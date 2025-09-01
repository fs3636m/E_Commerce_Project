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

// ==================== CRITICAL SECURITY SETTINGS ====================
const FORBIDDEN_PHRASES = [
  'amazon', 'ebay', 'walmart', 'target', 'best buy', 'external',
  'other website', 'other store', 'competitor', 'elsewhere',
  'check out', 'you can buy', 'available at', 'sold at',
  'other retailers', 'other platforms', 'on [any site]', 'from [any store]',
  'local boutiques', 'local boutique', 'boutiques offer', 
  'online platform', 'online platforms', 'custom outfitter',
  'specialty stores', 'specialty shop', 'tailor shop',
  'many places', 'various places', 'other places',
  'explore options', 'look into', 'check with',
  'i recommend looking', 'you might want to check',
  'consider visiting', 'try reaching out to',
  'third-party', 'another company', 'other providers'
];

// ==================== HELPER FUNCTIONS ====================
function getFallbackProducts(catalog) {
  return catalog
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 3)
    .map(p => ({
      id: p.id,
      title: p.title,
      reason: "Popular item in our store"
    }));
}

function getFashionProducts(catalog) {
  const fashionKeywords = ['shirt', 'dress', 'pants', 'jeans', 'jacket', 'coat', 
                          'skirt', 'blouse', 'sweater', 'hoodie', 'activewear', 
                          'outfit', 'fashion', 'clothing', 'apparel'];
  
  return catalog
    .filter(product => 
      fashionKeywords.some(keyword => 
        product.title.toLowerCase().includes(keyword) ||
        (product.category && product.category.toLowerCase().includes(keyword))
      )
    )
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 4)
    .map(p => ({
      id: p.id,
      title: p.title,
      reason: "Fashion item from our collection"
    }));
}

function validateAIResponse(response, catalog, userMessage = "") {
  const responseLower = response.message.toLowerCase();
  const userMessageLower = userMessage.toLowerCase();
  
  // Check for custom outfit related forbidden phrases
  const customOutfitForbidden = [
    'local boutiques', 'online platform', 'custom outfitter', 
    'specialty stores', 'many places offer', 'various places'
  ];
  
  const hasCustomOutfitMention = customOutfitForbidden.some(phrase =>
    responseLower.includes(phrase)
  );
  
  // Check if user is asking about custom outfits
  const isAskingAboutCustomOutfits = userMessageLower.includes('custom outfit') ||
                                    userMessageLower.includes('custom clothing') ||
                                    userMessageLower.includes('tailor') ||
                                    userMessageLower.includes('bespoke');
  
  // Check general forbidden phrases
  const hasForbiddenPhrase = FORBIDDEN_PHRASES.some(phrase => 
    responseLower.includes(phrase.toLowerCase())
  );
  
  // Check if user is asking about external platforms
  const isAskingAboutExternal = FORBIDDEN_PHRASES.some(phrase =>
    userMessageLower.includes(phrase.toLowerCase())
  );
  
  if (hasCustomOutfitMention || hasForbiddenPhrase || isAskingAboutExternal || isAskingAboutCustomOutfits) {
    console.warn('Blocked external recommendation attempt');
    
    // Special handling for custom outfit queries
    if (isAskingAboutCustomOutfits || hasCustomOutfitMention) {
      const fashionProducts = getFashionProducts(catalog);
      return {
        message: fashionProducts.length > 0 
          ? "While we don't offer custom outfit services directly, we have a wide range of unique and stylish clothing items that might meet your needs. Here are some fashion items from our collection:"
          : "We don't offer custom outfit services, but we have many other great products in our store. How else can I help you today?",
        suggestedProducts: fashionProducts,
        responseType: "not_available"
      };
    }
    
    return {
      message: "I can only provide information about products available in our store. We have a great selection of items - would you like me to show you what we have available?",
      suggestedProducts: getFallbackProducts(catalog),
      responseType: "general_help"
    };
  }
  
  // Validate suggested products are actually in our catalog
  if (response.suggestedProducts?.length) {
    const catalogIds = new Set(catalog.map(p => p.id));
    response.suggestedProducts = response.suggestedProducts
      .filter(p => p.id && catalogIds.has(p.id))
      .slice(0, 4);
  }
  
  return response;
}

// ==================== CORE FUNCTIONS ====================
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

// ==================== PROMPT ENGINEERING ====================
const getSystemPrompt = (catalog, context) => `
CRITICAL RULES - YOU MUST FOLLOW THESE ABSOLUTELY:
1. NEVER mention or recommend any other websites, stores, boutiques, or platforms
2. ONLY recommend products from our EXACT catalog below
3. NEVER suggest going elsewhere for any reason, including custom outfits
4. If we don't offer a service (like custom outfits), suggest alternatives FROM OUR CATALOG
5. ONLY discuss products and services available in OUR store

ABSOLUTELY FORBIDDEN - NEVER MENTION:
- Local boutiques, online platforms, or any external providers
- Amazon, eBay, Walmart, Target, Best Buy, or any competitors
- "You can find this at [any place]"
- "Many places offer this"
- Any external platforms or marketplaces

SPECIFIC RULE FOR CUSTOM OUTFITS:
If user asks about custom outfits or tailoring services, respond with:
"We don't offer custom outfit services, but we have these fashion items that might interest you:"
Then suggest relevant clothing items FROM OUR CATALOG.

RESPONSE FORMAT (JSON ONLY):
{
  "message": "Your response - NEVER mention other stores",
  "suggestedProducts": [
    {
      "id": "product_id",
      "title": "Product Name", 
      "reason": "Why suggested"
    }
  ],
  "responseType": "greeting|product_info|general_help|not_available"
}

OUR PRODUCT CATALOG (ONLY RECOMMEND THESE):
${catalog.map(p => 
  `${p.title} (ID: ${p.id}) - ${p.priceFormatted} - ${p.brand} - ${p.rating}/5 stars`
).join('\n')}

EXAMPLE SAFE RESPONSES:

User: "Do you do custom outfits?"
Response: {
  "message": "We don't offer custom outfit services, but we have a great selection of ready-to-wear fashion items. Here are some popular choices:",
  "suggestedProducts": [
    {"id": "cloth123", "title": "Designer Dress", "reason": "Elegant ready-to-wear option"},
    {"id": "cloth456", "title": "Tailored Shirt", "reason": "High-quality pre-made shirt"}
  ],
  "responseType": "not_available"
}

User: "Where can I get custom clothing?"
Response: {
  "message": "I can only provide information about our store's products. We have these stylish clothing items available:",
  "suggestedProducts": [
    {"id": "fash123", "title": "Premium Blazer", "reason": "Well-fitted ready-to-wear"},
    {"id": "fash456", "title": "Designer Pants", "reason": "Quality fashion item"}
  ],
  "responseType": "general_help"
}

User: "Is this cheaper on Amazon?"
Response: {
  "message": "I can only provide pricing for our store. We offer competitive prices and excellent service on all our products!",
  "suggestedProducts": [],
  "responseType": "general_help"
}
`;

// ==================== FALLBACK RESPONSES ====================
const getFallbackResponse = (userMessage, catalog = []) => {
  const lowerMessage = userMessage.toLowerCase();
  
  // Check if user is asking about external platforms
  const isAskingAboutExternal = FORBIDDEN_PHRASES.some(phrase =>
    lowerMessage.includes(phrase.toLowerCase())
  );
  
  // Check for custom outfit queries
  const isAskingAboutCustomOutfits = lowerMessage.includes('custom outfit') || 
                                    lowerMessage.includes('custom clothing') || 
                                    lowerMessage.includes('tailor') ||
                                    lowerMessage.includes('bespoke');

  if (isAskingAboutExternal) {
    return {
      message: "I can only provide information about products available in our store. We have a great selection of items - what are you looking for today?",
      suggestedProducts: [],
      responseType: "general_help"
    };
  }
  
  if (isAskingAboutCustomOutfits) {
    const fashionProducts = getFashionProducts(catalog);
    return {
      message: fashionProducts.length > 0 
        ? "We don't offer custom outfit services, but we have a wonderful collection of fashion items that might suit your style. Here are some options:"
        : "We don't offer custom outfit services, but we have many other great products in our store. How else can I help you today?",
      suggestedProducts: fashionProducts,
      responseType: "not_available"
    };
  }
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return {
      message: "Hello! 👋 Welcome to our store! I'm here to help you find amazing products from our collection. What can I help you with today?",
      suggestedProducts: [],
      responseType: "greeting"
    };
  }
  
  if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
    return {
      message: "You're welcome! 😊 Is there anything else I can help you find in our store today?",
      suggestedProducts: [],
      responseType: "greeting"
    };
  }
  
  if (lowerMessage.includes('product') || lowerMessage.includes('item')) {
    return {
      message: "I'd love to help you find products in our store! We have items ranging from £15 to £500. What type of items are you looking for?",
      suggestedProducts: [],
      responseType: "general_help"
    };
  }
  
  return {
    message: "I'm here to help you with your shopping needs in our store! We have great products at competitive prices. What can I assist you with today?",
    suggestedProducts: [],
    responseType: "general_help"
  };
};

// ==================== MAIN REQUEST HANDLER ====================
async function handleAIRequest(req, res, isChat = false) {
  try {
    if (!ensureApiKey(res)) return;

    const { message, messages, userId, productId, brandId, model = "gpt-4o-mini", temperature = 0.3 } = req.body || {};

    let baseMessages;
    let userMessageContent = "";
    
    if (isChat) {
      baseMessages = Array.isArray(messages) && messages.length ? messages : null;
      if (!baseMessages) return res.status(400).json({ success: false, message: "Provide 'messages' array." });
      userMessageContent = messages[messages.length - 1]?.content || "";
    } else {
      baseMessages = typeof message === "string" && message.trim() ? 
        [{ role: "user", content: message.trim() }] : null;
      if (!baseMessages) return res.status(400).json({ success: false, message: "Provide 'message'." });
      userMessageContent = message.trim();
    }

    const { context, catalog } = await buildContext({ userId, productId, brandId });
    const systemPrompt = getSystemPrompt(catalog, context);

    const systemMessage = { role: "system", content: systemPrompt };
    const finalMessages = [systemMessage, ...baseMessages];

    const response = await client.chat.completions.create({
      model: model,
      messages: finalMessages,
      temperature: temperature,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    const rawReply = response.choices?.[0]?.message?.content || "{}";
    
    let parsed;
    try {
      parsed = JSON.parse(rawReply);
      
      // CRITICAL: Validate response to block external recommendations
      parsed = validateAIResponse(parsed, catalog, userMessageContent);
      
      if (!parsed.message || !parsed.responseType) {
        throw new Error("Invalid response format from AI");
      }
      
    } catch (error) {
      console.error("JSON parse error:", error);
      parsed = getFallbackResponse(userMessageContent, catalog);
    }

    // Final validation of suggested products
    if (parsed.suggestedProducts?.length) {
      const catalogMap = new Map(catalog.map(p => [p.id, p]));
      parsed.suggestedProducts = parsed.suggestedProducts
        .filter(p => p.id && catalogMap.has(p.id))
        .map(p => ({
          ...catalogMap.get(p.id),
          reason: p.reason || "Recommended from our store"
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
    
    const userMessage = req.body?.message || "";
    const fallback = getFallbackResponse(userMessage, []);
    
    return res.status(200).json({ 
      success: true,
      ...fallback
    });
  }
}

// ==================== EXPORTED FUNCTIONS ====================
async function ask(req, res) {
  return handleAIRequest(req, res, false);
}

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