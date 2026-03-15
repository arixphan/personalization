import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Trash2, User, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Ticket } from '../KanbanCard';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Ticket>) => void;
  onDelete?: (id: number) => void;
  ticket?: Ticket;
  projectId: number;
  columns: string[];
}

export const TicketModal: React.FC<TicketModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  ticket,
  projectId,
  columns,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('medium');
  const [type, setType] = useState('task');

  useEffect(() => {
    if (ticket) {
      setTitle(ticket.title || '');
      setDescription(ticket.description || '');
      setStatus(ticket.status || columns[0]);
      setPriority(ticket.priority || 'medium');
      setType(ticket.type || 'task');
    } else {
      setTitle('');
      setDescription('');
      setStatus(columns[0]);
      setPriority('medium');
      setType('task');
    }
  }, [ticket, isOpen, columns]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description,
      status,
      priority,
      type,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none p-4"
          >
            <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl pointer-events-auto overflow-hidden flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b dark:border-gray-800">
                <h2 className="text-xl font-bold dark:text-white">
                  {ticket ? `Edit Ticket #${ticket.id}` : 'Create New Ticket'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X size={20} className="dark:text-gray-400" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="E.g., Implementation of design system"
                    className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the ticket in detail..."
                    className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {columns.map((col) => (
                        <option key={col} value={col}>
                          {col.charAt(0).toUpperCase() + col.slice(1).replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="highest">Highest</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                      <option value="lowest">Lowest</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="task">Task</option>
                      <option value="story">Story</option>
                      <option value="bug">Bug</option>
                      <option value="epic">Epic</option>
                    </select>
                  </div>
                </div>
              </form>

              {/* Footer Actions */}
              <div className="p-4 sm:p-6 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between">
                <div>
                  {ticket && onDelete && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => onDelete(ticket.id)}
                      className="flex items-center space-x-2"
                    >
                      <Trash2 size={18} />
                      <span className="hidden sm:inline">Delete</span>
                    </Button>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    variant="default"
                    className="flex items-center space-x-2 px-6"
                  >
                    <Save size={18} />
                    <span>{ticket ? 'Save Changes' : 'Create Ticket'}</span>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
