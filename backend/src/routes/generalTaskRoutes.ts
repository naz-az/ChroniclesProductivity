import express from 'express';
import * as generalTaskController from '../controllers/generalTaskController';

const router = express.Router();

// Get all general tasks
router.get('/', generalTaskController.getAllGeneralTasks);

// Get a specific general task
router.get('/:id', generalTaskController.getGeneralTaskById);

// Create a new general task
router.post('/', generalTaskController.createGeneralTask);

// Update a general task
router.put('/:id', generalTaskController.updateGeneralTask);

// Delete a general task
router.delete('/:id', generalTaskController.deleteGeneralTask);

export default router; 