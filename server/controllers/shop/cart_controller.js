const mongoose = require("mongoose");
const Cart = require("../../models/cart");
const Product = require("../../models/products");

// helpers
const n = (v, d = 0) => {
  const x = Number(v);
  return Number.isFinite(x) ? x : d;
};
const isId = (v) => mongoose.Types.ObjectId.isValid(v);

// normalize -> always return an array of items to the client
const normalizeItems = (items = []) =>
  items
    .filter((it) => !!it.productId) // keep only valid populated refs
    .map((it) => ({
      productId: it.productId._id,
      image: it.productId.image,
      title: it.productId.title,
      price: it.productId.price,
      salePrice: it.productId.salePrice,
      quantity: it.quantity,
    }));

// GET /api/shop/cart/get/:userId
exports.fetchCartItems = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User id is mandatory!" });
    }

    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "image title price salePrice",
    });

    // return empty list instead of 404 (easier for UI)
    if (!cart) {
      return res.status(200).json({ success: true, data: [] });
    }

    // prune broken refs
    const valid = cart.items.filter((it) => !!it.productId);
    if (valid.length !== cart.items.length) {
      cart.items = valid;
      await cart.save();
    }

    return res.status(200).json({ success: true, data: normalizeItems(valid) });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Error" });
  }
};

// POST /api/shop/cart/add
// body: { userId, productId, quantity }
exports.addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body || {};
    const qty = n(quantity, 0);

    if (!userId || !productId || qty <= 0) {
      return res.status(400).json({ success: false, message: "Invalid data provided!" });
    }
    if (!isId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product id!" });
    }

    const product = await Product.findById(productId).lean();
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) cart = new Cart({ userId, items: [] });

    const idx = cart.items.findIndex((it) => String(it.productId) === String(productId));
    if (idx === -1) {
      cart.items.push({ productId, quantity: qty });
    } else {
      cart.items[idx].quantity = n(cart.items[idx].quantity, 0) + qty;
    }

    await cart.save();

    await cart.populate({ path: "items.productId", select: "image title price salePrice" });
    return res.status(200).json({ success: true, data: normalizeItems(cart.items) });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Error" });
  }
};

// PUT /api/shop/cart/update-cart
// body: { userId, productId, quantity }
exports.updateCartItemQty = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body || {};
    const qty = n(quantity, 0);

    if (!userId || !productId || qty <= 0) {
      return res.status(400).json({ success: false, message: "Invalid data provided!" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found!" });
    }

    const idx = cart.items.findIndex((it) => String(it.productId) === String(productId));
    if (idx === -1) {
      return res.status(404).json({ success: false, message: "Cart item not present!" });
    }

    cart.items[idx].quantity = qty;
    await cart.save();

    await cart.populate({ path: "items.productId", select: "image title price salePrice" });
    return res.status(200).json({ success: true, data: normalizeItems(cart.items) });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Error" });
  }
};

// DELETE /api/shop/cart/:userId/:productId
exports.deleteCartItem = async (req, res) => {
  try {
    const { userId, productId } = req.params || {};
    if (!userId || !productId) {
      return res.status(400).json({ success: false, message: "Invalid data provided!" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      // return empty list instead of 404 to keep UI simple
      return res.status(200).json({ success: true, data: [] });
    }

    cart.items = cart.items.filter((it) => String(it.productId) !== String(productId));
    await cart.save();

    await cart.populate({ path: "items.productId", select: "image title price salePrice" });
    return res.status(200).json({ success: true, data: normalizeItems(cart.items) });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Error" });
  }
};
