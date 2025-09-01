const paypal = require("../../helpers/paypal");
const Order = require("../../models/Order");
const Cart = require("../../models/cart");
const Product = require("../../models/products");

const createOrder = async (req, res) => {
  try {
    const {
      userId,
      cartItems, // These cartItems come from frontend and likely don't have brandId
      addressInfo,
      orderStatus,
      paymentMethod,
      paymentStatus,
      totalAmount,
      orderDate,
      orderUpdateDate,
      paymentId,
      payerId,
    } = req.body;

    // ✅ FIRST: Enrich cartItems with brandId from products
    const enrichedCartItems = await Promise.all(
      cartItems.map(async (item) => {
        try {
          // Find the product to get its brandId
          const product = await Product.findById(item.productId);
          if (!product) {
            throw new Error(`Product not found: ${item.productId}`);
          }
          
          return {
            ...item,
            brandId: product.brand, // Add brandId from the product
          };
        } catch (error) {
          console.error("Error enriching cart item:", error);
          throw error;
        }
      })
    );

    // Build PayPal payment JSON (using original cartItems for PayPal)
    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: "http://localhost:5173/shop/paypal-return",
        cancel_url: "http://localhost:5173/shop/paypal-cancel",
      },
      transactions: [
        {
          item_list: {
            items: cartItems.map((item) => ({
              name: item.title,
              sku: item.productId,
              price: Number(item.price).toFixed(2),
              currency: "USD",
              quantity: item.quantity,
            })),
          },
          amount: {
            currency: "USD",
            total: Number(totalAmount).toFixed(2),
          },
          description: "Order payment",
        },
      ],
    };

    paypal.payment.create(create_payment_json, async (error, paymentInfo) => {
      if (error) {
        console.error("🔥 PayPal error:", error);
        return res.status(500).json({
          success: false,
          message: "Error while creating PayPal payment",
        });
      } else {
        // ✅ Create new order with ENRICHED cartItems (that include brandId)
        const newlyCreatedOrder = new Order({
          userId,
          cartItems: enrichedCartItems, // Use the enriched items with brandId
          addressInfo,
          orderStatus,
          paymentMethod,
          paymentStatus,
          totalAmount,
          orderDate,
          orderUpdateDate,
          paymentId,
          payerId,
        });

        await newlyCreatedOrder.save();

        // ✅ Get PayPal approval URL
        const approvalURL = paymentInfo.links.find(
          (link) => link.rel === "approval_url"
        ).href;

        res.status(201).json({
          success: true,
          approvalURL,
          orderId: newlyCreatedOrder._id,
        });
      }
    });
  } catch (e) {
    console.error("🔥 Error in createOrder:", e);
    res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};
const capturePayment = async (req, res) => {
  try {
    const { paymentId, payerId, orderId } = req.body;

    // Fetch the order by ID
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order cannot be found",
      });
    }

    // Update order payment and status
    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paymentId = paymentId;
    order.payerId = payerId;

    // Safely reduce stock for each product
    for (let item of order.cartItems) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productId}`,
        });
      }

      // Ensure totalStock is a number and prevent NaN
      const currentStock = Number(product.totalStock) || 0;
      const quantitySold = Number(item.quantity) || 0;

      let updatedStock = currentStock - quantitySold;
      if (updatedStock < 0) updatedStock = 0;

      console.log(
        "Updating stock for product:",
        product._id,
        "Old stock:",
        currentStock,
        "Quantity sold:",
        quantitySold,
        "New stock:",
        updatedStock
      );

      product.totalStock = updatedStock;
      await product.save();
    }

    // Clear the user's cart
    await Cart.findOneAndDelete({ userId: order.userId });
    console.log("🗑 Cleared cart for user:", order.userId);

    // Save the updated order
    await order.save();

    // ✅ Verify brandId is present in all items (for debugging)
    console.log("Order cartItems with brandId:");
    order.cartItems.forEach((item, index) => {
      console.log(`Item ${index + 1}:`, {
        product: item.title,
        brandId: item.brandId ? item.brandId.toString() : 'MISSING',
        quantity: item.quantity,
        price: item.price
      });
    });

    return res.status(200).json({
      success: true,
      message: "Order confirmed and cart cleared",
      data: order,
    });
  } catch (e) {
    console.error("🔥 capturePayment error:", e);
    return res.status(500).json({
      success: false,
      message: "Some error occurred!",
    });
  }
};


const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId });

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found!",
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

module.exports = {
  createOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrderDetails,
};