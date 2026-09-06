import express from "express";
import {
  registerUser,
  loginUser,
  googleCallback,
} from "../controllers/auth.controller.js";
import {
  loginUserValidator,
  registerUserValidator,
} from "../validators/auth.validator.js";
import passport from "passport";
import { config } from "../config/config.js";

const authRouter = express.Router();

authRouter.post("/register", registerUserValidator, registerUser);
authRouter.post("/login", loginUserValidator, loginUser);

authRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
); //redirects to google for authentication

authRouter.get("/google/callback",      // callback route after google authentication
  passport.authenticate("google", {
    failureRedirect:
      config.NODE_ENV === "development"
        ? "http://localhost:5173/login"
        : "/login",
    session: false,
  }),
  googleCallback,
);

export default authRouter;
