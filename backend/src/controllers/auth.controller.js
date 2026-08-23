import userModel from "../models/user.model.js";
import { config } from "../config/config.js";
import jwt from "jsonwebtoken";

const generateToken = (user) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    config.JWT_SECRET_KEY,
    { expiresIn: "7d" },
  );
  return token;
};

export const registerUser = async (req, res) => {
  const { email, contact, password, fullname } = req.body;

  const exUser = await userModel.findOne({ $or: [{ email }, { contact }] });

  if (exUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = await userModel.create({
    email,
    contact,
    password,
    fullname,
  });

  const token = generateToken(user);
  res.cookie("token", token);

  res.status(201).json({
    message: "User registered successfully",
    user: {
      id: user._id,
      email: user.email,
      contact: user.contact,
      fullname: user.fullname,
      role: user.role,
    },
  });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const exUser = await userModel.findOne({ email }).select("+password");

  if (!exUser) {
    return res.status(400).json({ message: "User does not exist" });
  }

  const isValidPassword = await exUser.comparePassword(password);

  if (!isValidPassword) {
    return res.status(400).json({ message: "Invalid Credientials" });
  }

  const token = generateToken(exUser);
  res.cookie("token", token);

  res.status(200).json({
    message: "User logged in successfully",
    user: {
      id: exUser._id,
      email: exUser.email,
      contact: exUser.contact,
      fullname: exUser.fullname,
      role: exUser.role,
    },
  });
};
