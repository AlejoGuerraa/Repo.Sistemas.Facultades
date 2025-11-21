const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const alumnos = sequelize.define(
    "alumnos",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

      nombre: { type: DataTypes.STRING(100), allowNull: false },
      apellido: { type: DataTypes.STRING(100), allowNull: false },

      telefono: { type: DataTypes.BIGINT, allowNull: false, unique: true },
      direccion: { type: DataTypes.STRING(255), allowNull: false, unique: true },
      dni: { type: DataTypes.STRING(15), allowNull: false, unique: true },

      edad: { type: DataTypes.INTEGER, allowNull: false },
      nacionalidad: { type: DataTypes.STRING(50), allowNull: false },

      id_facultad: { type: DataTypes.INTEGER, allowNull: false },
      id_carrera: { type: DataTypes.INTEGER, allowNull: false },

      conejos: { type: DataTypes.JSON },
    },
    {
      tableName: "alumnos",
      timestamps: false,
    }
  );

  return alumnos;
};
