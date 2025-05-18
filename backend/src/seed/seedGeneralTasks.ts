import { getDbConnection } from '../models/db';
import { GeneralTask } from '../models/generalTasks';

const sampleGeneralTasks: Partial<GeneralTask>[] = [
  {
    title: "Weekly grocery shopping",
    description: "Buy groceries for the week including fresh vegetables, fruits, and meat",
    start_date: "2023-10-15",
    end_date: "2023-10-15",
    category: "Shopping",
    priority: "High",
    status: "Completed"
  },
  {
    title: "Pay utility bills",
    description: "Pay electricity, water, and internet bills",
    start_date: "2023-10-20",
    end_date: "2023-10-20",
    category: "Finance",
    priority: "High",
    status: "Completed"
  },
  {
    title: "Schedule dentist appointment",
    description: "Schedule a dental check-up for next month",
    start_date: "2023-10-25",
    end_date: "2023-10-25",
    category: "Health",
    priority: "Medium",
    status: "Not Started"
  },
  {
    title: "Clean home office",
    description: "Organize workspace, clean desk, and discard unnecessary items",
    start_date: "2023-11-01",
    end_date: "2023-11-01",
    category: "Home",
    priority: "Low",
    status: "In Progress"
  },
  {
    title: "Plan family vacation",
    description: "Research destinations, accommodations, and activities for summer vacation",
    start_date: "2023-11-05",
    end_date: "2023-11-15",
    category: "Travel",
    priority: "Medium",
    status: "Not Started"
  },
  {
    title: "Update personal resume",
    description: "Add recent experience and skills to resume",
    start_date: "2023-11-10",
    end_date: "2023-11-10",
    category: "Career",
    priority: "Low",
    status: "Not Started"
  },
  {
    title: "Car maintenance",
    description: "Take car for oil change and tire rotation",
    start_date: "2023-11-15",
    end_date: "2023-11-15",
    category: "Automotive",
    priority: "Medium",
    status: "Not Started"
  },
  {
    title: "Renew gym membership",
    description: "Renew annual gym membership at local fitness center",
    start_date: "2023-11-20",
    end_date: "2023-11-20",
    category: "Fitness",
    priority: "Low",
    status: "Not Started"
  },
  {
    title: "Birthday gift for Mom",
    description: "Shop for Mom's birthday present",
    start_date: "2023-12-01",
    end_date: "2023-12-05",
    category: "Personal",
    priority: "High",
    status: "Not Started"
  },
  {
    title: "Organize digital photos",
    description: "Sort through digital photos from past year and organize into albums",
    start_date: "2023-12-10",
    end_date: "2023-12-15",
    category: "Digital",
    priority: "Low",
    status: "Not Started"
  }
];

export const seedGeneralTasks = async (): Promise<void> => {
  const db = await getDbConnection();
  
  try {
    // Check if there's already data in the table
    const existingTasks = await db.all("SELECT COUNT(*) as count FROM general_tasks");
    
    if (existingTasks[0].count > 0) {
      console.log('General tasks data already exists, skipping seed');
      return;
    }
    
    // Create the table if it doesn't exist
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
    
    // Insert sample data
    console.log('Seeding general tasks data...');
    
    for (const task of sampleGeneralTasks) {
      await db.run(
        `INSERT INTO general_tasks 
          (title, description, start_date, end_date, category, priority, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          task.title,
          task.description || null,
          task.start_date || null,
          task.end_date || null,
          task.category || 'General',
          task.priority || 'Medium',
          task.status || 'Not Started'
        ]
      );
    }
    
    console.log('General tasks seed completed successfully');
  } catch (error) {
    console.error('Error seeding general tasks data:', error);
  }
};

// Run the seed if this file is executed directly
if (require.main === module) {
  seedGeneralTasks().then(() => {
    console.log('General tasks seeding completed');
    process.exit(0);
  }).catch(err => {
    console.error('Error during general tasks seeding:', err);
    process.exit(1);
  });
} 