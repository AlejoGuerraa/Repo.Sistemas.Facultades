import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Principal from "./pages/principal";
// import Usuario from "./pages/usuario";

const router = createBrowserRouter([
  { path: "/", element: <Principal /> },
  // { path: "/usuario", element: <Usuario /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
