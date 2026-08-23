import express from "express";
import { registerUser, loginUser } from "../controllers/auth.controller.js";
import {
  loginUserValidator,
  registerUserValidator,
} from "../validators/auth.validator.js";

const authRouter = express.Router();

authRouter.post("/register", registerUserValidator, registerUser);
authRouter.post("/login", loginUserValidator, loginUser);

export default authRouter;
