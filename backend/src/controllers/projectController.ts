import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import prisma from '../services/prisma';

export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } }
        ]
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        _count: { select: { tasks: true } }
      }
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects', error });
  }
};

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    const ownerId = req.user!.userId;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        ownerId
      }
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error creating project', error });
  }
};

export const getProjectDetails = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const project = await prisma.project.findUnique({
      where: { id: parseInt(id) },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        tasks: { include: { assignee: { select: { id: true, name: true, email: true } } } }
      }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is owner or member
    const isMember = project.members.some(m => m.userId === userId) || project.ownerId === userId;
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching project details', error });
  }
};

export const addProjectMember = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { userIdToAdd } = req.body;
    const userId = req.user!.userId;

    const project = await prisma.project.findUnique({ where: { id: parseInt(id) } });

    if (!project || project.ownerId !== userId) {
      return res.status(403).json({ message: 'Only project owners can add members' });
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId: parseInt(id),
        userId: userIdToAdd
      }
    });

    res.status(201).json(member);
  } catch (error) {
    res.status(500).json({ message: 'Error adding project member', error });
  }
};
