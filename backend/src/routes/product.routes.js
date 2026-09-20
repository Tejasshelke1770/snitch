import { Router } from "express";
import {
  createProduct,
  getProductsBySeller,
  getAllProducts,
  getProductById,
  // updateVariantStock,
  deleteProductVariant,
  addProductVariant,
  deleteProduct,
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

productRouter.delete(
  "/seller/delete/variant/:productId/:variantId",
  authSellerMiddleware,
  deleteProductVariant,
);

productRouter.delete(
  "/seller/delete/product/:productId",
  authSellerMiddleware,
  deleteProduct,
);

// productRouter.patch(
//   "/:productId/variants/:variantId/stock",
//   authSellerMiddleware,
//   updateVariantStock,
// );

export default productRouter;
