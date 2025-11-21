const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const profesores_materias = sequelize.define(
    "profesores_materias",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

      id_materia: { type: DataTypes.INTEGER, allowNull: false },
      id_profesor: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      tableName: "profesores_materias",
      timestamps: false,
    }
  );

  return profesores_materias;
};
