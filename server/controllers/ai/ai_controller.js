// server/controllers/ai/ai_controller.js
const OpenAI = require("openai");
const mongoose = require("mongoose");

let Product;
let Order;
try {
  Product = require("../../models/products");
} catch (_) {}
try {
  Order = require("../../models/Order");
} catch (_) {}

const API_KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
const client = new OpenAI({ apiKey: API_KEY });

const toId = (v) =>
  mongoose.Types.ObjectId.isValid(v) ? new mongoose.Types.ObjectId(v) : null;

// Build context and catalog for AI
async function buildContext({ userId, productId }) {
  const context = [];

  // Current product info
  if (productId && Product?.findById) {
    try {
      const p = await Product.findById(productId)
        .select("title category price salePrice salesPrice image")
        .lean();
      if (p?.title) {
        const price =
          (typeof p.salePrice === "number" && p.salePrice > 0 && p.salePrice) ||
          (typeof p.salesPrice === "number" &&
            p.salesPrice > 0 &&
            p.salesPrice) ||
          p.price;
        context.push(
          `Current product: ${p.title} (${p.category ?? "-"}) — $${Number(
            price ?? 0
          ).toFixed(2)}`
        );
      }
    } catch (_) {}
  }

  // User preferences
  if (userId && Order?.aggregate) {
    try {
      const uid = toId(userId);
      if (uid) {
        const pref = await Order.aggregate([
          { $match: { userId: uid } },
          { $unwind: "$cartItems" },
          {
            $lookup: {
              from: "products",
              localField: "cartItems.productId",
              foreignField: "_id",
              as: "p",
            },
          },
          { $unwind: "$p" },
          {
            $group: {
              _id: "$p.category",
              score: { $sum: { $ifNull: ["$cartItems.quantity", 1] } },
            },
          },
          { $sort: { score: -1 } },
          { $limit: 3 },
        ]);
        const topCats = pref.map((x) => x._id).filter(Boolean);
        if (topCats.length)
          context.push(`User likes categories: ${topCats.join(", ")}`);
      }
    } catch (_) {}
  }

  // Full product catalog
  let catalog = [];
  if (Product?.find) {
    try {
      const topProducts = await Product.find()
        .limit(50)
        .select("title price _id image")
        .lean();
      catalog = topProducts.map((p) => ({
        title: p.title,
        id: p._id.toString(),
        price: p.price,
        image: p.image || null,
      }));
      context.push(
        `Available products:\n${catalog
          .map((p) => `${p.title} — $${p.price} — ${p.image || "no image"}`)
          .join("\n")}`
      );
    } catch (_) {}
  }

  return { context, catalog };
}

function ensureApiKey(res) {
  if (!API_KEY) {
    res.status(500).json({
      success: false,
      message:
        "Missing API key. Set OPENAI_API_KEY or VITE_OPENAI_API_KEY on the server.",
    });
    return false;
  }
  return true;
}

// Ask endpoint (single-message)
async function ask(req, res) {
  try {
    if (!ensureApiKey(res)) return;

    const {
      message,
      messages,
      userId,
      productId,
      model = "gpt-4o-mini",
      temperature = 0.3,
    } = req.body || {};

    const baseMessages =
      Array.isArray(messages) && messages.length
        ? messages
        : typeof message === "string" && message.trim()
        ? [{ role: "user", content: message.trim() }]
        : null;

    if (!baseMessages)
      return res
        .status(400)
        .json({ success: false, message: "Provide 'message' or 'messages'." });

    const { context, catalog } = await buildContext({ userId, productId });

    const catalogLines = catalog
      .map((p) => `${p.title} — $${p.price} — ${p.image || "no image"}`)
      .join("\n");

    const system = {
      role: "system",
      content: `
You are a shopping assistant for THIS APP only.
Answer in 1–3 sentences and suggest up to 4 products.
Use ONLY the catalog provided.
Do NOT mention any external sites.
ALWAYS return **raw JSON only** with no code blocks, markdown, or backticks.

Format:

{
  "message": "Your reply here",
  "suggestedProducts": [
    {"title": "Product title", "id": "productId", "price": 20, "image": "url"}
  ]
}

Catalog:
${catalogLines}
`,
    };

    const finalMessages = [system, ...baseMessages];

    const resp = await client.chat.completions.create({
      model,
      messages: finalMessages,
      temperature,
      max_tokens: 400,
    });

    const rawReply = resp.choices?.[0]?.message?.content || "{}";
    let parsed;
    try {
      parsed = JSON.parse(rawReply);
    } catch {
      parsed = { message: rawReply, suggestedProducts: [] };
    }

    if (parsed.suggestedProducts?.length) {
      const catalogMap = Object.fromEntries(catalog.map((p) => [p.id, p]));
      parsed.suggestedProducts = parsed.suggestedProducts
        .map((p) => catalogMap[p.id] || null)
        .filter(Boolean);
    } else parsed.suggestedProducts = [];

    return res.status(200).json({ success: true, ...parsed });
  } catch (e) {
    console.error("AI ask error:", e?.response?.data || e);
    return res.status(500).json({ success: false, message: "AI error" });
  }
}

// Chat endpoint (multi-turn)
async function chat(req, res) {
  try {
    if (!ensureApiKey(res)) return;

    const {
      messages = [],
      userId,
      productId,
      model = "gpt-4o-mini",
      temperature = 0.3,
    } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0)
      return res
        .status(400)
        .json({ success: false, message: "Provide 'messages' array." });

    const { context, catalog } = await buildContext({ userId, productId });

    const catalogLines = catalog
      .map((p) => `${p.title} — $${p.price} — ${p.image || "no image"}`)
      .join("\n");

    const system = {
      role: "system",
      content: `
You are a shopping assistant for THIS APP only.
Answer in 1–3 sentences and suggest up to 4 products.
Use ONLY the catalog provided.
Do NOT mention any external sites.
ALWAYS return **raw JSON only** with no code blocks, markdown, or backticks.

Format:

{
  "message": "Your reply here",
  "suggestedProducts": [
    {"title": "Product title", "id": "productId", "price": 20, "image": "url"}
  ]
}

Catalog:
${catalogLines}
`,
    };

    const finalMessages = [system, ...messages];

    const resp = await client.chat.completions.create({
      model,
      messages: finalMessages,
      temperature,
      max_tokens: 400,
    });

    const rawReply = resp.choices?.[0]?.message?.content || "{}";
    let parsed;
    try {
      parsed = JSON.parse(rawReply);
    } catch {
      parsed = { message: rawReply, suggestedProducts: [] };
    }

    if (parsed.suggestedProducts?.length) {
      const catalogMap = Object.fromEntries(catalog.map((p) => [p.id, p]));
      parsed.suggestedProducts = parsed.suggestedProducts
        .map((p) => catalogMap[p.id] || null)
        .filter(Boolean);
    } else parsed.suggestedProducts = [];

    return res.status(200).json({ success: true, ...parsed });
  } catch (e) {
    console.error("AI chat error:", e?.response?.data || e);
    return res.status(500).json({ success: false, message: "AI error" });
  }
}

function health(_req, res) {
  res.json({ ok: true, service: "ai", time: new Date().toISOString() });
}

module.exports = { ask, chat, health };
