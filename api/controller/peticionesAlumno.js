// peticionesAlumno.js

const { Op } = require("sequelize");
const { alumnos, carreras, facultades, materias, profesores, conejos, alumnos_conejos, notas_materias, notas_examenes } = require("../models");

const buscarAlumno = async (req, res) => {
  const { search } = req.query;

  // parámetros de paginación
  const limit = parseInt(req.query.limit) || 100;   // por defecto 20
  const offset = parseInt(req.query.offset) || 0;  // por defecto 0

  try {
    const where = {};

    if (search) {
      const term = `%${search}%`;
      where[Op.or] = [
        { nombre: { [Op.like]: term } },
        { apellido: { [Op.like]: term } },
        { dni: { [Op.like]: term } },
      ];
    }

    // COUNT TOTAL (sin paginación)
    const total = await alumnos.count({ where });

    // BUSCAR SOLO EL BLOQUE QUE CORRESPONDE
    const datos = await alumnos.findAll({
      where,
      include: [
        {
          model: carreras,
          as: "carrera",
          attributes: ["id", "nombre"],
        },
        {
          model: facultades,
          as: "facultad",
          attributes: ["id", "nombre"],
        },
      ],
      order: [["id", "ASC"]],
      limit,
      offset,
    });

    // Mapear igual que tu versión original
    const results = datos.map((a) => ({
      id: a.id,
      nombre: a.nombre,
      apellido: a.apellido,
      telefono: a.telefono,
      direccion: a.direccion,
      dni: a.dni,
      edad: a.edad,
      nacionalidad: a.nacionalidad,
      id_carrera: a.id_carrera,
      id_facultad: a.id_facultad,
      carrera: a.carrera ? a.carrera.nombre : null,
      facultad: a.facultad ? a.facultad.nombre : null,
    }));

    return res.json({
      results,
      total,
    });
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

const listarAlumnosPorCarrera = async (req, res) => {
  const { idCarrera } = req.params;

  const limit = parseInt(req.query.limit) || 300;   // por defecto 20
  const offset = parseInt(req.query.offset) || 0;  // por defecto 0

  try {
    const lista = await alumnos.findAll({ where: { id_carrera: idCarrera } });
    if (!lista || lista.length === 0)
      return res.status(404).json({ error: "No hay alumnos para esta carrera" });

    res.json(lista);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error buscando alumnos" });
  }
};
const listarCarreras = async (req, res) => {
  try {
    const lista = await carreras.findAll();
    res.json(lista);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error buscando carreras" });
  }
};


const getConejosByAlumno = async (req, res) => {
  try {
    const { id } = req.params;

    const registros = await alumnos_conejos.findAll({
      where: { alumno_id: id },
      attributes: ["id", "alumno_id", "conejo_id"],
      include: [
        {
          model: conejos,
          as: "conejo",
          attributes: ["id", "placa" ,"raza", "edad"]
        }
      ],
      order: [["id", "ASC"]],
      raw: false
    });

    console.log(`[getConejosByAlumno] alumno=${id} registros=${registros.length}`);
    if (registros.length > 0) {
      console.log("Ejemplo registro[0]:", registros[0].toJSON ? registros[0].toJSON() : registros[0]);
    }

    return res.json(registros);
  } catch (err) {
    console.error("getConejosByAlumno error:", err);
    return res.status(500).json({ error: "Error obteniendo conejos del alumno" });
  }
};


const getNotasExamenesByAlumno = async (req, res) => {
  try {
    const { id } = req.params;

    const notas = await notas_examenes.findAll({
      where: { id_alumno: id },
      include: [
        {
          model: materias,
          as: "materia",
          attributes: ["id", "nombre", "anio", "id_carrera"]
        }
      ],
      order: [
        ["id_materia", "ASC"],
        ["tipo", "ASC"]
      ]
    });

    res.json(notas);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error obteniendo notas de exámenes" });
  }
};

const getNotasMateriasByAlumno = async (req, res) => {
  try {
    const { id } = req.params;

    const notas = await notas_materias.findAll({
      where: { alumno_id: id },
      include: [
        {
          model: materias,
          as: "materia",
          attributes: ["id", "nombre", "anio", "id_carrera"]
        }
      ],
      order: [["materia_id", "ASC"]]
    });

    res.json(notas);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error obteniendo notas de materias" });
  }
};

// =========================
// Notas Exámenes
// =========================
const getNotasExamenes0a3 = async (req, res) => {
  try {
    const notas = await notas_examenes.findAll({
      where: { nota: { [Op.between]: [0, 3.99] } },
      include: [
        { model: alumnos, as: "alumno", attributes: ["id", "nombre", "apellido", "dni"] },
        { model: materias, as: "materia", attributes: ["id", "nombre", "id_carrera"] },
      ],
      order: [[{ model: alumnos, as: "alumno" }, "apellido", "ASC"]],
    });
    res.json(notas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo notas de exámenes 0-3" });
  }
};

const getNotasExamenes4a7 = async (req, res) => {
  try {
    const notas = await notas_examenes.findAll({
      where: { nota: { [Op.between]: [4, 7.99] } },
      include: [
        { model: alumnos, as: "alumno", attributes: ["id", "nombre", "apellido", "dni"] },
        { model: materias, as: "materia", attributes: ["id", "nombre", "id_carrera"] },
      ],
      order: [[{ model: alumnos, as: "alumno" }, "apellido", "ASC"]],
    });
    res.json(notas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo notas de exámenes 4-7" });
  }
};

const getNotasExamenes7a10 = async (req, res) => {
  try {
    const notas = await notas_examenes.findAll({
      where: { nota: { [Op.between]: [7, 10] } },
      include: [
        { model: alumnos, as: "alumno", attributes: ["id", "nombre", "apellido", "dni"] },
        { model: materias, as: "materia", attributes: ["id", "nombre", "id_carrera"] },
      ],
      order: [[{ model: alumnos, as: "alumno" }, "apellido", "ASC"]],
    });
    res.json(notas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo notas de exámenes 7-10" });
  }
};

// =========================
// Notas Materias
// =========================
const getNotasMaterias0a3 = async (req, res) => {
  try {
    const notas = await notas_materias.findAll({
      where: {
        [Op.or]: [
          { promedio: { [Op.between]: [0, 3.99] } },
          { promedio_sin_aplazo: { [Op.between]: [0, 3.99] } },
        ],
      },
      include: [
        { model: alumnos, as: "alumno", attributes: ["id", "nombre", "apellido", "dni"] },
        { model: materias, as: "materia", attributes: ["id", "nombre", "id_carrera"] },
      ],
      order: [[{ model: alumnos, as: "alumno" }, "apellido", "ASC"]],
    });
    res.json(notas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo notas materias 0-3" });
  }
};

const getNotasMaterias4a7 = async (req, res) => {
  try {
    const notas = await notas_materias.findAll({
      where: {
        [Op.or]: [
          { promedio: { [Op.between]: [4, 6.99] } },
          { promedio_sin_aplazo: { [Op.between]: [4, 6.99] } },
        ],
      },
      include: [
        { model: alumnos, as: "alumno", attributes: ["id", "nombre", "apellido", "dni"] },
        { model: materias, as: "materia", attributes: ["id", "nombre", "id_carrera"] },
      ],
      order: [[{ model: alumnos, as: "alumno" }, "apellido", "ASC"]],
    });
    res.json(notas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo notas materias 4-7" });
  }
};

const getNotasMaterias7a10 = async (req, res) => {
  try {
    const notas = await notas_materias.findAll({
      where: {
        [Op.or]: [
          { promedio: { [Op.between]: [7, 10] } },
          { promedio_sin_aplazo: { [Op.between]: [7, 10] } },
        ],
      },
      include: [
        { model: alumnos, as: "alumno", attributes: ["id", "nombre", "apellido", "dni"] },
        { model: materias, as: "materia", attributes: ["id", "nombre", "id_carrera"] },
      ],
      order: [[{ model: alumnos, as: "alumno" }, "apellido", "ASC"]],
    });
    res.json(notas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo notas materias 7-10" });
  }
};


module.exports = {
  buscarAlumno,
  ingresarAlumno,
  editarAlumno,
  ingresarProfesor,
  editarProfesor,
  listarMateriasPorCarrera,
  getConejosByAlumno,
  getNotasExamenesByAlumno,
  getNotasMateriasByAlumno,
  listarAlumnosPorCarrera,
  listarCarreras,
  getNotasExamenes0a3,
  getNotasExamenes4a7,
  getNotasExamenes7a10,
  getNotasMaterias0a3,
  getNotasMaterias4a7,
  getNotasMaterias7a10,
};
