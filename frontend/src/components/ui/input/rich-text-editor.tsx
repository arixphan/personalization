import React, { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Highlight } from '@tiptap/extension-highlight';
import { Placeholder } from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Baseline,
  Highlighter,
  Eraser,
  Strikethrough,
  Code,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface RichTextEditorProps {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
  readOnly?: boolean;
}

const COLORS = [
  { label: 'Default', value: 'inherit' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Red', value: '#ef4444' },
  { label: 'Green', value: '#22c55e' },
  { label: 'Orange', value: '#f97316' },
  { label: 'Purple', value: '#a855f7' },
];

const HIGHLIGHTS = [
  { label: 'None', value: 'transparent' },
  { label: 'Yellow', value: '#fef08a' },
  { label: 'Green', value: '#bbf7d0' },
  { label: 'Blue', value: '#bfdbfe' },
  { label: 'Red', value: '#fecaca' },
];

const RichTextEditorComponent: React.FC<RichTextEditorProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder = 'Start typing...',
  required = false,
  error,
  className,
  readOnly = false,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    editable: !readOnly,
    immediatelyRender: false,
    onBlur: ({ editor }) => {
      const html = editor.getHTML();
      lastValueRef.current = html;
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[160px] p-4 text-sm',
      },
    },
  });

  // Ref to store the latest value from the parent to avoid infinite loops
  const lastValueRef = useRef(value);

  // Sync value -> editor (only if value changed externally)
  useEffect(() => {
    if (editor && value !== lastValueRef.current && value !== editor.getHTML()) {
      lastValueRef.current = value;
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  const errorId = `${id}-error`;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium">
          {label} {required && "*"}
        </label>
      )}

      <div className="border border-border rounded-xl overflow-hidden bg-white dark:bg-gray-900 transition-all">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            icon={Bold}
            title="Bold"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            icon={Italic}
            title="Italic"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
            icon={Strikethrough}
            title="Strikethrough"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive('code')}
            icon={Code}
            title="Code"
          />

          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive('heading', { level: 1 })}
            icon={Heading1}
            title="Heading 1"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            icon={Heading2}
            title="Heading 2"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })}
            icon={Heading3}
            title="Heading 3"
          />

          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            icon={List}
            title="Bullet List"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            icon={ListOrdered}
            title="Ordered List"
          />

          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

          {/* Text Color Dropdown */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  "p-1.5 rounded-md flex items-center gap-0.5 transition-all text-gray-500 hover:text-blue-600 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm",
                  editor.isActive('textStyle', { color: editor.getAttributes('textStyle').color }) && "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40"
                )}
                title="Text Color"
              >
                <div className="relative flex flex-col items-center">
                  <Baseline size={16} />
                  <div
                    className="absolute -bottom-1 w-full h-0.5 rounded-full"
                    style={{ backgroundColor: editor.getAttributes('textStyle').color || 'currentColor' }}
                  />
                </div>
                <ChevronDown size={12} className="opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" align="start">
              <div className="grid grid-cols-3 gap-1">
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => {
                      if (c.value === 'inherit') {
                        editor.chain().focus().unsetColor().run();
                      } else {
                        editor.chain().focus().setColor(c.value).run();
                      }
                    }}
                    className={cn(
                      "w-8 h-8 rounded-md border border-gray-100 dark:border-gray-800 flex items-center justify-center transition-all hover:scale-110 shadow-sm",
                      editor.isActive('textStyle', { color: c.value }) && "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900"
                    )}
                    style={{ backgroundColor: c.value === 'inherit' ? 'transparent' : c.value }}
                    title={c.label}
                  >
                    {c.value === 'inherit' && <Eraser size={14} className="text-gray-400" />}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Highlight Dropdown */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  "p-1.5 rounded-md flex items-center gap-0.5 transition-all text-gray-500 hover:text-blue-600 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm",
                  editor.isActive('highlight') && "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40"
                )}
                title="Highlight Color"
              >
                <div className="relative flex flex-col items-center">
                  <Highlighter size={16} />
                  <div
                    className="absolute -bottom-1 w-full h-0.5 rounded-full"
                    style={{ backgroundColor: editor.getAttributes('highlight').color || 'transparent' }}
                  />
                </div>
                <ChevronDown size={12} className="opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" align="start">
              <div className="grid grid-cols-3 gap-1">
                {HIGHLIGHTS.map((h) => (
                  <button
                    key={h.value}
                    type="button"
                    onClick={() => {
                      if (h.value === 'transparent') {
                        editor.chain().focus().unsetHighlight().run();
                      } else {
                        editor.chain().focus().setHighlight({ color: h.value }).run();
                      }
                    }}
                    className={cn(
                      "w-8 h-8 rounded-md border border-gray-100 dark:border-gray-800 flex items-center justify-center transition-all hover:scale-110 shadow-sm",
                      editor.isActive('highlight', { color: h.value }) && "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900"
                    )}
                    style={{ backgroundColor: h.value }}
                    title={h.label}
                  >
                    {h.value === 'transparent' && <Eraser size={14} className="text-gray-400" />}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <ToolbarButton
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            icon={Eraser}
            title="Clear Formatting"
            className="ml-auto"
          />
        </div>

        <EditorContent editor={editor} id={id} />
      </div>

      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};

export const RichTextEditor = React.memo(RichTextEditorComponent);

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  icon: React.ElementType;
  title: string;
  className?: string;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  onClick,
  active,
  icon: Icon,
  title,
  className
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "p-1.5 rounded-md transition-all",
      active
        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
        : "hover:bg-white hover:shadow-sm dark:hover:bg-gray-700 text-gray-500 hover:text-blue-600",
      className
    )}
    title={title}
  >
    <Icon size={16} />
  </button>
);
