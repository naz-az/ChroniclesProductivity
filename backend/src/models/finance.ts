import { Database } from 'sqlite3';
import sqlite3 from 'sqlite3';
import path from 'path';

// Create a database connection
const db = new sqlite3.Database(path.resolve(__dirname, '../../task.db'), (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database for finance.');
  }
});

// Define interfaces
export interface Transaction {
  id?: number;
  amount: number;
  description: string;
  category: string;
  transaction_type: 'income' | 'expense';
  date: string;
  recurring?: boolean;
  user_id?: number;
  created_at?: string;
}

export interface Bill {
  id?: number;
  name: string;
  amount: number;
  due_date: string;
  category: string;
  is_paid: boolean;
  recurring?: boolean;
  recurrence_interval?: string; // 'monthly', 'weekly', 'yearly', etc.
  user_id?: number;
  created_at?: string;
}

export interface Budget {
  id?: number;
  category: string;
  allocated_amount: number;
  spent_amount: number;
  start_date: string;
  end_date: string;
  user_id?: number;
  created_at?: string;
}

export interface SavingsGoal {
  id?: number;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  user_id?: number;
  created_at?: string;
}

// Create financial tables
export const createFinanceTables = async (): Promise<void> => {
  try {
    // Transactions table
    await new Promise<void>((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS finance_transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          amount REAL NOT NULL,
          description TEXT,
          category TEXT NOT NULL,
          transaction_type TEXT NOT NULL,
          date TEXT NOT NULL,
          recurring BOOLEAN DEFAULT 0,
          user_id INTEGER,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Bills table
    await new Promise<void>((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS finance_bills (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          amount REAL NOT NULL,
          due_date TEXT NOT NULL,
          category TEXT NOT NULL,
          is_paid BOOLEAN DEFAULT 0,
          recurring BOOLEAN DEFAULT 0,
          recurrence_interval TEXT,
          user_id INTEGER,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Budgets table
    await new Promise<void>((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS finance_budgets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          category TEXT NOT NULL,
          allocated_amount REAL NOT NULL,
          spent_amount REAL DEFAULT 0,
          start_date TEXT NOT NULL,
          end_date TEXT NOT NULL,
          user_id INTEGER,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Savings Goals table
    await new Promise<void>((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS finance_savings_goals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          target_amount REAL NOT NULL,
          current_amount REAL DEFAULT 0,
          target_date TEXT NOT NULL,
          user_id INTEGER,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('Finance tables created successfully');
  } catch (error) {
    console.error('Error creating finance tables:', error);
    throw error;
  }
};

// Transaction CRUD operations
export const getTransactions = (): Promise<Transaction[]> => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM finance_transactions ORDER BY date DESC', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows as Transaction[]);
      }
    });
  });
};

export const getTransactionById = (id: number): Promise<Transaction> => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM finance_transactions WHERE id = ?', [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row as Transaction);
      }
    });
  });
};

export const createTransaction = (transaction: Transaction): Promise<Transaction> => {
  return new Promise((resolve, reject) => {
    const { amount, description, category, transaction_type, date, recurring, user_id } = transaction;
    db.run(
      `INSERT INTO finance_transactions (amount, description, category, transaction_type, date, recurring, user_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [amount, description, category, transaction_type, date, recurring ? 1 : 0, user_id],
      function(err) {
        if (err) {
          reject(err);
        } else {
          getTransactionById(this.lastID)
            .then(newTransaction => resolve(newTransaction))
            .catch(err => reject(err));
        }
      }
    );
  });
};

export const updateTransaction = (id: number, transaction: Transaction): Promise<Transaction> => {
  return new Promise((resolve, reject) => {
    const { amount, description, category, transaction_type, date, recurring, user_id } = transaction;
    db.run(
      `UPDATE finance_transactions SET 
         amount = ?, 
         description = ?, 
         category = ?,
         transaction_type = ?,
         date = ?, 
         recurring = ?,
         user_id = ?
       WHERE id = ?`,
      [amount, description, category, transaction_type, date, recurring ? 1 : 0, user_id, id],
      (err) => {
        if (err) {
          reject(err);
        } else {
          getTransactionById(id)
            .then(updatedTransaction => resolve(updatedTransaction))
            .catch(err => reject(err));
        }
      }
    );
  });
};

export const deleteTransaction = (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM finance_transactions WHERE id = ?', [id], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Bill CRUD operations
export const getBills = (): Promise<Bill[]> => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM finance_bills ORDER BY due_date ASC', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows as Bill[]);
      }
    });
  });
};

export const getBillById = (id: number): Promise<Bill> => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM finance_bills WHERE id = ?', [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row as Bill);
      }
    });
  });
};

export const createBill = (bill: Bill): Promise<Bill> => {
  return new Promise((resolve, reject) => {
    const { name, amount, due_date, category, is_paid, recurring, recurrence_interval, user_id } = bill;
    db.run(
      `INSERT INTO finance_bills (name, amount, due_date, category, is_paid, recurring, recurrence_interval, user_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, amount, due_date, category, is_paid ? 1 : 0, recurring ? 1 : 0, recurrence_interval, user_id],
      function(err) {
        if (err) {
          reject(err);
        } else {
          getBillById(this.lastID)
            .then(newBill => resolve(newBill))
            .catch(err => reject(err));
        }
      }
    );
  });
};

export const updateBill = (id: number, bill: Bill): Promise<Bill> => {
  return new Promise((resolve, reject) => {
    const { name, amount, due_date, category, is_paid, recurring, recurrence_interval, user_id } = bill;
    db.run(
      `UPDATE finance_bills SET 
         name = ?, 
         amount = ?, 
         due_date = ?,
         category = ?,
         is_paid = ?, 
         recurring = ?,
         recurrence_interval = ?,
         user_id = ?
       WHERE id = ?`,
      [name, amount, due_date, category, is_paid ? 1 : 0, recurring ? 1 : 0, recurrence_interval, user_id, id],
      (err) => {
        if (err) {
          reject(err);
        } else {
          getBillById(id)
            .then(updatedBill => resolve(updatedBill))
            .catch(err => reject(err));
        }
      }
    );
  });
};

export const deleteBill = (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM finance_bills WHERE id = ?', [id], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Budget CRUD operations
export const getBudgets = (): Promise<Budget[]> => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM finance_budgets ORDER BY start_date DESC', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows as Budget[]);
      }
    });
  });
};

export const getBudgetById = (id: number): Promise<Budget> => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM finance_budgets WHERE id = ?', [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row as Budget);
      }
    });
  });
};

export const createBudget = (budget: Budget): Promise<Budget> => {
  return new Promise((resolve, reject) => {
    const { category, allocated_amount, spent_amount, start_date, end_date, user_id } = budget;
    db.run(
      `INSERT INTO finance_budgets (category, allocated_amount, spent_amount, start_date, end_date, user_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [category, allocated_amount, spent_amount || 0, start_date, end_date, user_id],
      function(err) {
        if (err) {
          reject(err);
        } else {
          getBudgetById(this.lastID)
            .then(newBudget => resolve(newBudget))
            .catch(err => reject(err));
        }
      }
    );
  });
};

export const updateBudget = (id: number, budget: Budget): Promise<Budget> => {
  return new Promise((resolve, reject) => {
    const { category, allocated_amount, spent_amount, start_date, end_date, user_id } = budget;
    db.run(
      `UPDATE finance_budgets SET 
         category = ?, 
         allocated_amount = ?, 
         spent_amount = ?,
         start_date = ?,
         end_date = ?, 
         user_id = ?
       WHERE id = ?`,
      [category, allocated_amount, spent_amount, start_date, end_date, user_id, id],
      (err) => {
        if (err) {
          reject(err);
        } else {
          getBudgetById(id)
            .then(updatedBudget => resolve(updatedBudget))
            .catch(err => reject(err));
        }
      }
    );
  });
};

export const deleteBudget = (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM finance_budgets WHERE id = ?', [id], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Savings Goal CRUD operations
export const getSavingsGoals = (): Promise<SavingsGoal[]> => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM finance_savings_goals ORDER BY target_date ASC', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows as SavingsGoal[]);
      }
    });
  });
};

export const getSavingsGoalById = (id: number): Promise<SavingsGoal> => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM finance_savings_goals WHERE id = ?', [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row as SavingsGoal);
      }
    });
  });
};

export const createSavingsGoal = (goal: SavingsGoal): Promise<SavingsGoal> => {
  return new Promise((resolve, reject) => {
    const { name, target_amount, current_amount, target_date, user_id } = goal;
    db.run(
      `INSERT INTO finance_savings_goals (name, target_amount, current_amount, target_date, user_id) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, target_amount, current_amount || 0, target_date, user_id],
      function(err) {
        if (err) {
          reject(err);
        } else {
          getSavingsGoalById(this.lastID)
            .then(newGoal => resolve(newGoal))
            .catch(err => reject(err));
        }
      }
    );
  });
};

export const updateSavingsGoal = (id: number, goal: SavingsGoal): Promise<SavingsGoal> => {
  return new Promise((resolve, reject) => {
    const { name, target_amount, current_amount, target_date, user_id } = goal;
    db.run(
      `UPDATE finance_savings_goals SET 
         name = ?, 
         target_amount = ?, 
         current_amount = ?,
         target_date = ?,
         user_id = ?
       WHERE id = ?`,
      [name, target_amount, current_amount, target_date, user_id, id],
      (err) => {
        if (err) {
          reject(err);
        } else {
          getSavingsGoalById(id)
            .then(updatedGoal => resolve(updatedGoal))
            .catch(err => reject(err));
        }
      }
    );
  });
};

export const deleteSavingsGoal = (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM finance_savings_goals WHERE id = ?', [id], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Analytics functions
export const getMonthlyIncome = (year: number, month: number): Promise<number> => {
  return new Promise((resolve, reject) => {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // Last day of month
    
    db.get(
      `SELECT SUM(amount) as total FROM finance_transactions 
       WHERE transaction_type = 'income' 
       AND date BETWEEN ? AND ?`,
      [startDate, endDate],
      (err, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(row?.total || 0);
        }
      }
    );
  });
};

export const getMonthlyExpense = (year: number, month: number): Promise<number> => {
  return new Promise((resolve, reject) => {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // Last day of month
    
    db.get(
      `SELECT SUM(amount) as total FROM finance_transactions 
       WHERE transaction_type = 'expense' 
       AND date BETWEEN ? AND ?`,
      [startDate, endDate],
      (err, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(row?.total || 0);
        }
      }
    );
  });
};

export const getExpensesByCategory = (year: number, month: number): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // Last day of month
    
    db.all(
      `SELECT category, SUM(amount) as total FROM finance_transactions 
       WHERE transaction_type = 'expense' 
       AND date BETWEEN ? AND ?
       GROUP BY category
       ORDER BY total DESC`,
      [startDate, endDate],
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

export const getUpcomingBills = (days: number = 30): Promise<Bill[]> => {
  return new Promise((resolve, reject) => {
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const futureDateStr = futureDate.toISOString().split('T')[0];
    
    db.all(
      `SELECT * FROM finance_bills 
       WHERE is_paid = 0 
       AND due_date BETWEEN ? AND ?
       ORDER BY due_date ASC`,
      [today, futureDateStr],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as Bill[]);
        }
      }
    );
  });
};

export { db }; 