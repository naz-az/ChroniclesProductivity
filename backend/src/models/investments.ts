import { Database } from 'sqlite3';
import sqlite3 from 'sqlite3';
import path from 'path';

// Create a database connection
const db = new sqlite3.Database(path.resolve(__dirname, '../../task.db'), (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database for investments.');
  }
});

// Define interfaces
export interface Investment {
  id?: number;
  name: string;
  type: 'stock' | 'crypto' | 'gold' | 'bond' | 'real_estate' | 'etf' | 'mutual_fund' | 'other';
  amount: number;
  purchase_price: number;
  current_price: number;
  purchase_date: string;
  symbol?: string;
  notes?: string;
  user_id?: number;
  created_at?: string;
}

export interface InvestmentHistory {
  id?: number;
  investment_id: number;
  price: number;
  date: string;
  created_at?: string;
}

export interface AssetAllocation {
  id?: number;
  user_id?: number;
  stocks_percentage: number;
  crypto_percentage: number;
  gold_percentage: number;
  bonds_percentage: number;
  real_estate_percentage: number;
  cash_percentage: number;
  other_percentage: number;
  target_date: string;
  created_at?: string;
}

// Create investment tables
export const createInvestmentTables = async (): Promise<void> => {
  try {
    // Investments table
    await new Promise<void>((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS investments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          amount REAL NOT NULL,
          purchase_price REAL NOT NULL,
          current_price REAL NOT NULL,
          purchase_date TEXT NOT NULL,
          symbol TEXT,
          notes TEXT,
          user_id INTEGER,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Investment history table for tracking price changes
    await new Promise<void>((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS investment_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          investment_id INTEGER NOT NULL,
          price REAL NOT NULL,
          date TEXT NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (investment_id) REFERENCES investments (id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Asset allocation table
    await new Promise<void>((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS asset_allocation (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          stocks_percentage REAL DEFAULT 0,
          crypto_percentage REAL DEFAULT 0,
          gold_percentage REAL DEFAULT 0,
          bonds_percentage REAL DEFAULT 0,
          real_estate_percentage REAL DEFAULT 0,
          cash_percentage REAL DEFAULT 0,
          other_percentage REAL DEFAULT 0,
          target_date TEXT NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('Investment tables created successfully');
  } catch (error) {
    console.error('Error creating investment tables:', error);
    throw error;
  }
};

// Investment CRUD operations
export const getInvestments = (): Promise<Investment[]> => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM investments ORDER BY type, name', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows as Investment[]);
      }
    });
  });
};

export const getInvestmentById = (id: number): Promise<Investment> => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM investments WHERE id = ?', [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row as Investment);
      }
    });
  });
};

export const createInvestment = (investment: Investment): Promise<Investment> => {
  return new Promise((resolve, reject) => {
    const { name, type, amount, purchase_price, current_price, purchase_date, symbol, notes, user_id } = investment;
    db.run(
      `INSERT INTO investments (name, type, amount, purchase_price, current_price, purchase_date, symbol, notes, user_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, type, amount, purchase_price, current_price, purchase_date, symbol, notes, user_id],
      function(err) {
        if (err) {
          reject(err);
        } else {
          getInvestmentById(this.lastID)
            .then(newInvestment => resolve(newInvestment))
            .catch(err => reject(err));
        }
      }
    );
  });
};

export const updateInvestment = (id: number, investment: Investment): Promise<Investment> => {
  return new Promise((resolve, reject) => {
    const { name, type, amount, purchase_price, current_price, purchase_date, symbol, notes, user_id } = investment;
    db.run(
      `UPDATE investments SET 
         name = ?, 
         type = ?, 
         amount = ?,
         purchase_price = ?,
         current_price = ?, 
         purchase_date = ?,
         symbol = ?,
         notes = ?,
         user_id = ?
       WHERE id = ?`,
      [name, type, amount, purchase_price, current_price, purchase_date, symbol, notes, user_id, id],
      (err) => {
        if (err) {
          reject(err);
        } else {
          getInvestmentById(id)
            .then(updatedInvestment => resolve(updatedInvestment))
            .catch(err => reject(err));
        }
      }
    );
  });
};

export const deleteInvestment = (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM investments WHERE id = ?', [id], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Investment History CRUD operations
export const getInvestmentHistory = (investmentId: number): Promise<InvestmentHistory[]> => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM investment_history WHERE investment_id = ? ORDER BY date DESC', [investmentId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows as InvestmentHistory[]);
      }
    });
  });
};

export const addInvestmentHistory = (history: InvestmentHistory): Promise<InvestmentHistory> => {
  return new Promise((resolve, reject) => {
    const { investment_id, price, date } = history;
    db.run(
      `INSERT INTO investment_history (investment_id, price, date) 
       VALUES (?, ?, ?)`,
      [investment_id, price, date],
      function(err) {
        if (err) {
          reject(err);
        } else {
          db.get('SELECT * FROM investment_history WHERE id = ?', [this.lastID], (err, row) => {
            if (err) {
              reject(err);
            } else {
              resolve(row as InvestmentHistory);
            }
          });
        }
      }
    );
  });
};

// Asset Allocation CRUD operations
export const getAssetAllocation = (): Promise<AssetAllocation> => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM asset_allocation ORDER BY created_at DESC LIMIT 1', (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row as AssetAllocation);
      }
    });
  });
};

export const updateAssetAllocation = (allocation: AssetAllocation): Promise<AssetAllocation> => {
  return new Promise((resolve, reject) => {
    const { 
      user_id, 
      stocks_percentage, 
      crypto_percentage, 
      gold_percentage, 
      bonds_percentage, 
      real_estate_percentage, 
      cash_percentage,
      other_percentage,
      target_date
    } = allocation;
    
    db.run(
      `INSERT INTO asset_allocation (
        user_id, 
        stocks_percentage, 
        crypto_percentage, 
        gold_percentage, 
        bonds_percentage, 
        real_estate_percentage, 
        cash_percentage,
        other_percentage,
        target_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id, 
        stocks_percentage, 
        crypto_percentage, 
        gold_percentage, 
        bonds_percentage, 
        real_estate_percentage, 
        cash_percentage,
        other_percentage,
        target_date
      ],
      function(err) {
        if (err) {
          reject(err);
        } else {
          db.get('SELECT * FROM asset_allocation WHERE id = ?', [this.lastID], (err, row) => {
            if (err) {
              reject(err);
            } else {
              resolve(row as AssetAllocation);
            }
          });
        }
      }
    );
  });
};

// Analytics functions
export const getTotalInvestmentValue = (): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT SUM(amount * current_price) as total_value FROM investments',
      (err, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.total_value || 0);
        }
      }
    );
  });
};

export const getInvestmentsByType = (): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT 
        type, 
        SUM(amount * current_price) as total_value,
        COUNT(*) as count
      FROM investments 
      GROUP BY type
      ORDER BY total_value DESC`,
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  });
};

export const getProfitLossAnalysis = (): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT 
        id,
        name,
        type,
        symbol,
        amount,
        purchase_price,
        current_price,
        purchase_date,
        (current_price - purchase_price) as price_change,
        ((current_price - purchase_price) / purchase_price * 100) as percent_change,
        (amount * current_price) - (amount * purchase_price) as total_profit_loss
      FROM investments
      ORDER BY percent_change DESC`,
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  });
}; 