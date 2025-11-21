const express = require('express');

// const {} = require('./controller/peticionesUsuario');
// const {} = require('./controller/busqueda');
// const {} = require('./controller/peticionesLibros');

// const isAuth = require('./middlewares/isAuth');

const sequelize = require('./config/db');

const { FORCE } = require('sequelize/lib/index-hints');

require('./models/alumnos_conejos');
require('./models/alumnos');
require('./models/carreras');
require('./models/conejos');
require('./models/facultades');
require('./models/materias');
require('./models/notas_examenes');
require('./models/notas_materias');
require('./models/materias');
require('./models/profesores_materias');
require('./models/profesores');

const server = express();
server.use(express.json());

server.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Endpoints de usuario
// server.get('/facultades/', getUser)

// Endpoints de búsqueda
//server.get('/facultades/', buscar);

server.listen(3000, '0.0.0.0', async () => {
  try {
    await sequelize.sync({ force: false })
    console.log("Tablas alteradas correctamente");
    console.log("El server está corriendo en el puerto 3000");
  } catch (error) {
    console.error("Error al sincronizar las tablas:", error);
  }
});