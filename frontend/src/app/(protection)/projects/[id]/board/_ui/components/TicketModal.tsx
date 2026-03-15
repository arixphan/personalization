import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CustomInput, CustomSelect, CustomTextarea } from '@/components/ui/input';
import { Ticket } from '../KanbanCard';
import { TICKET_TYPES, TicketType, getTicketTypeStyles } from '@/lib/ticket-utils';
import { cn } from '@/lib/utils';

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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 flex items-center justify-center p-4"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none p-4"
          >
            <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl pointer-events-auto overflow-hidden flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b dark:border-gray-800">
                <h2 className="text-2xl font-semibold tracking-tight dark:text-white">
                  {ticket ? `Edit Ticket #${ticket.id}` : 'Create New Ticket'}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-full"
                >
                  <X size={20} className="dark:text-gray-400" />
                </Button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-6">
                <CustomInput
                  id="title"
                  label="Title"
                  required
                  value={title}
                  onChange={setTitle}
                  placeholder="E.g., Implementation of design system"
                />

                <CustomTextarea
                  id="description"
                  label="Description"
                  value={description}
                  onChange={setDescription}
                  placeholder="Describe the ticket in detail..."
                  rows={4}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <CustomSelect
                    id="status"
                    label="Status"
                    value={status}
                    onChange={setStatus}
                    options={columns.map(col => ({
                      value: col,
                      label: col.charAt(0).toUpperCase() + col.slice(1).replace(/_/g, ' ')
                    }))}
                  />

                  <CustomSelect
                    id="priority"
                    label="Priority"
                    value={priority}
                    onChange={setPriority}
                    options={[
                      { value: 'highest', label: 'Highest' },
                      { value: 'high', label: 'High' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'low', label: 'Low' },
                      { value: 'lowest', label: 'Lowest' },
                    ]}
                  />
                </div>

                    <div className="flex flex-col space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">
                          Type
                        </label>
                        <Badge 
                          variant="outline"
                          className={cn(
                            "uppercase tracking-wider px-2 py-0.5 border-none",
                            getTicketTypeStyles(type).color,
                            getTicketTypeStyles(type).bgColor,
                            getTicketTypeStyles(type).darkBgColor
                          )}
                        >
                          {type}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {(Object.keys(TICKET_TYPES) as TicketType[]).map((t) => {
                          const config = TICKET_TYPES[t];
                          const Icon = config.icon;
                          const isSelected = type === t;
                          return (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setType(t)}
                              className={cn(
                                "flex items-center space-x-3 px-3 py-2 rounded-lg border transition-all text-left",
                                isSelected 
                                  ? cn(config.borderColor, config.bgColor, config.darkBgColor, "ring-2 ring-offset-2 ring-blue-500/20")
                                  : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-800"
                              )}
                            >
                              <div className={cn("p-1.5 rounded-md", isSelected ? "bg-white dark:bg-gray-900" : config.bgColor, config.darkBgColor)}>
                                <Icon size={14} className={config.color} />
                              </div>
                              <span className={cn(
                                "text-sm font-medium capitalize",
                                isSelected ? config.color : "text-gray-600 dark:text-gray-400"
                              )}>
                                {t}
                              </span>
                            </button>
                          );
                        })}
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
                    size="lg"
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
