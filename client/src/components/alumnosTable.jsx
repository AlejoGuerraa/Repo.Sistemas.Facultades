import React from "react";
import { useNavigate } from "react-router-dom";
import "../pagescss/AlumnosTable.css";

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
            <tr className="empty-row">
              <td colSpan="10">No hay resultados</td>
            </tr>
          ) : (
            alumnos.map((a) => (
              <tr
                key={a.id}
                className="alumno-row"
                onClick={() => navigate(`/alumno/${a.id}`)}
                role="row"
                tabIndex={0}
                onKeyDown={(e) =>
                  e.key === "Enter" && navigate(`/alumno/${a.id}`)
                }
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
    </div>
  );
}
