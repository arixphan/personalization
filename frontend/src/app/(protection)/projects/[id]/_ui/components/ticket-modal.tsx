import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CustomInput, CustomSelect, RichTextEditor } from '@/components/ui/input';
import { Ticket } from './kanban-card';
import { TICKET_TYPES, TicketType, getTicketTypeStyles } from '@/lib/ticket-utils';
import { cn } from '@/lib/utils';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Ticket>, keepOpen?: boolean) => void;
  onDelete?: (id: number) => void;
  ticket?: Ticket;
  projectId: number;
  columns: string[];
  readOnly?: boolean;
}

export const TicketModal: React.FC<TicketModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  ticket,
  projectId,
  columns,
  readOnly = false,
}) => {
  // Sync state with ticket/columns IMMEDIATELY when props change to avoid "empty first render"
  const [title, setTitle] = useState(ticket?.title || '');
  const [description, setDescription] = useState(ticket?.description || '');

  const initialStatus = ticket?.status && ticket.status.trim() !== ''
    ? ticket.status
    : (columns && columns.length > 0 ? columns[0] : 'To Do');

  const [status, setStatus] = useState(initialStatus);
  const [priority, setPriority] = useState(ticket?.priority || 'medium');
  const [type, setType] = useState(ticket?.type || 'task');

  // Memoize column options outside of any early returns
  const statusOptions = React.useMemo(() => columns.map(col => ({
    value: col,
    label: col.charAt(0).toUpperCase() + col.slice(1).replace(/_/g, ' ')
  })), [columns]);

  useEffect(() => {
    if (!isOpen) return;

    if (ticket) {
      setTitle(ticket.title || '');
      setDescription(ticket.description || '');

      // AGGRESSIVE INITIALIZATION: Ensure we ALWAYS have a status.
      let statusValue = ticket.status;
      if (!statusValue || statusValue.trim() === '') {
        statusValue = columns && columns.length > 0 ? columns[0] : 'To Do';
      }

      setStatus(statusValue);
      setPriority(ticket.priority || 'medium');
      setType(ticket.type || 'task');
    } else {
      setTitle('');
      setDescription('');
      const defaultStatus = (columns && columns.length > 0 ? columns[0] : 'To Do');
      setStatus(defaultStatus);
      setPriority('medium');
      setType('task');
    }
  }, [ticket, isOpen, columns]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;

    onSave({
      title,
      description,
      status,
      priority,
      type,
    });
    onClose();
  };

  const handleInstantStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    if (ticket && !readOnly) {
      onSave({
        title,
        description,
        status: newStatus,
        priority,
        type,
      }, true);
    }
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
                  disabled={readOnly}
                />

                <RichTextEditor
                  id="description"
                  label="Description"
                  value={description}
                  onChange={setDescription}
                  placeholder="Describe the ticket in detail with rich text..."
                  readOnly={readOnly}
                />

                <div className="space-y-4">

                  <CustomSelect
                    id="priority"
                    label="Priority"
                    value={priority}
                    onChange={setPriority}
                    disabled={readOnly}
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
                          disabled={readOnly}
                          className={cn(
                            "flex items-center space-x-3 px-3 py-2 rounded-lg border transition-all text-left",
                            isSelected
                              ? cn(config.borderColor, config.bgColor, config.darkBgColor, "ring-2 ring-offset-2 ring-blue-500/20")
                              : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-800",
                            readOnly ? "opacity-70 cursor-not-allowed" : ""
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
                  <div className="flex items-stretch shadow-sm h-10">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const idx = columns.indexOf(status);
                        if (idx > 0) handleInstantStatusChange(columns[idx - 1]);
                      }}
                      disabled={readOnly || columns.indexOf(status) <= 0}
                      className="rounded-e-none focus:z-10 h-full w-10 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <ChevronLeft size={16} className="text-gray-600 dark:text-gray-300" />
                    </Button>
                    <div className="w-[140px] -mx-px focus-within:z-10 [&>div]:h-full [&_button]:rounded-none [&_button]:h-10 [&_[role=combobox]]:h-10 [&_button]:border-gray-200 dark:[&_button]:border-gray-800 [&_button]:bg-white dark:[&_button]:bg-gray-950 [&_button]:text-center [&_span]:mx-auto">
                      <CustomSelect
                        id="quick-status"
                        value={status}
                        onChange={handleInstantStatusChange}
                        options={statusOptions}
                        disabled={readOnly}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const idx = columns.indexOf(status);
                        if (idx < columns.length - 1) handleInstantStatusChange(columns[idx + 1]);
                      }}
                      disabled={readOnly || columns.indexOf(status) >= columns.length - 1}
                      className="rounded-s-none focus:z-10 h-full w-10 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <ChevronRight size={16} className="text-gray-600 dark:text-gray-300" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                  >
                    {readOnly ? 'Close' : 'Cancel'}
                  </Button>
                  {!readOnly && (
                    <Button
                      onClick={handleSubmit}
                      variant="default"
                      className="flex items-center space-x-2 px-6"
                      size="lg"
                      disabled={!title.trim() || !status}
                    >
                      <Save size={18} />
                      <span>{ticket ? 'Save Changes' : 'Create Ticket'}</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
