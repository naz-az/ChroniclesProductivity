import express from 'express';
import cors from 'cors';
import taskRoutes from './routes/taskRoutes';
import projectRoutes from './routes/projectRoutes';
import financeRoutes from './routes/financeRoutes';
import fitnessRoutes from './routes/fitnessRoutes';
import { createTasksTable } from './models/task';
import { createProjectsTable } from './models/project';
import { createFinanceTables } from './models/finance';
import { createFitnessTables } from './models/fitness';

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/fitness', fitnessRoutes);

// Initialize database tables
const initDb = async () => {
  try {
    await createTasksTable();
    await createProjectsTable();
    await createFinanceTables();
    await createFitnessTables();
    console.log('Database tables initialized');
  } catch (error) {
    console.error('Error initializing database tables:', error);
  }
};

// Initialize DB and start server
initDb().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}); 