import { getDbConnection } from './db';

export interface UserSettings {
  id: number;
  theme: string;
  language: string;
  notification_enabled: boolean;
  default_view: string; // 'table', 'card', or 'both'
  date_format: string;
  time_format: string;
  start_day_of_week: string; // 'sunday' or 'monday'
  created_at: string;
  updated_at: string;
}

export interface DashboardSettings {
  id: number;
  user_id: number;
  show_tasks: boolean;
  show_finance: boolean;
  show_investments: boolean;
  show_fitness: boolean;
  show_projects: boolean;
  widget_order: string; // JSON string of ordered widgets
  created_at: string;
  updated_at: string;
}

// Create settings tables
export async function createSettingsTables() {
  const db = await getDbConnection();

  // Create user_settings table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS user_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      theme TEXT DEFAULT 'dark',
      language TEXT DEFAULT 'en',
      notification_enabled BOOLEAN DEFAULT 1,
      default_view TEXT DEFAULT 'table',
      date_format TEXT DEFAULT 'MM/DD/YYYY',
      time_format TEXT DEFAULT '12h',
      start_day_of_week TEXT DEFAULT 'sunday',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create dashboard_settings table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS dashboard_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      show_tasks BOOLEAN DEFAULT 1,
      show_finance BOOLEAN DEFAULT 1,
      show_investments BOOLEAN DEFAULT 1,
      show_fitness BOOLEAN DEFAULT 1,
      show_projects BOOLEAN DEFAULT 1,
      widget_order TEXT DEFAULT '["tasks", "projects", "finance", "investments", "fitness"]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES user_settings (id)
    )
  `);

  // Insert default values if not exist
  const userSettings = await db.get('SELECT * FROM user_settings WHERE id = 1');
  if (!userSettings) {
    await db.run(`
      INSERT INTO user_settings 
      (theme, language, notification_enabled, default_view, date_format, time_format, start_day_of_week)
      VALUES ('dark', 'en', 1, 'table', 'MM/DD/YYYY', '12h', 'sunday')
    `);
  }

  const dashboardSettings = await db.get('SELECT * FROM dashboard_settings WHERE user_id = 1');
  if (!dashboardSettings) {
    await db.run(`
      INSERT INTO dashboard_settings 
      (user_id, show_tasks, show_finance, show_investments, show_fitness, show_projects, widget_order)
      VALUES (1, 1, 1, 1, 1, 1, '["tasks", "projects", "finance", "investments", "fitness"]')
    `);
  }
}

// Helper functions to get and update settings
export async function getUserSettings(): Promise<UserSettings> {
  const db = await getDbConnection();
  let settings = await db.get<UserSettings>('SELECT * FROM user_settings WHERE id = 1');
  
  if (!settings) {
    // Insert default settings if none exist
    await db.run(`
      INSERT INTO user_settings 
      (theme, language, notification_enabled, default_view, date_format, time_format, start_day_of_week)
      VALUES ('dark', 'en', 1, 'table', 'MM/DD/YYYY', '12h', 'sunday')
    `);
    
    // Query again to get the newly inserted settings
    settings = await db.get<UserSettings>('SELECT * FROM user_settings WHERE id = 1');
    
    // If still no settings, throw an error
    if (!settings) {
      throw new Error('Failed to create default user settings');
    }
  }
  
  return settings;
}

export async function updateUserSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
  const db = await getDbConnection();
  
  // Create update query dynamically based on provided fields
  const fields = Object.keys(settings)
    .filter(key => key !== 'id' && key !== 'created_at')
    .map(key => `${key} = ?`);
  
  const values = Object.keys(settings)
    .filter(key => key !== 'id' && key !== 'created_at')
    .map(key => (settings as any)[key]);
  
  values.push(new Date().toISOString()); // for updated_at
  
  if (fields.length > 0) {
    await db.run(
      `UPDATE user_settings SET ${fields.join(', ')}, updated_at = ? WHERE id = 1`,
      ...values
    );
  }
  
  return getUserSettings();
}

export async function getDashboardSettings(userId: number = 1): Promise<DashboardSettings> {
  const db = await getDbConnection();
  let settings = await db.get<DashboardSettings>(
    'SELECT * FROM dashboard_settings WHERE user_id = ?',
    userId
  );
  
  if (!settings) {
    // Insert default settings if none exist
    await db.run(`
      INSERT INTO dashboard_settings 
      (user_id, show_tasks, show_finance, show_investments, show_fitness, show_projects, widget_order)
      VALUES (?, 1, 1, 1, 1, 1, '["tasks", "projects", "finance", "investments", "fitness"]')
    `, userId);
    
    // Query again to get the newly inserted settings
    settings = await db.get<DashboardSettings>(
      'SELECT * FROM dashboard_settings WHERE user_id = ?', 
      userId
    );
    
    // If still no settings, throw an error
    if (!settings) {
      throw new Error(`Failed to create default dashboard settings for user ${userId}`);
    }
  }
  
  return settings;
}

export async function updateDashboardSettings(
  settings: Partial<DashboardSettings>
): Promise<DashboardSettings> {
  const db = await getDbConnection();
  const userId = settings.user_id || 1;
  
  // Create update query dynamically based on provided fields
  const fields = Object.keys(settings)
    .filter(key => key !== 'id' && key !== 'user_id' && key !== 'created_at')
    .map(key => `${key} = ?`);
  
  const values = Object.keys(settings)
    .filter(key => key !== 'id' && key !== 'user_id' && key !== 'created_at')
    .map(key => (settings as any)[key]);
  
  values.push(new Date().toISOString()); // for updated_at
  values.push(userId); // for WHERE clause
  
  if (fields.length > 0) {
    await db.run(
      `UPDATE dashboard_settings SET ${fields.join(', ')}, updated_at = ? WHERE user_id = ?`,
      ...values
    );
  }
  
  return getDashboardSettings(userId);
} 