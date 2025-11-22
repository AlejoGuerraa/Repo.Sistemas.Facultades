// Header.jsx
import { useNavigate } from "react-router-dom";
import "../pagescss/header.css";
import { Ghost, Brain, Smile } from "lucide-react"; // íconos

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="header-container">
      <div className="header-left">
        <span className="app-title" onClick={() => navigate("/")}>
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
