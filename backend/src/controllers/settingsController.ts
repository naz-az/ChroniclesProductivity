import { Request, Response } from 'express';
import { 
  getUserSettings, 
  updateUserSettings, 
  getDashboardSettings, 
  updateDashboardSettings 
} from '../models/settings';

// Get user settings
export const getUserSettingsController = async (req: Request, res: Response) => {
  try {
    const settings = await getUserSettings();
    res.status(200).json(settings);
  } catch (error) {
    console.error('Error getting user settings:', error);
    res.status(500).json({ error: 'Failed to retrieve user settings' });
  }
};

// Update user settings
export const updateUserSettingsController = async (req: Request, res: Response) => {
  try {
    const updatedSettings = await updateUserSettings(req.body);
    res.status(200).json(updatedSettings);
  } catch (error) {
    console.error('Error updating user settings:', error);
    res.status(500).json({ error: 'Failed to update user settings' });
  }
};

// Get dashboard settings
export const getDashboardSettingsController = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId ? parseInt(req.params.userId) : 1;
    const settings = await getDashboardSettings(userId);
    res.status(200).json(settings);
  } catch (error) {
    console.error('Error getting dashboard settings:', error);
    res.status(500).json({ error: 'Failed to retrieve dashboard settings' });
  }
};

// Update dashboard settings
export const updateDashboardSettingsController = async (req: Request, res: Response) => {
  try {
    const updatedSettings = await updateDashboardSettings(req.body);
    res.status(200).json(updatedSettings);
  } catch (error) {
    console.error('Error updating dashboard settings:', error);
    res.status(500).json({ error: 'Failed to update dashboard settings' });
  }
}; 