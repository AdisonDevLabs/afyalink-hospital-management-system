const { Pool } = require('pg');

let pool;

// Use DATABASE_URL if defined (Render or production), else use local credentials
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // Required by many cloud PostgreSQL providers
    },
  });
} else {
  pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });
}

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    console.log("ENV DATABASE_URL:", process.env.DATABASE_URL);
    return console.error('❌ Error acquiring client:', err.stack);
    
  }
  
  console.log('✅ Successfully connected to PostgreSQL database');
  release(); // release the client back to the pool
});

module.exports = pool;
