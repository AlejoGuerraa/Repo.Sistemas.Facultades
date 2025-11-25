import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css";

// PÁGINAS
import Principal from "./pages/principal";
import AlumnoPage from "./pages/alumno";      // 👈 agregala
import UtnPage from "./pages/paginaUTN";            // 👈 agregalas
import UbaPage from "./pages/paginaUBA";
import UnsamPage from "./pages/paginaUNSAM";
import EasyMode from "./pages/easyMode";
import BrainHunter from "./pages/brainHunter";
import GhostHunter from "./pages/ghostHunter";

// DEFINICIÓN DE RUTAS
const router = createBrowserRouter([
  { path: "/", element: <Principal /> },

  // 👉 página individual del alumno
  { path: "/alumno/:id", element: <AlumnoPage /> },

  // 👉 páginas de universidades
  { path: "/utn", element: <UtnPage /> },
  { path: "/uba", element: <UbaPage /> },
  { path: "/unsam", element: <UnsamPage /> },
  { path: "/easy", element : <EasyMode/>},
  { path: "/ghost", element : <GhostHunter/>},
  { path: "/brain", element : <BrainHunter/>}

]);

// RENDER
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
