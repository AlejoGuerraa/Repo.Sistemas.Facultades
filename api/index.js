const express = require("express");
const sequelize = require("./config/db");

// Importar controladores
const {
  buscarAlumno,
  ingresarAlumno,
  editarAlumno,
  ingresarProfesor,
  editarProfesor,
  listarMateriasPorCarrera
} = require("./controller/peticionesAlumno");

// Importar modelos (necesario para que sequelize detecte todo)
require("./models"); // inicializa todos los modelos
// si necesitás más modelos para relaciones, agrégalos acá

const server = express();
server.use(express.json());

// CORS
server.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  next();
});

server.get("/alumnos/buscar", buscarAlumno);
server.post("/alumnos/ingresar", ingresarAlumno);
server.put("/alumnos/editar/:id", editarAlumno);

server.post("/profesores/ingresar", ingresarProfesor);
server.put("/profesores/editar/:id", editarProfesor);

// Lista materias según carrera
server.get("/materias/:idCarrera", listarMateriasPorCarrera);

server.listen(3000, "0.0.0.0", async () => {
  try {
    await sequelize.sync({ force: false });
    console.log("Tablas sincronizadas correctamente");
    console.log("Servidor corriendo en puerto 3000");
  } catch (error) {
    console.error("Error al sincronizar las tablas:", error);
  }
});
