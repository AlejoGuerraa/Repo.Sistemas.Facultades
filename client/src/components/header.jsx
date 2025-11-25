// Header.jsx
import { useNavigate } from "react-router-dom";
import "../pagescss/header.css";
import { Ghost, Brain, Smile } from "lucide-react";

// IMPORTAR LOGO
import logo from "../assets/logo.png";

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="header-container">
      <div className="header-left" onClick={() => navigate("/")}>
        {/* LOGO CIRCULAR */}
        <img src={logo} alt="Logo" className="header-logo" />
        <span className="app-title">Sistema Facultades</span>
      </div>

      <div className="header-right">
        {/* Íconos con navegación */}
        
        <Smile
          className="icon"
          onClick={() => navigate("/easy")}
          title="Easy mode"
        />
        <Ghost
          className="icon"
          onClick={() => navigate("/ghost")}
          title="Ghost Hunter"
        />
        <Brain
          className="icon"
          onClick={() => navigate("/brain")}
          title="Brain Hunter"
        />
        
      </div>
    </header>
  );
}
