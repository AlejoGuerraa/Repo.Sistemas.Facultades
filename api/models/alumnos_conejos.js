const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const alumnos_conejos = sequelize.define(
    "alumnos_conejos",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      alumno_id: { type: DataTypes.INTEGER, allowNull: false },
      conejo_id: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      tableName: "alumnos_conejos",
      timestamps: false,
    }
  );

  return alumnos_conejos;
};
