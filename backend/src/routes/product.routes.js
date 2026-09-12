import { Router } from "express";
import {
  createProduct,
  getProductsBySeller,
  getAllProducts
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
productRouter.get("/", getAllProducts)

export default productRouter;
