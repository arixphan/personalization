import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Search, Filter } from 'lucide-react';

interface BacklogProps {
  projectId: string;
  onClose: () => void;
}

const Backlog: React.FC<BacklogProps> = ({ projectId, onClose }) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sprintFilter, setSprintFilter] = useState<string>('all');
  
  // Mock data for demonstration
  const currentSprint = {
    id: 'sprint-1',
    name: 'Sprint 1',
    startDate: new Date(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    tickets: [
      {
        id: 'ticket-1',
        title: 'Implement user authentication',
        description: 'Add login and registration functionality',
        status: 'in-progress',
        priority: 'high',
        sprint: 'Sprint 1'
      },
      {
        id: 'ticket-2',
        title: 'Design dashboard layout',
        description: 'Create responsive dashboard design',
        status: 'todo',
        priority: 'medium',
        sprint: 'Sprint 1'
      }
    ]
  };

  const backlogTickets = [
    {
      id: 'ticket-3',
      title: 'Add email notifications',
      description: 'Implement email notification system',
      priority: 'low',
      sprint: 'Backlog'
    },
    {
      id: 'ticket-4',
      title: 'Optimize database queries',
      description: 'Improve application performance',
      priority: 'high',
      sprint: 'Backlog'
    }
  ];

  const allTickets = [...currentSprint.tickets, ...backlogTickets];

  const filteredTickets = allTickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    const matchesSprint = sprintFilter === 'all' || ticket.sprint === sprintFilter;
    return matchesSearch && matchesPriority && matchesSprint;
  });

  const currentSprintTickets = filteredTickets.filter(ticket => ticket.sprint === 'Sprint 1');
  const backlogFilteredTickets = filteredTickets.filter(ticket => ticket.sprint === 'Backlog');

  return (
    <div className="h-full overflow-auto">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <button
              onClick={onClose}
              className={`text-sm mb-2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              } hover:underline`}
            >
              ← Back to Board
            </button>
            <h1 className={`text-3xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Project Backlog
            </h1>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`} size={20} />
            <input
              type="text"
              placeholder="Search tickets..."
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
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300'
            }`}
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={sprintFilter}
            onChange={(e) => setSprintFilter(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300'
            }`}
          >
            <option value="all">All Sprints</option>
            <option value="Sprint 1">Current Sprint</option>
            <option value="Backlog">Backlog</option>
          </select>
        </div>
      </header>

      <section className="mb-8">
        <h2 className={`text-xl font-semibold mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Current Sprint ({new Date(currentSprint.startDate).toLocaleDateString()} - {new Date(currentSprint.endDate).toLocaleDateString()})
        </h2>
        <div className="space-y-4">
          {currentSprintTickets.map(ticket => (
            <div
              key={ticket.id}
              className={`p-4 rounded-lg ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              } shadow-sm`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className={`font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {ticket.title}
                  </h3>
                  <p className={`text-sm mt-1 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {ticket.description}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  ticket.priority === 'high'
                    ? 'bg-red-100 text-red-800'
                    : ticket.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {ticket.priority}
                </span>
              </div>
              {'status' in ticket && (
                <div className="mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className={`text-xl font-semibold mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Backlog
        </h2>
        <div className="space-y-4">
          {backlogFilteredTickets.map(ticket => (
            <div
              key={ticket.id}
              className={`p-4 rounded-lg ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              } shadow-sm`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className={`font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {ticket.title}
                  </h3>
                  <p className={`text-sm mt-1 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {ticket.description}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  ticket.priority === 'high'
                    ? 'bg-red-100 text-red-800'
                    : ticket.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {ticket.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Backlog;