// src/pages/brainHunter.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";
import brainImg from "../assets/cerebro.jpg"; // <-- asegurate que exista

const API_BASE = "http://localhost:3000";
const DEFAULT_LIMIT = 100;

function formatDate(dt) {
  if (!dt) return "-";
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return dt;
  }
}

function normalizeArray(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (payload.results && Array.isArray(payload.results)) return payload.results;
  return [];
}

export default function BrainHunter() {
  const [examenes, setExamenes] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Endpoints para notas altas (7–10)
        const [resEx, resMat] = await Promise.all([
          fetch(`${API_BASE}/notas-examenes/7-10?limit=${DEFAULT_LIMIT}`),
          fetch(`${API_BASE}/notas-materias/7-10?limit=${DEFAULT_LIMIT}`),
        ]);

        if (!resEx.ok) throw new Error("Error cargando notas de exámenes");
        if (!resMat.ok) throw new Error("Error cargando notas por materia");

        const exData = normalizeArray(await resEx.json()).slice(0, DEFAULT_LIMIT);
        const matData = normalizeArray(await resMat.json()).slice(0, DEFAULT_LIMIT);

        setExamenes(exData);
        setMaterias(matData);
      } catch (err) {
        console.error("BrainHunter load error:", err);
        setError("Error cargando datos. Revisá la consola.");
        setExamenes([]);
        setMaterias([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div className="brain-root">
      <Header />
      <main className="brain-main">
        <img
          src={brainImg}
          alt="Brain Hunter"
          style={{ width: 180, display: "block", margin: "12px auto" }}
        />
        <h1>Brain Hunter — (7–10)</h1>

        {loading ? (
          <div className="center">Cargando...</div>
        ) : error ? (
          <div className="center error">{error}</div>
        ) : (
          <>
            <section className="panel">
              <h2>Exámenes (nota 7–10)</h2>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Alumno</th>
                      <th>DNI</th>
                      <th>Materia</th>
                      <th>Tipo</th>
                      <th>Nota</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examenes.length === 0 ? (
                      <tr><td colSpan="7" className="muted">No hay exámenes en este rango</td></tr>
                    ) : (
                      examenes.map((n) => {
                        const alumno = n.alumno || n.Alumno || n.alumnoData || null;
                        const materia = n.materia || n.Materia || n.materiaData || null;
                        return (
                          <tr key={n.id} className="clickable">
                            <td>{n.id}</td>
                            <td
                              className="link-like"
                              onClick={() => alumno && navigate(`/alumno/${alumno.id}`)}
                              title={alumno ? "Ver alumno" : ""}
                            >
                              {alumno ? `${alumno.apellido} ${alumno.nombre}` : `ID ${n.id_alumno}`}
                            </td>
                            <td>{alumno?.dni ?? n.id_alumno}</td>
                            <td>{materia?.nombre ?? `ID ${n.id_materia}`}</td>
                            <td>{n.tipo}</td>
                            <td>{Number(n.nota).toFixed(1)}</td>
                            <td>{formatDate(n.fecha)}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="panel">
              <h2>Notas por materia</h2>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Alumno</th>
                      <th>DNI</th>
                      <th>Materia</th>
                      <th>Estado</th>
                      <th>Promedio</th>
                      <th>Promedio (sin aplazo)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materias.length === 0 ? (
                      <tr><td colSpan="7" className="muted">No hay registros en este rango</td></tr>
                    ) : (
                      materias.map((m) => {
                        const alumno = m.alumno || m.Alumno || m.alumnoData || null;
                        const materia = m.materia || m.Materia || m.materiaData || null;
                        return (
                          <tr key={m.id} className="clickable">
                            <td>{m.id}</td>
                            <td
                              className="link-like"
                              onClick={() => alumno && navigate(`/alumno/${alumno.id}`)}
                              title={alumno ? "Ver alumno" : ""}
                            >
                              {alumno ? `${alumno.apellido} ${alumno.nombre}` : `ID ${m.alumno_id}`}
                            </td>
                            <td>{alumno?.dni ?? m.alumno_id}</td>
                            <td>{materia?.nombre ?? `ID ${m.materia_id}`}</td>
                            <td className={`estado ${m.estado}`}>{m.estado}</td>
                            <td>{m.promedio ?? "-"}</td>
                            <td>{m.promedio_sin_aplazo ?? "-"}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />

      <style>{`
        .brain-main { max-width: 1100px; margin: 22px auto; padding: 16px; }
        h1 { text-align:center; color:#153445; margin-bottom: 18px; }
        .panel { background:#fff; border-radius:12px; padding:16px; margin-bottom:18px; box-shadow: 0 8px 24px rgba(10,30,45,0.05); }
        .panel h2 { margin:0 0 12px 0; color:#1a374d; font-size:1.05rem; }
        .table-wrap { overflow:auto; }
        .table { width:100%; border-collapse:collapse; }
        .table thead th { text-align:left; padding:10px; font-weight:600; color:#2b4b5f; border-bottom:2px solid #eef6fb; }
        .table tbody td { padding:10px; border-bottom:1px solid #f2f6f9; color:#233544; font-size:0.95rem; }
        .table tbody tr:hover { background:#f1fbff; }
        .muted { text-align:center; padding: 14px; color:#7b8c98; }
        .center { text-align:center; padding:18px; }
        .error { color:crimson; }
        .clickable { cursor: pointer; }
        .link-like { color:#1765c6; text-decoration:underline; display:inline-block; }
        .estado.promocionada { color: #0b875a; font-weight:600; }
        .estado.aprobada { color: #2a7f3a; }
        .estado.desaprobada { color: #d04444; font-weight:700; }
        @media (max-width:900px) {
          .table thead { display:none }
          .table tbody td { display:block; width:100% }
          .table tbody tr { margin-bottom:12px; display:block; border:1px solid #eef6fb; border-radius:8px; padding:8px }
        }
      `}</style>
    </div>
  );
}
