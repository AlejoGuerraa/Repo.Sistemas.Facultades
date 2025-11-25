// Principal.jsx
import React, { useState, useEffect, useCallback } from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import CardUniv from "../components/CardUniv";
import Busqueda from "../components/Busqueda";
import AlumnosTable from "../components/AlumnosTable";

import "../pagescss/principal.css";

// IMPORTAR IMÁGENES DE LOGOS
import utnLogo from "../assets/logoUTN.jpg";
import unsamLogo from "../assets/logoUNSAM.png";
import ubaLogo from "../assets/logoUBA.jpg";

const SOUTH_AMERICA = [
  "Argentina", "Bolivia", "Brasil", "Chile", "Colombia", "Ecuador",
  "Paraguay", "Peru", "Uruguay", "Venezuela"
];

const DEFAULT_FACULTADES = [
  { id: 1, nombre: "UTN" },
  { id: 2, nombre: "UBA" },
  { id: 3, nombre: "UNSAM" },
];

// Mapeo forzado de carreras según id_carrera
const CARRERAS_FORZADAS = {
  1: "Ing. Sistemas",
  2: "Medicina",
  3: "Economía",
  4: "Contador",
};

export default function Principal() {
  const [alumnos, setAlumnos] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  const [facultadesMap, setFacultadesMap] = useState({});
  const [carrerasMap, setCarrerasMap] = useState({});

  const [selectedFacultad, setSelectedFacultad] = useState("all");
  const [selectedNacionalidad, setSelectedNacionalidad] = useState("all");
  const [sortField, setSortField] = useState(""); // sin orden
  const [sortDir, setSortDir] = useState("desc");

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
          const map = {};
          DEFAULT_FACULTADES.forEach((f) => (map[f.id] = f.nombre));
          setFacultadesMap(map);
        }
      } catch {
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
      } catch {
        setCarrerasMap({});
      }
    }

    loadMeta();
  }, []);

  const fetchAlumnos = useCallback(
    async (searchTerm = "") => {
      setLoading(true);
      try {
        const base = "http://localhost:3000";
        const PAGE = 200;
        let offset = 0;
        let all = [];
        let total = null;

        while (true) {
          const url = new URL("/alumnos/buscar", base);
          if (searchTerm) url.searchParams.set("search", searchTerm);
          url.searchParams.set("limit", PAGE);
          url.searchParams.set("offset", offset);

          const res = await fetch(url.toString());
          if (!res.ok) throw new Error("Error fetching alumnos");
          const datos = await res.json();

          const page = Array.isArray(datos) ? datos : (datos.results || []);
          if (total === null) {
            total = datos?.total ?? null;
          }

          all = all.concat(page);

          if (page.length < PAGE) break;
          if (total !== null && all.length >= total) break;

          offset += PAGE;
          if (offset > 200000) break;
        }

        // Mapear alumnos
        const mapped = all.map((a) => {
          const idCarrera = a.id_carrera ?? a.carreraId ?? null;

          return {
            id: a.id,
            nombre: a.nombre,
            apellido: a.apellido,
            telefono: a.telefono,
            direccion: a.direccion,
            dni: a.dni,
            edad: a.edad,
            nacionalidad: a.nacionalidad,
            id_carrera: idCarrera,
            id_facultad: a.id_facultad ?? a.facultadId ?? null,
            // FORZAR nombre de carrera según id_carrera
            carrera: CARRERAS_FORZADAS[idCarrera] || null,
            facultad: a.facultad ?? (a.facultad && typeof a.facultad === "object" ? a.facultad.nombre : a.facultad) ?? null,
          };
        });

        setAlumnos(mapped);
      } catch (err) {
        console.error("fetchAlumnos error:", err);
        setAlumnos([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchAlumnos(q);
  }, [q, fetchAlumnos]);

  const visibleAlumnos = React.useMemo(() => {
    let arr = [...alumnos];

    if (selectedFacultad !== "all") {
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
        const aVal = `${x.apellido ?? ""} ${x.nombre ?? ""}`.toLowerCase();
        const bVal = `${y.apellido ?? ""} ${y.nombre ?? ""}`.toLowerCase();
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
        <div className="universidades-row">
          <CardUniv nombre="UTN" imagen={utnLogo} destino="/utn" />
          <CardUniv nombre="UBA" imagen={ubaLogo} destino="/uba" />
          <CardUniv nombre="UNSAM" imagen={unsamLogo} destino="/unsam" />
        </div>
        <div className="top-controls">
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
                    <option key={id} value={id}>{name}</option>
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
                    <option key={pais} value={pais}>{pais}</option>
                  ))}
                </select>
              </label>

              <label>
                Ordenar por
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value)}
                >
                  <option value="">Sin ordenar</option>
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
        .universidades-row {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 22px;
          margin: 25px 0 10px 0;
        }
      `}</style>
    </div>
  );
}
