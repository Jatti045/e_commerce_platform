const {
  addUserAddress,
  fetchUserAddress,
  deleteUserAddress,
  updateUserAddress,
  processPayment,
  fetchOrders,
} = require("../controllers/checkout-controller");
const express = require("express");

const router = express.Router();

router.post("/add-user-address", addUserAddress);
router.get("/get-user-address/:id", fetchUserAddress);
router.delete("/delete-user-address", deleteUserAddress);
router.put("/update-user-address", updateUserAddress);

// Orders
router.get("/get-orders/:id", fetchOrders);

// Stripe payment
router.post("/stripe", processPayment);

module.exports = router;
