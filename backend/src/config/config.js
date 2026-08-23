import { configDotenv } from "dotenv";
configDotenv();

if (!process.env.MONGO_URI) {
  throw new Error("MONGO URI is not defined in environment variables");
}
if (!process.env.JWT_SECRET_KEY) {
  throw new Error("JWT_SECRET_KEY is not defined in environment variables");
}

export const config = {
  MONGO_URI: process.env.MONGO_URI,
  PORT: process.env.PORT,
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
};
