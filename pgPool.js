import { Pool } from "pg"
// const { Pool } = require("pg")

const client = new Pool({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "new_password",
    database: "test",
    max: 100
});

const pool = await client.connect();

const result = await pool.query(
  `INSERT INTO "User" (name, email)
   VALUES ($1, $2)
   RETURNING *`,
  ["Yash", "yash@example.com"]
);

console.log(result.rows);

pool.release();
// await pool.end();