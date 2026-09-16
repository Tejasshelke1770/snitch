import axios from "axios";

const api = axios.create({
  baseURL: "/api/products",
  withCredentials: true,
});

export const createProduct = async (formData) => {
  const response = await api.post("/", formData);
  return response.data;
};

export const getProductsBySeller = async () => {
  const response = await api.get("/seller");
  return response.data;
};

export const getAllProducts = async () => {
  const response = await api.get("/");
  return response.data;
};

export const getProductById = async (productId) => {
  const response = await api.get(`/details/${productId}`);
  return response.data;
};

export const addProductVariants = async ({ formData, productId }) => {
  const response = await api.post(`/seller/${productId}/variants`, formData);
  return response.data;
};

export const deleteProductVariant = async ({ productId, variantId }) => {
  const response = await api.delete(`/seller/delete/variant/${productId}/${variantId}`);
  return response.data;
};

export const deleteProduct = async ( productId ) => {
  const response = await api.delete(`/seller/delete/product/${productId}`);
  return response.data;
};

// export const updateVariantStock = async (productId, variantId, stock) => {
//   const response = await api.patch(`/${productId}/variants/${variantId}/stock`, {
//     stock,
//   });
//   return response.data;
// };

