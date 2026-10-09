import mysql from 'mysql2/promise';

// Aviso si falta algún dato de conexión en el .env
const requeridas = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const faltantes = requeridas.filter((nombre) => !process.env[nombre]);
if (faltantes.length > 0) {
  console.warn(`⚠ Faltan variables en el archivo .env: ${faltantes.join(', ')}`);
}

// Pool de conexiones: en lugar de abrir una conexión nueva en cada
// consulta, reutiliza unas pocas conexiones que ya están abiertas.
export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: 'utf8mb4',
  connectionLimit: 5,  // Hostinger limita las conexiones; con 5 por persona es suficiente
  dateStrings: true,   // fechas como texto 'AAAA-MM-DD', igual que en el frontend
});
