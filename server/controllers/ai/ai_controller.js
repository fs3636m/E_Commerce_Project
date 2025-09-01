// server/controllers/ai/ai_controller.js
const OpenAI = require("openai");
const mongoose = require("mongoose");

let Product;
let Order;
let Brand;
try { Product = require("../../models/products"); } catch (_) {}
try { Order = require("../../models/Order"); } catch (_) {}
try { Brand = require("../../models/Brand"); } catch (_) {}

const API_KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
const client = new OpenAI({ apiKey: API_KEY });

const toId = (v) =>
  mongoose.Types.ObjectId.isValid(v) ? new mongoose.Types.ObjectId(v) : null;

// Format currency as pounds
const formatGBP = (amount) => {
  const num = Number(amount);
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
  }).format(isNaN(num) ? 0 : num);
};

// Build comprehensive context for AI
async function buildContext({ userId, productId, brandId }) {
  const context = [];
  let catalog = [];

  // Current product info
  if (productId && Product?.findById) {
    try {
      const product = await Product.findById(productId)
        .populate("brand", "name description")
        .select("title category price salePrice salesPrice image brand description features")
        .lean();
      
      if (product) {
        const price = product.salePrice > 0 ? product.salePrice : 
                     product.salesPrice > 0 ? product.salesPrice : product.price;
        
        context.push(`CURRENT_PRODUCT: ${product.title} | Category: ${product.category || "-"} | Price: ${formatGBP(price)} | Brand: ${product.brand?.name || "Unknown"} | Description: ${product.description || "No description"} | Features: ${product.features?.join(", ") || "None"}`);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  }

  // Brand information
  if (brandId && Brand?.findById) {
    try {
      const brand = await Brand.findById(brandId)
        .select("name description rating numberOfReviews")
        .lean();
      
      if (brand) {
        context.push(`BRAND_INFO: ${brand.name} | Rating: ${brand.rating || 0}/5 (${brand.numberOfReviews || 0} reviews) | Description: ${brand.description || "No description"}`);
      }
    } catch (error) {
      console.error("Error fetching brand:", error);
    }
  }

  // User preferences and order history
  if (userId && Order?.aggregate) {
    try {
      const uid = toId(userId);
      if (uid) {
        // User's favorite categories
        const preferences = await Order.aggregate([
          { $match: { userId: uid, orderStatus: { $in: ["completed", "confirmed", "shipped"] } } },
          { $unwind: "$cartItems" },
          {
            $lookup: {
              from: "products",
              localField: "cartItems.productId",
              foreignField: "_id",
              as: "product",
            },
          },
          { $unwind: "$product" },
          {
            $group: {
              _id: "$product.category",
              totalSpent: { $sum: { $multiply: ["$cartItems.price", "$cartItems.quantity"] } },
              itemsBought: { $sum: "$cartItems.quantity" },
            },
          },
          { $sort: { totalSpent: -1 } },
          { $limit: 5 },
        ]);
        
        if (preferences.length) {
          const topCategories = preferences.map(p => `${p._id} (${formatGBP(p.totalSpent)} spent, ${p.itemsBought} items)`);
          context.push(`USER_PREFERENCES: Top categories - ${topCategories.join(", ")}`);
        }

        // User's recent orders summary
        const recentOrders = await Order.find({ userId: uid })
          .sort({ orderDate: -1 })
          .limit(3)
          .lean();
        
        if (recentOrders.length) {
          const orderSummary = recentOrders.map(order => 
            `Order #${order._id.toString().slice(-6)}: ${formatGBP(order.totalAmount)} - ${order.orderStatus}`
          );
          context.push(`RECENT_ORDERS: ${orderSummary.join(" | ")}`);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  // Product catalog with filtering
  if (Product?.find) {
    try {
      let query = {};
      let limit = 15;
      
      if (productId) {
        const currentProduct = await Product.findById(productId).lean();
        if (currentProduct) {
          query = { 
            category: currentProduct.category,
            _id: { $ne: productId }
          };
          limit = 8;
        }
      } else if (brandId) {
        query = { brand: brandId };
        limit = 10;
      }

      const products = await Product.find(query)
        .limit(limit)
        .populate("brand", "name")
        .select("title category price salePrice image brand rating numberOfReviews")
        .sort({ rating: -1, numberOfReviews: -1 })
        .lean();

      catalog = products.map(p => {
        const price = p.salePrice > 0 ? p.salePrice : p.price;
        return {
          title: p.title,
          id: p._id.toString(),
          price: price,
          originalPrice: p.price,
          category: p.category,
          image: p.image || null,
          brand: p.brand?.name || "Unknown",
          rating: p.rating || 0,
          reviews: p.numberOfReviews || 0,
          onSale: p.salePrice > 0 && p.salePrice < p.price,
          priceFormatted: formatGBP(price),
          originalPriceFormatted: formatGBP(p.price)
        };
      });

    } catch (error) {
      console.error("Error fetching catalog:", error);
    }
  }

  return { context: context.join("\n"), catalog };
}

function ensureApiKey(res) {
  if (!API_KEY) {
    res.status(500).json({
      success: false,
      message: "Missing API key. Set OPENAI_API_KEY or VITE_OPENAI_API_KEY on the server.",
    });
    return false;
  }
  return true;
}

// Enhanced system prompt for better responses
const getSystemPrompt = (catalog, context) => `
You are a friendly shopping assistant for our UK-based e-commerce app. Your role is to:

1. PROVIDE HELPFUL, FRIENDLY RESPONSES to greetings and questions
2. SUGGEST RELEVANT PRODUCTS when appropriate
3. ANSWER QUESTIONS about products, brands, and shopping
4. BE CONVERSATIONAL but informative
5. ALWAYS USE BRITISH POUNDS (£) FOR ALL PRICES

IMPORTANT: You MUST ALWAYS respond with valid JSON in this exact format:

{
  "message": "Your response message here - ALWAYS mention prices in £",
  "suggestedProducts": [
    {
      "id": "product_id",
      "title": "Product Name",
      "reason": "Why suggested"
    }
  ],
  "responseType": "greeting|product_info|general_help|error"
}

RESPONSE TYPES:
- "greeting": For hello, hi, greetings
- "product_info": When discussing specific products
- "general_help": For shopping questions and advice  
- "error": For unsupported requests

RULES:
- ALL PRICES MUST BE IN BRITISH POUNDS (£)
- For greetings: Be warm and welcoming, offer help with shopping
- For product questions: Be informative and helpful
- Only suggest products from the catalog below
- Keep responses conversational and friendly
- Always format prices as £XX.XX

AVAILABLE PRODUCTS:
${catalog.map(p => 
  `${p.title} (ID: ${p.id}) - ${p.priceFormatted} - ${p.brand} - ${p.rating}/5 stars`
).join('\n')}

EXAMPLES:

User says: "hello"
Response: {
  "message": "Hello! Welcome to our UK store! I'm here to help you find great products. What can I help you with today?",
  "suggestedProducts": [],
  "responseType": "greeting"
}

User says: "what products do you have?"
Response: {
  "message": "We have a great selection of products! Here are some of our most popular items starting from £25.99:",
  "suggestedProducts": [
    {"id": "prod123", "title": "Wireless Headphones", "reason": "Best seller with great reviews for £89.99"},
    {"id": "prod456", "title": "Smart Watch", "reason": "Feature-rich and popular choice for £199.99"}
  ],
  "responseType": "general_help"
}

User says: "how much is this product?"
Response: {
  "message": "This product is currently priced at £49.99. It's on sale from the original price of £69.99!",
  "suggestedProducts": [],
  "responseType": "product_info"
}
`;

// Fallback responses for when AI fails
const getFallbackResponse = (userMessage) => {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return {
      message: "Hello! 👋 Welcome to our UK store! I'm here to help you find amazing products. What can I help you with today?",
      suggestedProducts: [],
      responseType: "greeting"
    };
  }
  
  if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
    return {
      message: "You're welcome! 😊 Is there anything else I can help you find today?",
      suggestedProducts: [],
      responseType: "greeting"
    };
  }
  
  if (lowerMessage.includes('product') || lowerMessage.includes('item')) {
    return {
      message: "I'd love to help you find products! We have items ranging from £15 to £500. Could you tell me what type of items you're looking for?",
      suggestedProducts: [],
      responseType: "general_help"
    };
  }
  
  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
    return {
      message: "I can help you with pricing information! Our products range from affordable options around £20 to premium items up to £500. What specific product are you interested in?",
      suggestedProducts: [],
      responseType: "general_help"
    };
  }
  
  return {
    message: "I'm here to help you with your shopping needs! We have great products at competitive prices in GBP. What can I assist you with today?",
    suggestedProducts: [],
    responseType: "general_help"
  };
};

async function handleAIRequest(req, res, isChat = false) {
  try {
    if (!ensureApiKey(res)) return;

    const { message, messages, userId, productId, brandId, model = "gpt-4o-mini", temperature = 0.3 } = req.body || {};

    let baseMessages;
    if (isChat) {
      baseMessages = Array.isArray(messages) && messages.length ? messages : null;
      if (!baseMessages) return res.status(400).json({ success: false, message: "Provide 'messages' array." });
    } else {
      baseMessages = typeof message === "string" && message.trim() ? 
        [{ role: "user", content: message.trim() }] : null;
      if (!baseMessages) return res.status(400).json({ success: false, message: "Provide 'message'." });
    }

    const { context, catalog } = await buildContext({ userId, productId, brandId });
    const systemPrompt = getSystemPrompt(catalog, context);

    const systemMessage = { role: "system", content: systemPrompt };
    const finalMessages = [systemMessage, ...baseMessages];

    console.log("Sending to AI:", finalMessages);

    const response = await client.chat.completions.create({
      model: model,
      messages: finalMessages,
      temperature: temperature,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    const rawReply = response.choices?.[0]?.message?.content || "{}";
    console.log("Raw AI response:", rawReply);
    
    let parsed;
    try {
      parsed = JSON.parse(rawReply);
      
      // Validate the response structure
      if (!parsed.message || !parsed.responseType) {
        throw new Error("Invalid response format from AI");
      }
      
    } catch (error) {
      console.error("JSON parse error:", error, "Raw response:", rawReply);
      
      // Use fallback response based on user message
      const userMessage = isChat ? messages[messages.length - 1]?.content : message;
      parsed = getFallbackResponse(userMessage || "");
    }

    // Validate and filter suggested products
    if (parsed.suggestedProducts?.length) {
      const catalogMap = new Map(catalog.map(p => [p.id, p]));
      parsed.suggestedProducts = parsed.suggestedProducts
        .filter(p => p.id && catalogMap.has(p.id))
        .map(p => ({
          ...catalogMap.get(p.id),
          reason: p.reason || "Recommended for you"
        }))
        .slice(0, 4);
    } else {
      parsed.suggestedProducts = [];
    }

    return res.status(200).json({ 
      success: true, 
      ...parsed
    });

  } catch (error) {
    console.error("AI request error:", error);
    
    // Fallback response for any error
    const userMessage = req.body?.message || "";
    const fallback = getFallbackResponse(userMessage);
    
    return res.status(200).json({ 
      success: true,
      ...fallback
    });
  }
}

// Ask endpoint (single-message)
async function ask(req, res) {
  return handleAIRequest(req, res, false);
}

// Chat endpoint (multi-turn)
async function chat(req, res) {
  return handleAIRequest(req, res, true);
}

function health(_req, res) {
  res.json({ 
    ok: true, 
    service: "ai-shopping-assistant", 
    time: new Date().toISOString(),
    currency: "GBP (£)"
  });
}

module.exports = { ask, chat, health, formatGBP };