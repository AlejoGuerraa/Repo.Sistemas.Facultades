const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const notas_examenes = sequelize.define(
    "notas_examenes",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

      id_alumno: { type: DataTypes.INTEGER, allowNull: false },
      id_materia: { type: DataTypes.INTEGER, allowNull: false },

      tipo: {
        type: DataTypes.ENUM("parcial1", "parcial2", "final"),
        allowNull: false,
      },

      nota: { type: DataTypes.DECIMAL(3, 1), allowNull: false },

      fecha: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "notas_examenes",
      timestamps: false,
    }
  );

  return notas_examenes;
};
