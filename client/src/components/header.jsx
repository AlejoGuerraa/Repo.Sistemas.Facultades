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

        <span className="app-title">
          Sistema Facultades
        </span>
      </div>

      <div className="header-right">
        <Ghost className="icon" />
        <Brain className="icon" />
        <Smile className="icon" />
      </div>
    </header>
  );
}
