const Product = require("../models/Product");
const UserCart = require("../models/UserCart");

const invalidateProductCache = async (redisClient) => {
  const keys = await redisClient.keys("products:cat:*");
  if (keys.length) {
    await redisClient.del(...keys);
  }
};

const addNewProduct = async (req, res) => {
  try {
    const {
      productImage,
      productImagePublicId,
      productName,
      productDescription,
      productPrice,
      productCategory,
      clothingType,
      productSize,
    } = req.body;

    const productPriceToNum = parseFloat(productPrice);

    if (
      productImage === "" ||
      productImagePublicId === "" ||
      productName === "" ||
      productDescription === "" ||
      productPrice === "" ||
      productCategory === "" ||
      clothingType === "" ||
      !productSize ||
      isNaN(productPriceToNum)
    ) {
      return res.json({
        success: false,
        message:
          "Please complete all required fields appropriately. Make sure to enter the product name, description, price, category, and clothing type.",
      });
    }

    const newlyCreatedProduct = new Product({
      productImage,
      productImagePublicId,
      productName,
      productDescription,
      productPrice,
      productCategory,
      clothingType,
      productSize,
    });

    await newlyCreatedProduct.save();

    await invalidateProductCache(req.redisClient);

    if (newlyCreatedProduct) {
      return res.json({
        success: true,
        message:
          "Success! Your product has been successfully created and added to your catalog.",
        data: newlyCreatedProduct,
      });
    } else {
      res.json({
        success: false,
        message:
          "Your product could not be created. Please check your inputs and try again.",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

const fetchAllProducts = async (req, res) => {
  try {
    const allProducts = await Product.find({});

    if (!allProducts) {
      return res.json({
        success: false,
        message: "Currently, no products have been added",
      });
    }

    res.status(200).json({
      success: true,
      data: allProducts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

const deleteExistingProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message:
          "We're sorry, but the product you're looking for doesn't exist. Please check your list or try a different search.",
      });
    }

    await invalidateProductCache(req.redisClient);

    res.json({
      success: true,
      message:
        "Success! Your product has been successfully removed from your catalog",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

const editExistingProduct = async (req, res) => {
  try {
    const id = req.params.id;

    const {
      productImage,
      productImagePublicId,
      productName,
      productDescription,
      productPrice,
      productCategory,
      clothingType,
      productSize,
    } = req.body;

    const productPriceToNum = parseFloat(productPrice);

    if (
      productImage === "" ||
      productImagePublicId === "" ||
      productName === "" ||
      productDescription === "" ||
      productPrice === "" ||
      productCategory === "" ||
      clothingType === "" ||
      !productSize ||
      isNaN(productPriceToNum)
    ) {
      return res.json({
        success: false,
        message:
          "Please complete all required fields appropriately. Make sure to enter the product name, description, price, category, and clothing type.",
      });
    }

    const prevProductData = await Product.findById(id);
    if (
      prevProductData.productImage === productImage &&
      prevProductData.productImagePublicId === productImagePublicId &&
      prevProductData.productName === productName &&
      prevProductData.productDescription === productDescription &&
      prevProductData.productPrice === productPrice &&
      prevProductData.productCategory === productCategory &&
      prevProductData.clothingType === clothingType &&
      JSON.stringify(prevProductData.productSize) ===
        JSON.stringify(productSize)
    ) {
      return res.json({
        success: false,
        message:
          "It looks like no changes were made. Please update at least one field before submitting to save your changes.",
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        productImage,
        productImagePublicId,
        productName,
        productDescription,
        productPrice,
        productCategory,
        clothingType,
        productSize,
      },
      { new: true, runValidators: true }
    );

    await invalidateProductCache(req.redisClient);

    res.json({
      success: true,
      message:
        "Success! Your product has been updated and all changes have been saved.",
      updatedProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

const fetchSingleProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const singleProduct = await Product.findById(id);

    if (!singleProduct) {
      return res.json({
        success: false,
        message:
          "We're sorry, but the product you're looking for doesn't exist. Please check your list or try a different search.",
      });
    }

    res.json({
      success: true,
      message:
        "Success! The product details have been loaded and are ready for you to view",
      product: singleProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

const addProductToUserCart = async (req, res) => {
  try {
    const { productId, userId, size } = req.body;

    if (!userId) {
      return res.json({
        success: false,
        message: "Please log in to add items to your cart",
      });
    }

    if (!productId) {
      return res.json({
        success: false,
        message:
          "We ran into an issue while adding the product to your cart. Please try again later.",
      });
    }

    if (!size) {
      return res.json({
        success: false,
        message: "Please select a size before adding to your cart.",
      });
    }

    let userCart = await UserCart.findOne({ user: userId });
    if (!userCart) {
      userCart = new UserCart({
        user: userId,
        items: [],
      });
    }

    const existingItemIndex = userCart.items.findIndex(
      (item) =>
        item.product.toString() === productId.toString() && item.size === size
    );

    if (existingItemIndex !== -1) {
      userCart.items[existingItemIndex].quantity += 1;
    } else {
      userCart.items.push({ product: productId, size, quantity: 1 });
    }

    await userCart.save();
    res.json({
      success: true,
      message: "The product has been added to your cart.",
      data: userCart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

const removeProductFromUserCart = async (req, res) => {
  try {
    const productId = req.params.id;
    const { userId, size } = req.body;

    const updatedCart = await UserCart.findOneAndUpdate(
      {
        user: userId,
      },
      {
        $pull: { items: { product: productId, size } },
      },
      {
        new: true,
      }
    );

    if (!updatedCart) {
      return res.status(404).json({
        success: false,
        message:
          "We couldn't remove the product from your cart. Please try again.",
      });
    }

    res.json({
      success: true,
      message: "The product has been removed from your cart.",
      data: updatedCart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

const fetchUserCart = async (req, res) => {
  try {
    const { id } = req.body;

    const cart = await UserCart.findOne({ user: id });
    const cartProducts = await UserCart.findOne({ user: id }).populate(
      "items.product"
    );

    if (!cartProducts) {
      return res.json({
        success: false,
        data: [],
        totalItems: 0,
        totalCost: 0,
        message: "No cart found for this user.",
      });
    }

    const totalItems = cart?.items?.reduce(
      (acc, item) => acc + item.quantity,
      0
    );

    const totalCost = cartProducts?.items?.reduce(
      (acc, item) =>
        acc + parseFloat(item.product.productPrice) * item.quantity,
      0
    );

    res.json({
      success: true,
      data: cartProducts,
      totalItems,
      totalCost: totalCost.toFixed(2),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

const fetchProductsByCategory = async (req, res) => {
  try {
    const { category, type, sort } = req.query;

    const cacheKey = `products:cat:${category || "all"}:type:${
      type || "all"
    }:sort:${sort || "none"}`;

    // attempt to read from Redis
    const cached = await req.redisClient.get(cacheKey);
    if (cached) {
      let data;
      if (typeof cached === "string") {
        try {
          data = JSON.parse(cached);
        } catch (e) {
          // if parsing fails, fall back to the raw string
          data = cached;
        }
      } else {
        data = cached;
      }
      return res.status(200).json({
        success: true,
        message: "Products fetched successfully",
        data,
      });
    }

    // build Mongo query
    const productQuery = {};
    if (category) productQuery.productCategory = category;
    if (type) productQuery.clothingType = type;

    // build sort
    const sortOption =
      sort === "asc"
        ? { productPrice: 1 }
        : sort === "desc"
        ? { productPrice: -1 }
        : {};

    // hit the database
    const products = await Product.find(productQuery).sort(sortOption);

    if (!products.length) {
      return res.status(200).json({
        success: false,
        message: "No products available",
        data: products,
      });
    }

    // cache the fresh result
    await req.redisClient.set(cacheKey, JSON.stringify(products));

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

const increaseProductQuantity = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const cartProducts = await UserCart.findOne({ user: userId }).populate(
      "items.product"
    );

    if (!cartProducts) {
      return res.status(404).json({
        success: false,
        message: "No cart found for this user.",
      });
    }

    const product = cartProducts.items.find(
      (item) => item.product._id.toString() === productId
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart.",
      });
    }

    product.quantity += 1;
    await cartProducts.save();

    const totalItems = cartProducts.items.reduce(
      (acc, item) => acc + item.quantity,
      0
    );

    const totalCost = cartProducts.items.reduce(
      (acc, item) =>
        acc + parseFloat(item.product.productPrice) * item.quantity,
      0
    );

    res.json({
      success: true,
      data: cartProducts,
      totalItems,
      totalCost: totalCost.toFixed(2),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

const decreaseProductQuantity = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const cartProducts = await UserCart.findOne({ user: userId }).populate(
      "items.product"
    );

    if (!cartProducts) {
      return res.status(404).json({
        success: false,
        message: "No cart found for this user.",
      });
    }

    const product = cartProducts.items.find(
      (item) => item.product._id.toString() === productId
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart.",
      });
    }

    product.quantity -= 1;
    await cartProducts.save();

    let updatedCart = null;

    if (product.quantity === 0) {
      updatedCart = await UserCart.findOneAndUpdate(
        {
          user: userId,
        },
        {
          $pull: { items: { product: productId } },
        },
        {
          new: true,
        }
      );

      if (!updatedCart) {
        return res.status(404).json({
          success: false,
          message:
            "We couldn't remove the product from your cart. Please try again.",
        });
      }
    } else {
      updatedCart = cartProducts;
    }

    const totalItems = cartProducts.items.reduce(
      (acc, item) => acc + item.quantity,
      0
    );

    const totalCost = cartProducts.items.reduce(
      (acc, item) =>
        acc + parseFloat(item.product.productPrice) * item.quantity,
      0
    );

    res.json({
      success: true,
      data: updatedCart,
      totalItems,
      totalCost: totalCost.toFixed(2),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

module.exports = {
  addNewProduct,
  fetchAllProducts,
  deleteExistingProduct,
  editExistingProduct,
  fetchSingleProduct,
  addProductToUserCart,
  fetchUserCart,
  removeProductFromUserCart,
  fetchProductsByCategory,
  increaseProductQuantity,
  decreaseProductQuantity,
};
