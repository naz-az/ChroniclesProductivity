import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { initializeDb } from './models/db';
import taskRoutes from './routes/taskRoutes';
import projectRoutes from './routes/projectRoutes';
import financeRoutes from './routes/financeRoutes';
import fitnessRoutes from './routes/fitnessRoutes';
import investmentRoutes from './routes/investmentRoutes';
import settingsRoutes from './routes/settingsRoutes';
import generalTaskRoutes from './routes/generalTaskRoutes';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize database
initializeDb()
  .then(() => {
    console.log('Database initialized successfully');
  })
  .catch((err) => {
    console.error('Error initializing database:', err);
    process.exit(1);
  });

// Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/fitness', fitnessRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/general-tasks', generalTaskRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Chronicles Productivity API' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app; 