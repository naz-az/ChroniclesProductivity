import express from 'express';
import {
  getUserSettingsController,
  updateUserSettingsController,
  getDashboardSettingsController,
  updateDashboardSettingsController
} from '../controllers/settingsController';

const router = express.Router();

// User settings routes
router.get('/user', getUserSettingsController);
router.put('/user', updateUserSettingsController);

// Dashboard settings routes
router.get('/dashboard/:userId?', getDashboardSettingsController);
router.put('/dashboard', updateDashboardSettingsController);

export default router; 