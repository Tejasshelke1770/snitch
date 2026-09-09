import { useDispatch, useSelector } from "react-redux";
import { createProduct, getAllProducts } from "../service/product.api";
import { setSellerProducts, setLoading, setError } from "../state/product.slice";

const useProduct = () => {
  const dispatch = useDispatch();
  const { loading, error, products } = useSelector((state) => state.product || {});

  const handleCreateProduct = async (formData) => {
    try {
      dispatch(setLoading(true));
      const response = await createProduct(formData);
      return { success: true, product: response.product };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to create product. Please try again.";
      dispatch(setError(message));
      dispatch(setLoading(false));
      return { success: false, error: message };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleGetProducts = async () => {
    try {
      dispatch(setLoading(true));
      const response = await getAllProducts();
      dispatch(setSellerProducts(response.products));
      return { success: true, products: response.products };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to get all products. Please try again.";
      dispatch(setError(message));
      dispatch(setLoading(false));
      return { success: false, error: message };
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    handleCreateProduct,
    handleGetProducts,
    loading,
    error,
    products
  };
};

export default useProduct;
