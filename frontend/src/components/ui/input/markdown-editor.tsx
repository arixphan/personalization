import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Link as LinkIcon, 
  Eye, 
  Code,
  Type,
  Heading2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

interface MarkdownEditorProps {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  id,
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  error,
  className,
}) => {
  const [isPreview, setIsPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const errorId = `${id}-error`;

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);

    const newValue = `${beforeText}${prefix}${selectedText}${suffix}${afterText}`;
    onChange(newValue);

    // Set focus back and selection
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selectedText.length + suffix.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const toggleList = (marker: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);

    // If something is selected, apply marker to each line
    if (selectedText.length > 0) {
      const lines = selectedText.split('\n');
      const updatedLines = lines.map(line => {
        if (line.trim() === '') return line;
        return line.startsWith(marker) ? line : `${marker}${line}`;
      });
      const newValue = `${beforeText}${updatedLines.join('\n')}${afterText}`;
      onChange(newValue);
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start + updatedLines.join('\n').length);
      }, 0);
    } else {
      // If nothing selected, insert marker at start of line
      const lineStart = beforeText.lastIndexOf('\n') + 1;
      const newBefore = value.substring(0, lineStart);
      const rest = value.substring(lineStart);
      const newValue = `${newBefore}${marker}${rest}`;
      onChange(newValue);
      
      setTimeout(() => {
        textarea.focus();
        const newPos = start + marker.length;
        textarea.setSelectionRange(newPos, newPos);
      }, 0);
    }
  };

  const toggleHeader = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const beforeText = value.substring(0, start);
    const lineStart = beforeText.lastIndexOf('\n') + 1;
    
    const newBefore = value.substring(0, lineStart);
    const rest = value.substring(lineStart);
    
    const headerPrefix = '### ';
    const newValue = `${newBefore}${headerPrefix}${rest}`;
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      const newPos = start + headerPrefix.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleToolbarAction = (action: string) => {
    if (isPreview) return;

    switch (action) {
      case 'bold':
        insertMarkdown('**', '**');
        break;
      case 'italic':
        insertMarkdown('_', '_');
        break;
      case 'link':
        insertMarkdown('[', '](url)');
        break;
      case 'list':
        toggleList('- ');
        break;
      case 'ordered-list':
        toggleList('1. ');
        break;
      case 'code':
        insertMarkdown('`', '`');
        break;
      case 'header':
        toggleHeader();
        break;
      default:
        break;
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        {label && (
          <label htmlFor={id} className="text-sm font-medium">
            {label} {required && "*"}
          </label>
        )}
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setIsPreview(false)}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-md transition-all",
              !isPreview 
                ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400" 
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            )}
          >
            <div className="flex items-center space-x-1">
              <Type size={14} />
              <span>Write</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setIsPreview(true)}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-md transition-all",
              isPreview 
                ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400" 
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            )}
          >
            <div className="flex items-center space-x-1">
              <Eye size={14} />
              <span>Preview</span>
            </div>
          </button>
        </div>
      </div>

      <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-gray-900 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/50 transition-all">
        {/* Toolbar */}
        {!isPreview && (
          <div className="flex items-center space-x-1 p-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
            {[
              { icon: Bold, action: 'bold', label: 'Bold' },
              { icon: Italic, action: 'italic', label: 'Italic' },
              { icon: Heading2, action: 'header', label: 'Heading' },
              { icon: Code, action: 'code', label: 'Code' },
              { icon: LinkIcon, action: 'link', label: 'Link' },
              { icon: List, action: 'list', label: 'List' },
              { icon: ListOrdered, action: 'ordered-list', label: 'Ordered List' },
            ].map((item) => (
              <button
                key={item.action}
                type="button"
                onClick={() => handleToolbarAction(item.action)}
                className="p-1.5 rounded-md hover:bg-white hover:shadow-sm dark:hover:bg-gray-700 text-gray-500 hover:text-blue-600 transition-all"
                title={item.label}
              >
                <item.icon size={16} />
              </button>
            ))}
          </div>
        )}

        <div className="relative min-h-[160px]">
          {isPreview ? (
            <div className="p-4 prose prose-sm dark:prose-invert max-w-none overflow-y-auto min-h-[160px]">
              {value ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
              ) : (
                <span className="text-gray-400 italic text-sm">Nothing to preview</span>
              )}
            </div>
          ) : (
            <Textarea
              id={id}
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              placeholder={placeholder}
              required={required}
              className="border-0 focus-visible:ring-0 min-h-[160px] resize-none p-4 text-sm bg-transparent"
              aria-invalid={!!error}
              aria-describedby={error ? errorId : undefined}
            />
          )}
        </div>
      </div>

      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};
