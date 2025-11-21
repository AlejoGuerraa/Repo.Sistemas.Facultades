const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const notas_materias = sequelize.define(
    "notas_materias",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

      alumno_id: { type: DataTypes.INTEGER, allowNull: false },
      materia_id: { type: DataTypes.INTEGER, allowNull: false },

      estado: {
        type: DataTypes.ENUM("desaprobada", "aprobada", "promocionada"),
        allowNull: false,
      },

      promedio: { type: DataTypes.DECIMAL(3, 1), allowNull: true },
      promedio_sin_aplazo: { type: DataTypes.DECIMAL(3, 1), allowNull: true },
    },
    {
      tableName: "notas_materias",
      timestamps: false,
    }
  );

  return notas_materias;
};
