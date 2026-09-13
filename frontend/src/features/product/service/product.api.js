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
  const response = await api.get(`/details/${productId}`)
  return response.data
}
