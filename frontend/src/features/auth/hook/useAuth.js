import { setError, setLoading, setUser } from "../state/auth.slice";
import { register, login, loginWithGoogle, getMe } from "../service/auth.api";
import { useDispatch, useSelector } from "react-redux";

export const useAuth = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);
  const error = useSelector((state) => state.auth.error);

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
      return { success: true, user: data.user };
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
      const data = await login({ email, password });
      dispatch(setUser(data.user || data));
      return { success: true, user: data.user };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Login failed. Please try again.";
      dispatch(setError(message));
      return { success: false, error: message };
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleGoogleLogin() {
    try {
      dispatch(setLoading(true));
      const data = await loginWithGoogle();
      dispatch(setUser(data.user || data));
      return { success: true, user: data.user };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Google login failed. Please try again.";
      dispatch(setError(message));
      return { success: false, error: message };
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleGetMe() {
    try {
      dispatch(setLoading(true));
      const data = await getMe();
      dispatch(setUser(data.user));
      return { success: true, user: data.user };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Google login failed. Please try again.";
      dispatch(setError(message));
      return { success: false, error: message };
    } finally {
      dispatch(setLoading(false));
    }
  }

  return {
    user,
    loading,
    error,
    handleRegisterUser,
    handleLogin,
    handleGoogleLogin,
    handleGetMe,
  };
};
