import { Request, Response } from 'express';
import { getDbConnection } from '../models/db';

// Get all tasks
export const getAllTasks = async (req: Request, res: Response) => {
  try {
    const db = await getDbConnection();
    const tasks = await db.all('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

// Get a specific task
export const getTaskById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDbConnection();
    const task = await db.get('SELECT * FROM tasks WHERE id = ?', [id]);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
};

// Create a new task
export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, description, start_date, end_date, category } = req.body;
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const db = await getDbConnection();
    const result = await db.run(
      'INSERT INTO tasks (title, description, start_date, end_date, category) VALUES (?, ?, ?, ?, ?)',
      [title, description, start_date, end_date, category]
    );
    
    const newTask = await db.get('SELECT * FROM tasks WHERE id = ?', [result.lastID]);
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

// Update a task
export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, start_date, end_date, category } = req.body;
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const db = await getDbConnection();
    await db.run(
      'UPDATE tasks SET title = ?, description = ?, start_date = ?, end_date = ?, category = ? WHERE id = ?',
      [title, description, start_date, end_date, category, id]
    );
    
    const updatedTask = await db.get('SELECT * FROM tasks WHERE id = ?', [id]);
    
    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

// Delete a task
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDbConnection();
    const task = await db.get('SELECT * FROM tasks WHERE id = ?', [id]);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    await db.run('DELETE FROM tasks WHERE id = ?', [id]);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
}; 