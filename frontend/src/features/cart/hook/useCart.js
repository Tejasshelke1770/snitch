import { useDispatch } from "react-redux";
import {
  setItems,
  addItemToCart,
  removeItem,
  setLoading,
  setError,
} from "../state/cart.slice";
import { addItem, getCart } from "../service/cart.api";

const useCart = () => {
  const dispatch = useDispatch();

  const handleAddItem = async ({ productId, variantId, quantity }) => {
    try {
      dispatch(setLoading(true));
      const response = await addItem({ productId, variantId, quantity });
      //   dispatch(setItems(response.product))
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Failed to add product";
      dispatch(setError(message));
      return { success: false, error: message };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleGetCart = async () => {
    try {
      dispatch(setLoading(true));
      const response = await getCart();
      dispatch(addItemToCart(response.cart));
      return { success: true, cart: response.cart };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to get Cart Products. ";
      dispatch(setError(message));
      return { success: false, error: message };
    } finally {
      dispatch(setLoading(false));
    }
  };

  return { handleAddItem, handleGetCart };
};

export default useCart;
