// server/src/config/db.js

import pg from 'pg';
import env from './env.js';

const { Pool } = pg;

let config;

if (env.DATABASE_URL) {
  config = {
    connectionString: env.DATABASE_URL,
    ssl: env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false,
    } : false,
  };
  console.log('Database config: Using DATABASE_URL.');
} else {
  config = {
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_DATABASE,
  };
  console.log(`Database config: Using individual vars (Host: ${env.DB_HOST}:${env.DB_PORT})`);
}

const pool = new Pool(config);

pool.on('connect', (client) => {
  console.log('Database client connected.');
});
  
  pool.on('error', (err, client) => {
    console.error('Unexpected error on idle database client', err);
    process.exit(-1);
  });

export default pool;
