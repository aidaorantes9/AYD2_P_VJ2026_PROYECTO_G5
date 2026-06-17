// Se importa mysql2 con promesas para poder usar async/await en las consultas
const mysql = require('mysql2/promise');

// Se cargan las variables del archivo .env
require('dotenv').config();

// Se crea un pool de conexiones para reutilizar conexiones a MySQL
// Esto evita abrir una conexión nueva en cada petición
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'prccd',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Se exporta el pool para usarlo desde los controladores.
module.exports = pool;