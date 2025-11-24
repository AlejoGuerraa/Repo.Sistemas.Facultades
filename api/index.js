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
  listarCarreras
} = require("./controller/peticionesAlumno");

// Nuevo controlador para alumno (conejos, notas, etc.)

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

server.get("/alumno/:id/conejos", getConejosByAlumno);
server.get("/alumno/:id/notas-examenes", getNotasExamenesByAlumno);
server.get("/alumno/:id/notas-materias", getNotasMateriasByAlumno);
// Materias por carrera
server.get("/carreras/:idCarrera/materias", listarMateriasPorCarrera);

// Alumnos por carrera
server.get("/carreras/:idCarrera/alumnos", listarAlumnosPorCarrera);

// Todas las carreras
server.get("/carreras", listarCarreras);
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
