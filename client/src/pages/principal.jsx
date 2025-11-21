import React from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import CardUniv from "../components/CardUniv";

import "../pagescss/principal.css";

// IMPORTAR IMÁGENES DE LOGOS
import utnLogo from "../assets/logoUTN.jpg";
import unsamLogo from "../assets/logoUNSAM.png";
import ubaLogo from "../assets/logoUBA.jpg";

export default function Principal() {
  return (
    <div className="principal-container">

      {/* HEADER */}
      <Header />

      {/* CONTENIDO PRINCIPAL */}
      <main className="principal-main">
        <h1 className="principal-title">Página Principal</h1>
        <p className="principal-subtitle">Seleccioná una universidad:</p>

        {/* GRID DE CARDS */}
        <div className="card-grid">
          <CardUniv imagen={utnLogo} destino="/paginaUTN" />
          <CardUniv imagen={unsamLogo} destino="/paginaUNSAM" />
          <CardUniv imagen={ubaLogo} destino="/paginaUBA" />
        </div>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
