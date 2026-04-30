import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import prisma from '../services/prisma';

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, status, dueDate, projectId, assigneeId } = req.body;
    const userId = req.user!.userId;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: true }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isOwner = project.ownerId === userId;
    if (!isOwner) {
      return res.status(403).json({ message: 'Only project owners can create tasks' });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'TODO',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        assigneeId: assigneeId || null
      }
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error creating task', error });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, status, dueDate, assigneeId } = req.body;
    const userId = req.user!.userId;

    const task = await prisma.task.findUnique({
      where: { id: parseInt(id) },
      include: { project: { include: { members: true } } }
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const isOwner = task.project.ownerId === userId;
    const isMember = task.project.members.some(m => m.userId === userId);
    const isAssignee = task.assigneeId === userId;

    if (!isOwner && !isMember && !isAssignee) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Members/Assignees can only update status
    const data: any = { status };
    if (isOwner) {
      if (title) data.title = title;
      if (description) data.description = description;
      if (dueDate) data.dueDate = new Date(dueDate);
      if (assigneeId !== undefined) data.assigneeId = assigneeId;
    }

    const updatedTask = await prisma.task.update({
      where: { id: parseInt(id) },
      data
    });

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const task = await prisma.task.findUnique({
      where: { id: parseInt(id) },
      include: { project: true }
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.project.ownerId !== userId) {
      return res.status(403).json({ message: 'Only project owners can delete tasks' });
    }

    await prisma.task.delete({ where: { id: parseInt(id) } });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error });
  }
};
