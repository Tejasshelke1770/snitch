import "./App.css";
import { RouterProvider } from "react-router";
import { Provider } from "react-redux";
import { store } from "./app.store.js";
import { routes } from "./app.routes.jsx";

const App = () => {
  return (
    <Provider store={store}>
      <RouterProvider router={routes} />
    </Provider>
  );
};

export default App;
