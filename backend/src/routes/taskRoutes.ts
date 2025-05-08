import express from 'express';
import { 
  getAllTasks, 
  getTaskById, 
  createTask, 
  updateTask, 
  deleteTask 
} from '../controllers/taskController';

const router = express.Router();

// GET all tasks
router.get('/', getAllTasks);

// GET a specific task
router.get('/:id', getTaskById);

// POST create a new task
router.post('/', createTask);

// PUT update a task
router.put('/:id', updateTask);

// DELETE a task
router.delete('/:id', deleteTask);

export default router; 