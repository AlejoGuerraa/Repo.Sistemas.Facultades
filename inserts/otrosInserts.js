/**
 * script.js
 *
 * Lee tablas reales: alumnos (id, id_carrera) y materias (id, id_carrera, anio)
 * Genera 3 CSV en output/:
 *  - notas_examenes.csv  (id,id_alumno,id_materia,tipo,nota,fecha)
 *  - alumnos_conejos.csv (id,alumno_id,conejo_id)   (1 fila por nota)
 *  - alumno_materia.csv  (alumno_id,materia_id,estado,promedio,promedio_sin_aplazo)
 *
 * CONFIG: ajustá DB y START_CONEJO_ID antes de ejecutar.
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

//////////////////////
// CONFIG - ADAPTÁ  //
//////////////////////
const CONFIG = {
  DB: {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'facultades',
    port: 3306,
  },
  OUTDIR: path.join(__dirname, 'output'),
  START_NOTA_ID: 1,
  START_ALUMNO_CONEJO_ID: 1,
  START_CONEJO_ID: 1,
  MAX_RETRIES_ON_FAIL: 6,
  PROB_SECOND_FINAL_IF_FAIL_FIRST_FINAL: 0.30,
  PROB_RETAKE_AFTER_AVG_LT_4: 0.80,
  PROB_RECUPERA_PARCIALES_IF_AVG_LT_4: 0.50,
  LOG_EVERY: 50000,
  MAX_PAST_YEARS_FOR_DATES: 2,
  YEAR_DISTRIBUTION: [0.10, 0.15, 0.30, 0.25, 0.20],
};

if (!fs.existsSync(CONFIG.OUTDIR)) fs.mkdirSync(CONFIG.OUTDIR, { recursive: true });

//////////////////////////////
// 👉 INSERTS PESADOS (NUEVO)
//////////////////////////////
async function ejecutarInsertsPesados() {
  try {
    const conn = await mysql.createConnection(CONFIG.DB);
    console.log("📄 Ejecutando insertsPesados.sql...");

    const sql = fs.readFileSync(path.join(__dirname, "insertsPesados.sql"), "utf8");

    const statements = sql
        .split(/;\s*\n/) // separa solo cuando hay ; + salto de línea
        .map(s => s.trim())
        .filter(s => s && !s.startsWith("--")); // evita comentarios sueltos

    for (const st of statements) {
      await conn.query(st);
    }

    await conn.end();
    console.log("✅ insertsPesados.sql ejecutado.\n");

  } catch (err) {
    console.error("❌ Error ejecutando insertsPesados.sql:", err);
    process.exit(1);
  }
}

////////////////////////////////
// 👉 LLAMADO ANTES DEL SCRIPT
////////////////////////////////
(async () => {
  await ejecutarInsertsPesados();
})();
//////////////////////////////
//  FIN FUNCIÓN AGREGADA   //
//////////////////////////////


const PATH_NOTAS = path.join(CONFIG.OUTDIR, 'notas_examenes.csv');
const PATH_ALUM_CONEJOS = path.join(CONFIG.OUTDIR, 'alumnos_conejos.csv');
const PATH_ALUM_MATERIA = path.join(CONFIG.OUTDIR, 'alumno_materia.csv');

const notasStream = fs.createWriteStream(PATH_NOTAS, { flags: 'w', encoding: 'utf8' });
const acStream = fs.createWriteStream(PATH_ALUM_CONEJOS, { flags: 'w', encoding: 'utf8' });
const amStream = fs.createWriteStream(PATH_ALUM_MATERIA, { flags: 'w', encoding: 'utf8' });

// Headers
notasStream.write('id,id_alumno,id_materia,tipo,nota,fecha\n');
acStream.write('id,alumno_id,conejo_id\n');
amStream.write('alumno_id,materia_id,estado,promedio,promedio_sin_aplazo\n');

/* ---------- utils ---------- */
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function round1(x) { return Math.round(x * 10) / 10; }
function rand() { return Math.random(); }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function nowSQLDateRandomPastYears(maxYears = CONFIG.MAX_PAST_YEARS_FOR_DATES) {
  const now = Date.now();
  const past = now - Math.floor(Math.random() * maxYears * 365 * 24 * 3600 * 1000);
  return new Date(past).toISOString().slice(0, 19).replace('T', ' ');
}

// nota 1.0 - 10.0 con 1 decimal, bias desplaza hacia arriba
function randGrade(bias = 0.0) {
  const base = (Math.random() + Math.random()) * 4.5 + 1.0;
  return clamp(round1(base + bias), 1.0, 10.0);
}

// elegir año simulado por alumno
function pickYearForAlumno() {
  const arr = CONFIG.YEAR_DISTRIBUTION;
  const r = Math.random();
  let accum = 0;
  for (let i=0;i<arr.length;i++){
    accum += arr[i];
    if (r <= accum) return i + 1;
  }
  return arr.length;
}

/* ---------- conejo allocator ---------- */
let nextConejoId = CONFIG.START_CONEJO_ID;
function reserveConejoForNota(nota) {
  const notaInt = clamp(Math.round(nota), 1, 10);
  const desiredAge = 11 - notaInt;
  const currentAge = ((nextConejoId - 1) % 10) + 1;
  let offset = desiredAge - currentAge;
  offset = ((offset % 10) + 10) % 10;
  const selected = nextConejoId + offset;
  nextConejoId = selected + 1;
  return selected;
}

/* ---------- main ---------- */
(async () => {
  const conn = await mysql.createConnection(CONFIG.DB);
  console.log('Conectado a DB, cargando tablas...');

  // leer materias y alumnos reales
  const [materiasRows] = await conn.query('SELECT id, anio, id_carrera FROM materias;');
  const [alumnosRows] = await conn.query('SELECT id, id_carrera FROM alumnos;');

  if (!materiasRows.length) {
    console.error('No se encontraron materias. Abortando.');
    process.exit(1);
  }
  if (!alumnosRows.length) {
    console.error('No se encontraron alumnos. Abortando.');
    process.exit(1);
  }

  // indexar materias por carrera y año
  const materiasByCarreraYear = {};
  for (const m of materiasRows) {
    materiasByCarreraYear[m.id_carrera] = materiasByCarreraYear[m.id_carrera] || {};
    materiasByCarreraYear[m.id_carrera][m.anio] = materiasByCarreraYear[m.id_carrera][m.anio] || [];
    materiasByCarreraYear[m.id_carrera][m.anio].push(m.id);
  }

  // si hay materias con anio = 0 (comunes o intro), las tratamos como año 1
  for (const c in materiasByCarreraYear) {
    if (materiasByCarreraYear[c][0]) {
      materiasByCarreraYear[c][1] = (materiasByCarreraYear[c][1] || []).concat(materiasByCarreraYear[c][0]);
      delete materiasByCarreraYear[c][0];
    }
  }

  // stats y contadores
  let nextNotaId = CONFIG.START_NOTA_ID;
  let nextAlumnoConejoId = CONFIG.START_ALUMNO_CONEJO_ID;
  const stats = { notas:0, conejos:0, paresAM:0 };

  // trackeo de aprobaciones por alumno: alumnoId -> Set(materiaId)
  const aprobadasMap = new Map();

  // Para cada alumno: asignamos un "año actual" simulado (no existe en tabla)
  console.log(`Simulando para ${alumnosRows.length} alumnos...`);
  for (const a of alumnosRows) {
    const alumnoId = a.id;
    const idCarrera = a.id_carrera;
    const maxYear = Math.max(...Object.keys(materiasByCarreraYear[idCarrera] || {1:[]}).map(Number));
    const currentYear = Math.min(pickYearForAlumno(), maxYear || 1);

    aprobadasMap.set(alumnoId, new Set());

    // por cada año desde 1 hasta currentYear (simulamos que pasó por esos años; para años previos bias alto)
    let puedeSeguir = true;
    for (let anio = 1; anio <= currentYear && puedeSeguir; anio++) {
      const materiasThisYear = (materiasByCarreraYear[idCarrera] && materiasByCarreraYear[idCarrera][anio]) || [];
      if (!materiasThisYear.length) continue;

      let allApprovedThisYear = true;

      for (const materiaId of materiasThisYear) {
        // si ya aprobó la materia (pudo haber sido aprobada por un intento anterior), saltarla
        if (aprobadasMap.get(alumnoId).has(materiaId)) continue;

        // simulamos intentos para esa materia
        let approved = false;
        let attempts = 0;
        while (!approved && attempts <= CONFIG.MAX_RETRIES_ON_FAIL) {
          attempts++;
          // PARCIALES
          const p1 = randGrade(anio < currentYear ? 1.4 : 0.0); // bias positivo para años anteriores
          const p2 = randGrade(anio < currentYear ? 1.2 : 0.0);
          const fecha1 = nowSQLDateRandomPastYears();
          const fecha2 = nowSQLDateRandomPastYears();
          // escribir parciales
          notasStream.write(`${nextNotaId},${alumnoId},${materiaId},parcial1,${p1},${fecha1}\n`); nextNotaId++; stats.notas++;
          const conejo1 = reserveConejoForNota(p1);
          acStream.write(`${nextAlumnoConejoId++},${alumnoId},${conejo1}\n`); stats.conejos++;

          notasStream.write(`${nextNotaId},${alumnoId},${materiaId},parcial2,${p2},${fecha2}\n`); nextNotaId++; stats.notas++;
          const conejo2 = reserveConejoForNota(p2);
          acStream.write(`${nextAlumnoConejoId++},${alumnoId},${conejo2}\n`); stats.conejos++;

          const avg = round1((p1 + p2) / 2.0);

          // PROMOCION
          if (avg >= 7.0) {
            approved = true;
            aprobadasMap.get(alumnoId).add(materiaId);
            break;
          }

          // FINAL DIRECTO
          if (avg >= 4.0 && avg < 7.0) {
            const final = randGrade();
            notasStream.write(`${nextNotaId},${alumnoId},${materiaId},final,${final},${nowSQLDateRandomPastYears()}\n`);
            nextNotaId++; stats.notas++;
            const conejoF = reserveConejoForNota(final);
            acStream.write(`${nextAlumnoConejoId++},${alumnoId},${conejoF}\n`); stats.conejos++;

            if (final >= 4.0) {
              approved = true;
              aprobadasMap.get(alumnoId).add(materiaId);
              break;
            } else {
              // posible segundo final
              if (Math.random() < CONFIG.PROB_SECOND_FINAL_IF_FAIL_FIRST_FINAL) {
                const final2 = randGrade();
                notasStream.write(`${nextNotaId},${alumnoId},${materiaId},final,${final2},${nowSQLDateRandomPastYears()}\n`);
                nextNotaId++; stats.notas++;
                const conejoF2 = reserveConejoForNota(final2);
                acStream.write(`${nextAlumnoConejoId++},${alumnoId},${conejoF2}\n`); stats.conejos++;

                if (final2 >= 4.0) {
                  approved = true;
                  aprobadasMap.get(alumnoId).add(materiaId);
                  break;
                }
              }
              // no aprobó este intento -> puede recursar (loop) si attempts <= MAX_RETRIES_ON_FAIL
            }
          } else {
            // avg < 4.0 -> desaprobó por parciales bajos
            if (Math.random() < CONFIG.PROB_RECUPERA_PARCIALES_IF_AVG_LT_4) {
              // recupera parciales (rp1 rp2)
              const rp1 = randGrade();
              const rp2 = randGrade();
              notasStream.write(`${nextNotaId},${alumnoId},${materiaId},parcial1,${rp1},${nowSQLDateRandomPastYears()}\n`); nextNotaId++; stats.notas++;
              const conejoRp1 = reserveConejoForNota(rp1);
              acStream.write(`${nextAlumnoConejoId++},${alumnoId},${conejoRp1}\n`); stats.conejos++;

              notasStream.write(`${nextNotaId},${alumnoId},${materiaId},parcial2,${rp2},${nowSQLDateRandomPastYears()}\n`); nextNotaId++; stats.notas++;
              const conejoRp2 = reserveConejoForNota(rp2);
              acStream.write(`${nextAlumnoConejoId++},${alumnoId},${conejoRp2}\n`); stats.conejos++;

              const avg2 = round1((rp1 + rp2) / 2.0);
              if (avg2 >= 7.0) {
                approved = true;
                aprobadasMap.get(alumnoId).add(materiaId);
                break;
              } else if (avg2 >= 4.0) {
                const finalr = randGrade();
                notasStream.write(`${nextNotaId},${alumnoId},${materiaId},final,${finalr},${nowSQLDateRandomPastYears()}\n`); nextNotaId++; stats.notas++;
                const conejoFr = reserveConejoForNota(finalr);
                acStream.write(`${nextAlumnoConejoId++},${alumnoId},${conejoFr}\n`); stats.conejos++;
                if (finalr >= 4.0) {
                  approved = true;
                  aprobadasMap.get(alumnoId).add(materiaId);
                  break;
                } else {
                  // no aprobado en este intento
                }
              } else {
                // sigue desaprobado en este intento
              }
            } else {
              // no recupera; desaprueba este intento
            }
          } // fin avg <4 branch

          // si llega acá y approved==false, loop continuará (recursa) si attempts <= MAX_RETRIES_ON_FAIL
        } // end while attempts

        if (!approved) {
          allApprovedThisYear = false;
        }
      } // end for materiasThisYear

      // si no aprobó TODO el año, no puede avanzar
      if (!allApprovedThisYear) {
        puedeSeguir = false;
      } else {
        puedeSeguir = true;
      }
    } // end for años
  } // end for alumnos

  // CERRAR streams de notas y alumnos_conejos antes de procesar alumno_materia (que depende de notas)
  notasStream.end();
  acStream.end();

  console.log('Notas y alumnos_conejos generados. Ahora calculando alumno_materia desde las notas generadas (streaming)...');

  // Como generamos las notas en un CSV, y no queremos leer la DB otra vez, vamos a
  // leer el CSV notas_examenes.csv para calcular alumno_materia. Esto evita
  // depender de una tabla alumno_materia inexistente.
  // Procesamos el CSV línea por línea para calcular por par (alumno,materia) las notas.

  // Map temporal: key = `${alumnoId}_${materiaId}` -> array of notas
  const pairsMap = new Map();
  const rl = require('readline').createInterface({
    input: fs.createReadStream(PATH_NOTAS),
    crlfDelay: Infinity
  });

  let lineNo = 0;
  for await (const line of rl) {
    lineNo++;
    if (lineNo === 1) continue; // header
    // id,id_alumno,id_materia,tipo,nota,fecha
    const parts = line.split(',');
    if (parts.length < 6) continue;
    const id_alumno = parseInt(parts[1], 10);
    const id_materia = parseInt(parts[2], 10);
    const nota = parseFloat(parts[4]);

    const key = `${id_alumno}_${id_materia}`;
    if (!pairsMap.has(key)) pairsMap.set(key, []);
    pairsMap.get(key).push(nota);
  }

  // Para cada par, calcular estado y promedios y escribir alumno_materia.csv
  let updated = 0;
  for (const [key, notasArr] of pairsMap.entries()) {
    const [alumnoIdStr, materiaIdStr] = key.split('_');
    const alumnoId = parseInt(alumnoIdStr, 10);
    const materiaId = parseInt(materiaIdStr, 10);

    const all_notas = notasArr.map(n => Number(n));
    const promedio = round1(all_notas.reduce((s,x)=>s+x,0) / all_notas.length);

    const validas = all_notas.filter(n => n >= 4);
    const promedio_sin_aplazo = validas.length ? round1(validas.reduce((s,x)=>s+x,0) / validas.length) : '';

    let estado = 'desaprobada';
    if (all_notas.some(n => n >= 7)) estado = 'promocionada';
    else if (all_notas.some(n => n >= 4)) estado = 'aprobada';

    amStream.write(`${alumnoId},${materiaId},${estado},${promedio},${promedio_sin_aplazo}\n`);
    updated++;
  }

  amStream.end();

  // CERRAR CONEXION DB
  await conn.end();

  console.log('Terminado.');
  console.log(`  notas generadas: ${ (nextNotaId - CONFIG.START_NOTA_ID).toLocaleString() }`);
  console.log(`  conejos asignados: ${ (nextAlumnoConejoId - CONFIG.START_ALUMNO_CONEJO_ID).toLocaleString() }`);
  console.log(`  alumno_materia filas: ${ updated.toLocaleString() }`);
  console.log(`Archivos en: ${CONFIG.OUTDIR}`);
  console.log('Recordá ajustar START_CONEJO_ID para que los ages cuadren con tu tabla `conejos` si es necesario.');
})().catch(err => {
  console.error('Error en ejecución:', err);
  process.exit(1);
});
