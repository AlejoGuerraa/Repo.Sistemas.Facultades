import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";
import "../pagescss/Alumno.css";

const API_BASE = "http://localhost:3000";

function safeIncluded(obj, candidates = []) {
  // devuelve la primera propiedad incluida disponible (o null)
  for (const c of candidates) {
    if (obj && Object.prototype.hasOwnProperty.call(obj, c)) return obj[c];
  }
  return null;
}

export default function AlumnoPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [alumno, setAlumno] = useState(null);
  const [conejos, setConejos] = useState([]);
  const [notasExamenes, setNotasExamenes] = useState([]);
  const [notasMaterias, setNotasMaterias] = useState([]);

  const [loadingAlumno, setLoadingAlumno] = useState(true);
  const [loadingConejos, setLoadingConejos] = useState(true);
  const [loadingNotasEx, setLoadingNotasEx] = useState(true);
  const [loadingNotasMat, setLoadingNotasMat] = useState(true);

  const [error, setError] = useState(null);

  useEffect(() => {
    // 1) Intentar obtener alumno por /alumno/:id (si existe)
    // 2) Si falla (404), fallback: buscar en /alumnos/buscar?limit=100&offset=0 y buscar por id
    async function loadAlumno() {
      setLoadingAlumno(true);
      setError(null);
      try {
        // Intento directo (posible que no lo tengas implementado)
        const resDirect = await fetch(`${API_BASE}/alumno/${id}`);
        if (resDirect.ok) {
          const data = await resDirect.json();
          setAlumno(data);
          setLoadingAlumno(false);
          return;
        }
        // fallback: buscar en endpoint paginado /alumnos/buscar
        let found = null;
        let offset = 0;
        const LIMIT = 200;
        while (!found) {
          const res = await fetch(`${API_BASE}/alumnos/buscar?limit=${LIMIT}&offset=${offset}`);
          if (!res.ok) break;
          const payload = await res.json();
          const arr = payload.results || payload;
          if (!arr || arr.length === 0) break;
          found = arr.find((a) => Number(a.id) === Number(id));
          if (found) {
            setAlumno(found);
            setLoadingAlumno(false);
            return;
          }
          offset += LIMIT;
          // stop after some loops to avoid infinite
          if (offset > 2000) break;
          // if payload.total exists and we've passed it, stop
          if (payload.total && offset >= payload.total) break;
        }

        setAlumno(null);
        setLoadingAlumno(false);
        setError("No se encontró la información del alumno en el servidor.");
      } catch (err) {
        console.error("loadAlumno error:", err);
        setError("Error cargando datos del alumno.");
        setAlumno(null);
        setLoadingAlumno(false);
      }
    }

    loadAlumno();
  }, [id]);

  useEffect(() => {
    // fetch conejos
    async function loadConejos() {
      setLoadingConejos(true);
      try {
        const res = await fetch(`${API_BASE}/alumno/${id}/conejos`);
        if (!res.ok) {
          setConejos([]);
          setLoadingConejos(false);
          return;
        }
        const data = await res.json();
        // data likely array of alumnos_conejos with included conejo object
        setConejos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("loadConejos:", err);
        setConejos([]);
      } finally {
        setLoadingConejos(false);
      }
    }
    loadConejos();
  }, [id]);

  useEffect(() => {
    // fetch notas_examenes
    async function loadNotasEx() {
      setLoadingNotasEx(true);
      try {
        const res = await fetch(`${API_BASE}/alumno/${id}/notas-examenes`);
        if (!res.ok) {
          setNotasExamenes([]);
          setLoadingNotasEx(false);
          return;
        }
        const data = await res.json();
        setNotasExamenes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("loadNotasEx:", err);
        setNotasExamenes([]);
      } finally {
        setLoadingNotasEx(false);
      }
    }
    loadNotasEx();
  }, [id]);

  useEffect(() => {
    // fetch notas_materias
    async function loadNotasMat() {
      setLoadingNotasMat(true);
      try {
        const res = await fetch(`${API_BASE}/alumno/${id}/notas-materias`);
        if (!res.ok) {
          setNotasMaterias([]);
          setLoadingNotasMat(false);
          return;
        }
        const data = await res.json();
        setNotasMaterias(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("loadNotasMat:", err);
        setNotasMaterias([]);
      } finally {
        setLoadingNotasMat(false);
      }
    }
    loadNotasMat();
  }, [id]);

  return (
    <div className="alumno-page-root">
      <Header />

      <main className="alumno-main container">
        <div className="top-row">
          <button className="back-btn" onClick={() => navigate(-1)}>← Volver</button>
        </div>

        {loadingAlumno ? (
          <div className="center-message">Cargando alumno...</div>
        ) : error ? (
          <div className="center-message error">{error}</div>
        ) : alumno ? (
          <>
            {/* Datos personales */}
            <section className="card personal-card">
              <div className="personal-grid">
                <div>
                  <h2 className="name">{alumno.nombre} {alumno.apellido}</h2>
                  <div className="sub">ID: {alumno.id} — DNI: {alumno.dni}</div>
                </div>

                <div className="personal-meta">
                  <div><strong>Edad:</strong> {alumno.edad ?? "—"}</div>
                  <div><strong>Nacionalidad:</strong> {alumno.nacionalidad ?? "—"}</div>
                  <div><strong>Teléfono:</strong> {alumno.telefono ?? "—"}</div>
                  <div><strong>Dirección:</strong> {alumno.direccion ?? "—"}</div>
                  <div><strong>Carrera:</strong> {alumno.carrera ?? alumno.id_carrera}</div>
                  <div><strong>Facultad:</strong> {alumno.facultad ?? alumno.id_facultad}</div>
                </div>
              </div>
            </section>

            {/* Conejos */}
            <section className="card section-card">
              <h3 className="section-title">Conejos ({conejos.length})</h3>

              {loadingConejos ? (
                <div className="small-loading">Cargando conejos...</div>
              ) : conejos.length === 0 ? (
                <div className="muted">No se encontraron conejos para este alumno.</div>
              ) : (
                <div className="table-wrap">
                  <table className="tabla">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Conejo ID</th>
                        <th>Placa</th>
                        <th>Raza</th>
                        <th>Edad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {conejos.map((r) => {
                        const included = safeIncluded(r, ["conejos", "conejo", "Conejo"]);
                        const conejo = included || {
                          id: r.conejo_id ?? r.conejoId ?? null,
                          placa: r.placa ?? "-",  // reemplazamos nombre por placa
                          raza: r.raza ?? "-",
                          edad: r.edad ?? "-",
                        };
                        return (
                          <tr key={r.id}>
                            <td>{r.id}</td>
                            <td>{conejo?.id ?? r.conejo_id}</td>
                            <td>{conejo?.placa ?? "-"}</td>
                            <td>{conejo?.raza ?? "-"}</td>
                            <td>{conejo?.edad ?? "-"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Notas de exámenes */}
            <section className="card section-card">
              <h3 className="section-title">Notas — Exámenes ({notasExamenes.length})</h3>

              {loadingNotasEx ? (
                <div className="small-loading">Cargando notas de exámenes...</div>
              ) : notasExamenes.length === 0 ? (
                <div className="muted">No hay notas de exámenes para este alumno.</div>
              ) : (
                <div className="table-wrap">
                  <table className="tabla">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Materia</th>
                        <th>Tipo</th>
                        <th>Nota</th>
                        <th>Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notasExamenes.map((n) => {
                        const mat = safeIncluded(n, ["materias", "materia", "Materia"]) || n.materia || n.materias;
                        const materiaNombre = mat?.nombre ?? `ID ${n.id_materia}`;
                        const fecha = n.fecha ? (new Date(n.fecha)).toLocaleString() : "-";
                        return (
                          <tr key={n.id}>
                            <td>{n.id}</td>
                            <td>{materiaNombre}</td>
                            <td>{n.tipo}</td>
                            <td>{Number(n.nota).toFixed(1)}</td>
                            <td>{fecha}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Notas de materias (resumen) */}
            <section className="card section-card">
              <h3 className="section-title">Notas — Materias ({notasMaterias.length})</h3>

              {loadingNotasMat ? (
                <div className="small-loading">Cargando notas por materia...</div>
              ) : notasMaterias.length === 0 ? (
                <div className="muted">No hay registros en notas_materias para este alumno.</div>
              ) : (
                <div className="table-wrap">
                  <table className="tabla">
                    <thead>
                      <tr>
                        <th>Materia</th>
                        <th>Estado</th>
                        <th>Promedio</th>
                        <th>Promedio (sin aplazo)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notasMaterias.map((m) => {
                        const mat = safeIncluded(m, ["materias", "materia", "Materia"]) || m.materia || m.materias;
                        const materiaNombre = mat?.nombre ?? `ID ${m.materia_id || m.materiaId}`;
                        return (
                          <tr key={m.id}>
                            <td>{materiaNombre}</td>
                            <td className={`estado ${m.estado}`}>{m.estado}</td>
                            <td>{m.promedio ?? "-"}</td>
                            <td>{m.promedio_sin_aplazo ?? "-"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        ) : (
          <div className="center-message">Alumno no encontrado.</div>
        )}
      </main>

      <Footer />
    </div >
  );
}
