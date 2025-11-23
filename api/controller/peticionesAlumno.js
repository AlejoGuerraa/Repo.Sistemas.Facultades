// peticionesAlumno.js
const alumnos = require("../models/alumnos");
const profesores = require("../models/profesores");
const materias = require("../models/materias");


const buscarAlumno = async (req, res) => {
  const { search } = req.query;

  try {
    // Si no llega search, devolvemos todos (si preferís, podés retornar 400)
    const where = {};
    if (search) {
      const term = `%${search}%`;
      where[Op.or] = [
        { nombre: { [Op.like]: term } },
        { apellido: { [Op.like]: term } },
        { dni: { [Op.like]: term } },
      ];
    }

    const datos = await alumnos.findAll({ where });
    return res.json(datos);
  } catch (error) {
    console.error("buscarAlumno error:", error);
    return res.status(500).json({ error: "Error buscando alumno." });
  }
};

const ingresarAlumno = async (req, res) => {
  try {
    const nuevo = await alumnos.create(req.body);
    res.status(200).json({ message: "Alumno ingresado correctamente", data: nuevo });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Error al ingresar alumno" });
  }
};

const editarAlumno = async (req, res) => {
  const { id } = req.params;

  try {
    const alumno = await alumnos.findByPk(id);
    if (!alumno) return res.status(404).json({ error: "Alumno no encontrado" });

    await alumno.update(req.body);
    res.json({ message: "Alumno actualizado", data: alumno });

  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Error al editar alumno" });
  }
};

const ingresarProfesor = async (req, res) => {
  try {
    const nuevo = await profesores.create(req.body);
    res.status(200).json({ message: "Profesor ingresado correctamente", data: nuevo });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Error al ingresar profesor" });
  }
};

const editarProfesor = async (req, res) => {
  const { id } = req.params;

  try {
    const prof = await profesores.findByPk(id);
    if (!prof) return res.status(404).json({ error: "Profesor no encontrado" });

    await prof.update(req.body);
    res.json({ message: "Profesor actualizado", data: prof });

  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Error al editar profesor" });
  }
};

const listarMateriasPorCarrera = async (req, res) => {
  const { idCarrera } = req.params;

  try {
    const lista = await materias.findAll({ where: { id_carrera: idCarrera } });

    if (!lista || lista.length === 0)
      return res.status(404).json({ error: "No hay materias para esta carrera" });

    res.json(lista);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error buscando materias" });
  }
};

module.exports = {
  buscarAlumno,
  ingresarAlumno,
  editarAlumno,
  ingresarProfesor,
  editarProfesor,
  listarMateriasPorCarrera,
};
