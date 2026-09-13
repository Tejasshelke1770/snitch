import { useDispatch, useSelector } from "react-redux";
import { createProduct, getProductsBySeller, getAllProducts, getProductById, } from "../service/product.api";
import { setSellerProducts, setLoading, setError, setAllProducts, } from "../state/product.slice";

const useProduct = () => {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.product.products);
  const AllProducts = useSelector((state) => state.product.allProducts);
  const loading = useSelector((state) => state.product.loading);
  const error = useSelector((state) => state.product.error);

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
      return { success: false, error: message };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleGetProductsBySeller = async () => {
    try {
      dispatch(setLoading(true));
      const response = await getProductsBySeller();
      dispatch(setSellerProducts(response.products));
      return { success: true, products: response.products };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to get products. Please try again.";
      dispatch(setError(message));
      return { success: false, error: message };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleGetAllProducts = async () => {
    try {
      dispatch(setLoading(true));
      const response = await getAllProducts();
      dispatch(setAllProducts(response.products));
      return { success: true, products: response.products };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to get all products. Please try again.";
      dispatch(setError(message));
      return { success: false, error: message };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleGetProductById = async (productId) => {
    const response = await getProductById(productId)
    return response.product
  }

  return {
    handleCreateProduct,
    handleGetProductsBySeller,
    handleGetAllProducts,
    handleGetProductById,
    products,
    AllProducts,
    loading,
    error,
  };
};

export default useProduct;
