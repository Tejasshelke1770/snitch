import { createBrowserRouter } from "react-router";
import Register from "../features/auth/pages/Register";
import Login from "../features/auth/pages/Login";
import CreateProduct from "../features/product/pages/CreateProduct";
import ProductsList from "../features/product/pages/ProductsList";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <h1>Home</h1>,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/products/create",
    element: <CreateProduct />,
  },
  {
    path: "/products",
    element: <ProductsList />,
  },
]);
