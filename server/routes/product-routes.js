const express = require("express");
const {
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
} = require("../controllers/product-controller");

const router = express.Router();

router.post("/add", addNewProduct);
router.get("/all", fetchAllProducts);
router.delete("/delete/:id", deleteExistingProduct);
router.put("/update/:id", editExistingProduct);
router.get("/get/:id", fetchSingleProduct);
router.post("/add-to-user-cart", addProductToUserCart);
router.post("/get-user-cart", fetchUserCart);
router.delete("/delete-from-user-cart/:id", removeProductFromUserCart);
router.get("/get-products-by-category", fetchProductsByCategory);
router.post("/increase-product-quantity", increaseProductQuantity);
router.post("/decrease-product-quantity", decreaseProductQuantity);

module.exports = router;
