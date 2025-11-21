const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const materias = sequelize.define(
    "materias",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

      nombre: { type: DataTypes.STRING(255), allowNull: false },
      anio: { type: DataTypes.INTEGER, allowNull: false },

      id_carrera: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      tableName: "materias",
      timestamps: false,
    }
  );

  return materias;
};
