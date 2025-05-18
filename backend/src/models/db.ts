import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import path from 'path';
import { createFinanceTables } from './finance';
import { createFitnessTables } from './fitness';
import { createInvestmentTables } from './investments';
import { createSettingsTables } from './settings';
import { createGeneralTasksTable } from './generalTasks';

// Create a database instance
export async function getDbConnection() {
  const db = await open({
    filename: path.resolve(__dirname, '../../task.db'),
    driver: sqlite3.Database
  });
  
  // Create tasks table if it doesn't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      start_date TEXT,
      end_date TEXT,
      category TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  return db;
}

// Initialize the database
export async function initializeDb() {
  const db = await getDbConnection();
  
  // Create Finance, Fitness, and Investment tables if they don't exist
  try {
    await createFinanceTables();
    await createFitnessTables();
    await createInvestmentTables();
    await createSettingsTables();
    await createGeneralTasksTable();
  } catch (error) {
    console.error('Error creating module tables:', error);
  }
  
  console.log('Database initialized');
  return db;
} 