const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product", // still reference for filtering
    required: true,
  },
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand", // reference to the Brand model
    required: true,
  },
  title: { type: String, required: true }, // snapshot
  image: { type: String },
  price: { type: Number, required: true }, // snapshot price at time of order
  quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cartItems: [orderItemSchema], // 🛒 no cartId anymore
    addressInfo: {
      addressId: String,
      address: String,
      city: String,
      pincode: String,
      phone: String,
      notes: String,
    },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "completed", "cancelled"],
      default: "pending",
    },
    paymentMethod: { type: String, default: "paypal" },
    paymentStatus: { type: String, default: "unpaid" },
    totalAmount: { type: Number, required: true },
    orderDate: { type: Date, default: Date.now },
    orderUpdateDate: { type: Date },
    paymentId: String,
    payerId: String,
  },
  { timestamps: true }
);

// Fix overwrite issue in dev
module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
