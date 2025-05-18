import { Request, Response } from 'express';
import * as GeneralTaskModel from '../models/generalTasks';

export const getAllGeneralTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await GeneralTaskModel.getGeneralTasks();
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching general tasks:", error);
    res.status(500).json({ error: "Failed to fetch general tasks" });
  }
};

export const getGeneralTaskById = async (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.id);
    if (isNaN(taskId)) {
      return res.status(400).json({ error: "Invalid task ID" });
    }

    const task = await GeneralTaskModel.getGeneralTaskById(taskId);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error("Error fetching general task:", error);
    res.status(500).json({ error: "Failed to fetch general task" });
  }
};

export const createGeneralTask = async (req: Request, res: Response) => {
  try {
    const { title, description, start_date, end_date, category, priority, status } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const newTask = await GeneralTaskModel.createGeneralTask({
      title,
      description,
      start_date,
      end_date,
      category,
      priority,
      status
    });

    res.status(201).json(newTask);
  } catch (error) {
    console.error("Error creating general task:", error);
    res.status(500).json({ error: "Failed to create general task" });
  }
};

export const updateGeneralTask = async (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.id);
    if (isNaN(taskId)) {
      return res.status(400).json({ error: "Invalid task ID" });
    }

    const { title, description, start_date, end_date, category, priority, status } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const existingTask = await GeneralTaskModel.getGeneralTaskById(taskId);
    if (!existingTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    const updatedTask = await GeneralTaskModel.updateGeneralTask(taskId, {
      title,
      description,
      start_date,
      end_date,
      category,
      priority,
      status
    });

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Error updating general task:", error);
    res.status(500).json({ error: "Failed to update general task" });
  }
};

export const deleteGeneralTask = async (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.id);
    if (isNaN(taskId)) {
      return res.status(400).json({ error: "Invalid task ID" });
    }

    await GeneralTaskModel.deleteGeneralTask(taskId);
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting general task:", error);
    res.status(500).json({ error: "Failed to delete general task" });
  }
}; 