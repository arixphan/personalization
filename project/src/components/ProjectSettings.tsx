import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Project, Epic } from '../types';
import { X, Plus, Trash2 } from 'lucide-react';

interface ProjectSettingsProps {
  project: Project;
  onClose: () => void;
  onSave: (settings: Project['settings']) => void;
}

const ProjectSettings: React.FC<ProjectSettingsProps> = ({ project, onClose, onSave }) => {
  const { theme } = useTheme();
  const [settings, setSettings] = useState(project.settings);
  const [newEpic, setNewEpic] = useState({ name: '', description: '' });

  const handleAddEpic = () => {
    if (newEpic.name && newEpic.description) {
      setSettings({
        ...settings,
        epics: [...settings.epics, { ...newEpic, id: Date.now().toString() }]
      });
      setNewEpic({ name: '', description: '' });
    }
  };

  const handleRemoveEpic = (epicId: string) => {
    setSettings({
      ...settings,
      epics: settings.epics.filter(epic => epic.id !== epicId)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(settings);
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
        } max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Project Settings
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
              Sprint Duration (days)
            </label>
            <input
              type="number"
              min="1"
              value={settings.sprintDuration}
              onChange={(e) => setSettings({
                ...settings,
                sprintDuration: parseInt(e.target.value)
              })}
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
              Column Statuses
            </label>
            <div className="space-y-2">
              {settings.columnStatuses.map((status, index) => (
                <input
                  key={index}
                  type="text"
                  value={status}
                  onChange={(e) => {
                    const newStatuses = [...settings.columnStatuses];
                    newStatuses[index] = e.target.value;
                    setSettings({ ...settings, columnStatuses: newStatuses });
                  }}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className={`block mb-2 font-medium ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Epics
            </label>
            <div className="space-y-4">
              {settings.epics.map((epic) => (
                <div
                  key={epic.id}
                  className={`p-4 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className={`font-medium ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {epic.name}
                      </h4>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {epic.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveEpic(epic.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Epic Name"
                  value={newEpic.name}
                  onChange={(e) => setNewEpic({ ...newEpic, name: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300'
                  }`}
                />
                <textarea
                  placeholder="Epic Description"
                  value={newEpic.description}
                  onChange={(e) => setNewEpic({ ...newEpic, description: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300'
                  }`}
                  rows={2}
                />
                <button
                  type="button"
                  onClick={handleAddEpic}
                  className={`w-full px-4 py-2 rounded-lg flex items-center justify-center space-x-2 ${
                    theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  <Plus size={18} />
                  <span>Add Epic</span>
                </button>
              </div>
            </div>
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
              Save Settings
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ProjectSettings;