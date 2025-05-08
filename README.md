# Chronicles Productivity

A task management application built with React TypeScript for the frontend and Express with SQLite for the backend.

## Features

- Dashboard with task statistics
- Software Engineering task management
- Add tasks with title, description, dates, and category
- Responsive design with a sidebar navigation

## Project Structure

```
ChroniclesProductivity/
├── frontend/             # React TypeScript frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Application pages
│   │   └── App.tsx       # Main application component
│   └── ...
└── backend/              # Express TypeScript backend
    ├── src/
    │   ├── controllers/  # Request handlers
    │   ├── models/       # Database models
    │   ├── routes/       # API routes
    │   └── index.ts      # Entry point
    └── ...
```

## Prerequisites

- Node.js (v14+)
- npm (v6+)

## Setup and Running

### Quick Start (Both Frontend and Backend)

1. Install all dependencies:
   ```
   npm run install:all
   ```

2. Start both frontend and backend at once:
   ```
   npm run dev:full
   ```

   This will start the backend server on port 5000 and frontend on port 3000.

### Running Separately

#### Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

   This will start the backend server on port 5000.

#### Frontend

1. Open a new terminal and navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

   This will start the frontend on port 3000.

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## API Endpoints

- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get a specific task
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

## Technologies Used

- **Frontend:**
  - React
  - TypeScript
  - React Router
  - Axios

- **Backend:**
  - Node.js
  - Express
  - TypeScript
  - SQLite

## Future Enhancements

- User authentication
- Task completion status
- Task filters and sorting
- Additional task categories 