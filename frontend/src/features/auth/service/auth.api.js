import axios from "axios";

const api = axios.create({
  baseURL: `/api/auth`,
  withCredentials: true,
});

export async function register({
  email,
  contact,
  password,
  fullname,
  isSeller,
}) {
  const response = await api.post("/register", {
    email,
    contact,
    password,
    fullname,
    isSeller,
  });
  return response.data;
}

export async function login({ email, password }) {
  const response = await api.post("/login", { email, password });
  return response.data;
}

export async function loginWithGoogle() {
  const response = await api.get("/google");
  return response.data;
}
