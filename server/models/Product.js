const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    productImage: {
      type: String,
      required: true,
    },
    productImagePublicId: {
      type: String,
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    productDescription: {
      type: String,
      required: true,
    },
    productPrice: {
      type: Number,
      required: true,
    },
    productCategory: {
      type: String,
      required: true,
      enum: ["men", "women", "unisex", "kids"],
    },
    clothingType: {
      type: String,
      required: true,
      enum: ["shirt", "pants", "shoes", "accessories", "jackets", "hoodies"],
    },
    productSize: {
      xs: { type: Number, required: true, min: 0, default: 0 },
      s: { type: Number, required: true, min: 0, default: 0 },
      m: { type: Number, required: true, min: 0, default: 0 },
      l: { type: Number, required: true, min: 0, default: 0 },
      xl: { type: Number, required: true, min: 0, default: 0 },
      "2xl": { type: Number, required: true, min: 0, default: 0 },
    },
    inStock: { type: Number, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Products", ProductSchema);
