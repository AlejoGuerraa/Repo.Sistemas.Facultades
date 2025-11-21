import React from "react";
import { useNavigate } from "react-router-dom";
import "../pagescss/cardUniv.css";

export default function CardUniv({ imagen, destino, nombre }) {
  const navigate = useNavigate();

  return (
    <div className="card-univ" onClick={() => navigate(destino)}>
      <img src={imagen} alt={nombre} className="card-univ-img" />
      <h3 className="card-univ-title">{nombre}</h3>
    </div>
  );
}
