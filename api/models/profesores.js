const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const profesores = sequelize.define(
    "profesores",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

      nombre: { type: DataTypes.STRING(100), allowNull: false },
      apellido: { type: DataTypes.STRING(100), allowNull: false },

      titulo: { type: DataTypes.STRING(255), allowNull: true },

      id_facultad: { type: DataTypes.INTEGER, allowNull: true },
      id_materia: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
      tableName: "profesores",
      timestamps: false,
    }
  );

  return profesores;
};
