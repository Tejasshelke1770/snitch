import productModel from "../models/product.model.js";
import UploadImage from "../services/storage.service.js";

export const createProduct = async (req, res) => {
  const { title, description, priceAmount, priceCurrency } = req.body;
  const seller = req.user;

  const images = await Promise.all(
    req.files.map(async (file) => {
      return await UploadImage({
        buffer: file.buffer,
        fileName: file.originalname,
      });
    }),
  );

  const product = await productModel.create({
    title,
    description,
    seller: seller._id,
    price: {
      amount: priceAmount,
      currency: priceCurrency || "INR",
    },
    images,
  });

  res.status(201).json({
    message: "Prouct Created successfully",
    success: true,
    product,
  });
};

export const getProductsBySeller = async (req, res) => {
  const user_id = req.user._id;

  const products = await productModel.find({ seller: user_id });

  return res.status(200).json({
    message: "products fetched successfully",
    success: true,
    products,
  });
};

export const getAllProducts = async (req, res) => {
  const products = await productModel.find();

  return res.status(200).json({
    message: "Products fetched successfully",
    success: true,
    products,
  });
};

export const getProductById = async (req, res) => {
  const productId = req.params.id;

  const product = await productModel.findById(productId);

  if (!product) {
    return res.status(404).json({
      message: "Product not found",
      success: false,
    });
  }

  return res.status(200).json({
    message: "Product details fetched successfully",
    success: true,
    product,
  });
};

export const addProductVariant = async (req, res) => {
  const productId = req.params.productId;
  const userId = req.user._id;
  const files = req.files;
  const images = [];

  const product = await productModel.findOne({
    $and: [{ _id: productId }, { seller: userId }],
  });

  if (!product) {
    return res.status(404).json({
      message: "Product not found",
      success: false,
    });
  }

  if (files || files?.length > 0) {
    (
      await Promise.all(
        files.map(async (file) => {
          const image = await UploadImage({
            buffer: file.buffer,
            fileName: file.originalname,
          });
          return image;
        }),
      )
    ).map((img) => images.push(img));
  }

  const price = req.body.priceAmount;
  const stock = req.body.stock;
  const attributes = JSON.parse(req.body.attributes) || {};

  product.variants.push({
    images,
    price: {
      amount: price || product.price.amount,
      currency: req.body.priceCurrency || product.price.currency,
    },
    stock,
    attributes,
  });

  await product.save();

  return res.status(201).json({
    message: "Variant added successfully",
    success: true,
    product,
  });
};

export const deleteProductVariant = async (req, res) => {
  const productId = req.params.productId;
  const variantId = req.params.variantId;
  const userId = req.user._id;

  const variant = await productModel.findOne({
    _id: productId,
    seller: userId,
    variants: {
      $elemMatch: {
        _id: variantId,
      },
    },
  });

  if (!variant) {
    return res.status(404).json({
      message: "variant not found",
      success: false,
    });
  }

  await productModel.findOneAndUpdate(
    { _id: productId, seller: userId },
    { $pull: { variants: { _id: variantId } } },
    { new: true },
  );

  return res.status(200).json({
    message: "variant deleted ",
    success: true,
  });
};

export const deleteProduct = async (req, res) => {
  const userId = req.user._id;
  const productId = req.params.productId;

  const product = await productModel.findOneAndDelete({
    _id: productId,
    seller: userId,
  });

  if (!product) {
    return res.status(404).json({
      message: "product not found",
      success: false,
    });
  }

  return res.status(200).json({
    message: "product deleted",
    success: true,
  });
};

// edit product
//update vaiant

// export const updateVariantStock = async (req, res) => {
//   try {
//     const { productId, variantId } = req.params;
//     const { stock } = req.body;
//     const seller = req.user;

//     const product = await productModel.findOne({ _id: productId, seller: seller._id });
//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found or unauthorized",
//       });
//     }

//     const variant = product.variants.id(variantId);
//     if (!variant) {
//       return res.status(404).json({
//         success: false,
//         message: "Variant not found",
//       });
//     }

//     variant.stock = Math.max(0, Number(stock) || 0);
//     await product.save();

//     return res.status(200).json({
//       message: "Variant stock updated successfully",
//       success: true,
//       product,
//       variant,
//     });
//   } catch (err) {
//     return res.status(500).json({
//       success: false,
//       message: err.message || "Failed to update variant stock",
//     });
//   }
// };

