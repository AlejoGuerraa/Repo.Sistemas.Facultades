import React, { useState, useEffect, useCallback } from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import CardUniv from "../components/CardUniv";
import Busqueda from "../components/Busqueda";
import AlumnosTable from "../components/AlumnosTable";

import "../pagescss/principal.css"; // si querés mantener estilos globales

// IMPORTAR IMÁGENES DE LOGOS
import utnLogo from "../assets/logoUTN.jpg";
import unsamLogo from "../assets/logoUNSAM.png";
import ubaLogo from "../assets/logoUBA.jpg";

/**
 * Principal.jsx
 *
 * Lógica:
 * - llama a /alumnos/buscar?search=...
 * - intenta cargar /facultades y /carreras (si existen) para mostrar nombres
 * - filtra client-side por facultad y nacionalidad
 * - ordena por edad o alfabéticamente y aplica dirección asc/desc
 */

const SOUTH_AMERICA = [
  "Argentina", "Bolivia", "Brazil", "Brasil", "Chile", "Colombia", "Ecuador",
  "Guyana", "Paraguay", "Peru", "Perú", "Suriname", "Uruguay", "Venezuela"
];

// Si no tenés endpoint de facultades, ajustá los ids según tu base.
const DEFAULT_FACULTADES = [
  { id: 1, nombre: "UNSAM" },
  { id: 2, nombre: "UBA" },
  { id: 3, nombre: "UTN" },
];

export default function Principal() {
  const [alumnos, setAlumnos] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  const [facultadesMap, setFacultadesMap] = useState({});
  const [carrerasMap, setCarrerasMap] = useState({});

  const [selectedFacultad, setSelectedFacultad] = useState("all");
  const [selectedNacionalidad, setSelectedNacionalidad] = useState("all");
  const [sortField, setSortField] = useState("edad"); // 'edad' | 'alfabetico'
  const [sortDir, setSortDir] = useState("desc"); // 'asc' | 'desc'

  // cargar facultades/carreras si endpoints existen
  useEffect(() => {
    async function loadMeta() {
      try {
        const fRes = await fetch("/facultades");
        if (fRes.ok) {
          const fList = await fRes.json();
          const map = {};
          fList.forEach((f) => (map[f.id] = f.nombre));
          setFacultadesMap(map);
        } else {
          // fallback default
          const map = {};
          DEFAULT_FACULTADES.forEach((f) => (map[f.id] = f.nombre));
          setFacultadesMap(map);
        }
      } catch (err) {
        const map = {};
        DEFAULT_FACULTADES.forEach((f) => (map[f.id] = f.nombre));
        setFacultadesMap(map);
      }

      try {
        const cRes = await fetch("/carreras");
        if (cRes.ok) {
          const cList = await cRes.json();
          const map = {};
          cList.forEach((c) => (map[c.id] = c.nombre));
          setCarrerasMap(map);
        } else {
          setCarrerasMap({});
        }
      } catch (err) {
        setCarrerasMap({});
      }
    }

    loadMeta();
  }, []);

  // llamada al backend
  const fetchAlumnos = useCallback(
    async (searchTerm = "") => {
      setLoading(true);
      try {
        const url = new URL("/alumnos/buscar", window.location.origin);
        if (searchTerm) url.searchParams.set("search", searchTerm);

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error("Error fetching alumnos");
        const datos = await res.json();
        setAlumnos(Array.isArray(datos) ? datos : datos.results || []);
      } catch (err) {
        console.error("fetchAlumnos error:", err);
        setAlumnos([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // buscar por query (invocado desde Busqueda)
  useEffect(() => {
    fetchAlumnos(q);
  }, [q, fetchAlumnos]);

  // filtrado y ordenado client-side
  const visibleAlumnos = React.useMemo(() => {
    let arr = [...alumnos];

    if (selectedFacultad !== "all") {
      // selectedFacultad stores the facultad id as string
      const fid = Number(selectedFacultad);
      arr = arr.filter((a) => Number(a.id_facultad) === fid);
    }

    if (selectedNacionalidad !== "all") {
      arr = arr.filter(
        (a) =>
          a.nacionalidad &&
          a.nacionalidad.toLowerCase().includes(selectedNacionalidad.toLowerCase())
      );
    }

    if (sortField === "edad") {
      arr.sort((x, y) => {
        const aVal = Number(x.edad) || 0;
        const bVal = Number(y.edad) || 0;
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      });
    } else if (sortField === "alfabetico") {
      arr.sort((x, y) => {
        const aVal = `${x.apellido} ${x.nombre}`.toLowerCase();
        const bVal = `${y.apellido} ${y.nombre}`.toLowerCase();
        if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
    }

    return arr;
  }, [alumnos, selectedFacultad, selectedNacionalidad, sortField, sortDir]);

  return (
    <div className="principal-container">

      <Header />

      <main className="principal-main">
        <div className="top-controls">
          <div className="title-area">
            <h1 className="principal-title">Gestión de Alumnos</h1>
            <p className="principal-subtitle">Buscá y filtrá alumnos rápidamente</p>
          </div>

          <div className="controls-row">
            <Busqueda onSearch={(s) => setQ(s)} />

            <div className="dropdowns">
              <label>
                Universidad
                <select
                  value={selectedFacultad}
                  onChange={(e) => setSelectedFacultad(e.target.value)}
                >
                  <option value="all">Todas</option>
                  {Object.entries(facultadesMap).map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Nacionalidad
                <select
                  value={selectedNacionalidad}
                  onChange={(e) => setSelectedNacionalidad(e.target.value)}
                >
                  <option value="all">Todas</option>
                  {SOUTH_AMERICA.map((pais) => (
                    <option key={pais} value={pais}>
                      {pais}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Ordenar por
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value)}
                >
                  <option value="edad">Edad</option>
                  <option value="alfabetico">Alfabético</option>
                </select>
              </label>

              <button
                className="sort-toggle"
                onClick={() => setSortDir((s) => (s === "asc" ? "desc" : "asc"))}
                title="Invertir orden"
              >
                {sortDir === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          {loading ? (
            <div className="loading">Cargando alumnos...</div>
          ) : (
            <AlumnosTable
              alumnos={visibleAlumnos}
              carrerasMap={carrerasMap}
              facultadesMap={facultadesMap}
            />
          )}
        </div>
      </main>

      <Footer />

      <style>{`
        /* Encapsulado rápido (puedes separar luego) */
        .top-controls { display: flex; flex-direction: column; gap: 16px; }
        .title-area { display: flex; flex-direction: column; gap: 6px; }
        .controls-row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; justify-content: space-between; }
        .dropdowns { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
        .dropdowns label { display: flex; flex-direction: column; font-size: 0.85rem; color: #314158; }
        .dropdowns select { margin-top: 6px; padding: 8px 10px; border-radius: 8px; border: 1px solid #dbe8f2; background: #fff; min-width: 160px; }
        .sort-toggle { margin-top: 18px; padding: 8px 12px; border-radius: 8px; border: none; background: #1a374d; color: #fff; cursor: pointer; }
        .loading { padding: 18px; background: #fff; border-radius: 12px; text-align: center; }
        @media (max-width: 900px) {
          .controls-row { flex-direction: column; align-items: stretch; }
          .dropdowns { justify-content: flex-start; }
        }
      `}</style>
    </div>
  );
}
