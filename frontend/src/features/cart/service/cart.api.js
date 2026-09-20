import axios from "axios";

const api = axios.create({
  baseURL: "/api/cart",
  withCredentials: true,
});

export const addItem = async ({ productId, variantId, quantity }) => {
  const response = await api.post(`/add/${productId}/${variantId}`, {
    quantity: quantity,
  });
  return response.data;
};

export const getCart = async () => {
  const response = await api.get("/");
  return response.data;
};

export const clearCart = async () => {
  const response = await api.delete("/clear");
  return response.data;
};

export const removeCartItem = async (itemId) => {
  const response = await api.delete(`/item/remove/${itemId}`);
  return response.data;
};

//done
export const addItemQuantity = async ({ productId, varientId }) => {
  const response = await api.patch(`/quantity/increase/${productId}/${varientId}`);
  return response.data;
};

export const removeItemQuantity = async ({ itemId, quantity = 1 }) => {
  const response = await api.post(`/item/add/${itemId}`, { quantity });
  return response.data;
};
