import express from 'express';
import {
  getAllTransactions, getTransaction, addTransaction, editTransaction, removeTransaction,
  getAllBills, getBill, addBill, editBill, removeBill,
  getAllBudgets, getBudget, addBudget, editBudget, removeBudget,
  getAllSavingsGoals, getSavingsGoal, addSavingsGoal, editSavingsGoal, removeSavingsGoal,
  getIncome, getExpenses, getCategoryExpenses, getComingBills
} from '../controllers/financeController';

const router = express.Router();

// Transaction routes
router.get('/transactions', getAllTransactions);
router.get('/transactions/:id', getTransaction);
router.post('/transactions', addTransaction);
router.put('/transactions/:id', editTransaction);
router.delete('/transactions/:id', removeTransaction);

// Bill routes
router.get('/bills', getAllBills);
router.get('/bills/:id', getBill);
router.post('/bills', addBill);
router.put('/bills/:id', editBill);
router.delete('/bills/:id', removeBill);

// Budget routes
router.get('/budgets', getAllBudgets);
router.get('/budgets/:id', getBudget);
router.post('/budgets', addBudget);
router.put('/budgets/:id', editBudget);
router.delete('/budgets/:id', removeBudget);

// Savings goal routes
router.get('/savings-goals', getAllSavingsGoals);
router.get('/savings-goals/:id', getSavingsGoal);
router.post('/savings-goals', addSavingsGoal);
router.put('/savings-goals/:id', editSavingsGoal);
router.delete('/savings-goals/:id', removeSavingsGoal);

// Analytics routes
router.get('/analytics/income', getIncome);
router.get('/analytics/expenses', getExpenses);
router.get('/analytics/category-expenses', getCategoryExpenses);
router.get('/analytics/upcoming-bills', getComingBills);

export default router; 