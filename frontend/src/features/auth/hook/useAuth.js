import { setError, setLoading, setUser } from "../state/auth.slice";
import { register, login } from "../service/auth.api";
import { useDispatch, useSelector } from "react-redux";

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);

  async function handleRegisterUser({
    email,
    contact,
    password,
    fullname,
    isSeller = false,
  }) {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const data = await register({
        email,
        contact,
        password,
        fullname,
        isSeller,
      });
      dispatch(setUser(data.user || data));
      dispatch(setLoading(false));
      return { success: true, data };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Registration failed. Please try again.";
      dispatch(setError(message));
      dispatch(setLoading(false));
      return { success: false, error: message };
    }
  }

  async function handleLogin({ email, password }) {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const data = await login({ email, password });
      dispatch(setUser(data.user || data));
      dispatch(setLoading(false));
      return { success: true, data };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Login failed. Please try again.";
      dispatch(setError(message));
      dispatch(setLoading(false));
      return { success: false, error: message };
    }
  }

  return {
    user,
    loading,
    error,
    handleRegisterUser,
    handleLogin,
  };
};
