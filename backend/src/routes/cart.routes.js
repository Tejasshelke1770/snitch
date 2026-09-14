import { Router } from "express";
import { authUserMiddleware } from "../middlewares/auth.middleware.js";
import { addToCart, getMyCart } from "../controllers/cart.controller.js";
import { validateCart } from "../validators/cart.validator.js";

const cartRouter = Router();

cartRouter.post("/add/:productId/:variantId",
  authUserMiddleware,
  validateCart,
  addToCart,
);

cartRouter.get('/', authUserMiddleware, getMyCart)

export default cartRouter;
