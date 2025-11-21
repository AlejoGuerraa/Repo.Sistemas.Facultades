const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Carrera = sequelize.define(
    "carreras",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      nombre: { type: DataTypes.STRING(200), allowNull: false },
      id_facultad: { type: DataTypes.INTEGER },
    },
    {
      tableName: "carreras",
      timestamps: false,
    }
  );

  return carreras;
};
