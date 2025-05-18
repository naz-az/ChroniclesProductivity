import { getDbConnection } from './db';

export interface GeneralTask {
  id?: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  category: string;
  priority: string;
  status: string;
  user_id?: number;
  created_at?: string;
}

export const createGeneralTasksTable = async (): Promise<void> => {
  const db = await getDbConnection();
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS general_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      start_date TEXT,
      end_date TEXT,
      category TEXT DEFAULT 'General',
      priority TEXT DEFAULT 'Medium',
      status TEXT DEFAULT 'Not Started',
      user_id INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

export const getGeneralTasks = (): Promise<GeneralTask[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await getDbConnection();
      const tasks = await db.all('SELECT * FROM general_tasks ORDER BY created_at DESC');
      resolve(tasks);
    } catch (error) {
      reject(error);
    }
  });
};

export const getGeneralTaskById = (id: number | undefined): Promise<GeneralTask> => {
  return new Promise(async (resolve, reject) => {
    try {
      if (id === undefined) {
        reject(new Error('Task ID is undefined'));
        return;
      }

      const db = await getDbConnection();
      const task = await db.get('SELECT * FROM general_tasks WHERE id = ?', [id]);
      resolve(task);
    } catch (error) {
      reject(error);
    }
  });
};

export const createGeneralTask = (task: GeneralTask): Promise<GeneralTask> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await getDbConnection();
      const result = await db.run(
        `INSERT INTO general_tasks 
          (title, description, start_date, end_date, category, priority, status, user_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          task.title,
          task.description || null,
          task.start_date || null,
          task.end_date || null,
          task.category || 'General',
          task.priority || 'Medium',
          task.status || 'Not Started',
          task.user_id || 1
        ]
      );
      
      if (result.lastID) {
        const newTask = await getGeneralTaskById(result.lastID);
        resolve(newTask);
      } else {
        throw new Error('Failed to get lastID after insertion');
      }
    } catch (error) {
      reject(error);
    }
  });
};

export const updateGeneralTask = (id: number, task: GeneralTask): Promise<GeneralTask> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await getDbConnection();
      await db.run(
        `UPDATE general_tasks SET 
          title = ?, 
          description = ?, 
          start_date = ?, 
          end_date = ?, 
          category = ?,
          priority = ?,
          status = ?
        WHERE id = ?`,
        [
          task.title,
          task.description || null,
          task.start_date || null,
          task.end_date || null,
          task.category || 'General',
          task.priority || 'Medium',
          task.status || 'Not Started',
          id
        ]
      );
      
      const updatedTask = await getGeneralTaskById(id);
      resolve(updatedTask);
    } catch (error) {
      reject(error);
    }
  });
};

export const deleteGeneralTask = (id: number): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await getDbConnection();
      await db.run('DELETE FROM general_tasks WHERE id = ?', [id]);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}; 