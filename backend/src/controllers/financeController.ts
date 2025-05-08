import { Request, Response } from 'express';
import { 
  getTransactions, getTransactionById, createTransaction, updateTransaction, deleteTransaction,
  getBills, getBillById, createBill, updateBill, deleteBill,
  getBudgets, getBudgetById, createBudget, updateBudget, deleteBudget,
  getSavingsGoals, getSavingsGoalById, createSavingsGoal, updateSavingsGoal, deleteSavingsGoal,
  getMonthlyIncome, getMonthlyExpense, getExpensesByCategory, getUpcomingBills,
  Transaction, Bill, Budget, SavingsGoal
} from '../models/finance';

// Transaction Controllers
export const getAllTransactions = async (req: Request, res: Response) => {
  try {
    const transactions = await getTransactions();
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

export const getTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const transaction = await getTransactionById(parseInt(id));
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
};

export const addTransaction = async (req: Request, res: Response) => {
  try {
    const transactionData: Transaction = req.body;
    
    // Validate required fields
    if (!transactionData.amount || !transactionData.category || !transactionData.transaction_type || !transactionData.date) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }
    
    const newTransaction = await createTransaction(transactionData);
    res.status(201).json(newTransaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
};

export const editTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const transactionData: Transaction = req.body;
    
    // Validate required fields
    if (!transactionData.amount || !transactionData.category || !transactionData.transaction_type || !transactionData.date) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }
    
    const updatedTransaction = await updateTransaction(parseInt(id), transactionData);
    
    if (!updatedTransaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json(updatedTransaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
};

export const removeTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteTransaction(parseInt(id));
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
};

// Bill Controllers
export const getAllBills = async (req: Request, res: Response) => {
  try {
    const bills = await getBills();
    res.json(bills);
  } catch (error) {
    console.error('Error fetching bills:', error);
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
};

export const getBill = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const bill = await getBillById(parseInt(id));
    
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    
    res.json(bill);
  } catch (error) {
    console.error('Error fetching bill:', error);
    res.status(500).json({ error: 'Failed to fetch bill' });
  }
};

export const addBill = async (req: Request, res: Response) => {
  try {
    const billData: Bill = req.body;
    
    // Validate required fields
    if (!billData.name || !billData.amount || !billData.due_date || !billData.category) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }
    
    const newBill = await createBill(billData);
    res.status(201).json(newBill);
  } catch (error) {
    console.error('Error creating bill:', error);
    res.status(500).json({ error: 'Failed to create bill' });
  }
};

export const editBill = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const billData: Bill = req.body;
    
    // Validate required fields
    if (!billData.name || !billData.amount || !billData.due_date || !billData.category) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }
    
    const updatedBill = await updateBill(parseInt(id), billData);
    
    if (!updatedBill) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    
    res.json(updatedBill);
  } catch (error) {
    console.error('Error updating bill:', error);
    res.status(500).json({ error: 'Failed to update bill' });
  }
};

export const removeBill = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteBill(parseInt(id));
    res.json({ message: 'Bill deleted successfully' });
  } catch (error) {
    console.error('Error deleting bill:', error);
    res.status(500).json({ error: 'Failed to delete bill' });
  }
};

// Budget Controllers
export const getAllBudgets = async (req: Request, res: Response) => {
  try {
    const budgets = await getBudgets();
    res.json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
};

export const getBudget = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const budget = await getBudgetById(parseInt(id));
    
    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    
    res.json(budget);
  } catch (error) {
    console.error('Error fetching budget:', error);
    res.status(500).json({ error: 'Failed to fetch budget' });
  }
};

export const addBudget = async (req: Request, res: Response) => {
  try {
    const budgetData: Budget = req.body;
    
    // Validate required fields
    if (!budgetData.category || !budgetData.allocated_amount || !budgetData.start_date || !budgetData.end_date) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }
    
    const newBudget = await createBudget(budgetData);
    res.status(201).json(newBudget);
  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({ error: 'Failed to create budget' });
  }
};

export const editBudget = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const budgetData: Budget = req.body;
    
    // Validate required fields
    if (!budgetData.category || !budgetData.allocated_amount || !budgetData.start_date || !budgetData.end_date) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }
    
    const updatedBudget = await updateBudget(parseInt(id), budgetData);
    
    if (!updatedBudget) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    
    res.json(updatedBudget);
  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(500).json({ error: 'Failed to update budget' });
  }
};

export const removeBudget = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteBudget(parseInt(id));
    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    res.status(500).json({ error: 'Failed to delete budget' });
  }
};

// Savings Goal Controllers
export const getAllSavingsGoals = async (req: Request, res: Response) => {
  try {
    const goals = await getSavingsGoals();
    res.json(goals);
  } catch (error) {
    console.error('Error fetching savings goals:', error);
    res.status(500).json({ error: 'Failed to fetch savings goals' });
  }
};

export const getSavingsGoal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const goal = await getSavingsGoalById(parseInt(id));
    
    if (!goal) {
      return res.status(404).json({ error: 'Savings goal not found' });
    }
    
    res.json(goal);
  } catch (error) {
    console.error('Error fetching savings goal:', error);
    res.status(500).json({ error: 'Failed to fetch savings goal' });
  }
};

export const addSavingsGoal = async (req: Request, res: Response) => {
  try {
    const goalData: SavingsGoal = req.body;
    
    // Validate required fields
    if (!goalData.name || !goalData.target_amount || !goalData.target_date) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }
    
    const newGoal = await createSavingsGoal(goalData);
    res.status(201).json(newGoal);
  } catch (error) {
    console.error('Error creating savings goal:', error);
    res.status(500).json({ error: 'Failed to create savings goal' });
  }
};

export const editSavingsGoal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const goalData: SavingsGoal = req.body;
    
    // Validate required fields
    if (!goalData.name || !goalData.target_amount || !goalData.target_date) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }
    
    const updatedGoal = await updateSavingsGoal(parseInt(id), goalData);
    
    if (!updatedGoal) {
      return res.status(404).json({ error: 'Savings goal not found' });
    }
    
    res.json(updatedGoal);
  } catch (error) {
    console.error('Error updating savings goal:', error);
    res.status(500).json({ error: 'Failed to update savings goal' });
  }
};

export const removeSavingsGoal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteSavingsGoal(parseInt(id));
    res.json({ message: 'Savings goal deleted successfully' });
  } catch (error) {
    console.error('Error deleting savings goal:', error);
    res.status(500).json({ error: 'Failed to delete savings goal' });
  }
};

// Analytics Controllers
export const getIncome = async (req: Request, res: Response) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) {
      return res.status(400).json({ error: 'Year and month are required' });
    }
    
    const income = await getMonthlyIncome(parseInt(year as string), parseInt(month as string));
    res.json({ income });
  } catch (error) {
    console.error('Error fetching income:', error);
    res.status(500).json({ error: 'Failed to fetch income' });
  }
};

export const getExpenses = async (req: Request, res: Response) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) {
      return res.status(400).json({ error: 'Year and month are required' });
    }
    
    const expenses = await getMonthlyExpense(parseInt(year as string), parseInt(month as string));
    res.json({ expenses });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
};

export const getCategoryExpenses = async (req: Request, res: Response) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) {
      return res.status(400).json({ error: 'Year and month are required' });
    }
    
    const categoryExpenses = await getExpensesByCategory(parseInt(year as string), parseInt(month as string));
    res.json(categoryExpenses);
  } catch (error) {
    console.error('Error fetching category expenses:', error);
    res.status(500).json({ error: 'Failed to fetch category expenses' });
  }
};

export const getComingBills = async (req: Request, res: Response) => {
  try {
    const { days } = req.query;
    const upcomingBills = await getUpcomingBills(days ? parseInt(days as string) : 30);
    res.json(upcomingBills);
  } catch (error) {
    console.error('Error fetching upcoming bills:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming bills' });
  }
}; 