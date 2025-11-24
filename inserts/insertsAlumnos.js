// generar_alumnos_csv.js
// Genera alumnos.csv con 3496 alumnos según tus reglas.
// Uso: node generar_alumnos_csv.js

const fs = require('fs');
const path = require('path');

const OUTFILE = path.join(__dirname, 'alumnos.csv');
const TOTAL = 3496;

// --- Datos base (copiados de tu archivo) ---
const nombres = [
  "Matías","Sofía","Tomás","Valentina","Martín","Camila","Lucas","Emilia","Diego","Isabella",
  "Facundo","Mía","Bruno","Agustina","Nicolás","Lucía","Julián","Renata","Gonzalo","Julieta",
  "Federico","Belén","Santiago","Antonella","Beltrán","Sabrina","Alan","Paula","Maximiliano","Rocío",
  "Ezequiel","Mariana","Gonzalo2","Carla","Ramiro","Florencia","Iván","María","Adrián","Lorena",
  "Hernán","Agustín","Eduardo","Victoria","Sebastián","Luciana","Gabriel","Ana","Cristian","Noelia",
  "Pablo","Verónica","Javier","Natalia","Óscar","Mónica","Alejandro","Patricia","Andrés","Claudia",
  "Hugo","Silvana","Enzo","Margarita","Raúl","Ariadna","Rodrigo","Susana","Marcos","Daniela",
  "Óliver","Carolina","Bruno2","Gisela","Fabián","Mara","Nelson","Juliana","Sergio","Lola",
  "Ivanna","Germán","Elena","Renzo","Agustín2","Rafael","Aldana","Santiago2","Clara","Fabricio",
  "Gaspar","Marta","Leandro","Agustina2","Víctor","Marta2","Esteban","Olivia","Ciro","Melina"
].slice(0,100);

const apellidos = [
  "González","Rodríguez","Gómez","Fernández","López","Martínez","Pérez","Sánchez","Romero","Torres",
  "Rivera","Ruiz","Ramírez","Alonso","Vargas","Ramos","Medina","Castro","Ortiz","Silva",
  "Paredes","Mendoza","Morales","Cruz","Flores","Suárez","Guerrero","Vega","Herrera","Rojas",
  "Acosta","Aguirre","Díaz","Iglesias","Vidal","Luna","Paz","Domínguez","Gutiérrez","Sosa",
  "Cabrera","Bravo","Marín","Benítez","Ferrer","Nuñez","Riviera2","Salazar","Valdez","Pinto",
  "Quiroga","Santana","Peralta","Cárdenas","Leiva","Arias","Crespo","Montes","Soler","Cortés",
  "Saavedra","López2","Molina","Campos","Acuña","Araya","Candia","Bustos","Cardozo","Delgado",
  "Espinoza","Faust","García","Hidalgo","Ibáñez","Juárez","Ledesma","Molina2","Noriega","Olivares",
  "Paz2","Quinteros","Retamoso","Salas","Terra","Urrutia","Vargas2","Zamora","Yrigoyen","Zapata",
  "Bellido","Correa","Duarte","Estévez","Funes","Giménez","Holm","Ibarra","Jara","Kraus"
].slice(0,100);

const calles = [
  "Avenida Rivadavia","Calle Florida","Avenida 9 de Julio","Avenida Corrientes","Calle San Martín",
  "Avenida Belgrano","Calle Lavalle","Avenida Santa Fe","Calle Córdoba","Avenida Libertador",
  "Calle Perú","Avenida Alvear","Calle Defensa","Avenida Cabildo","Calle Independencia",
  "Avenida Callao","Calle Tucumán","Avenida Mitre","Calle Pueyrredón","Avenida Entre Ríos",
  "Calle Esmeralda","Avenida Hipólito Yrigoyen","Calle Maipú","Avenida San Juan","Calle Moreno",
  "Avenida Sarmiento","Calle Suipacha","Avenida Las Heras","Calle Catamarca","Avenida Sáenz Peña",
  "Calle Perú2","Avenida Pueyrredón2","Calle Gurruchaga","Avenida Scalabrini Ortiz","Calle Paraguay",
  "Avenida Boedo","Calle Fitz Roy","Avenida Dorrego","Calle Avellaneda","Avenida Independencia2",
  "Calle Pichincha","Avenida Caseros","Calle Bulnes","Avenida Triunvirato","Calle México",
  "Avenida Roca","Calle Jujuy","Avenida Lamadrid","Calle Rioja","Avenida Gaona"
].slice(0,50);

const NACIONALIDADES = ["Argentina", "Paraguaya", "Chilena", "Uruguaya", "Boliviana", "Peruana", "Venezolana"];

// Mapeo de prefijos (sin '+') para cada nacionalidad
const PREFIX_BY_COUNTRY = {
  "Argentina": "54",
  "Paraguaya": "595",
  "Chilena": "56",
  "Uruguaya": "598",
  "Boliviana": "591",
  "Peruana": "51",
  "Venezolana": "58"
};

// --- Helper utilities ---
function randInt(min, max) { // inclusive
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function zeroPad(num, len) {
  return num.toString().padStart(len, '0');
}

// --- Preparar pools únicos ---
if (nombres.length === 0 || apellidos.length === 0 || calles.length === 0) {
  console.error("Faltan listas de nombres/apellidos/calles");
  process.exit(1);
}

// Direcciones únicas: combina cada calle con números 1..10000 y toma suficientes
const addressesPool = [];
const MAX_NUMBER = 10000; // 50 calles * 10000 = 500k > suficiente
for (const calle of calles) {
  for (let n = 1; n <= MAX_NUMBER; n++) {
    addressesPool.push(`${calle} ${n}`);
    if (addressesPool.length >= 200000) break; // seguridad
  }
  if (addressesPool.length >= 200000) break;
}
shuffle(addressesPool);

// DNIs únicos (8 dígitos) pool
const dniSet = new Set();
function generateUniqueDNI() {
  while (true) {
    const dni = randInt(10_000_000, 99_999_999).toString();
    if (!dniSet.has(dni)) {
      dniSet.add(dni);
      return dni;
    }
  }
}

// Teléfonos únicos: prefix + 8 dígitos
const phoneSet = new Set();
function generateUniquePhone(prefix) {
  // prefix is string like '54'
  // generate 8 digits
  let tries = 0;
  while (true) {
    const num = zeroPad(randInt(0, 99_999_999), 8);
    const phone = `${prefix}${num}`; // e.g. '54' + '01234567'
    if (!phoneSet.has(phone)) {
      phoneSet.add(phone);
      return phone;
    }
    tries++;
    if (tries > 20000) {
      throw new Error("No se pudo generar telefono unico (pool agotado)");
    }
  }
}

// Selección de nombre/apellido: permitimos repeticiones, no es obligatorio ser único
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Probabilidad para nacionalidad: 80% Argentina
function pickNationality() {
  return Math.random() < 0.8 ? "Argentina" : pickRandom(NACIONALIDADES.filter(n => n !== "Argentina"));
}

// Generar edades coherentes a partir de 17 (ej: 17..45)
function pickEdad() {
  return randInt(17, 40);
}

// --- Construir filas según orden requerido ---
// Reparto exacto por rangos (primeros, siguientes, etc.)
const distribution = [
  { count: 828, id_facultad: 1, id_carrera: 1 },   // primeros 828
  { count: 1081, id_facultad: 2, id_carrera: 2 },  // siguientes 1081
  { count: 736, id_facultad: 3, id_carrera: 3 },   // siguientes 736
  { count: 851, id_facultad: 3, id_carrera: 4 }    // siguientes 851
];

let rowsNeeded = TOTAL;
for (const d of distribution) rowsNeeded -= d.count;
if (rowsNeeded !== 0) {
  console.error("Error en la distribución: la suma no coincide con TOTAL");
  process.exit(1);
}

// Pre-generate unique addresses slice
const selectedAddresses = addressesPool.slice(0, TOTAL);
if (selectedAddresses.length < TOTAL) {
  console.error("No hay suficientes direcciones únicas");
  process.exit(1);
}

// Abrir stream de salida
const stream = fs.createWriteStream(OUTFILE, { encoding: 'utf8' });

// Cabecera CSV
// Campos: id,nombre,apellido,telefono,direccion,dni,edad,nacionalidad,id_facultad,id_carrera
stream.write('"id","nombre","apellido","telefono","direccion","dni","edad","nacionalidad","id_facultad","id_carrera"\n');

let id = 1;
let addressIndex = 0;

// Para garantizar el 80% Argentina lo implementamos por fila con probabilidad
for (const block of distribution) {
  for (let i = 0; i < block.count; i++) {
    // Nombre/Apellido
    const nombre = pickRandom(nombres);
    const apellido = pickRandom(apellidos);

    // Nacionalidad: 80% Argentina global via probabilistic pick
    const nacionalidad = pickNationality();

    // Telefono: prefijo según nacionalidad + 8 digitos (único)
    const prefix = PREFIX_BY_COUNTRY[nacionalidad] || "54";
    const telefono = generateUniquePhone(prefix);

    // Direccion (única)
    const direccion = selectedAddresses[addressIndex++];
    // DNI (único, 8 dígitos)
    const dni = generateUniqueDNI();

    // Edad coherente
    const edad = pickEdad();

    const id_facultad = block.id_facultad;
    const id_carrera = block.id_carrera;

    // Formateo CSV: escapamos comillas dobles en strings
    function q(s) {
      if (s === null || s === undefined) return '""';
      return `"${String(s).replace(/"/g, '""')}"`;
    }

    const line = [
      id,
      q(nombre),
      q(apellido),
      // telefono lo dejamos sin comillas (numerico), pero MySQL acepta con o sin
      telefono,
      q(direccion),
      q(dni),
      edad,
      q(nacionalidad),
      id_facultad,
      id_carrera
    ].join(',');

    stream.write(line + '\n');

    id++;
  }
}

stream.end(() => {
  console.log(`✅ Archivo generado: ${OUTFILE}`);
  console.log(`Registros: ${TOTAL}`);
});
