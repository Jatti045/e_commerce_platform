const cloudinary = require("../utils/cloudinary-config");
const Product = require("../models/Product");
const User = require("../models/User");
const Order = require("../models/Order");

const uploadImageToCloudinary = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.json({
        success: false,
        message:
          "Please upload an image for your product before submitting the form.",
      });
    }

    const base64String = file.buffer.toString("base64");
    const dataUrl = `data:${file.mimetype};base64,${base64String}`;

    const result = await cloudinary.uploader.upload(dataUrl);
    res.status(200).json({
      success: true,
      message: "Your product image has been successfully uploaded",
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

const fetchAdminDashboardData = async (req, res) => {
  try {
    const totalUsers = (await User.countDocuments()) - 1;
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Calculate total sales
    const totalSalesResult = await Order.aggregate([
      { $match: { orderStatus: { $ne: "cancelled" } } },
      { $group: { _id: null, totalSales: { $sum: "$totalAmount" } } },
    ]);
    const totalSales =
      totalSalesResult.length > 0 ? totalSalesResult[0].totalSales : 0;

    // Get sales data by month for the last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const salesByMonth = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo },
          orderStatus: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    // Create month names array
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Format the data for charts
    const revenueByMonth = salesByMonth.map((item) => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      revenue: item.revenue,
    }));

    const ordersByMonth = salesByMonth.map((item) => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      orders: item.orders,
    }));

    // Get top selling products
    const topProducts = await Order.aggregate([
      { $match: { orderStatus: { $ne: "cancelled" } } },
      { $unwind: "$cartItems" },
      {
        $lookup: {
          from: "products",
          localField: "cartItems.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: "$cartItems.product",
          productName: { $first: "$productDetails.productName" },
          totalSold: { $sum: "$cartItems.quantity" },
          revenue: {
            $sum: {
              $multiply: [
                "$cartItems.quantity",
                "$productDetails.productPrice",
              ],
            },
          },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $project: {
          productName: 1,
          totalSold: 1,
          revenue: { $round: ["$revenue", 2] },
        },
      },
    ]);

    // Get order status distribution
    const orderStatusDistribution = await Order.aggregate([
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          status: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          orders: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: "$_id",
          orders: 1,
          revenue: { $round: ["$revenue", 2] },
          _id: 0,
        },
      },
    ]);

    // Get category performance
    const categoryPerformance = await Order.aggregate([
      { $match: { orderStatus: { $ne: "cancelled" } } },
      { $unwind: "$cartItems" },
      {
        $lookup: {
          from: "products",
          localField: "cartItems.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: "$productDetails.category",
          totalSold: { $sum: "$cartItems.quantity" },
          revenue: {
            $sum: { $multiply: ["$cartItems.quantity", "$totalAmount"] },
          },
        },
      },
      { $sort: { revenue: -1 } },
      {
        $project: {
          category: "$_id",
          totalSold: 1,
          revenue: { $round: ["$revenue", 2] },
          _id: 0,
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalSales: Math.round(totalSales * 100) / 100, // Round to 2 decimal places
        revenueByMonth,
        ordersByMonth,
        topProducts,
        orderStatusDistribution,
        recentActivity,
        categoryPerformance,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

const fetchAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate({
        path: "user",
        model: "Users",
        select: "username email",
      })
      .populate({
        path: "cartItems.product",
        model: "Products",
        select: "productName productPrice productImage",
      })
      .populate({
        path: "addressInfo",
        model: "Address",
      })
      .sort({ createdAt: -1 });

    const formattedOrders = orders.map((order) => ({
      _id: order._id,
      customerName: order.user?.username || "Unknown Customer",
      customerEmail: order.user?.email || "Unknown Email",
      createdAt: order.createdAt,
      status: order.orderStatus,
      total: order.totalAmount,
      cartItems: order.cartItems,
      addressInfo: order.addressInfo,
      paymentId: order.paymentId,
      payerId: order.payerId,
    }));

    return res.status(200).json({
      success: true,
      data: formattedOrders,
    });
  } catch (error) {
    console.error("Error fetching all orders:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching orders",
    });
  }
};

module.exports = {
  uploadImageToCloudinary,
  fetchAdminDashboardData,
  fetchAllOrders,
};
