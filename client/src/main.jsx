import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css"; // estilos globales

// PÁGINAS
import Principal from "./pages/principal";
// import Usuario from "./pages/usuario";  // si después lo agregás

// DEFINICIÓN DE RUTAS
const router = createBrowserRouter([
  { path: "/", element: <Principal /> },
  // { path: "/usuario", element: <Usuario /> },
]);

// RENDER
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
