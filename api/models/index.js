const sequelize = require("../config/db");

// Importás y ejecutás cada modelo
const alumnos = require("./alumnos")(sequelize);
const carreras = require("./carreras")(sequelize);
const facultades = require("./facultades")(sequelize);
const profesores = require("./profesores")(sequelize);
const materias = require("./materias")(sequelize);
const conejos = require("./conejos")(sequelize);
const alumnos_conejos = require("./alumnos_conejos")(sequelize);
const notas_examenes = require("./notas_examenes")(sequelize);
const notas_materias = require("./notas_materias")(sequelize);
const profesores_materias = require("./profesores_materias")(sequelize);

// Acá irían todas las asociaciones (belongsTo, hasMany, etc.)

module.exports = {
  sequelize,
  alumnos,
  carreras,
  facultades,
  profesores,
  materias,
  conejos,
  alumnos_conejos,
  notas_examenes,
  notas_materias,
  profesores_materias,
};
