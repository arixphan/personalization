// import React from 'react';
// import { useSortable } from '@dnd-kit/sortable';
// import { CSS } from '@dnd-kit/utilities';
// import type { Task } from './KanbanBoard';
// import { Theme } from '../types';
// import { 
//   AlertTriangle, 
//   ArrowUp, 
//   ArrowDown, 
//   Minus, 
//   Bug, 
//   BookOpen, 
//   CheckSquare, 
//   Layers,
//   User,
//   Calendar,
//   MessageSquare,
//   Paperclip
// } from 'lucide-react';

// interface KanbanCardProps {
//   task: Task;
//   theme: Theme;
//   onTaskClick: (taskId: string) => void;
// }

// export const KanbanCard: React.FC<KanbanCardProps> = ({ task, theme, onTaskClick }) => {
//   const {
//     attributes,
//     listeners,
//     setNodeRef,
//     transform,
//     transition,
//     isDragging,
//   } = useSortable({ id: task.id });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//   };

//   const getPriorityIcon = (priority: string) => {
//     switch (priority) {
//       case 'highest':
//         return <ArrowUp size={14} className="text-red-600" />;
//       case 'high':
//         return <ArrowUp size={14} className="text-red-500" />;
//       case 'medium':
//         return <Minus size={14} className="text-yellow-500" />;
//       case 'low':
//         return <ArrowDown size={14} className="text-green-500" />;
//       case 'lowest':
//         return <ArrowDown size={14} className="text-green-600" />;
//       default:
//         return <Minus size={14} className="text-gray-500" />;
//     }
//   };

//   const getTypeIcon = (type: string) => {
//     switch (type) {
//       case 'story':
//         return <BookOpen size={14} className="text-green-500" />;
//       case 'task':
//         return <CheckSquare size={14} className="text-blue-500" />;
//       case 'bug':
//         return <Bug size={14} className="text-red-500" />;
//       case 'epic':
//         return <Layers size={14} className="text-purple-500" />;
//       case 'subtask':
//         return <CheckSquare size={14} className="text-gray-500" />;
//       default:
//         return <CheckSquare size={14} className="text-blue-500" />;
//     }
//   };

//   const getPriorityColor = (priority: string) => {
//     switch (priority) {
//       case 'highest':
//         return 'border-l-red-600';
//       case 'high':
//         return 'border-l-red-500';
//       case 'medium':
//         return 'border-l-yellow-500';
//       case 'low':
//         return 'border-l-green-500';
//       case 'lowest':
//         return 'border-l-green-600';
//       default:
//         return 'border-l-gray-500';
//     }
//   };

//   return (
//     <div
//       ref={setNodeRef}
//       style={style}
//       {...attributes}
//       {...listeners}
//       onClick={() => onTaskClick(task.id)}
//       className={`
//         rounded-lg p-3 sm:p-4 cursor-pointer border-l-4 ${getPriorityColor(task.priority)}
//         ${isDragging ? 'opacity-50' : 'opacity-100'}
//         ${
//           theme === 'dark'
//             ? 'bg-gray-700 hover:bg-gray-600'
//             : 'bg-white hover:bg-gray-50'
//         }
//         transition-all shadow-sm hover:shadow-md
//       `}
//     >
//       {/* Header with ID and Type */}
//       <div className="flex items-center justify-between mb-2">
//         <div className="flex items-center space-x-2">
//           <span className={`text-xs font-mono ${
//             theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
//           }`}>
//             {task.id}
//           </span>
//           {getTypeIcon(task.type)}
//         </div>
//         <div className="flex items-center space-x-1">
//           {getPriorityIcon(task.priority)}
//           {task.storyPoints && (
//             <span className={`text-xs px-1.5 py-0.5 rounded ${
//               theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-600'
//             }`}>
//               {task.storyPoints}
//             </span>
//           )}
//         </div>
//       </div>

//       {/* Title */}
//       <h4
//         className={`font-medium mb-2 line-clamp-2 ${
//           theme === 'dark' ? 'text-white' : 'text-gray-900'
//         } text-sm sm:text-base`}
//       >
//         {task.title}
//       </h4>

//       {/* Labels */}
//       {task.labels.length > 0 && (
//         <div className="flex flex-wrap gap-1 mb-2">
//           {task.labels.slice(0, 2).map((label) => (
//             <span
//               key={label}
//               className={`text-xs px-2 py-0.5 rounded-full ${
//                 theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-700'
//               }`}
//             >
//               {label}
//             </span>
//           ))}
//           {task.labels.length > 2 && (
//             <span className={`text-xs px-2 py-0.5 rounded-full ${
//               theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-700'
//             }`}>
//               +{task.labels.length - 2}
//             </span>
//           )}
//         </div>
//       )}

//       {/* Footer */}
//       <div className="flex items-center justify-between mt-3">
//         <div className="flex items-center space-x-2">
//           {task.assignee && (
//             <div className="flex items-center space-x-1">
//               <User size={12} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
//               <span className={`text-xs ${
//                 theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
//               }`}>
//                 {task.assignee.split(' ')[0]}
//               </span>
//             </div>
//           )}
//           {task.dueDate && (
//             <div className="flex items-center space-x-1">
//               <Calendar size={12} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
//               <span className={`text-xs ${
//                 theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
//               }`}>
//                 {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
//               </span>
//             </div>
//           )}
//         </div>

//         <div className="flex items-center space-x-2">
//           {task.comments.length > 0 && (
//             <div className="flex items-center space-x-1">
//               <MessageSquare size={12} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
//               <span className={`text-xs ${
//                 theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
//               }`}>
//                 {task.comments.length}
//               </span>
//             </div>
//           )}
//           {task.attachments.length > 0 && (
//             <div className="flex items-center space-x-1">
//               <Paperclip size={12} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
//               <span className={`text-xs ${
//                 theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
//               }`}>
//                 {task.attachments.length}
//               </span>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };