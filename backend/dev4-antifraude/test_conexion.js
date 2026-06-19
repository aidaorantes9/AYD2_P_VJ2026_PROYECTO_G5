require("dotenv").config();
const mysql = require("mysql2/promise");

(async () => {
  const conn = await mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "123456"
  });

  const [rows] = await conn.query("SELECT 1 + 1 AS result");
  console.log(rows);

  await conn.end();
})();