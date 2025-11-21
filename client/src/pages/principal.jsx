import React from "react";
import Footer from "../components/footer";

export default function Principal() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-100">
      {/* CONTENIDO PRINCIPAL (si querés agregar algo luego) */}
      <main className="flex-grow p-6 text-gray-800">
        <h1 className="text-3xl font-bold">Página Principal</h1>
        <p className="mt-2">Contenido...</p>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
