import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Plus, Folder, Settings, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import KanbanBoard from './KanbanBoard';
import ProjectForm from './ProjectForm';
import ProjectSettings from './ProjectSettings';
import Backlog from './Backlog';
import { Project, ProjectType } from '../types';

const Projects: React.FC = () => {
  const { theme } = useTheme();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [showSettings, setShowSettings] = useState<string | null>(null);
  const [showBacklog, setShowBacklog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Website Redesign',
      description: 'Modernizing the company website with new features',
      type: 'Software',
      status: 'active',
      createdAt: new Date('2024-01-15'),
      settings: {
        sprintDuration: 14,
        columnStatuses: ['To Do', 'In Progress', 'Review', 'Done'],
        epics: []
      }
    },
    {
      id: '2',
      name: 'Mobile App Development',
      description: 'Creating a new mobile app for customers',
      type: 'Software',
      status: 'on-hold',
      createdAt: new Date('2024-02-01'),
      settings: {
        sprintDuration: 14,
        columnStatuses: ['To Do', 'In Progress', 'Review', 'Done'],
        epics: []
      }
    }
  ]);

  const handleCreateProject = (projectData: Omit<Project, 'id' | 'createdAt'>) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setProjects([...projects, newProject]);
    setShowNewProjectForm(false);
  };

  const handleSaveSettings = (projectId: string, newSettings: Project['settings']) => {
    setProjects(projects.map(project =>
      project.id === projectId
        ? { ...project, settings: newSettings }
        : project
    ));
    setShowSettings(null);
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesType = typeFilter === 'all' || project.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  if (selectedProject) {
    const project = projects.find(p => p.id === selectedProject);
    if (!project) return null;

    if (showBacklog) {
      return <Backlog projectId={selectedProject} onClose={() => setShowBacklog(false)} />;
    }

    return (
      <div className="h-full">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <button
              onClick={() => setSelectedProject(null)}
              className={`text-sm mb-2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              } hover:underline`}
            >
              ← Back to Projects
            </button>
            <h1 className={`text-3xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {project.name}
            </h1>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowBacklog(true)}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <span>Backlog</span>
            </button>
            <button
              onClick={() => setShowSettings(project.id)}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <Settings size={18} />
              <span>Settings</span>
            </button>
          </div>
        </header>
        <KanbanBoard projectId={selectedProject} />
        
        {showSettings === project.id && (
          <ProjectSettings
            project={project}
            onClose={() => setShowSettings(null)}
            onSave={(settings) => handleSaveSettings(project.id, settings)}
          />
        )}
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Projects
            </h1>
            <p className={`mt-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Manage and track all your projects in one place
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNewProjectForm(true)}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              theme === 'dark'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white transition-colors`}
          >
            <Plus size={20} />
            <span>New Project</span>
          </motion.button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`} size={20} />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-300'
              }`}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300'
            }`}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300'
            }`}
          >
            <option value="all">All Types</option>
            <option value="Software">Software</option>
            <option value="Marketing">Marketing</option>
            <option value="Design">Design</option>
            <option value="Research">Research</option>
            <option value="Business">Business</option>
          </select>
        </div>
      </header>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredProjects.map((project) => (
          <motion.div
            key={project.id}
            variants={itemVariants}
            className={`rounded-xl p-6 ${
              theme === 'dark'
                ? 'bg-gray-800/50 hover:bg-gray-800/80'
                : 'bg-white hover:bg-gray-50'
            } transition-colors group`}
          >
            <div className="flex items-start justify-between">
              <div
                onClick={() => setSelectedProject(project.id)}
                className="flex-1 cursor-pointer"
              >
                <div className={`inline-flex p-3 rounded-lg ${
                  project.status === 'active'
                    ? 'bg-green-500/20 text-green-500'
                    : project.status === 'on-hold'
                    ? 'bg-yellow-500/20 text-yellow-500'
                    : 'bg-blue-500/20 text-blue-500'
                }`}>
                  <Folder size={24} />
                </div>

                <h3 className={`text-xl font-semibold mt-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {project.name}
                </h3>
                
                <p className={`mt-2 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {project.description}
                </p>

                <div className="mt-4 flex items-center space-x-3">
                  <span className={`text-sm px-3 py-1 rounded-full ${
                    project.status === 'active'
                      ? 'bg-green-500/10 text-green-500'
                      : project.status === 'on-hold'
                      ? 'bg-yellow-500/10 text-yellow-500'
                      : 'bg-blue-500/10 text-blue-500'
                  }`}>
                    {project.status}
                  </span>
                  <span className={`text-sm ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {project.type}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowSettings(project.id)}
                className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${
                  theme === 'dark'
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                <Settings size={20} />
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {showNewProjectForm && (
        <ProjectForm
          onClose={() => setShowNewProjectForm(false)}
          onSubmit={handleCreateProject}
        />
      )}

      {showSettings && (
        <ProjectSettings
          project={projects.find(p => p.id === showSettings)!}
          onClose={() => setShowSettings(null)}
          onSave={(settings) => handleSaveSettings(showSettings, settings)}
        />
      )}
    </div>
  );
};

export default Projects;