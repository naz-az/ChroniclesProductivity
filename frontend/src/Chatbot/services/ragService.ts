import axios from 'axios';

// Define interfaces for database tables
interface SoftwareTask {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  type: string;
  repository: string;
  estimatedHours: number;
  timeSpent: number;
  tags: string[];
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface FinancialTransaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: string;
  category: string;
  paymentMethod?: string;
  notes?: string;
}

interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  status: string;
  category: string;
  paymentMethod?: string;
  recurring: boolean;
  recurringPeriod?: string;
  notes?: string;
}

interface Budget {
  id: string;
  category: string;
  amount: number;
  period: string;
  startDate: string;
  endDate?: string;
  actualSpent?: number;
  notes?: string;
}

interface HealthActivity {
  id: string;
  type: string;
  title: string;
  date: string;
  duration?: number;
  intensity?: string;
  caloriesBurned?: number;
  notes?: string;
  exercises?: HealthActivityExercise[];
}

interface HealthActivityExercise {
  id: number;
  activityId: string;
  name: string;
  sets?: number;
  reps?: number;
  weight?: number;
}

interface WorkoutPlan {
  id: string;
  name: string;
  description?: string;
  goal: string;
  frequency: number;
  duration: number;
  notes?: string;
  schedule?: WorkoutPlanSchedule[];
}

interface WorkoutPlanSchedule {
  id: number;
  planId: string;
  dayOfWeek: string;
  focus: string;
  exercises?: WorkoutScheduleExercise[];
}

interface WorkoutScheduleExercise {
  id: number;
  scheduleId: number;
  name: string;
  sets: number;
  reps: string;
  weight?: string;
}

interface InvestmentAsset {
  id: string;
  type: string;
  symbol?: string;
  name: string;
  purchaseDate: string;
  purchasePrice: number;
  quantity: number;
  currentPrice?: number;
  lastUpdated?: string;
  sector?: string;
  notes?: string;
}

interface InvestmentPortfolio {
  id: string;
  name: string;
  description?: string;
  riskLevel: string;
  timeHorizon?: string;
  notes?: string;
  assetAllocations?: AssetAllocation[];
  performance?: PortfolioPerformance[];
}

interface AssetAllocation {
  id: number;
  portfolioId: string;
  assetClass: string;
  percentage: number;
  currentAmount?: number;
}

interface PortfolioPerformance {
  id: number;
  portfolioId: string;
  period: string;
  returnPercentage: number;
  returnAmount?: number;
}

// Interface for projects
interface Project {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate: string;
  startDate?: string;
  createdAt?: string;
  updatedAt?: string;
  imageUrl?: string;
  developmentProgress?: number;
  platformStatus?: any;
  deploymentStatus?: string;
  monetizationStrategy?: string;
  maintenancePlan?: string;
  profitMetrics?: any;
  keyFeatures?: string[];
  targetAudience?: string;
  techStack?: string;
  category?: string;
}

// Main database state
interface DatabaseState {
  softwareTasks: SoftwareTask[];
  financialTransactions: FinancialTransaction[];
  bills: Bill[];
  budgets: Budget[];
  healthActivities: HealthActivity[];
  workoutPlans: WorkoutPlan[];
  investmentAssets: InvestmentAsset[];
  investmentPortfolios: InvestmentPortfolio[];
  projects: Project[];
}

// Base URL for API requests - matches the backend server port
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// API endpoint mapping based on the ACTUAL backend endpoints from test-api.js
const API_ENDPOINTS = {
  // These are from the backend/src/index.ts file
  softwareTasks: `${API_BASE_URL}/tasks`,
  projects: `${API_BASE_URL}/projects`,
  
  // These are confirmed working endpoints from test-api.js
  financialTransactions: `${API_BASE_URL}/finance/transactions`,
  bills: `${API_BASE_URL}/finance/bills`,
  budgets: `${API_BASE_URL}/finance/budgets`,
  savingsGoals: `${API_BASE_URL}/finance/savings-goals`,
  
  healthActivities: `${API_BASE_URL}/fitness/workouts`,
  nutrition: `${API_BASE_URL}/fitness/nutrition`,
  measurements: `${API_BASE_URL}/fitness/measurements`,
  fitnessGoals: `${API_BASE_URL}/fitness/goals`
};

// Cache mechanism for database data
let cachedDatabaseData: DatabaseState | null = null;
let lastCacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

// Vector embeddings cache
interface EmbeddingRecord {
  id: string;
  type: string;
  embedding: number[];
  content: string;
  metadata: Record<string, any>;
}

let embeddingsCache: EmbeddingRecord[] = [];
let lastEmbeddingCacheTime: number = 0;

// Mock data to use when API is unavailable
const MOCK_DATA: DatabaseState = {
  softwareTasks: [
    {
      id: 'task1',
      title: 'Implement RAG functionality',
      description: 'Add Retrieval-Augmented Generation to the chatbot interface',
      status: 'In Progress',
      priority: 'High',
      type: 'Feature',
      repository: 'frontend',
      estimatedHours: 8,
      timeSpent: 4,
      tags: ['AI', 'RAG', 'Chatbot'],
      createdAt: '2023-10-15T09:00:00Z',
      updatedAt: '2023-10-16T14:30:00Z'
    },
    {
      id: 'task2',
      title: 'Fix API endpoints',
      description: 'Resolve 404 errors in backend API calls',
      status: 'Open',
      priority: 'Critical',
      type: 'Bug',
      repository: 'backend',
      estimatedHours: 3,
      timeSpent: 0,
      tags: ['API', 'Backend'],
      createdAt: '2023-10-17T11:00:00Z',
      updatedAt: '2023-10-17T11:00:00Z'
    }
  ],
  financialTransactions: [
    {
      id: 'trans1',
      description: 'Web hosting services',
      amount: 129.99,
      date: '2023-10-01',
      type: 'Expense',
      category: 'Hosting',
      paymentMethod: 'Credit Card',
      notes: 'Monthly hosting fee'
    }
  ],
  bills: [
    {
      id: 'bill1',
      name: 'AWS Cloud Services',
      amount: 245.50,
      dueDate: '2023-10-31',
      status: 'Pending',
      category: 'Cloud Services',
      paymentMethod: 'Bank Transfer',
      recurring: true,
      recurringPeriod: 'Monthly',
      notes: 'Includes EC2, S3, and Lambda services'
    }
  ],
  budgets: [
    {
      id: 'budget1',
      category: 'Development Tools',
      amount: 500,
      period: 'Monthly',
      startDate: '2023-10-01',
      endDate: '2023-10-31',
      actualSpent: 320.75,
      notes: 'Budget for development tools and services'
    }
  ],
  healthActivities: [
    {
      id: 'health1',
      type: 'Exercise',
      title: 'Morning Run',
      date: '2023-10-16',
      duration: 45,
      intensity: 'Medium',
      caloriesBurned: 350,
      notes: 'Felt great, managed to increase pace'
    }
  ],
  workoutPlans: [
    {
      id: 'workout1',
      name: 'Coder Fitness',
      description: 'Workout plan designed for developers',
      goal: 'Improve posture and reduce strain',
      frequency: 4,
      duration: 12,
      notes: 'Focus on exercises that can be done at desk'
    }
  ],
  investmentAssets: [
    {
      id: 'asset1',
      type: 'Stock',
      symbol: 'MSFT',
      name: 'Microsoft',
      purchaseDate: '2023-01-15',
      purchasePrice: 240.22,
      quantity: 10,
      currentPrice: 330.11,
      lastUpdated: '2023-10-17T09:30:00Z',
      sector: 'Technology',
      notes: 'Long-term hold'
    }
  ],
  investmentPortfolios: [
    {
      id: 'portfolio1',
      name: 'Tech Growth',
      description: 'Portfolio focused on technology growth stocks',
      riskLevel: 'Moderate',
      timeHorizon: '5+ years',
      notes: 'Quarterly rebalancing'
    }
  ],
  projects: [
    {
      id: 'project1',
      title: 'Chronicles Productivity App',
      description: 'Comprehensive productivity and life management application',
      status: 'In Development',
      priority: 'High',
      dueDate: '2024-03-30',
      startDate: '2023-09-01',
      developmentProgress: 35,
      deploymentStatus: 'Not Deployed',
      category: 'Productivity',
      keyFeatures: ['Task Management', 'Financial Tracking', 'Health Monitoring'],
      techStack: 'React, Node.js, MongoDB'
    }
  ]
};

// Simple cosine similarity function
const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same dimensions');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

// Function to fetch all required data from the database
const getDatabaseData = async (): Promise<DatabaseState> => {
  try {
    // Check if we have valid cached data
    const currentTime = Date.now();
    if (cachedDatabaseData && (currentTime - lastCacheTime < CACHE_DURATION)) {
      console.log('[ragService] Using cached database data');
      return cachedDatabaseData;
    }

    console.log('[ragService] Fetching fresh database data from actual backend');
    
    // Initialize empty state - will be populated with whatever endpoints work
    const dbState: DatabaseState = {
      softwareTasks: [],
      projects: [],
      financialTransactions: [],
      bills: [],
      budgets: [],
      healthActivities: [],
      workoutPlans: [],
      investmentAssets: [],
      investmentPortfolios: []
    };
    
    // Fetch each endpoint individually with error handling
    try {
      const tasksRes = await axios.get(API_ENDPOINTS.softwareTasks);
      // Log the raw response to see exactly what we're getting
      console.log('[ragService] Raw tasks data:', JSON.stringify(tasksRes.data).substring(0, 500));
      
      // Handle different possible response formats
      if (tasksRes.data && tasksRes.data.value && Array.isArray(tasksRes.data.value)) {
        // Format from Invoke-RestMethod showing { value: [...], Count: X }
        dbState.softwareTasks = tasksRes.data.value.map((task: any) => ({
          id: String(task.id),
          title: task.title,
          description: task.description || '',
          status: task.status || 'Unknown',
          priority: task.priority || 'Medium',
          type: task.category || 'Task',
          repository: '',
          estimatedHours: 0,
          timeSpent: 0,
          tags: [],
          startDate: task.start_date,
          endDate: task.end_date,
          createdAt: task.created_at,
          updatedAt: task.updated_at || task.created_at
        }));
      } else if (Array.isArray(tasksRes.data)) {
        // Standard array response
        dbState.softwareTasks = tasksRes.data.map((task: any) => ({
          id: String(task.id),
          title: task.title,
          description: task.description || '',
          status: task.status || 'Unknown',
          priority: task.priority || 'Medium',
          type: task.category || 'Task',
          repository: '',
          estimatedHours: 0,
          timeSpent: 0,
          tags: [],
          startDate: task.start_date,
          endDate: task.end_date,
          createdAt: task.created_at,
          updatedAt: task.updated_at || task.created_at
        }));
      }
      
      console.log(`[ragService] Successfully fetched ${dbState.softwareTasks.length} software tasks`);
      console.log('[ragService] Task titles:');
      dbState.softwareTasks.forEach((task, index) => {
        console.log(`  ${index + 1}. ${task.title} (ID: ${task.id})`);
      });
    } catch (error) {
      console.warn('[ragService] Could not fetch software tasks:', error);
    }
    
    try {
      const projectsRes = await axios.get(API_ENDPOINTS.projects);
      // Log the raw response to see exactly what we're getting
      console.log('[ragService] Raw projects data:', JSON.stringify(projectsRes.data).substring(0, 500));
      
      // Handle different possible response formats
      if (projectsRes.data && projectsRes.data.value && Array.isArray(projectsRes.data.value)) {
        // Format from Invoke-RestMethod showing { value: [...], Count: X }
        dbState.projects = projectsRes.data.value.map((project: any) => ({
          id: String(project.id),
          title: project.title,
          description: project.description || '',
          status: project.status || 'In Progress',
          priority: project.priority || 'Medium',
          dueDate: project.end_date || project.due_date || '',
          startDate: project.start_date || '',
          createdAt: project.created_at || '',
          updatedAt: project.updated_at || project.created_at || '',
          category: project.category || ''
        }));
      } else if (Array.isArray(projectsRes.data)) {
        // Standard array response
        dbState.projects = projectsRes.data.map((project: any) => ({
          id: String(project.id),
          title: project.title,
          description: project.description || '',
          status: project.status || 'In Progress',
          priority: project.priority || 'Medium',
          dueDate: project.end_date || project.due_date || '',
          startDate: project.start_date || '',
          createdAt: project.created_at || '',
          updatedAt: project.updated_at || project.created_at || '',
          category: project.category || ''
        }));
      }
      
      console.log(`[ragService] Successfully fetched ${dbState.projects.length} projects`);
    } catch (error) {
      console.warn('[ragService] Could not fetch projects:', error);
    }
    
    try {
      const transactionsRes = await axios.get(API_ENDPOINTS.financialTransactions);
      dbState.financialTransactions = transactionsRes.data;
      console.log('[ragService] Successfully fetched financial transactions');
    } catch (error) {
      console.warn('[ragService] Could not fetch financial transactions:', error);
    }
    
    try {
      const billsRes = await axios.get(API_ENDPOINTS.bills);
      dbState.bills = billsRes.data;
      console.log('[ragService] Successfully fetched bills');
    } catch (error) {
      console.warn('[ragService] Could not fetch bills:', error);
    }
    
    try {
      const budgetsRes = await axios.get(API_ENDPOINTS.budgets);
      dbState.budgets = budgetsRes.data;
      console.log('[ragService] Successfully fetched budgets');
    } catch (error) {
      console.warn('[ragService] Could not fetch budgets:', error);
    }
    
    try {
      const healthRes = await axios.get(API_ENDPOINTS.healthActivities);
      dbState.healthActivities = healthRes.data;
      console.log('[ragService] Successfully fetched health activities');
    } catch (error) {
      console.warn('[ragService] Could not fetch health activities:', error);
    }
    
    // Don't try to fetch endpoints that don't exist
    /* 
    try {
      const plansRes = await axios.get(API_ENDPOINTS.workoutPlans);
      dbState.workoutPlans = plansRes.data;
    } catch (error) {
      console.warn('[ragService] Could not fetch workout plans:', error);
    }
    
    try {
      const assetsRes = await axios.get(API_ENDPOINTS.investmentAssets);
      dbState.investmentAssets = assetsRes.data;
    } catch (error) {
      console.warn('[ragService] Could not fetch investment assets:', error);
    }
    
    try {
      const portfoliosRes = await axios.get(API_ENDPOINTS.investmentPortfolios);
      dbState.investmentPortfolios = portfoliosRes.data;
    } catch (error) {
      console.warn('[ragService] Could not fetch investment portfolios:', error);
    }
    */
    
    // Update cache with whatever data we got
    cachedDatabaseData = dbState;
    console.log('[ragService] Data fetching complete');
    
    lastCacheTime = currentTime;
    
    // Update embeddings whenever we fetch fresh data
    await updateEmbeddings(cachedDatabaseData);
    
    return cachedDatabaseData;
  } catch (error) {
    console.error('[ragService] Error in main data fetch process:', error);
    
    // Return existing cached data if available, otherwise empty state
    if (!cachedDatabaseData) {
      console.log('[ragService] Initializing empty database state');
      cachedDatabaseData = {
        softwareTasks: [],
        projects: [],
        financialTransactions: [],
        bills: [],
        budgets: [],
        healthActivities: [],
        workoutPlans: [],
        investmentAssets: [],
        investmentPortfolios: []
      };
      lastCacheTime = Date.now();
      await updateEmbeddings(cachedDatabaseData);
    }
    
    return cachedDatabaseData;
  }
};

// Function to convert text to embedding vector using backend API
const getEmbedding = async (text: string): Promise<number[]> => {
  try {
    // In a real implementation, this would call an embedding API like OpenAI
    // For this example, we're using a simulated embedding
    
    // For demonstration, we'll create a simple mock embedding
    // In a production app, you would use a proper embedding service
    const hash = await crypto.subtle.digest(
      'SHA-256', 
      new TextEncoder().encode(text)
    );
    
    // Convert hash to array of 384 dimensions (common embedding size)
    const hashArray = Array.from(new Uint8Array(hash));
    const embeddingLength = 384;
    
    // Create a deterministic but unique embedding based on the content
    const embedding = new Array(embeddingLength).fill(0);
    for (let i = 0; i < hashArray.length; i++) {
      const pos = i % embeddingLength;
      embedding[pos] = (embedding[pos] + hashArray[i] / 255) / 2;
    }
    
    return embedding;
  } catch (error) {
    console.error('[ragService] Error generating embedding:', error);
    
    // Return zero vector as fallback (should be avoided in production)
    return new Array(384).fill(0);
  }
};

// Generate embeddings for all database entities
const updateEmbeddings = async (data: DatabaseState): Promise<void> => {
  console.log('[ragService] Updating embeddings for database content');
  console.log('[ragService] Data summary for embedding:',
    `Tasks: ${data.softwareTasks.length}`,
    `Projects: ${data.projects.length}`,
    `Finance: ${data.financialTransactions.length}`,
    `Bills: ${data.bills.length}`,
    `Health: ${data.healthActivities.length}`
  );
  
  const currentTime = Date.now();
  
  // Only regenerate embeddings if cache is empty or data has changed
  if (embeddingsCache.length > 0 && (currentTime - lastEmbeddingCacheTime < CACHE_DURATION)) {
    console.log('[ragService] Using cached embeddings');
    return;
  }
  
  const newEmbeddings: EmbeddingRecord[] = [];
  
  // Process Projects
  for (const project of data.projects) {
    const content = `Project: "${project.title}" (ID: ${project.id})
${project.status ? `Status: ${project.status}` : ''}${project.priority ? `, Priority: ${project.priority}` : ''}
${project.description ? `Description: ${project.description}` : ''}
${project.startDate ? `Start Date: ${project.startDate}` : ''}
${project.dueDate ? `Due Date: ${project.dueDate}` : ''}
${project.category ? `Category: ${project.category}` : ''}`;
    
    const embedding = await getEmbedding(content);
    
    newEmbeddings.push({
      id: project.id,
      type: 'project',
      embedding,
      content,
      metadata: { ...project }
    });
  }
  
  // Process Software Tasks
  for (const task of data.softwareTasks) {
    // Some consistency checking to ensure we have the expected data
    if (!task || !task.title) {
      console.warn('[ragService] Skipping invalid task:', task);
      continue;
    }
    
    // Create content string with all available task data
    let content = `Task: "${task.title}" (ID: ${task.id})\n`;
    
    if (task.status) content += `Status: ${task.status}`;
    if (task.priority) content += task.status ? `, Priority: ${task.priority}` : `Priority: ${task.priority}`;
    if (task.type) content += (task.status || task.priority) ? `, Type: ${task.type}` : `Type: ${task.type}`;
    content += '\n';
    
    if (task.description) content += `Description: ${task.description}\n`;
    if (task.startDate) content += `Start Date: ${task.startDate}\n`;
    if (task.endDate) content += `End Date: ${task.endDate}\n`;
    if (task.repository) content += `Repository: ${task.repository}\n`;
    
    if (task.estimatedHours) content += `Estimated Hours: ${task.estimatedHours}\n`;
    if (task.timeSpent) content += `Time Spent: ${task.timeSpent}\n`;
    
        if (task.tags && task.tags.length > 0) {
      const tagString = typeof task.tags === 'string' 
        ? JSON.parse(task.tags).join(', ') 
        : task.tags.join(', ');
      content += `Tags: ${tagString}\n`;
    }
    
    if (task.createdAt) content += `Created: ${task.createdAt}\n`;
    
    console.log(`[ragService] Creating embedding for task: ${task.title} (ID: ${task.id})`);
    
    const embedding = await getEmbedding(content);
    
    newEmbeddings.push({
      id: task.id,
      type: 'softwareTask',
      embedding,
      content,
      metadata: { ...task }
    });
  }
  
  // Process Financial Transactions
  for (const transaction of data.financialTransactions) {
    const content = `${transaction.type}: "${transaction.description}" (ID: ${transaction.id})
Amount: $${transaction.amount}, Date: ${transaction.date}
Category: ${transaction.category}
${transaction.paymentMethod ? `Payment Method: ${transaction.paymentMethod}` : ''}
${transaction.notes ? `Notes: ${transaction.notes}` : ''}`;
    
    const embedding = await getEmbedding(content);
    
    newEmbeddings.push({
      id: transaction.id,
      type: 'financialTransaction',
      embedding,
      content,
      metadata: { ...transaction }
    });
  }
  
  // Process Bills
  for (const bill of data.bills) {
    const content = `Bill: "${bill.name}" (ID: ${bill.id})
Amount: $${bill.amount}, Due Date: ${bill.dueDate}, Status: ${bill.status}
Category: ${bill.category}
Recurring: ${bill.recurring ? 'Yes' : 'No'}
${bill.recurringPeriod ? `Recurring Period: ${bill.recurringPeriod}` : ''}
${bill.paymentMethod ? `Payment Method: ${bill.paymentMethod}` : ''}
${bill.notes ? `Notes: ${bill.notes}` : ''}`;
    
    const embedding = await getEmbedding(content);
    
    newEmbeddings.push({
      id: bill.id,
      type: 'bill',
      embedding,
      content,
      metadata: { ...bill }
    });
  }
  
  // Process Budgets
  for (const budget of data.budgets) {
    const content = `Budget: ${budget.category} (ID: ${budget.id})
Amount: $${budget.amount}, Period: ${budget.period}
Start Date: ${budget.startDate}
${budget.endDate ? `End Date: ${budget.endDate}` : ''}
${budget.actualSpent ? `Actual Spent: $${budget.actualSpent}` : ''}
${budget.notes ? `Notes: ${budget.notes}` : ''}`;
    
    const embedding = await getEmbedding(content);
    
    newEmbeddings.push({
      id: budget.id,
      type: 'budget',
      embedding,
      content,
      metadata: { ...budget }
    });
  }
  
  // Process Health Activities
  for (const activity of data.healthActivities) {
    let content = `Activity: "${activity.title}" (ID: ${activity.id})
Type: ${activity.type}, Date: ${activity.date}
${activity.duration ? `Duration: ${activity.duration} minutes` : ''}
${activity.intensity ? `Intensity: ${activity.intensity}` : ''}
${activity.caloriesBurned ? `Calories Burned: ${activity.caloriesBurned}` : ''}
${activity.notes ? `Notes: ${activity.notes}` : ''}`;
    
        if (activity.exercises && activity.exercises.length > 0) {
      content += '\nExercises:';
          activity.exercises.forEach(exercise => {
        content += `\n  - ${exercise.name}`;
            const details = [];
            if (exercise.sets) details.push(`${exercise.sets} sets`);
            if (exercise.reps) details.push(`${exercise.reps} reps`);
            if (exercise.weight) details.push(`${exercise.weight} lbs`);
        if (details.length > 0) content += ` (${details.join(', ')})`;
      });
    }
    
    const embedding = await getEmbedding(content);
    
    newEmbeddings.push({
      id: activity.id,
      type: 'healthActivity',
      embedding,
      content,
      metadata: { ...activity }
    });
  }
  
  // Process Workout Plans
  for (const plan of data.workoutPlans) {
    let content = `Plan: "${plan.name}" (ID: ${plan.id})
${plan.description ? `Description: ${plan.description}` : ''}
Goal: ${plan.goal}
Frequency: ${plan.frequency} times per week, Duration: ${plan.duration} weeks
${plan.notes ? `Notes: ${plan.notes}` : ''}`;
    
        if (plan.schedule && plan.schedule.length > 0) {
      content += '\nSchedule:';
          plan.schedule.forEach(day => {
        content += `\n  - ${day.dayOfWeek}: ${day.focus}`;
            if (day.exercises && day.exercises.length > 0) {
          content += '\n    Exercises:';
              day.exercises.forEach(exercise => {
            content += `\n      - ${exercise.name}: ${exercise.sets} sets of ${exercise.reps}`;
            if (exercise.weight) content += ` at ${exercise.weight}`;
              });
            }
          });
        }
    
    const embedding = await getEmbedding(content);
    
    newEmbeddings.push({
      id: plan.id,
      type: 'workoutPlan',
      embedding,
      content,
      metadata: { ...plan }
    });
  }
  
  // Process Investment Assets
  for (const asset of data.investmentAssets) {
    const content = `Asset: "${asset.name}" (ID: ${asset.id})
Type: ${asset.type}
${asset.symbol ? `Symbol: ${asset.symbol}` : ''}
Purchase Date: ${asset.purchaseDate}, Purchase Price: $${asset.purchasePrice}, Quantity: ${asset.quantity}
${asset.currentPrice ? `Current Price: $${asset.currentPrice}` : ''}
${asset.lastUpdated ? `Last Updated: ${asset.lastUpdated}` : ''}
${asset.sector ? `Sector: ${asset.sector}` : ''}
${asset.notes ? `Notes: ${asset.notes}` : ''}`;
    
    const embedding = await getEmbedding(content);
    
    newEmbeddings.push({
      id: asset.id,
      type: 'investmentAsset',
      embedding,
      content,
      metadata: { ...asset }
    });
  }
  
  // Process Investment Portfolios
  for (const portfolio of data.investmentPortfolios) {
    let content = `Portfolio: "${portfolio.name}" (ID: ${portfolio.id})
${portfolio.description ? `Description: ${portfolio.description}` : ''}
Risk Level: ${portfolio.riskLevel}
${portfolio.timeHorizon ? `Time Horizon: ${portfolio.timeHorizon}` : ''}
${portfolio.notes ? `Notes: ${portfolio.notes}` : ''}`;
    
    if (portfolio.assetAllocations && portfolio.assetAllocations.length > 0) {
      content += '\nAsset Allocations:';
      portfolio.assetAllocations.forEach(allocation => {
        content += `\n  - ${allocation.assetClass}: ${allocation.percentage}%`;
        if (allocation.currentAmount) content += ` ($${allocation.currentAmount})`;
      });
    }
    
    if (portfolio.performance && portfolio.performance.length > 0) {
      content += '\nPerformance:';
      portfolio.performance.forEach(period => {
        content += `\n  - ${period.period}: ${period.returnPercentage}%`;
        if (period.returnAmount) content += ` ($${period.returnAmount})`;
      });
    }
    
    const embedding = await getEmbedding(content);
    
    newEmbeddings.push({
      id: portfolio.id,
      type: 'investmentPortfolio',
      embedding,
      content,
      metadata: { ...portfolio }
    });
  }
  
  embeddingsCache = newEmbeddings;
  lastEmbeddingCacheTime = currentTime;
  
  // Log summary of embeddings created by type
  const embeddingsByType = newEmbeddings.reduce((acc, record) => {
    acc[record.type] = (acc[record.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log(`[ragService] Generated ${embeddingsCache.length} embeddings for database entities`);
  console.log(`[ragService] Embeddings by type:`, embeddingsByType);
  
  // Special log for tasks
  const taskEmbeddings = newEmbeddings.filter(e => e.type === 'softwareTask');
  if (taskEmbeddings.length > 0) {
    console.log(`[ragService] Created ${taskEmbeddings.length} task embeddings:`);
    taskEmbeddings.forEach((task, idx) => {
      console.log(`  ${idx + 1}. ${task.content.split('\n')[0]}`);
      });
    } else {
    console.warn('[ragService] WARNING: No task embeddings were created!');
  }
};

// Function to perform semantic search against embeddings
const searchDatabase = async (query: string, pageContext?: string, limit: number = 5): Promise<{content: string, similarity: number}[]> => {
  try {
    console.log(`[ragService] Searching database for: "${query}"`);
    if (pageContext) {
      console.log(`[ragService] Using page context: ${pageContext}`);
    }
    
    // Ensure database data and embeddings are loaded
    if (embeddingsCache.length === 0) {
      console.log('[ragService] Embeddings cache is empty, loading data...');
      await getDatabaseData();
    }
    
    console.log(`[ragService] Embeddings cache has ${embeddingsCache.length} items`);
    console.log('[ragService] Embedding types:', embeddingsCache.map(e => e.type).reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>));
    
    if (embeddingsCache.filter(e => e.type === 'softwareTask').length === 0) {
      console.warn('[ragService] WARNING: No software task embeddings found!');
    }
    
    // Generate embedding for the query
    const queryEmbedding = await getEmbedding(query);
    
    // Compute similarity scores for all embeddings
    let searchResults = embeddingsCache.map(record => {
      const similarity = cosineSimilarity(queryEmbedding, record.embedding);
      return {
        content: record.content,
        similarity,
        type: record.type,
        metadata: record.metadata
      };
    });
    
    // Boost scores for results that match the current page context
    if (pageContext) {
      searchResults = searchResults.map(result => {
        // If the context is evident in the content, boost the score
        const contextRelevant = 
          result.type.toLowerCase().includes(pageContext.toLowerCase()) ||
          JSON.stringify(result.metadata).toLowerCase().includes(pageContext.toLowerCase());
        
        return {
          ...result,
          similarity: contextRelevant ? result.similarity * 1.5 : result.similarity
        };
      });
    }
    
    // Sort by similarity score (highest first)
    searchResults.sort((a, b) => b.similarity - a.similarity);
    
    // Log top results before returning
    console.log(`[ragService] Search results (top ${Math.min(limit, searchResults.length)} of ${searchResults.length}):`);
    searchResults.slice(0, limit).forEach((result, idx) => {
      console.log(`  ${idx + 1}. [${result.type}] Score: ${result.similarity.toFixed(4)} - ${result.content.split('\n')[0]}`);
    });
    
    // Filter for software tasks if looking for tasks specifically
    if (query.toLowerCase().includes('task') || query.toLowerCase().includes('software')) {
      console.log('[ragService] Task-specific query detected, showing all task results:');
      const taskResults = searchResults.filter(r => r.type === 'softwareTask');
      taskResults.slice(0, 5).forEach((result, idx) => {
        console.log(`  ${idx + 1}. [Task] Score: ${result.similarity.toFixed(4)} - ${result.content.split('\n')[0]}`);
      });
    }
    
    // Return the top N results
    return searchResults.slice(0, limit).map(r => ({ 
      content: r.content,
      similarity: r.similarity
    }));
  } catch (error) {
    console.error('[ragService] Error performing semantic search:', error);
    return [];
  }
};

// Function to get relevant database content for LLM based on query
const getDatabaseContentForLLM = async (query: string, pageContext?: string): Promise<string> => {
  try {
    console.log(`[ragService:LLM] Getting database content for query: "${query}"`);
    
    // First ensure data exists
    const dbData = await getDatabaseData();
    
    // Special handling for "list all database data" type queries
    if (query.toLowerCase().match(/list\s+all.*database|show\s+all.*data|all\s+.*database\s+data|all\s+data/)) {
      console.log('[ragService:LLM] "List all database data" query detected, returning everything');
      
      let allDataContent = `COMPLETE DATABASE CONTENTS\n\n`;
      
      // Software Tasks
      if (dbData.softwareTasks && dbData.softwareTasks.length > 0) {
        allDataContent += `SOFTWARE TASKS (${dbData.softwareTasks.length}):\n\n`;
        dbData.softwareTasks.forEach((task, idx) => {
          allDataContent += `[${idx + 1}] Task: "${task.title}" (ID: ${task.id})\n`;
          if (task.description) allDataContent += `Description: ${task.description}\n`;
          if (task.status) allDataContent += `Status: ${task.status}\n`;
          if (task.startDate) allDataContent += `Start Date: ${task.startDate}\n`;
          if (task.endDate) allDataContent += `End Date: ${task.endDate}\n`;
          allDataContent += '\n';
        });
      }
      
      // Projects
      if (dbData.projects && dbData.projects.length > 0) {
        allDataContent += `PROJECTS (${dbData.projects.length}):\n\n`;
        dbData.projects.forEach((project, idx) => {
          allDataContent += `[${idx + 1}] Project: "${project.title}" (ID: ${project.id})\n`;
          if (project.description) allDataContent += `Description: ${project.description}\n`;
          if (project.status) allDataContent += `Status: ${project.status}\n`;
          if (project.startDate) allDataContent += `Start Date: ${project.startDate}\n`;
          if (project.dueDate) allDataContent += `Due Date: ${project.dueDate}\n`;
          if (project.category) allDataContent += `Category: ${project.category}\n`;
          allDataContent += '\n';
        });
      }
      
      // Financial Transactions - Show ALL instead of just 5
      if (dbData.financialTransactions && dbData.financialTransactions.length > 0) {
        allDataContent += `FINANCIAL TRANSACTIONS (${dbData.financialTransactions.length}):\n\n`;
        dbData.financialTransactions.forEach((tx, idx) => {
          allDataContent += `[${idx + 1}] ${tx.type || 'Transaction'}: "${tx.description}" (ID: ${tx.id})\n`;
          if (tx.amount) allDataContent += `Amount: $${tx.amount}\n`;
          if (tx.date) allDataContent += `Date: ${tx.date}\n`;
          if (tx.category) allDataContent += `Category: ${tx.category}\n`;
          if (tx.paymentMethod) allDataContent += `Payment Method: ${tx.paymentMethod}\n`;
          allDataContent += '\n';
        });
      }
      
      // Bills - Show ALL instead of just 5
      if (dbData.bills && dbData.bills.length > 0) {
        allDataContent += `BILLS (${dbData.bills.length}):\n\n`;
        dbData.bills.forEach((bill, idx) => {
          allDataContent += `[${idx + 1}] Bill: "${bill.name}" (ID: ${bill.id})\n`;
          if (bill.amount) allDataContent += `Amount: $${bill.amount}\n`;
          if (bill.dueDate) allDataContent += `Due Date: ${bill.dueDate}\n`;
          if (bill.status) allDataContent += `Status: ${bill.status}\n`;
          if (bill.category) allDataContent += `Category: ${bill.category}\n`;
          if (bill.recurring) allDataContent += `Recurring: ${bill.recurring ? 'Yes' : 'No'}\n`;
          allDataContent += '\n';
        });
      }
      
      // Budgets - Show ALL instead of just 5
      if (dbData.budgets && dbData.budgets.length > 0) {
        allDataContent += `BUDGETS (${dbData.budgets.length}):\n\n`;
        dbData.budgets.forEach((budget, idx) => {
          allDataContent += `[${idx + 1}] Budget: "${budget.category}" (ID: ${budget.id})\n`;
          if (budget.amount) allDataContent += `Amount: $${budget.amount}\n`;
          if (budget.period) allDataContent += `Period: ${budget.period}\n`;
          if (budget.startDate) allDataContent += `Start Date: ${budget.startDate}\n`;
          if (budget.endDate) allDataContent += `End Date: ${budget.endDate}\n`;
          if (budget.actualSpent) allDataContent += `Actual Spent: $${budget.actualSpent}\n`;
          allDataContent += '\n';
        });
      }
      
      // Health Activities - Show ALL instead of just 5
      if (dbData.healthActivities && dbData.healthActivities.length > 0) {
        allDataContent += `HEALTH ACTIVITIES (${dbData.healthActivities.length}):\n\n`;
        dbData.healthActivities.forEach((activity, idx) => {
          allDataContent += `[${idx + 1}] Activity: "${activity.title || 'Workout'}" (ID: ${activity.id})\n`;
          if (activity.type) allDataContent += `Type: ${activity.type}\n`;
          if (activity.date) allDataContent += `Date: ${activity.date}\n`;
          if (activity.duration) allDataContent += `Duration: ${activity.duration} minutes\n`;
          if (activity.caloriesBurned) allDataContent += `Calories Burned: ${activity.caloriesBurned}\n`;
          if (activity.notes) allDataContent += `Notes: ${activity.notes}\n`;
          allDataContent += '\n';
        });
      }
      
      // Make sure the response includes all tables by explicitly checking for errors/truncation
      console.log('[ragService:LLM] Content length: ' + allDataContent.length);
      
      // If content is too long, provide a more concise summary
      if (allDataContent.length > 8000) {
        console.log('[ragService:LLM] Content too long, creating concise summary');
        
        // Create a more concise version that will fit in the response
        let conciseContent = `COMPLETE DATABASE CONTENTS (CONCISE FORMAT)\n\n`;
        
        // Tasks (always include full details for tasks)
        if (dbData.softwareTasks && dbData.softwareTasks.length > 0) {
          conciseContent += `SOFTWARE TASKS (${dbData.softwareTasks.length}):\n\n`;
          dbData.softwareTasks.forEach((task, idx) => {
            conciseContent += `[${idx + 1}] Task: "${task.title}" (ID: ${task.id})\n`;
            if (task.description) conciseContent += `Description: ${task.description}\n`;
            if (task.status) conciseContent += `Status: ${task.status}\n`;
            conciseContent += '\n';
          });
        }
        
        // Projects (always include full details for projects)
        if (dbData.projects && dbData.projects.length > 0) {
          conciseContent += `PROJECTS (${dbData.projects.length}):\n\n`;
          dbData.projects.forEach((project, idx) => {
            conciseContent += `[${idx + 1}] Project: "${project.title}" (ID: ${project.id})\n`;
            if (project.description) conciseContent += `Description: ${project.description}\n`;
            if (project.status) conciseContent += `Status: ${project.status}\n`;
            conciseContent += '\n';
          });
        }
        
        // Financial Transactions (concise format)
        if (dbData.financialTransactions && dbData.financialTransactions.length > 0) {
          conciseContent += `FINANCIAL TRANSACTIONS (${dbData.financialTransactions.length}):\n\n`;
          dbData.financialTransactions.forEach((tx, idx) => {
            conciseContent += `[${idx + 1}] ${tx.type || 'Transaction'}: "${tx.description}" - $${tx.amount} (${tx.date})\n`;
          });
          conciseContent += '\n';
        }
        
        // Bills (concise format)
        if (dbData.bills && dbData.bills.length > 0) {
          conciseContent += `BILLS (${dbData.bills.length}):\n\n`;
          dbData.bills.forEach((bill, idx) => {
            conciseContent += `[${idx + 1}] Bill: "${bill.name}" - $${bill.amount}, ${bill.category}\n`;
          });
          conciseContent += '\n';
        }
        
        // Budgets (concise format)
        if (dbData.budgets && dbData.budgets.length > 0) {
          conciseContent += `BUDGETS (${dbData.budgets.length}):\n\n`;
          dbData.budgets.forEach((budget, idx) => {
            conciseContent += `[${idx + 1}] Budget: ${budget.category} - $${budget.amount}\n`;
          });
          conciseContent += '\n';
        }
        
        // Health Activities (concise format)
        if (dbData.healthActivities && dbData.healthActivities.length > 0) {
          conciseContent += `HEALTH ACTIVITIES (${dbData.healthActivities.length}):\n\n`;
          dbData.healthActivities.forEach((activity, idx) => {
            conciseContent += `[${idx + 1}] Activity: ${activity.title || 'Workout'} (${activity.date})\n`;
          });
          conciseContent += '\n';
        }
        
        console.log('[ragService:LLM] Concise content length: ' + conciseContent.length);
        return conciseContent;
      }
      
      console.log('[ragService:LLM] Returning complete database content summary (all entries)');
      return allDataContent;
    }
    
    // Special handling for "list all tasks" type queries
    if (query.toLowerCase().match(/list\s+all|show\s+all|tell\s+me\s+.*\s+all|what\s+are\s+(\w+\s+)*tasks/)) {
      console.log('[ragService:LLM] "List all tasks" type query detected');
      
      if (dbData.softwareTasks && dbData.softwareTasks.length > 0) {
        console.log(`[ragService:LLM] Returning all ${dbData.softwareTasks.length} tasks`);
        
        let allTasksContent = `SOFTWARE ENGINEERING TASKS\n\nYou have ${dbData.softwareTasks.length} tasks:\n\n`;
        
        dbData.softwareTasks.forEach((task, idx) => {
          allTasksContent += `[${idx + 1}] Task: "${task.title}" (ID: ${task.id})\n`;
          if (task.description) allTasksContent += `Description: ${task.description}\n`;
          if (task.status) allTasksContent += `Status: ${task.status}\n`;
          if (task.startDate) allTasksContent += `Start Date: ${task.startDate}\n`;
          if (task.endDate) allTasksContent += `End Date: ${task.endDate}\n`;
          allTasksContent += '\n';
        });
        
        return allTasksContent;
      } else {
        console.warn('[ragService:LLM] No tasks found for "list all" query');
      }
    }
    
    // Special handling for tasks related queries
    if (query.toLowerCase().includes('task') || query.toLowerCase().includes('software') || 
        query.toLowerCase().includes('engineering') || query.toLowerCase().includes('soltwin')) {
      console.log('[ragService:LLM] Task-related query detected, checking tasks...');
      if (dbData.softwareTasks && dbData.softwareTasks.length > 0) {
        console.log(`[ragService:LLM] Found ${dbData.softwareTasks.length} tasks, searching for matches`);
        const taskMatches = dbData.softwareTasks.filter(task => 
          task.title.toLowerCase().includes(query.toLowerCase()) || 
          (task.description && task.description.toLowerCase().includes(query.toLowerCase()))
        );
        
        if (taskMatches.length > 0) {
          console.log(`[ragService:LLM] Direct task matches found: ${taskMatches.length}`);
          let taskContent = `TASK INFORMATION\n\nFound ${taskMatches.length} task(s) matching your query:\n\n`;
          taskMatches.forEach((task, idx) => {
            taskContent += `[${idx + 1}] Task: "${task.title}" (ID: ${task.id})\n`;
            if (task.description) taskContent += `Description: ${task.description}\n`;
            if (task.status) taskContent += `Status: ${task.status}\n`;
            if (task.startDate) taskContent += `Start Date: ${task.startDate}\n`;
            if (task.endDate) taskContent += `End Date: ${task.endDate}\n`;
            taskContent += '\n';
          });
          console.log('[ragService:LLM] Returning direct task matches');
          return taskContent;
        }
    } else {
        console.warn('[ragService:LLM] No tasks found in database');
      }
    }
    
    // Check if we have any actual data
    const hasData = Object.values(dbData).some(arr => arr && arr.length > 0);
    
    if (!hasData) {
      console.warn('[ragService:LLM] Database appears to be empty');
      return `DATABASE STATUS: The database appears to be empty or unavailable.
      
Potential reasons:
1. The backend server might not be running
2. The API endpoints might be different than expected
3. There might be an issue with database connectivity

The chatbot will still work and respond to your query using its built-in knowledge.`;
    }
    
    // If query is empty, return a summary of all data
    if (!query || query.trim() === '') {
      console.log('[ragService:LLM] Empty query, returning database summary');
      return generateDatabaseSummary();
    }
    
    // Search for relevant content
    const searchResults = await searchDatabase(query, pageContext, 7);
    
    // Format the results
    if (searchResults.length === 0) {
      console.warn('[ragService:LLM] No search results found for query');
      return 'No relevant data found in the database for this query.';
    }
    
    let relevantContent = `RELEVANT DATABASE CONTENT\n`;
    relevantContent += `The following information is most relevant to your query:\n\n`;
    
    searchResults.forEach((result, index) => {
      relevantContent += `[${index + 1}] ${result.content}\n\n`;
    });
    
    console.log('[ragService:LLM] Returning search results content');
    return relevantContent;
  } catch (error) {
    console.error('[ragService:LLM] Error retrieving database content for LLM:', error);
    return 'Error retrieving database content. Please try again later.';
  }
};

// Generate a summary of the database contents
const generateDatabaseSummary = (): string => {
  if (!cachedDatabaseData) return 'No database data available.';
  
  return `DATABASE SUMMARY
- ${cachedDatabaseData.projects.length} Projects
- ${cachedDatabaseData.softwareTasks.length} Software Tasks
- ${cachedDatabaseData.financialTransactions.length} Financial Transactions
- ${cachedDatabaseData.bills.length} Bills
- ${cachedDatabaseData.budgets.length} Budgets
- ${cachedDatabaseData.healthActivities.length} Health Activities
- ${cachedDatabaseData.workoutPlans.length} Workout Plans
- ${cachedDatabaseData.investmentAssets.length} Investment Assets
- ${cachedDatabaseData.investmentPortfolios.length} Investment Portfolios

To get specific information, please ask a question about any of these categories.`;
};

// Export the service
export default {
  getDatabaseData,
  getDatabaseContentForLLM,
  searchDatabase,
  updateEmbeddings
};