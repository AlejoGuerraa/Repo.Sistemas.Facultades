// paginaUBA.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";
import logoUBA from "../assets/logoUBA.jpg";

const API_BASE = "http://localhost:3000";
const ALUMNOS_LIMIT = 100;

export default function PaginaUBA() {
  const [carreras, setCarreras] = useState([]);
  const [materiasPorCarrera, setMateriasPorCarrera] = useState({});
  const [alumnosPorCarrera, setAlumnosPorCarrera] = useState({});
  const [filtros, setFiltros] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const resCarreras = await fetch(`${API_BASE}/carreras`);
        if (!resCarreras.ok) throw new Error("Error cargando carreras");
        const allCarreras = await resCarreras.json();

        // Solo carreras de UBA: id_facultad = 2 y id = 2
        const carrerasUBA = allCarreras.filter(
          (c) => c.id_facultad === 2 && c.id === 2
        );
        setCarreras(carrerasUBA);

        const materiasData = {};
        const alumnosData = {};
        const filtrosData = {};

        for (const c of carrerasUBA) {
          const resMat = await fetch(`${API_BASE}/carreras/${c.id}/materias`);
          materiasData[c.id] = resMat.ok ? await resMat.json() : [];

          const resAlum = await fetch(
            `${API_BASE}/carreras/${c.id}/alumnos?limit=${ALUMNOS_LIMIT}`
          );
          const payload = resAlum.ok ? await resAlum.json() : [];
          alumnosData[c.id] = Array.isArray(payload)
            ? payload.slice(0, ALUMNOS_LIMIT)
            : (payload.results || []).slice(0, ALUMNOS_LIMIT);

          filtrosData[c.id] = { query: "", sort: "edad", dir: "desc" };
        }

        setMateriasPorCarrera(materiasData);
        setAlumnosPorCarrera(alumnosData);
        setFiltros(filtrosData);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Error cargando información de UBA");
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleSortToggle = (carreraId, campo) => {
    setFiltros((prev) => {
      const cur = prev[carreraId] || { query: "", sort: campo, dir: "desc" };
      const nextDir = cur.sort === campo ? (cur.dir === "asc" ? "desc" : "asc") : "desc";
      return { ...prev, [carreraId]: { ...cur, sort: campo, dir: nextDir } };
    });

    const arr = [...(alumnosPorCarrera[carreraId] || [])];
    arr.sort((a, b) => {
      if (campo === "edad") return (a.edad ?? 0) - (b.edad ?? 0);
      const A = `${a.apellido ?? ""} ${a.nombre ?? ""}`.toLowerCase();
      const B = `${b.apellido ?? ""} ${b.nombre ?? ""}`.toLowerCase();
      return A.localeCompare(B);
    });

    setAlumnosPorCarrera((prev) => ({
      ...prev,
      [carreraId]: (filtros[carreraId]?.sort === campo && filtros[carreraId]?.dir === "asc")
        ? arr.reverse()
        : arr,
    }));
  };

  const handleSearch = (carreraId, q) => {
    setFiltros((prev) => ({ ...prev, [carreraId]: { ...(prev[carreraId] || {}), query: q } }));
  };

  if (loading) return <div style={{ textAlign: "center" }}>Cargando información...</div>;
  if (error) return <div style={{ textAlign: "center", color: "red" }}>{error}</div>;

  return (
    <div className="unsam-root">
      <Header />
      <main className="unsam-main">
        <div className="unsam-header">
          <img src={logoUBA} alt="UBA Logo" className="unsam-logo" />
          <h1 className="unsam-title">Universidad de Buenos Aires (UBA)</h1>
        </div>

        {carreras.map((carrera) => {
          const cfg = filtros[carrera.id] || { query: "", sort: "edad", dir: "desc" };
          const rawAlumnos = alumnosPorCarrera[carrera.id] || [];
          const q = (cfg.query || "").trim().toLowerCase();
          const alumnosFiltered = rawAlumnos
            .filter((a) => {
              if (!q) return true;
              const hay = [a.apellido ?? "", a.nombre ?? "", String(a.dni ?? "")]
                .join(" ")
                .toLowerCase();
              return hay.includes(q);
            })
            .slice(0, ALUMNOS_LIMIT);

          return (
            <section className="carrera-card" key={carrera.id}>
              <div className="carrera-header">
                <h2 className="carrera-name">{carrera.nombre}</h2>
                <div className="carrera-controls">
                  <input
                    className="search-input"
                    placeholder="Buscar por apellido / nombre / DNI..."
                    value={cfg.query}
                    onChange={(e) => handleSearch(carrera.id, e.target.value)}
                  />
                  <div className="sort-group">
                    <button className="btn-sort" onClick={() => handleSortToggle(carrera.id, "edad")}>Edad</button>
                    <button className="btn-sort" onClick={() => handleSortToggle(carrera.id, "alfabetico")}>A–Z</button>
                  </div>
                </div>
              </div>

              <div className="carrera-body">
                <div className="materias-block">
                  <h3 className="small-title">Materias</h3>
                  <table className="table">
                    <thead>
                      <tr><th>ID</th><th>Nombre</th></tr>
                    </thead>
                    <tbody>
                      {(materiasPorCarrera[carrera.id] || []).map((m) => (
                        <tr key={m.id}><td>{m.id}</td><td>{m.nombre}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="alumnos-block">
                  <h3 className="small-title">Alumnos (máx {ALUMNOS_LIMIT})</h3>
                  <table className="table table-hover">
                    <thead>
                      <tr><th>ID</th><th>Apellido</th><th>DNI</th><th>Edad</th><th>Nacionalidad</th></tr>
                    </thead>
                    <tbody>
                      {alumnosFiltered.map((a) => (
                        <tr key={a.id} onClick={() => navigate(`/alumno/${a.id}`)} className="clickable">
                          <td>{a.id}</td>
                          <td className="link-like">{a.apellido}</td>
                          <td>{a.dni}</td>
                          <td>{a.edad ?? "—"}</td>
                          <td>{a.nacionalidad ?? "—"}</td>
                        </tr>
                      ))}
                      {alumnosFiltered.length === 0 && (
                        <tr><td colSpan="5" style={{ textAlign: "center", opacity: 0.7 }}>No hay alumnos</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          );
        })}
      </main>
      <Footer />
      <style>{`
        .unsam-main { padding: 28px; max-width: 1200px; margin: 0 auto; }
        .unsam-header { text-align: center; margin-bottom: 22px; }
        .unsam-logo { width: 220px; height: auto; display:block; margin: 0 auto 10px; }
        .unsam-title { margin: 0; font-size: 1.6rem; color: #1a374d; }

        .carrera-card { background: #fff; border-radius: 12px; padding: 18px; box-shadow: 0 8px 28px rgba(10,30,45,0.06); margin-bottom: 22px; }
        .carrera-header { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; }
        .carrera-name { margin:0; font-size:1.1rem; color:#123244; }

        .carrera-controls { display:flex; gap:10px; align-items:center; }
        .search-input { padding:8px 12px; border-radius:10px; border:1px solid #dbe8f2; min-width:260px; }
        .sort-group { display:flex; gap:8px; }
        .btn-sort { background:#1a374d; color:#fff; border:none; padding:8px 10px; border-radius:8px; cursor:pointer; }
        .btn-sort:hover { opacity:0.9; transform:translateY(-1px); }

        .carrera-body { display:grid; grid-template-columns: 1fr 1fr; gap:18px; margin-top:16px; }
        .small-title { margin:0 0 8px 0; font-size:0.95rem; color:#2b4b5f; }

        .table { width:100%; border-collapse:collapse; background:transparent; }
        .table thead th { text-align:left; padding:10px; font-size:0.9rem; color:#2b4b5f; border-bottom:2px solid #eef6fb; }
        .table tbody td { padding:10px; border-bottom:1px solid #f2f6f9; font-size:0.95rem; color:#233544; }

        .table-hover tbody tr:nth-child(odd) { background: #fbfdff; }
        .table-hover tbody tr:hover { background: #eaf4fb; }

        .clickable { cursor:pointer; }
        .link-like { color:#1765c6; text-decoration:underline; }

        @media (max-width: 900px) {
          .carrera-body { grid-template-columns: 1fr; }
          .search-input { min-width: 160px; }
        }
      `}</style>
    </div>
  );
}
