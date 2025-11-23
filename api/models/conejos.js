const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const conejos = sequelize.define(
    "conejos",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      placa: { type: DataTypes.STRING(3) },
      raza: { type: DataTypes.STRING(100), allowNull: false },
      edad: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      tableName: "conejos",
      timestamps: false,
    }
  );

  return conejos;
};
