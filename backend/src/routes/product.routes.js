import { Router } from "express";
import {
  createProduct,
  getProductsBySeller,
  getAllProducts,
  getProductById,
  // addVariant,
  // updateVariantStock,
  // deleteVariant,
  addProductVariant,
} from "../controllers/product.controller.js";
import { authSellerMiddleware } from "../middlewares/auth.middleware.js";
import multer from "multer";
import productValidator from "../validators/product.validator.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const productRouter = Router();

productRouter.post(
  "/",
  authSellerMiddleware,
  upload.array("images", 7),
  productValidator,
  createProduct,
);

productRouter.get("/seller", authSellerMiddleware, getProductsBySeller);
productRouter.get("/", getAllProducts);
productRouter.get("/details/:id", getProductById);

productRouter.post(
  "/seller/:productId/variants",
  authSellerMiddleware,
  upload.array("images", 7),
  addProductVariant,
);

// Variant Management routes
// productRouter.post(
//   "/:productId/variants",
//   authSellerMiddleware,
//   upload.array("images", 5),
//   addVariant,
// );

// productRouter.patch(
//   "/:productId/variants/:variantId/stock",
//   authSellerMiddleware,
//   updateVariantStock,
// );

// productRouter.delete(
//   "/:productId/variants/:variantId",
//   authSellerMiddleware,
//   deleteVariant,
// );

export default productRouter;
