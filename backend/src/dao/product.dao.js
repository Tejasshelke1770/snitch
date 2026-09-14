import productModel from "../models/product.model.js";

export const getStockOfVariant = async (productId, variantId) => {
  const product = await productModel.findOne({
    _id: productId,
    "variants._id": variantId,
  });

  const stock = product?.variants?.find(
      (variant) => variant._id.toString() === variantId.toString(),
    )?.stock || 0;
  return stock;
};
