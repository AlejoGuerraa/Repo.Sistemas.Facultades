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
facultades.hasMany(carreras, { foreignKey: "id_facultad" });
carreras.belongsTo(facultades, { foreignKey: "id_facultad" });

// ---------- CARRERAS → MATERIAS ----------
carreras.hasMany(materias, { foreignKey: "id_carrera" });
materias.belongsTo(carreras, { foreignKey: "id_carrera" });

// ---------- FACULTAD → ALUMNOS ----------
facultades.hasMany(alumnos, { foreignKey: "id_facultad" });
alumnos.belongsTo(facultades, { foreignKey: "id_facultad" });

// ---------- CARRERA → ALUMNOS ----------
carreras.hasMany(alumnos, { foreignKey: "id_carrera" });
alumnos.belongsTo(carreras, { foreignKey: "id_carrera" });

// ---------- ALUMNOS ↔ CONEJOS (N:M) ----------
alumnos.belongsToMany(conejos, {
  through: alumnos_conejos,
  foreignKey: "alumno_id",
});
conejos.belongsToMany(alumnos, {
  through: alumnos_conejos,
  foreignKey: "conejo_id",
});


// ---------- MATERIAS → NOTAS EXÁMENES ----------
materias.hasMany(notas_examenes, { foreignKey: "id_materia" });
notas_examenes.belongsTo(materias, { foreignKey: "id_materia" });

// ---------- ALUMNOS → NOTAS EXÁMENES ----------
alumnos.hasMany(notas_examenes, { foreignKey: "id_alumno" });
notas_examenes.belongsTo(alumnos, { foreignKey: "id_alumno" });

// ---------- ALUMNOS → NOTAS MATERIAS ----------
alumnos.hasMany(notas_materias, { foreignKey: "alumno_id" });
notas_materias.belongsTo(alumnos, { foreignKey: "alumno_id" });

// ---------- MATERIAS → NOTAS MATERIAS ----------
materias.hasMany(notas_materias, { foreignKey: "materia_id" });
notas_materias.belongsTo(materias, { foreignKey: "materia_id" });

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
