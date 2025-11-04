// server/src/config/db.js

const { Pool } = require('pg');
const env = require('./env');

let pool;

if (env.DATABASE_URL) {
  pool = new Pool({
    connectionString: env.DATABASE_URL,
    ssl: env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false,
    } : false,
  });
  console.log('Database connection via DATABASE_URL');
} else {
  pool = new Pool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_DATABASE,
  });
  console.log(`Database connection via individual vars to ${env.DB_HOST}:${env.DB_PORT}`);
}

pool.connect()
  .then(client => {
    console.log('Successfully connected to PostgreSQL database');
    client.release();
  })
  .catch(err => {
    console.error('Error connecting to PostgreSQL database:', err.stack);
  })
  
  pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
  });

module.exports = pool;
