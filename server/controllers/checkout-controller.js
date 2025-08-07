const Address = require("../models/Address");
const Order = require("../models/Order");
const UserCart = require("../models/UserCart");
const Stripe = require("stripe");

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const stripe = new Stripe(STRIPE_SECRET_KEY);

const addUserAddress = async (req, res) => {
  try {
    const {
      isAuthenticated,
      user,
      name,
      streetAddress,
      city,
      region,
      postalCode,
      country,
    } = req.body;

    if (!isAuthenticated || !user) {
      return res.json({
        success: false,
        message:
          "You must be logged in to add a new address. Please log in or register first.",
      });
    }

    const existingUserAddress = await Address.findOne({ user: user.userId });

    if (existingUserAddress) {
      return res.json({
        success: false,
        message:
          "It looks like you already have an address saved. If you'd like to update it, please use the update option.",
      });
    }

    if (
      name === "" ||
      streetAddress === "" ||
      city === "" ||
      region === "" ||
      postalCode === "" ||
      country === ""
    ) {
      return res.json({
        success: false,
        message: "Please fill in all required fields to complete your address.",
      });
    }

    const newlyCreatedUserAddress = new Address({
      user: user.userId,
      name,
      streetAddress,
      city,
      region,
      postalCode,
      country,
    });

    await newlyCreatedUserAddress.save();

    if (!newlyCreatedUserAddress) {
      return res.json({
        success: false,
        message:
          "We’re sorry, but we couldn’t add your address at this time. Please try again later.",
      });
    }

    res.json({
      success: true,
      message: "Your address has been added successfully.",
      address: newlyCreatedUserAddress,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

const fetchUserAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const userAddress = await Address.findOne({ user: id });

    if (!userAddress) {
      return res.status(404).json({
        success: false,
        message:
          "We couldn’t find an address on file. Please add your shipping address to proceed.",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Your address has been successfully retrieved. Please review it for accuracy.",
      data: userAddress,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

const deleteUserAddress = async (req, res) => {
  try {
    const { userId } = req.body;

    const deletedUserAddress = await Address.findOneAndDelete({ user: userId });

    if (!deletedUserAddress) {
      return res.json({
        success: false,
        message:
          "We're sorry, but we couldn't remove your address at this time. Please try again later.",
      });
    }

    res.json({
      success: true,
      message: "Your address has been removed successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

const updateUserAddress = async (req, res) => {
  try {
    const { userId, name, streetAddress, city, region, postalCode, country } =
      req.body;

    const existingUserAddress = await Address.findOne({ user: userId });

    if (!existingUserAddress) {
      return res.status(404).json({
        success: false,
        message:
          "It looks like you do not have an address saved. Please create an address first before updating.",
      });
    }

    if (
      existingUserAddress.name === name &&
      existingUserAddress.streetAddress === streetAddress &&
      existingUserAddress.city === city &&
      existingUserAddress.region === region &&
      existingUserAddress.postalCode === postalCode &&
      existingUserAddress.country === country
    ) {
      return res.json({
        success: false,
        message:
          "No changes detected. Please update at least one field before submitting.",
      });
    }

    if (
      name === "" ||
      streetAddress === "" ||
      city === "" ||
      region === "" ||
      postalCode === "" ||
      country === ""
    ) {
      return res.json({
        success: false,
        message: "Please fill in all required fields to complete your address.",
      });
    }

    const updatedAddress = await Address.findOneAndUpdate(
      {
        user: userId,
      },
      {
        name,
        streetAddress,
        city,
        region,
        postalCode,
        country,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedAddress) {
      return res.json({
        success: false,
        message:
          "We're sorry, but we couldn't update your address at this time. Please try again later.",
      });
    }

    res.json({
      success: true,
      message: "Your address has been updated successfully.",
      address: updatedAddress,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

const processPayment = async (req, res, next) => {
  try {
    const { isAuthenticated, user } = req.body;

    if (!isAuthenticated || !user) {
      return res.json({
        success: false,
        message:
          "You must be logged in to checkout. Please log in or register first.",
      });
    }

    const userId = user?.userId;

    const userAddress = await Address.findOne({ user: userId });

    if (!userAddress) {
      return res.json({
        success: false,
        message: "You must register your address to checkout.",
      });
    }

    const cart = await UserCart.findOne({ user: userId }).populate({
      path: "items.product",
      select: "productName productPrice",
    });

    if (!cart || cart.items.length === 0) {
      return res.json({ success: false, message: "Cart is empty." });
    }

    const line_items = cart.items.map(({ product, quantity, size }) => ({
      price_data: {
        currency: "cad",
        product_data: {
          name: product.productName,
          description: `Size: ${size}`,
        },
        unit_amount: Math.round(product.productPrice * 100),
      },
      quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      success_url: `${req.headers.origin}/user/cart?success=true`,
      cancel_url: `${req.headers.origin}/user/cart?cancelled=true`,
      metadata: {
        userId: userId.toString(),
        address_line1: userAddress.streetAddress,
        address_city: userAddress.city,
        address_state: userAddress.region,
        address_postal: userAddress.postalCode,
        address_country: userAddress.country,
      },
    });

    res.status(200).json({ success: true, sessionId: session.id });
  } catch (error) {
    next(error);
  }
};

const fetchOrders = async (req, res) => {
  try {
    const { id } = req.params;

    const orders = await Order.find({ user: id })
      .populate({
        path: "cartItems.product",
        model: "Products",
        select: "productName productPrice productImage",
      })
      .populate({
        path: "addressInfo",
        model: "Address",
      });

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No orders were found",
      });
    }

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  addUserAddress,
  fetchUserAddress,
  deleteUserAddress,
  updateUserAddress,
  processPayment,
  fetchOrders,
};
