import { Request, Response } from 'express';
import { 
  Project, 
  getAllProjects, 
  getProjectById, 
  createProject, 
  updateProject, 
  deleteProject 
} from '../models/project';

// Get all projects
export const getProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const projects = await getAllProjects();
    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

// Get single project by ID
export const getProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = parseInt(req.params.id);
    const project = await getProjectById(projectId);
    
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    
    res.status(200).json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
};

// Create new project
export const addProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const projectData: Project = req.body;
    
    // Basic validation
    if (!projectData.title || !projectData.status) {
      res.status(400).json({ error: 'Title and status are required' });
      return;
    }
    
    const newProject = await createProject(projectData);
    res.status(201).json(newProject);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
};

// Update existing project
export const updateProjectById = async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = parseInt(req.params.id);
    const projectData: Project = req.body;
    
    // Basic validation
    if (!projectData.title || !projectData.status) {
      res.status(400).json({ error: 'Title and status are required' });
      return;
    }
    
    // Check if project exists
    const existingProject = await getProjectById(projectId);
    if (!existingProject) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    
    const updatedProject = await updateProject(projectId, projectData);
    res.status(200).json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
};

// Delete project
export const deleteProjectById = async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = parseInt(req.params.id);
    
    // Check if project exists
    const existingProject = await getProjectById(projectId);
    if (!existingProject) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    
    await deleteProject(projectId);
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
}; 