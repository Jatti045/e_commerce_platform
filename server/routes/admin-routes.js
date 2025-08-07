const {
  uploadImageToCloudinary,
  fetchAdminDashboardData,
  fetchAllOrders,
} = require("../controllers/admin-controller");
const express = require("express");
const uploadMiddleware = require("../middlewares/upload-middleware");

const router = express.Router();

router.post(
  "/upload-image",
  uploadMiddleware.single("file"),
  uploadImageToCloudinary
);

router.get("/get-admin-dashboard-data", fetchAdminDashboardData);
router.get("/orders/all", fetchAllOrders);

module.exports = router;
