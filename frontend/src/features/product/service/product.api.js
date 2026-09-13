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

// export const addVariant = async (productId, variantData) => {
//   const isFormData = variantData instanceof FormData;
//   const response = await api.post(`/${productId}/variants`, variantData, {
//     headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
//   });
//   return response.data;
// };

// export const updateVariantStock = async (productId, variantId, stock) => {
//   const response = await api.patch(`/${productId}/variants/${variantId}/stock`, {
//     stock,
//   });
//   return response.data;
// };

// export const deleteVariant = async (productId, variantId) => {
//   const response = await api.delete(`/${productId}/variants/${variantId}`);
//   return response.data;
// };
