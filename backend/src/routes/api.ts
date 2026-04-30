import express from 'express';
import { signup, login } from '../controllers/authController';
import { getProjects, createProject, getProjectDetails, addProjectMember } from '../controllers/projectController';
import { createTask, updateTask, deleteTask } from '../controllers/taskController';
import { getUsers } from '../controllers/userController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// Auth
router.post('/auth/signup', signup);
router.post('/auth/login', login);

// Users
router.get('/users', authenticate, getUsers);

// Projects
router.get('/projects', authenticate, getProjects);
router.post('/projects', authenticate, createProject);
router.get('/projects/:id', authenticate, getProjectDetails);
router.post('/projects/:id/members', authenticate, addProjectMember);

// Tasks
router.post('/tasks', authenticate, createTask);
router.put('/tasks/:id', authenticate, updateTask);
router.delete('/tasks/:id', authenticate, deleteTask);

export default router;
