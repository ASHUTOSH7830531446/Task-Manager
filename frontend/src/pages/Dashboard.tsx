import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

interface Project {
  id: number;
  name: string;
  description: string;
  owner: { name: string };
  _count: { tasks: number };
}

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const { user } = useAuth();

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (err) {
      console.error('Error fetching projects', err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/projects', { name: newProjectName, description: newProjectDesc });
      setNewProjectName('');
      setNewProjectDesc('');
      setShowModal(false);
      fetchProjects();
    } catch (err) {
      console.error('Error creating project', err);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>My Projects</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ New Project</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {projects.map(project => (
          <Link to={`/projects/${project.id}`} key={project.id} className="card" style={{ display: 'block' }}>
            <h3>{project.name}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{project.description}</p>
            <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span>Owner: {project.owner.name}</span>
              <span>{project._count.tasks} Tasks</span>
            </div>
          </Link>
        ))}
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div className="card" style={{ width: '400px' }}>
            <h3>Create New Project</h3>
            <form onSubmit={handleCreateProject}>
              <div style={{ marginBottom: '15px' }}>
                <label>Project Name</label>
                <input type="text" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} required />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>Description</label>
                <textarea value={newProjectDesc} onChange={(e) => setNewProjectDesc(e.target.value)} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
