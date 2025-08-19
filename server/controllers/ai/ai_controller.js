// server/controllers/ai/ai_controller.js

const OpenAI = require("openai");
const mongoose = require("mongoose");

// Optional models — load safely
let Product;
let Order;
try { Product = require("../../models/products"); } catch (_) {}
try { Order   = require("../../models/Order"); } catch (_) {}

const API_KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
const client = new OpenAI({ apiKey: API_KEY });

const toId = (v) =>
  mongoose.Types.ObjectId.isValid(v) ? new mongoose.Types.ObjectId(v) : null;

async function buildContext({ userId, productId }) {
  const context = [];

  // Product context
  if (productId && Product?.findById) {
    try {
      const p = await Product.findById(productId)
        .select("title category price salePrice salesPrice")
        .lean();
      if (p?.title) {
        const price =
          (typeof p.salePrice === "number" && p.salePrice > 0 && p.salePrice) ||
          (typeof p.salesPrice === "number" && p.salesPrice > 0 && p.salesPrice) ||
          p.price;
        context.push(
          `Current product: ${p.title} (${p.category ?? "-"}) — $${Number(price ?? 0).toFixed(2)}`
        );
      }
    } catch (_) {}
  }

  // User preference context (top categories from orders)
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
        if (topCats.length) context.push(`User likes: ${topCats.join(", ")}`);
      }
    } catch (_) {}
  }

  return context;
}

function ensureApiKey(res) {
  if (!API_KEY) {
    res.status(500).json({
      success: false,
      message:
        "Missing API key. Set OPENAI_API_KEY (preferred) or VITE_OPENAI_API_KEY on the server.",
    });
    return false;
  }
  return true;
}

/**
 * POST /api/ai/chat
 * body: { messages: [{role, content}], userId?: string, productId?: string, model?: string, temperature?: number }
 */
async function chat(req, res) {
  try {
    if (!ensureApiKey(res)) return;

    const {
      messages = [],
      userId,
      productId,
      model = "gpt-4o-mini",
      temperature = 0.7,
    } = req.body || {};

    if (!Array.isArray(messages)) {
      return res
        .status(400)
        .json({ success: false, message: "messages must be an array" });
    }

    const context = await buildContext({ userId, productId });

    const system = {
      role: "system",
      content:
        "You are a concise shopping assistant. Answer in 1–3 sentences. If helpful, suggest 2–4 relevant items based on the user's intent.",
    };

    const finalMessages = [system, ...messages];
    if (context.length) finalMessages.push({ role: "system", content: context.join("\n") });

    const resp = await client.chat.completions.create({
      model,
      messages: finalMessages,
      temperature,
      max_tokens: 350,
    });

    const reply =
      resp.choices?.[0]?.message ?? {
        role: "assistant",
        content: "Sorry, I had trouble responding.",
      };

    return res.status(200).json({ success: true, message: reply });
  } catch (e) {
    console.error("AI chat error:", e?.response?.data || e);
    return res.status(500).json({ success: false, message: "AI error" });
  }
}

/**
 * POST /api/ai/ask
 * body: { message?: string, messages?: [{role, content}], userId?: string, productId?: string, model?: string, temperature?: number }
 * - Convenience endpoint: accepts single `message` or full `messages` array.
 */
async function ask(req, res) {
  try {
    if (!ensureApiKey(res)) return;

    const {
      message,
      messages,
      userId,
      productId,
      model = "gpt-4o-mini",
      temperature = 0.7,
    } = req.body || {};

    const baseMessages =
      Array.isArray(messages) && messages.length
        ? messages
        : typeof message === "string" && message.trim()
        ? [{ role: "user", content: message.trim() }]
        : null;

    if (!baseMessages) {
      return res.status(400).json({
        success: false,
        message: "Provide 'message' or non-empty 'messages' array.",
      });
    }

    const context = await buildContext({ userId, productId });

    const system = {
      role: "system",
      content:
        "You are a concise shopping assistant. Answer in 1–3 sentences. If helpful, suggest 2–4 relevant items based on the user's intent.",
    };

    const finalMessages = [system, ...baseMessages];
    if (context.length) finalMessages.push({ role: "system", content: context.join("\n") });

    const resp = await client.chat.completions.create({
      model,
      messages: finalMessages,
      temperature,
      max_tokens: 350,
    });

    const reply =
      resp.choices?.[0]?.message ?? {
        role: "assistant",
        content: "Sorry, I had trouble responding.",
      };

    return res.status(200).json({ success: true, message: reply });
  } catch (e) {
    console.error("AI ask error:", e?.response?.data || e);
    return res.status(500).json({ success: false, message: "AI error" });
  }
}

function health(_req, res) {
  res.json({ ok: true, service: "ai", time: new Date().toISOString() });
}

module.exports = { chat, ask, health };
