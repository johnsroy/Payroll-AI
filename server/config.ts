// Database configuration
export const config = {
  // Default database configuration
  db: {
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432'),
    database: process.env.PGDATABASE || 'postgres',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
  },
  
  // Application settings
  app: {
    port: parseInt(process.env.PORT || '5000'),
    env: process.env.NODE_ENV || 'development',
  }
};