import { Database } from 'sqlite3';
import sqlite3 from 'sqlite3';
import path from 'path';

// Create a database connection
const db = new sqlite3.Database(path.resolve(__dirname, '../../task.db'), (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database for projects.');
  }
});

// Define the Project interface
export interface Project {
  id?: number;
  title: string;
  description: string;
  image_url: string;
  client: string;
  start_date?: string;
  end_date?: string;
  status: string;
  budget?: number;
  created_at?: string;
  
  // Additional detailed fields
  tech_stack?: string; // JSON string of technologies used
  team_members?: string; // JSON string of team members
  milestones?: string; // JSON string of project milestones
  phases?: string; // JSON string of project phases
  risks?: string; // JSON string of identified risks
  documents?: string; // JSON string of project document links
  success_metrics?: string; // JSON string of KPIs and metrics
  client_feedback?: string; // Client feedback on project
  priority?: string; // Project priority (High, Medium, Low)
  payment_status?: string; // Current payment status
}

// Create projects table if it doesn't exist
export const createProjectsTable = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        client TEXT,
        start_date TEXT,
        end_date TEXT,
        status TEXT NOT NULL,
        budget REAL,
        tech_stack TEXT,
        team_members TEXT,
        milestones TEXT,
        phases TEXT,
        risks TEXT,
        documents TEXT,
        success_metrics TEXT,
        client_feedback TEXT,
        priority TEXT,
        payment_status TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Get all projects
export const getAllProjects = (): Promise<Project[]> => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM projects ORDER BY created_at DESC', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows as Project[]);
      }
    });
  });
};

// Get project by ID
export const getProjectById = (id: number): Promise<Project> => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM projects WHERE id = ?', [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row as Project);
      }
    });
  });
};

// Create new project
export const createProject = (project: Project): Promise<Project> => {
  return new Promise((resolve, reject) => {
    const { 
      title, description, image_url, client, start_date, end_date, 
      status, budget, tech_stack, team_members, milestones, phases,
      risks, documents, success_metrics, client_feedback, priority,
      payment_status
    } = project;
    
    db.run(
      `INSERT INTO projects (
        title, description, image_url, client, start_date, end_date, 
        status, budget, tech_stack, team_members, milestones, phases,
        risks, documents, success_metrics, client_feedback, priority,
        payment_status
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, description, image_url, client, start_date, end_date, 
        status, budget, tech_stack, team_members, milestones, phases,
        risks, documents, success_metrics, client_feedback, priority,
        payment_status
      ],
      function(err) {
        if (err) {
          reject(err);
        } else {
          getProjectById(this.lastID)
            .then(newProject => resolve(newProject))
            .catch(err => reject(err));
        }
      }
    );
  });
};

// Update existing project
export const updateProject = (id: number, project: Project): Promise<Project> => {
  return new Promise((resolve, reject) => {
    const { 
      title, description, image_url, client, start_date, end_date, 
      status, budget, tech_stack, team_members, milestones, phases,
      risks, documents, success_metrics, client_feedback, priority,
      payment_status
    } = project;
    
    db.run(
      `UPDATE projects SET 
        title = ?, 
        description = ?, 
        image_url = ?,
        client = ?,
        start_date = ?, 
        end_date = ?, 
        status = ?,
        budget = ?,
        tech_stack = ?,
        team_members = ?,
        milestones = ?,
        phases = ?,
        risks = ?,
        documents = ?,
        success_metrics = ?,
        client_feedback = ?,
        priority = ?,
        payment_status = ?
       WHERE id = ?`,
      [
        title, description, image_url, client, start_date, end_date, 
        status, budget, tech_stack, team_members, milestones, phases,
        risks, documents, success_metrics, client_feedback, priority,
        payment_status, id
      ],
      (err) => {
        if (err) {
          reject(err);
        } else {
          getProjectById(id)
            .then(updatedProject => resolve(updatedProject))
            .catch(err => reject(err));
        }
      }
    );
  });
};

// Delete project
export const deleteProject = (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM projects WHERE id = ?', [id], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Export db for external use
export { db }; 