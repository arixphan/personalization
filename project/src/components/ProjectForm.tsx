import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Project, ProjectType } from '../types';
import { X } from 'lucide-react';

interface ProjectFormProps {
  onClose: () => void;
  onSubmit: (project: Omit<Project, 'id' | 'createdAt'>) => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onClose, onSubmit }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'Software' as ProjectType,
    status: 'active' as const,
    settings: {
      sprintDuration: 14,
      columnStatuses: ['To Do', 'In Progress', 'Review', 'Done'],
      epics: []
    }
  });

  const projectTypes: ProjectType[] = [
    'Software',
    'Marketing',
    'Design',
    'Research',
    'Business'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className={`w-full max-w-2xl rounded-xl p-6 ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Create New Project
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-gray-100 ${
              theme === 'dark' ? 'hover:bg-gray-700' : ''
            }`}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={`block mb-2 font-medium ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Project Title
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300'
              }`}
            />
          </div>

          <div>
            <label className={`block mb-2 font-medium ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Description
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300'
              }`}
              rows={4}
            />
          </div>

          <div>
            <label className={`block mb-2 font-medium ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Project Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as ProjectType })}
              className={`w-full px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300'
              }`}
            >
              {projectTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white`}
            >
              Create Project
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ProjectForm;