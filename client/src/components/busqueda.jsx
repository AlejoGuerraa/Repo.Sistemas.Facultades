import React, { useState, useEffect, useRef } from "react";

/**
 * Busqueda.jsx
 * Props:
 *  - onSearch(term) : function called when user types (debounced)
 *
 * CSS incluido abajo.
 */
export default function Busqueda({ onSearch, placeholder = "Buscar por nombre, apellido o DNI..." }) {
  const [term, setTerm] = useState("");
  const debRef = useRef(null);

  useEffect(() => {
    // Debounce 400ms
    if (debRef.current) clearTimeout(debRef.current);
    debRef.current = setTimeout(() => {
      onSearch(term.trim());
    }, 400);

    return () => clearTimeout(debRef.current);
  }, [term, onSearch]);

  return (
    <div className="busqueda-wrapper">
      <input
        className="busqueda-input"
        type="search"
        value={term}
        placeholder={placeholder}
        onChange={(e) => setTerm(e.target.value)}
      />
      <button
        className="busqueda-btn"
        onClick={() => {
          setTerm("");
          onSearch("");
        }}
        title="Limpiar búsqueda"
      >
        ×
      </button>

      <style>{`
        .busqueda-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
          background: white;
          padding: 6px;
          border-radius: 10px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.06);
        }

        .busqueda-input {
          border: none;
          outline: none;
          padding: 8px 10px;
          font-size: 0.95rem;
          min-width: 260px;
          background: transparent;
        }

        .busqueda-btn {
          background: transparent;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          line-height: 1;
          padding: 6px;
          color: #666;
        }

        .busqueda-btn:hover { color: #111; }
        @media (max-width: 600px) {
          .busqueda-input { min-width: 140px; }
        }
      `}</style>
    </div>
  );
}
