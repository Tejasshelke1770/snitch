import { Router } from "express";
import { authUserMiddleware } from "../middlewares/auth.middleware.js";
import { addToCart, getMyCart, incrementCartQuantity } from "../controllers/cart.controller.js";
import { validateCart, validateIncrementCartQuantity } from "../validators/cart.validator.js";

const cartRouter = Router();

cartRouter.post(
  "/add/:productId/:variantId",
  authUserMiddleware,
  validateCart,
  addToCart,
);

cartRouter.get("/", authUserMiddleware, getMyCart);

cartRouter.patch(
  "/quantity/increase/:productId/:varientId",
  authUserMiddleware,
  validateIncrementCartQuantity,
  incrementCartQuantity,
);

export default cartRouter;
