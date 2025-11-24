// generate_conejos_csv.js
// Genera conejos.csv con 4.000.000 registros
// Formato: "placa","raza",edad

const fs = require('fs');
const path = require('path');

const OUTFILE = path.join(__dirname, 'conejos.csv');
const TOTAL = 4_000_000;
const BATCH = 50_000; // líneas por escritura (optimiza RAM)

function buildCharset() {
  const ranges = [
    [0x00C0, 0x00FF], // Latin-1 Extended
    [0x0100, 0x017F], // Latin Extended-A
    [0x0180, 0x024F], // Latin Extended-B
  ];
  const chars = [];
  for (const [start, end] of ranges) {
    for (let cp = start; cp <= end; cp++) {
      const ch = String.fromCharCode(cp);
      if (!/['"\\\s]/.test(ch)) {
        chars.push(ch);
      }
    }
  }
  return chars;
}

function escapeCsv(s) {
  // comillas dobles -> "" para CSV
  return s.replace(/"/g, '""');
}

// ~50 razas comunes
const breeds = [
  'Lop Holandés','Mini Lop','Rex','Lionhead','Polish','Netherland Dwarf','English Spot','Flemish Giant',
  'Harlequin','Hotot','American Sable','Angora','Cinnamon','Champagne d`Argent','Belgian Hare','British Giant',
  'Californian','Chinchilla','Crème d`Argent','Dwarf Hotot','English Angora','French Lop','Giant Angora',
  'Havana','Jersey Wooly','New Zealand','Silver','Satin','Mini Rex','Polish Satin','Tan','Thrianta','American',
  'Argente Brun','Rhinelander','Czech Spot','English Lop','German Angora','Himalayan','Miniature Lop',
  'Velveteen Lop','Satinet','American Chinchilla','Canadian Plush','Brazilian','Swedish','Spanish','Portuguese','Aylesbury'
];

const charset = buildCharset();
console.log('Charset size:', charset.length);

const stream = fs.createWriteStream(OUTFILE, { flags: 'w', encoding: 'utf8' });

let count = 0;
let batch = [];

(async function generate() {
  try {
    const L = charset.length;

    outer:
    for (let i = 0; i < L; i++) {
      for (let j = 0; j < L; j++) {
        for (let k = 0; k < L; k++) {

          const placa = charset[i] + charset[j] + charset[k];
          const raza = breeds[count % breeds.length];
          const edad = (count % 10) + 1;

          const placaEsc = escapeCsv(placa);
          const razaEsc = escapeCsv(raza);

          batch.push(`"${placaEsc}","${razaEsc}",${edad}`);

          count++;

          if (batch.length >= BATCH) {
            stream.write(batch.join('\n') + '\n');
            batch = [];
          }

          if (count >= TOTAL) break outer;
        }
      }
    }

    if (batch.length > 0) {
      stream.write(batch.join('\n') + '\n');
    }

    stream.end(() => {
      console.log(`Listo. Generadas ${count.toLocaleString()} líneas en ${OUTFILE}`);
      console.log('Podés cargarlo con LOAD DATA INFILE para máxima velocidad.');
    });

  } catch (err) {
    console.error('Error al generar:', err);
    stream.end();
  }
})();
