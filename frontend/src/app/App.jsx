import "./App.css";
import { RouterProvider } from "react-router";
import { routes } from "./app.routes.jsx";
import { useAuth } from "../features/auth/hook/useAuth.js";
import { useEffect } from "react";

const App = () => {
  const { handleGetMe } = useAuth();

  useEffect(()=>{
    handleGetMe()
  },[]);

  return (
      <RouterProvider router={routes} />
  );
};

export default App;
