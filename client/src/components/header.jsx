import { useNavigate } from "react-router-dom";
import SearchBar from "./busqueda";
import "../pagescss/header.css";

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="header-container">
      <div className="header-left">

        <span className="app-title" onClick={() => navigate("/")}>
          Sistema Facultades
        </span>

        <div className="search-wrapper">
          <SearchBar />
        </div>
      </div>

      <div className="header-right"></div>
    </header>
  );
}
