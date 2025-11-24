const sequelize = require("../config/db");

// --------- IMPORTAR MODELOS --------- //
const alumnos = require("./alumnos")(sequelize);
const carreras = require("./carreras")(sequelize);
const facultades = require("./facultades")(sequelize);
const profesores = require("./profesores")(sequelize);
const materias = require("./materias")(sequelize);
const conejos = require("./conejos")(sequelize);
const alumnos_conejos = require("./alumnos_conejos")(sequelize);
const notas_examenes = require("./notas_examenes")(sequelize);
const notas_materias = require("./notas_materias")(sequelize);

// ---------------------------------------------
//               ASOCIACIONES
// ---------------------------------------------

// ---------- FACULTAD → CARRERAS ----------
facultades.hasMany(carreras, {
  foreignKey: "id_facultad",
  as: "carreras",
});
carreras.belongsTo(facultades, {
  foreignKey: "id_facultad",
  as: "facultad",
});

// ---------- CARRERAS → MATERIAS ----------
carreras.hasMany(materias, {
  foreignKey: "id_carrera",
  as: "materias",
});
materias.belongsTo(carreras, {
  foreignKey: "id_carrera",
  as: "carrera",
});

// ---------- FACULTAD → ALUMNOS ----------
facultades.hasMany(alumnos, {
  foreignKey: "id_facultad",
  as: "alumnos",
});
alumnos.belongsTo(facultades, {
  foreignKey: "id_facultad",
  as: "facultad",
});

// ---------- CARRERA → ALUMNOS ----------
carreras.hasMany(alumnos, {
  foreignKey: "id_carrera",
  as: "alumnos",
});
alumnos.belongsTo(carreras, {
  foreignKey: "id_carrera",
  as: "carrera",
});

// ---------- ALUMNOS ↔ CONEJOS (N:M) ----------
alumnos.belongsToMany(conejos, {
  through: alumnos_conejos,
  foreignKey: "alumno_id",
  as: "conejos",
});
conejos.belongsToMany(alumnos, {
  through: alumnos_conejos,
  foreignKey: "conejo_id",
  as: "alumnos",
});

alumnos_conejos.belongsTo(conejos, {
  foreignKey: "conejo_id",
  as: "conejo"
});

alumnos_conejos.belongsTo(alumnos, {
  foreignKey: "alumno_id",
  as: "alumno"
});


// ---------- MATERIAS → NOTAS EXÁMENES ----------
materias.hasMany(notas_examenes, {
  foreignKey: "id_materia",
  as: "notas_examenes",
});
notas_examenes.belongsTo(materias, {
  foreignKey: "id_materia",
  as: "materia",
});

// ---------- ALUMNOS → NOTAS EXÁMENES ----------
alumnos.hasMany(notas_examenes, {
  foreignKey: "id_alumno",
  as: "notas_examenes",
});
notas_examenes.belongsTo(alumnos, {
  foreignKey: "id_alumno",
  as: "alumno",
});

// ---------- ALUMNOS → NOTAS MATERIAS ----------
alumnos.hasMany(notas_materias, {
  foreignKey: "alumno_id",
  as: "notas_materias",
});
notas_materias.belongsTo(alumnos, {
  foreignKey: "alumno_id",
  as: "alumno",
});

// ---------- MATERIAS → NOTAS MATERIAS ----------
materias.hasMany(notas_materias, {
  foreignKey: "materia_id",
  as: "notas_materias",
});
notas_materias.belongsTo(materias, {
  foreignKey: "materia_id",
  as: "materia",
});

// EXPORTAR MODELOS + CONEXIÓN
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
};
