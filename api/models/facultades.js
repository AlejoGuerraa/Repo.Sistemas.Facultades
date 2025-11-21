const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const facultades = sequelize.define(
    "facultades",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      nombre: { type: DataTypes.STRING(200), allowNull: false },
    },
    {
      tableName: "facultades",
      timestamps: false,
    }
  );

  return facultades;
};
