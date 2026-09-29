import mysql from "mysql2/promise";

const g = globalThis as unknown as { _pool?: mysql.Pool };

export const pool = g._pool ?? mysql.createPool({ uri: process.env.MYSQL_URL, connectionLimit: 5 });

if (process.env.NODE_ENV !== "production") g._pool = pool;
