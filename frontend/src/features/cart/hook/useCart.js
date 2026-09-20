import { useDispatch, useSelector } from "react-redux";
import { setItems, setLoading, setError, incrementCartItemQuantity } from "../state/cart.slice";
import { addItem, addItemQuantity, getCart } from "../service/cart.api";

const useCart = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.cartItems);
  const loading = useSelector((state) => state.cart.loading);
  const error = useSelector((state) => state.cart.error);

  const handleAddItem = async ({ productId, variantId, quantity }) => {
    try {
      dispatch(setLoading(true));
      await addItem({ productId, variantId, quantity });
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
      dispatch(setItems(response.cart.items));
      return { success: true, cart: response.cart.items };
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

  const handleIncreaseCartItemQuantity = async ({ productId, varientId }) => {
    try {
      dispatch(setLoading(true));
      await addItemQuantity({ productId, varientId });
      dispatch(incrementCartItemQuantity({productId, varientId}))
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to increase item quantity. ";
      dispatch(setError(message));
      return { success: false, error: message };
    } finally {
      dispatch(setLoading(false));
    }
  };

  //decrease stock
  //remove cart item
  //remove all cart

  return {
    handleAddItem,
    handleGetCart,
    handleIncreaseCartItemQuantity,
    cartItems,
    loading,
    error,
  };
};

export default useCart;
