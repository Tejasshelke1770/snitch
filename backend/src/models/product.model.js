import mongoose from "mongoose";
import priceSchema from "./schemas/price.schema.js";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    price: {
      type: priceSchema,
      required: true,
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
      },
    ],
    variants: [
      {
        images: [{ url: { type: String, required: true } }],
        stock: { type: Number, required: true },
        attributes: { type: Map, of: String },
        price: {
          price: {
            type: priceSchema,
            required: true,
          },
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

const productModel = mongoose.model("product", productSchema);

export default productModel;
