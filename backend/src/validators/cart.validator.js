import { body, param, validationResult } from "express-validator";

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }
  next();
};

export const validateCart = [
  param("productId").isMongoId().withMessage("invalid product ID"),
  param("variantId").optional().isMongoId().withMessage("invalid variant ID"),
  body("quantity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Quantity atleast must be 1"),
  validateRequest,
];
