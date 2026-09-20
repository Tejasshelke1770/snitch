import productModel from "../models/product.model.js";
import cartModel from "../models/cart.model.js";
import { getStockOfVariant } from "../dao/product.dao.js";

export const addToCart = async (req, res) => {
  const userId = req.user._id;
  const productId = req.params.productId;
  const variantId = req.params.variantId;
  const quantity = req.body.quantity || 1;

  const product = await productModel.findOne({
    _id: productId,
    "variants._id": variantId,
  });

  if (!product) {
    return res.status(404).json({
      message: "Product not found",
      success: false,
    });
  }

  const stock = await getStockOfVariant(product, variantId);

  const cart =
    (await cartModel.findOne({ userId })) ||
    (await cartModel.create({ userId }));

  const isProductAlreadyExistInCart = cart.items.some(
    (el) =>
      el.product._id.toString() === productId.toString() &&
      el.variant._id.toString() === variantId.toString(),
  );

  if (isProductAlreadyExistInCart) {
    const cartQuantity = cart.items.find(
      (el) =>
        el.product._id.toString() === productId.toString() &&
        el.variant._id.toString() === variantId.toString(),
    ).quantity;

    if (cartQuantity + quantity > stock) {
      return res.status(400).json({
        message: `Cannot add ${quantity} items into cart. You already have ${cartQuantity} items in cart.`,
        success: false,
      });
    }

    await cartModel.findOneAndUpdate(
      { userId, "items.product": productId, "items.variant": variantId },
      { $inc: { "items.$.quantity": quantity } },
      { new: true },
    );

    return res.status(200).json({
      message: "Product quantity updated in cart",
      success: true,
    });
  }

  if (quantity > stock) {
    return res.status(400).json({
      message: `only ${stock} items left in stock`,
      success: false,
    });
  }

  cart.items.push({
    product: productId,
    variant: variantId,
    quantity,
    price: product.price,
  });

  await cart.save();

  return res.status(200).json({
    message: "Product added to cart successfully",
    success: true,
  });
};

export const getMyCart = async (req, res) => {
  const userId = req.user._id;

  let cart = await cartModel.findOne({ userId }).populate("items.product");

  if (!cart) {
    cart = await cartModel.create({ userId });
  }

  return res.status(200).json({
    message: "Cart Fetches successfully",
    success: true,
    cart,
  });
};

export const incrementCartQuantity = async (req, res) => {
  const productId = req.params.productId;
  const varientId = req.params.varientId;
  const userId = req.user._id;

  const product = await productModel.findOne({
    _id: productId,
    "variants._id": varientId,
  });

  if (!product) {
    return res.status(404).json({
      message: "Product not found!",
      success: false,
    });
  }

  const cart = await cartModel.findOne({ userId: userId });

  if (!cart) {
    return res.status(404).json({
      message: "cart not found",
      success: false,
    });
  }

  const stock = await getStockOfVariant(productId, varientId);

  const itemCartQuantity =
    cart.items.find(
      (item) =>
        item.product?.toString() === productId &&
        item.variant?.toString() === varientId,
    )?.quantity || 0;

  if (itemCartQuantity + 1 > stock) {
    return res.status(400).json({
      message: `only ${stock} items left in stock. you already have ${itemCartQuantity} items in cart`,
      success: false,
    });
  }

  await cartModel.findOneAndUpdate(
    { userId: userId, "items.product": productId, "items.variant": varientId },
    { $inc: { "items.$.quantity": 1 } },
    { new: true },
  );

  return res.status(200).json({
    message: "cart item quantity increased ",
    success: true,
  });
};
