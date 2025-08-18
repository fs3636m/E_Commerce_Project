// controllers/shop/order_controller.js
// PayPal v1-style flow with safe totals, stock updates, and RELIABLE cart clear.

const paypal = require("../../helpers/paypal"); // your existing PayPal helper (v1 SDK)
const mongoose = require("mongoose");
const Order = require("../../models/Order");         // keep your original casing/path
const Cart = require("../../models/cart");
const Product = require("../../models/products");

// ---------------- tiny helpers ----------------
const n = (v, d = 0) => {
  const x = Number(v);
  return Number.isFinite(x) ? x : d;
};
const round2 = (v) => Math.round(n(v, 0) * 100) / 100;
const money2 = (v) => round2(v).toFixed(2);

// Compute an authoritative total from the cart items you saved on the order
function computeOrderTotal(cartItems = []) {
  return (cartItems || []).reduce((sum, it) => {
    // your Order model stores price as String; coerce safely
    const unit = n(it?.salePrice) > 0 ? n(it?.salePrice) : n(it?.price);
    return sum + unit * n(it?.quantity, 0);
  }, 0);
}

// ------------------------------------------------------------------
// POST /api/shop/order/create
// Creates PayPal payment and saves a pending order.
// Returns { approvalURL, orderId }
const createOrder = async (req, res) => {
  try {
    const {
      userId,
      cartItems = [],
      addressInfo = {},
      orderStatus = "pending",
      paymentMethod = "paypal",
      paymentStatus = "unpaid",
      cartId, // may be undefined from client; we'll try to resolve it server-side
    } = req.body || {};

    if (!userId || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: "userId and cartItems are required" });
    }

    // authoritative server total
    const serverTotal = round2(computeOrderTotal(cartItems));

    // Build PayPal v1 payment JSON using SAFE values
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
              sku: item.productId,                 // keep your SKU mapping
              price: money2(n(item.price)),        // coerce to number, 2dp
              currency: "USD",
              quantity: n(item.quantity, 0),
            })),
          },
          amount: {
            currency: "USD",
            total: money2(serverTotal),
          },
          description: "description",
        },
      ],
    };

    // Try to resolve cartId if client didn't pass it
    let resolvedCartId = cartId || null;
    if (!resolvedCartId) {
      const userCart = await Cart.findOne({ userId }).select("_id").lean();
      resolvedCartId = userCart?._id || null;
    }

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
        cartId: resolvedCartId,     // save it if found; ok if null
        cartItems,
        addressInfo,
        orderStatus,                // "pending"
        paymentMethod,              // "paypal"
        paymentStatus,              // "unpaid"
        totalAmount: serverTotal,
        orderDate: new Date(),
        orderUpdateDate: new Date(),
        paymentId: "",              // set after capture
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
// Verifies+marks paid, updates stock, and ALWAYS clears the cart for that user.
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

    // Idempotent: if already paid/confirmed, don't double charge or double-deduct
    if (order.orderStatus === "paid" || order.paymentStatus === "paid" || order.orderStatus === "confirmed") {
      // ALSO make sure the cart is empty for this user (idempotent)
      await Cart.updateOne({ userId: order.userId }, { $set: { items: [] } }).catch(() => {});
      return res.status(200).json({
        success: true,
        message: "Order already paid",
      });
    }

    // (Optional) Verify PayPal here with your helper if you want strict checks.

    // Recompute total from saved items (prevents NaN)
    const finalTotal = round2(computeOrderTotal(order.cartItems));

    // Mark order paid/confirmed
    order.paymentStatus = "paid";
    order.paymentId = paymentId || order.paymentId || "";
    order.payerId = payerId || order.payerId || "";
    order.orderStatus = "confirmed";
    order.totalAmount = finalTotal;
    order.orderUpdateDate = new Date();

    // ---- Safe stock updates ----
    for (const item of order.cartItems || []) {
      const prodId = item.productId;
      if (!prodId || !mongoose.Types.ObjectId.isValid(prodId)) continue;

      const product = await Product.findById(prodId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found for id ${prodId}`,
        });
      }

      const current = n(product.totalStock, 0);
      const qty = n(item.quantity, 0);

      product.totalStock = Math.max(0, current - qty);
      if (typeof product.sold === "number") {
        product.sold = Math.max(0, n(product.sold, 0) + qty);
      }

      await product.save();
    }

    // ---------- THE IMPORTANT PART ----------
    // Robust cart clear: ALWAYS clear by userId (works even if cartId wasn't saved)
    await Cart.updateOne({ userId: order.userId }, { $set: { items: [] } }).catch(() => {});

    // (Optional) If cartId exists, also nuke the doc (best-effort)
    if (order.cartId && mongoose.Types.ObjectId.isValid(order.cartId)) {
      await Cart.findByIdAndDelete(order.cartId).catch(() => {});
    }
    // ---------------------------------------

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
    return res.status(200).json({ success: true, data: orders });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ success: false, message: "Some error occurred!" });
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
      return res.status(404).json({ success: false, message: "Order not found!" });
    }

    return res.status(200).json({ success: true, data: order });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ success: false, message: "Some error occurred!" });
  }
};

module.exports = {
  createOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrderDetails,
};
