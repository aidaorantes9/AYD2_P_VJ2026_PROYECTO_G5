// conexion a la base de datos mysql usando pool de conexiones
const mysql = require('mysql2/promise');
require('dotenv').config();

// el pool reutiliza conexiones para no abrir una nueva en cada consulta
const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

module.exports = pool;