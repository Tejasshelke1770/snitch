import { body, validationResult } from "express-validator";

function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

const productValidator = [
  body("title").notEmpty().withMessage("Title is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("priceAmount")
    .notEmpty()
    .withMessage("Price amount is required")
    .isNumeric()
    .withMessage("Price amount must be a number"),
  body("priceCurrency")
    .notEmpty()
    .withMessage("Price currency is required")
    .isIn(["INR", "USD", "EUR", "JPY", "GBP"])
    .withMessage("Price currency must be one of INR, USD, EUR, JPY, GBP"),
  body("images").custom((value, { req }) => {
    if (!req.files || req.files.length === 0) {
      throw new Error("At least one image is required");
    }
    return true;
  }),
  validateRequest,
];

export default productValidator;
