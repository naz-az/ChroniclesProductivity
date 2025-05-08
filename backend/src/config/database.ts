import sqlite3 from 'sqlite3';
import { getDbConnection, initializeDb } from '../models/db';
import path from 'path';

// Re-export the database connection for compatibility
export { getDbConnection, initializeDb };

// Create a singleton SQLite database instance for direct use
export const db = new sqlite3.Database(path.resolve(__dirname, '../../task.db'), (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
}); 