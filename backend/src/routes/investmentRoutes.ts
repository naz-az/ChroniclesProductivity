import express from 'express';
import * as investmentsModel from '../models/investments';

const router = express.Router();

// Get all investments
router.get('/investments', async (req, res) => {
  try {
    const investments = await investmentsModel.getInvestments();
    res.json(investments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch investments' });
  }
});

// Get investment by ID
router.get('/investments/:id', async (req, res) => {
  try {
    const investment = await investmentsModel.getInvestmentById(Number(req.params.id));
    if (investment) {
      res.json(investment);
    } else {
      res.status(404).json({ error: 'Investment not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch investment' });
  }
});

// Create new investment
router.post('/investments', async (req, res) => {
  try {
    const newInvestment = await investmentsModel.createInvestment(req.body);
    res.status(201).json(newInvestment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create investment' });
  }
});

// Update investment
router.put('/investments/:id', async (req, res) => {
  try {
    const updatedInvestment = await investmentsModel.updateInvestment(Number(req.params.id), req.body);
    res.json(updatedInvestment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update investment' });
  }
});

// Delete investment
router.delete('/investments/:id', async (req, res) => {
  try {
    await investmentsModel.deleteInvestment(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete investment' });
  }
});

// Get investment history for a specific investment
router.get('/investments/:id/history', async (req, res) => {
  try {
    const history = await investmentsModel.getInvestmentHistory(Number(req.params.id));
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch investment history' });
  }
});

// Add investment history record
router.post('/investments/:id/history', async (req, res) => {
  try {
    const history = {
      ...req.body,
      investment_id: Number(req.params.id)
    };
    const newHistory = await investmentsModel.addInvestmentHistory(history);
    res.status(201).json(newHistory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add investment history' });
  }
});

// Get asset allocation
router.get('/asset-allocation', async (req, res) => {
  try {
    const allocation = await investmentsModel.getAssetAllocation();
    res.json(allocation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch asset allocation' });
  }
});

// Update asset allocation
router.post('/asset-allocation', async (req, res) => {
  try {
    const allocation = await investmentsModel.updateAssetAllocation(req.body);
    res.status(201).json(allocation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update asset allocation' });
  }
});

// Get total investment value
router.get('/analytics/total-value', async (req, res) => {
  try {
    const totalValue = await investmentsModel.getTotalInvestmentValue();
    res.json({ totalValue });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate total investment value' });
  }
});

// Get investments breakdown by type
router.get('/analytics/by-type', async (req, res) => {
  try {
    const investmentsByType = await investmentsModel.getInvestmentsByType();
    res.json(investmentsByType);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get investments by type' });
  }
});

// Get profit/loss analysis
router.get('/analytics/profit-loss', async (req, res) => {
  try {
    const profitLossAnalysis = await investmentsModel.getProfitLossAnalysis();
    res.json(profitLossAnalysis);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get profit/loss analysis' });
  }
});

export default router; 