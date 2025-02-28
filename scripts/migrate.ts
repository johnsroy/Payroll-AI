import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

// This script runs migrations on the database directly
async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 });
  
  // Create the db connection
  const db = drizzle(migrationClient);
  
  console.log('Running migrations...');
  
  // Create the tables directly
  const queries = [
    // Create users table
    `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )`,
    
    // Create employees table
    `CREATE TABLE IF NOT EXISTS employees (
      id SERIAL PRIMARY KEY,
      employee_id TEXT NOT NULL UNIQUE,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      department TEXT,
      position TEXT,
      email TEXT,
      hire_date DATE,
      status TEXT DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // Create payroll_entries table
    `CREATE TABLE IF NOT EXISTS payroll_entries (
      id SERIAL PRIMARY KEY,
      employee_id TEXT NOT NULL,
      pay_period_start DATE NOT NULL,
      pay_period_end DATE NOT NULL,
      regular_hours NUMERIC NOT NULL,
      overtime_hours NUMERIC DEFAULT '0',
      regular_rate NUMERIC NOT NULL,
      overtime_rate NUMERIC,
      gross_pay NUMERIC NOT NULL,
      federal_tax NUMERIC,
      state_tax NUMERIC,
      medicare_tax NUMERIC,
      social_security_tax NUMERIC,
      other_taxes NUMERIC DEFAULT '0',
      health_insurance NUMERIC DEFAULT '0',
      retirement_401k NUMERIC DEFAULT '0',
      other_deductions NUMERIC DEFAULT '0',
      bonuses NUMERIC DEFAULT '0',
      net_pay NUMERIC NOT NULL,
      status TEXT DEFAULT 'pending',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  try {
    for (const query of queries) {
      await migrationClient.unsafe(query);
    }
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await migrationClient.end();
  }
}

main().catch(console.error);