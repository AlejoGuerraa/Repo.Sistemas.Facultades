import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * AlumnosTable.jsx
 * Props:
 *  - alumnos: array of alumnos (objects from backend)
 *  - carrerasMap: { id: nombre }
 *  - facultadesMap: { id: nombre }
 *  - onSortChange, sortField, sortDir (optional UI handlers)
 *
 * Table rows clickable → navigate to /alumno/:id
 */

export default function AlumnosTable({
  alumnos = [],
  carrerasMap = {},
  facultadesMap = {},
}) {
  const navigate = useNavigate();

  return (
    <div className="alumnos-table-wrap">
      <table className="alumnos-table" role="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>DNI</th>
            <th>Edad</th>
            <th>Nacionalidad</th>
            <th>Carrera</th>
            <th>Facultad</th>
            <th>Teléfono</th>
            <th>Dirección</th>
          </tr>
        </thead>

        <tbody>
          {alumnos.length === 0 ? (
            <tr className="empty-row"><td colSpan="10">No hay resultados</td></tr>
          ) : (
            alumnos.map((a) => (
              <tr
                key={a.id}
                className="alumno-row"
                onClick={() => navigate(`/alumno/${a.id}`)}
                role="row"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && navigate(`/alumno/${a.id}`)}
              >
                <td>{a.id}</td>
                <td>{a.nombre}</td>
                <td>{a.apellido}</td>
                <td>{a.dni}</td>
                <td>{a.edad}</td>
                <td>{a.nacionalidad}</td>
                <td>{carrerasMap[a.id_carrera] || a.id_carrera}</td>
                <td>{facultadesMap[a.id_facultad] || a.id_facultad}</td>
                <td>{a.telefono}</td>
                <td>{a.direccion}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <style>{`
        .alumnos-table-wrap {
          overflow: auto;
          background: white;
          border-radius: 12px;
          box-shadow: 0 6px 20px rgba(12,24,40,0.06);
          padding: 12px;
        }

        .alumnos-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1000px;
          font-family: Inter, Roboto, system-ui, Arial;
        }

        thead th {
          text-align: left;
          padding: 12px 16px;
          font-size: 0.85rem;
          color: #314158;
          background: linear-gradient(180deg, #f7fafc, #eef6ff);
          border-bottom: 1px solid #e6eef7;
          position: sticky;
          top: 0;
          z-index: 2;
        }

        tbody td {
          padding: 12px 16px;
          border-bottom: 1px solid #f0f4f8;
          color: #243244;
          font-size: 0.95rem;
        }

        .alumno-row {
          transition: background 0.18s ease, transform 0.12s ease;
          cursor: pointer;
        }

        .alumno-row:hover {
          background: linear-gradient(90deg, rgba(245,250,255,0.8), rgba(255,255,255,0.9));
          transform: translateY(-2px);
        }

        .empty-row td {
          text-align: center;
          padding: 24px;
          color: #667;
        }

        @media (max-width: 900px) {
          .alumnos-table { min-width: 800px; }
        }

        @media (max-width: 600px) {
          .alumnos-table { min-width: 600px; font-size: 0.9rem; }
          thead th, tbody td { padding: 10px; }
        }
      `}</style>
    </div>
  );
}
