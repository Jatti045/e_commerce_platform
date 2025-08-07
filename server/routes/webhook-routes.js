const express = require("express");
const Stripe = require("stripe");
const Order = require("../models/Order");
const UserCart = require("../models/UserCart");
const Address = require("../models/Address");

const router = express.Router();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const stripe = new Stripe(STRIPE_SECRET_KEY);

// Test endpoint to verify webhook is reachable
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Webhook endpoint is accessible",
    timestamp: new Date().toISOString(),
  });
});

router.post(
  "/checkout",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.WEBHOOK_SECRET_KEY;
    let event;

    console.log("🔔 Webhook received");
    console.log("Headers:", req.headers);
    console.log("Webhook Secret exists:", !!webhookSecret);
    console.log("Signature exists:", !!sig);

    try {
      // Construct the event using the raw body and signature
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      console.log("✅ Webhook signature verified successfully");
    } catch (err) {
      console.error("⚠️ Stripe webhook signature verification failed:");
      console.error("Error message:", err.message);
      console.error("Error type:", err.type);
      console.error(
        "Webhook secret (first 10 chars):",
        webhookSecret?.substring(0, 10)
      );
      console.error("Signature (first 20 chars):", sig?.substring(0, 20));

      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid signature",
          error: err.message,
        });
    }

    console.log("📦 Event type:", event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const { userId } = session?.metadata;

      if (!userId) {
        console.error("⚠️ No userId in session metadata");
        return res.status(400).json({ success: false, message: "No user ID" });
      }

      try {
        // Fetch user cart with populated product data
        const userCart = await UserCart.findOne({ user: userId }).populate(
          "items.product"
        );

        if (!userCart || !userCart.items || userCart.items.length === 0) {
          console.error("⚠️ Cart not found or empty for user:", userId);
          return res
            .status(404)
            .json({ success: false, message: "Cart not found or empty" });
        }

        // Fetch user address
        const userAddress = await Address.findOne({ user: userId });

        if (!userAddress) {
          console.error("⚠️ Address not found for user:", userId);
          return res
            .status(404)
            .json({ success: false, message: "Address not found" });
        }

        console.log("Processing order for user:", userId);
        console.log("Cart items:", userCart.items.length);
        console.log("Session amount:", session.amount_total);

        // Prepare order items with all required fields
        const orderItems = userCart.items.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
          size: item.size,
        }));

        // Convert amount from cents to dollars (Stripe sends in smallest currency unit)
        const totalAmount = session.amount_total / 100;

        // Create new order
        const newOrder = new Order({
          user: userId,
          cartItems: orderItems,
          addressInfo: userAddress._id,
          totalAmount: totalAmount,
          paymentId: session.payment_intent,
          payerId: session.customer || session.customer_details?.email,
          orderStatus: "pending",
        });

        const savedOrder = await newOrder.save();
        console.log("✅ Order saved successfully:", savedOrder._id);

        // Clear the user's cart
        await UserCart.findOneAndUpdate(
          { user: userId },
          { $set: { items: [] } }
        );

        console.log("✅ Cart cleared for user:", userId);

        return res.status(200).json({
          success: true,
          message: "Order processed successfully",
          orderId: savedOrder._id,
        });
      } catch (err) {
        console.error("❌ Error processing order:", err);
        console.error("Error details:", err.stack);
        return res.status(500).json({
          success: false,
          message: "Internal server error",
          error: err.message,
        });
      }
    }

    res.status(200).json({ success: true, message: "Event received" });
  }
);

module.exports = router;
