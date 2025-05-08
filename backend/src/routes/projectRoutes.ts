import express from 'express';
import {
  getProjects,
  getProject,
  addProject,
  updateProjectById,
  deleteProjectById
} from '../controllers/projectController';

const router = express.Router();

// GET all projects
router.get('/', getProjects);

// GET single project by ID
router.get('/:id', getProject);

// POST new project
router.post('/', addProject);

// PUT update existing project
router.put('/:id', updateProjectById);

// DELETE project
router.delete('/:id', deleteProjectById);

export default router; 