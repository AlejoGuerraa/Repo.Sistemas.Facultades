// index.js
const express = require("express");
const sequelize = require("./config/db");

require("./models"); // inicializa todos los modelos

// Controladores existentes
const {
  buscarAlumno,
  ingresarAlumno,
  editarAlumno,
  ingresarProfesor,
  editarProfesor,
  listarMateriasPorCarrera,
  getConejosByAlumno,
  getNotasExamenesByAlumno,
  getNotasMateriasByAlumno,
  listarAlumnosPorCarrera,
  listarCarreras,
  getNotasExamenes0a3,
  getNotasExamenes4a7,
  getNotasExamenes7a10,
  getNotasMaterias0a3,
  getNotasMaterias4a7,
  getNotasMaterias7a10,
} = require("./controller/peticionesAlumno");

const server = express();
server.use(express.json());

// CORS
server.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

/* ===========================
         RUTAS ALUMNOS
   =========================== */

server.get("/alumnos/buscar", buscarAlumno);
server.post("/alumnos/ingresar", ingresarAlumno);
server.put("/alumnos/editar/:id", editarAlumno);

/* ===========================
         RUTAS PROFESORES
   =========================== */

server.post("/profesores/ingresar", ingresarProfesor);
server.put("/profesores/editar/:id", editarProfesor);

/* ===========================
      NUEVAS RUTAS USUARIO
   =========================== */

// Conejos
server.get("/alumno/:id/conejos", getConejosByAlumno);

// Notas de un alumno
server.get("/alumno/:id/notas-examenes", getNotasExamenesByAlumno);
server.get("/alumno/:id/notas-materias", getNotasMateriasByAlumno);

// Materias por carrera
server.get("/carreras/:idCarrera/materias", listarMateriasPorCarrera);

// Alumnos por carrera
server.get("/carreras/:idCarrera/alumnos", listarAlumnosPorCarrera);

// Todas las carreras
server.get("/carreras", listarCarreras);

/* ===========================
      NUEVAS RUTAS EASY MODE
   =========================== */

server.get("/notas-examenes/0-3", getNotasExamenes0a3);
server.get("/notas-examenes/4-7", getNotasExamenes4a7);
server.get("/notas-examenes/7-10", getNotasExamenes7a10);

server.get("/notas-materias/0-3", getNotasMaterias0a3);
server.get("/notas-materias/4-7", getNotasMaterias4a7);
server.get("/notas-materias/7-10", getNotasMaterias7a10);

/* ===========================
             SERVER
   =========================== */

server.listen(3000, "0.0.0.0", async () => {
  try {
    await sequelize.sync({ force: false });
    console.log("Tablas sincronizadas correctamente");
    console.log("Servidor corriendo en puerto 3000");
  } catch (error) {
    console.error("Error al sincronizar las tablas:", error);
  }
});
