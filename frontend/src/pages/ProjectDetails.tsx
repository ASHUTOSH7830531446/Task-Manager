import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  dueDate: string;
  assignee: User | null;
}

interface Project {
  id: number;
  name: string;
  description: string;
  ownerId: number;
  owner: User;
  members: { user: User }[];
  tasks: Task[];
}

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'TODO', dueDate: '', assigneeId: '' });
  const [selectedUserId, setSelectedUserId] = useState('');
  const { user: currentUser } = useAuth();

  const fetchData = async () => {
    try {
      const [projRes, usersRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get('/users')
      ]);
      setProject(projRes.data);
      setAllUsers(usersRes.data);
    } catch (err) {
      console.error('Error fetching data', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { 
        ...newTask, 
        projectId: parseInt(id!),
        assigneeId: newTask.assigneeId ? parseInt(newTask.assigneeId) : null
      });
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', status: 'TODO', dueDate: '', assigneeId: '' });
      fetchData();
    } catch (err) {
      console.error('Error creating task', err);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${id}/members`, { userIdToAdd: parseInt(selectedUserId) });
      setShowMemberModal(false);
      setSelectedUserId('');
      fetchData();
    } catch (err) {
      console.error('Error adding member', err);
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchData();
    } catch (err) {
      console.error('Error updating task status', err);
    }
  };

  if (!project) return <div>Loading...</div>;

  const isOwner = project.ownerId === currentUser?.id;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
        <div>
          <h1>{project.name}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{project.description}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {isOwner && <button className="btn-primary" onClick={() => setShowMemberModal(true)}>+ Add Member</button>}
          {isOwner && <button className="btn-primary" onClick={() => setShowTaskModal(true)}>+ New Task</button>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '30px' }}>
        {/* Tasks Section */}
        <div>
          <h3>Tasks</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {project.tasks.length === 0 && <p>No tasks yet.</p>}
            {project.tasks.map(task => (
              <div key={task.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 5px 0' }}>{task.title}</h4>
                  <p style={{ margin: '0', fontSize: '13px', color: 'var(--text-muted)' }}>{task.description}</p>
                  <div style={{ marginTop: '10px', fontSize: '12px' }}>
                    <span>Assignee: {task.assignee?.name || 'Unassigned'}</span>
                    {task.dueDate && <span style={{ marginLeft: '15px' }}>Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div>
                  <select 
                    value={task.status} 
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    style={{ 
                      backgroundColor: task.status === 'DONE' ? '#d1fae5' : task.status === 'IN_PROGRESS' ? '#fef3c7' : '#f3f4f6',
                      borderColor: 'transparent',
                      fontWeight: 'bold'
                    }}
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="card">
            <h4>Team Members</h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '14px' }}>
              <li style={{ marginBottom: '8px' }}>
                <strong>{project.owner.name}</strong> (Owner)
              </li>
              {project.members.map(m => (
                <li key={m.user.id} style={{ marginBottom: '8px' }}>
                  {m.user.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div className="card" style={{ width: '450px' }}>
            <h3>New Task</h3>
            <form onSubmit={handleCreateTask}>
              <div style={{ marginBottom: '15px' }}>
                <label>Title</label>
                <input type="text" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} required />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>Description</label>
                <textarea value={newTask.description} onChange={(e) => setNewTask({...newTask, description: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label>Due Date</label>
                  <input type="date" value={newTask.dueDate} onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})} />
                </div>
                <div>
                  <label>Assignee</label>
                  <select value={newTask.assigneeId} onChange={(e) => setNewTask({...newTask, assigneeId: e.target.value})}>
                    <option value="">Unassigned</option>
                    <option value={project.ownerId}>{project.owner.name} (Owner)</option>
                    {project.members.map(m => (
                      <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Modal */}
      {showMemberModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div className="card" style={{ width: '400px' }}>
            <h3>Add Member</h3>
            <form onSubmit={handleAddMember}>
              <div style={{ marginBottom: '15px' }}>
                <label>Select User</label>
                <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} required>
                  <option value="">Select a user...</option>
                  {allUsers
                    .filter(u => u.id !== project.ownerId && !project.members.some(m => m.user.id === u.id))
                    .map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                    ))
                  }
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowMemberModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
