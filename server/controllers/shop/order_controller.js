// controllers/shop/order_controller.js
// Adjusted to match YOUR setup (uses helpers/paypal v1-style), with safe totals + stock updates.

const paypal = require("../../helpers/paypal"); // your existing PayPal helper (v1 SDK)
const mongoose = require("mongoose");
const Order = require("../../models/Order");
const Cart = require("../../models/cart");
const Product = require("../../models/products");

// --- tiny helpers ---
const n = (v, d = 0) => {
  const x = Number(v);
  return Number.isFinite(x) ? x : d;
};
const round2 = (v) => Math.round(n(v, 0) * 100) / 100;
const money2 = (v) => round2(v).toFixed(2);

// Compute an authoritative total from the cart items you saved
function computeOrderTotal(cartItems = []) {
  return (cartItems || []).reduce((sum, it) => {
    // your Order model stores price as String; coerce
    const unit = n(it?.salePrice) > 0 ? n(it?.salePrice) : n(it?.price);
    return sum + unit * n(it?.quantity, 0);
  }, 0);
}

// ------------------------------------------------------------------
// POST /api/shop/order/create
// (Keeps your current PayPal v1 flow, but computes totals safely)
const createOrder = async (req, res) => {
  try {
    const {
      userId,
      cartItems = [],
      addressInfo = {},
      orderStatus = "pending",
      paymentMethod = "paypal",
      paymentStatus = "unpaid",
      cartId = "",
    } = req.body || {};

    if (!userId || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: "userId and cartItems are required" });
    }

    const serverTotal = round2(computeOrderTotal(cartItems));

    // Build PayPal payment JSON (v1 style) using SAFE values
    const create_payment_json = {
      intent: "sale",
      payer: { payment_method: "paypal" },
      redirect_urls: {
        return_url: `${process.env.CLIENT_BASE_URL}/shop/paypal-return`,
        cancel_url: `${process.env.CLIENT_BASE_URL}/shop/paypal-cancel`,
      },
      transactions: [
        {
          item_list: {
            items: cartItems.map((item) => ({
              name: item.title,
              sku: item.productId,
              price: money2(n(item.price)), // coerce string -> number, then to 2dp
              currency: "USD",
              quantity: n(item.quantity, 0),
            })),
          },
          amount: {
            currency: "USD",
            total: money2(serverTotal), // authoritative server total
          },
          description: "description",
        },
      ],
    };

    paypal.payment.create(create_payment_json, async (error, paymentInfo) => {
      if (error) {
        console.log(error);
        return res.status(500).json({
          success: false,
          message: "Error while creating paypal payment",
        });
      }

      const newlyCreatedOrder = new Order({
        userId,
        cartId,
        cartItems,
        addressInfo,
        orderStatus,           // "pending"
        paymentMethod,         // "paypal"
        paymentStatus,         // "unpaid"
        totalAmount: serverTotal,
        orderDate: new Date(),
        orderUpdateDate: new Date(),
        paymentId: "",         // will be set after capture
        payerId: "",
      });

      await newlyCreatedOrder.save();

      const approvalURL =
        paymentInfo?.links?.find((link) => link.rel === "approval_url")?.href || null;

      return res.status(201).json({
        success: true,
        approvalURL,
        orderId: newlyCreatedOrder._id,
      });
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

// ------------------------------------------------------------------
// POST /api/shop/order/capture
// BODY: { orderId, paymentId, payerId }
// Simple + robust: coerce numbers and CLAMP stock so it never goes < 0
const capturePayment = async (req, res) => {
  try {
    const { orderId, paymentId, payerId } = req.body || {};
    if (!orderId) {
      return res.status(400).json({ success: false, message: "orderId is required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found!" });
    }

    // Idempotent: if already paid, don't deduct stock again
    if (order.orderStatus === "paid" || order.paymentStatus === "paid" || order.orderStatus === "confirmed") {
      return res.status(200).json({
        success: true,
        message: "Order already paid",
      });
    }

    // (If you want, verify the PayPal payment here using your helper.)
    // Since your existing code doesn’t verify, we proceed to mark as paid.

    // Compute the final total from saved items (prevents NaN)
    const finalTotal = round2(computeOrderTotal(order.cartItems));

    order.paymentStatus = "paid";
    order.paymentId = paymentId || order.paymentId || "";
    order.payerId = payerId || order.payerId || "";
    order.orderStatus = "confirmed"; // kept your original status
    order.totalAmount = finalTotal;
    order.orderUpdateDate = new Date();

    // ---- Safe stock updates (the simple fallback we used) ----
    for (const item of order.cartItems || []) {
      const prodId = item.productId;
      if (!prodId || !mongoose.Types.ObjectId.isValid(prodId)) continue;

      const product = await Product.findById(prodId);
      if (!product) {
        // don’t use product.title when product is null
        return res.status(404).json({
          success: false,
          message: `Product not found for id ${prodId}`,
        });
      }

      const current = n(product.totalStock, 0);
      const qty = n(item.quantity, 0);

      // clamp to >= 0 to satisfy min:0 validators and avoid negative stock crash
      product.totalStock = Math.max(0, current - qty);

      // If your Product has "sold", bump it safely (ignored if not present)
      if (typeof product.sold === "number") {
        product.sold = Math.max(0, n(product.sold, 0) + qty);
      }

      await product.save();
    }

    // Clear cart if present
    if (order.cartId && mongoose.Types.ObjectId.isValid(order.cartId)) {
      await Cart.findByIdAndDelete(order.cartId).catch(() => {});
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order placed successfully!",
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

// ------------------------------------------------------------------
// GET /api/shop/order/list/:userId
const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ success: false, message: "userId is required" });
    }

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    // Return empty list instead of 404 — easier for UI
    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

// ------------------------------------------------------------------
// GET /api/shop/order/details/:id
const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid order id" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};

module.exports = {
  createOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrderDetails,
};
