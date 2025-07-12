// import React, { useState, useEffect, useMemo } from "react";
// import { useTheme } from "../context/ThemeContext";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Calendar as CalendarIcon,
//   ChevronLeft,
//   ChevronRight,
//   Edit3,
//   Save,
//   X,
//   ArrowLeft,
//   ArrowRight,
//   BookOpen,
//   Plus,
// } from "lucide-react";
// import YooptaEditor, { createYooptaEditor } from "@yoopta/editor";
// import Paragraph from "@yoopta/paragraph";
// import Blockquote from "@yoopta/blockquote";
// import Code from "@yoopta/code";
// import Link from "@yoopta/link";
// import { HeadingOne, HeadingTwo, HeadingThree } from "@yoopta/headings";
// import { BulletedList, NumberedList, TodoList } from "@yoopta/lists";
// import { Bold, Italic, CodeMark, Strike, Underline } from "@yoopta/marks";
// import ActionMenuList, {
//   DefaultActionMenuRender,
// } from "@yoopta/action-menu-list";
// import Toolbar, { DefaultToolbarRender } from "@yoopta/toolbar";

// interface DiaryEntry {
//   id: string;
//   date: string; // YYYY-MM-DD format
//   title: string;
//   content: {
//     blocks: { [key: string]: any };
//     order: string[];
//   };
//   mood?: "great" | "good" | "neutral" | "bad" | "terrible";
//   tags: string[];
//   createdAt: Date;
//   updatedAt: Date;
// }

// const Diary: React.FC = () => {
//   const { theme } = useTheme();
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [currentMonth, setCurrentMonth] = useState(new Date());
//   const [showCalendar, setShowCalendar] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [currentEntry, setCurrentEntry] = useState<DiaryEntry | null>(null);
//   const [entries, setEntries] = useState<DiaryEntry[]>([]);

//   // Initialize Yoopta Editor
//   const editor = useMemo(() => createYooptaEditor(), []);

//   const plugins = [
//     Paragraph,
//     HeadingOne,
//     HeadingTwo,
//     HeadingThree,
//     BulletedList,
//     NumberedList,
//     TodoList,
//     Blockquote,
//     Code,
//     Link,
//   ];

//   const marks = [Bold, Italic, CodeMark, Strike, Underline];

//   const TOOLS = {
//     ActionMenu: {
//       render: DefaultActionMenuRender,
//       tool: ActionMenuList,
//     },
//     Toolbar: {
//       render: DefaultToolbarRender,
//       tool: Toolbar,
//     },
//   };

//   // Mock data for demonstration
//   useEffect(() => {
//     const mockEntries: DiaryEntry[] = [
//       {
//         id: "1",
//         date: "2024-01-15",
//         title: "A Productive Monday",
//         content: {
//           blocks: {
//             "1": {
//               id: "1",
//               type: "HeadingOne",
//               children: [{ text: "A Productive Monday" }],
//               props: {},
//             },
//             "2": {
//               id: "2",
//               type: "Paragraph",
//               children: [
//                 {
//                   text: "Today was an incredibly productive day. I managed to complete all my tasks and even had time for some personal projects.",
//                 },
//               ],
//               props: {},
//             },
//             "3": {
//               id: "3",
//               type: "BulletedList",
//               children: [
//                 { text: "Finished the quarterly report" },
//                 { text: "Had a great meeting with the team" },
//                 { text: "Started reading a new book" },
//               ],
//               props: {},
//             },
//           },
//           order: ["1", "2", "3"],
//         },
//         mood: "great",
//         tags: ["work", "productivity", "goals"],
//         createdAt: new Date("2024-01-15T09:00:00"),
//         updatedAt: new Date("2024-01-15T21:30:00"),
//       },
//       {
//         id: "2",
//         date: "2024-01-14",
//         title: "Weekend Reflections",
//         content: {
//           blocks: {
//             "1": {
//               id: "1",
//               type: "HeadingOne",
//               children: [{ text: "Weekend Reflections" }],
//               props: {},
//             },
//             "2": {
//               id: "2",
//               type: "Paragraph",
//               children: [
//                 {
//                   text: "Spent the weekend with family and friends. It was exactly what I needed after a busy week.",
//                 },
//               ],
//               props: {},
//             },
//           },
//           order: ["1", "2"],
//         },
//         mood: "good",
//         tags: ["family", "relaxation", "weekend"],
//         createdAt: new Date("2024-01-14T19:00:00"),
//         updatedAt: new Date("2024-01-14T20:15:00"),
//       },
//       {
//         id: "3",
//         date: "2024-01-10",
//         title: "Learning New Technologies",
//         content: {
//           blocks: {
//             "1": {
//               id: "1",
//               type: "HeadingOne",
//               children: [{ text: "Learning New Technologies" }],
//               props: {},
//             },
//             "2": {
//               id: "2",
//               type: "Paragraph",
//               children: [
//                 {
//                   text: "Diving deep into React and modern web development. The learning curve is steep but exciting.",
//                 },
//               ],
//               props: {},
//             },
//             "3": {
//               id: "3",
//               type: "Code",
//               children: [
//                 {
//                   text: 'const learning = () => {\n  return "never stops";\n};',
//                 },
//               ],
//               props: { language: "javascript" },
//             },
//           },
//           order: ["1", "2", "3"],
//         },
//         mood: "good",
//         tags: ["learning", "technology", "development"],
//         createdAt: new Date("2024-01-10T14:30:00"),
//         updatedAt: new Date("2024-01-10T16:45:00"),
//       },
//     ];
//     setEntries(mockEntries);
//   }, []);

//   // Get current entry for selected date
//   useEffect(() => {
//     const dateStr = selectedDate.toISOString().split("T")[0];
//     const entry = entries.find((e) => e.date === dateStr);
//     setCurrentEntry(entry || null);
//     setIsEditing(!entry); // Auto-edit mode if no entry exists
//   }, [selectedDate, entries]);

//   // Calendar helpers
//   const getDaysInMonth = (date: Date) => {
//     const year = date.getFullYear();
//     const month = date.getMonth();
//     const firstDay = new Date(year, month, 1);
//     const lastDay = new Date(year, month + 1, 0);
//     const daysInMonth = lastDay.getDate();
//     const startingDayOfWeek = firstDay.getDay();

//     const days = [];

//     // Add empty cells for days before the first day of the month
//     for (let i = 0; i < startingDayOfWeek; i++) {
//       days.push(null);
//     }

//     // Add all days of the month
//     for (let day = 1; day <= daysInMonth; day++) {
//       days.push(new Date(year, month, day));
//     }

//     return days;
//   };

//   const hasEntry = (date: Date) => {
//     const dateStr = date.toISOString().split("T")[0];
//     return entries.some((entry) => entry.date === dateStr);
//   };

//   const isToday = (date: Date) => {
//     const today = new Date();
//     return date.toDateString() === today.toDateString();
//   };

//   const isSelected = (date: Date) => {
//     return date.toDateString() === selectedDate.toDateString();
//   };

//   // Navigation helpers
//   const goToPreviousEntry = () => {
//     const currentDateStr = selectedDate.toISOString().split("T")[0];
//     const sortedEntries = entries
//       .filter((entry) => entry.date < currentDateStr)
//       .sort((a, b) => b.date.localeCompare(a.date));

//     if (sortedEntries.length > 0) {
//       setSelectedDate(new Date(sortedEntries[0].date));
//     } else {
//       // Go to yesterday if no previous entries
//       const yesterday = new Date(selectedDate);
//       yesterday.setDate(yesterday.getDate() - 1);
//       setSelectedDate(yesterday);
//     }
//   };

//   const goToNextEntry = () => {
//     const currentDateStr = selectedDate.toISOString().split("T")[0];
//     const sortedEntries = entries
//       .filter((entry) => entry.date > currentDateStr)
//       .sort((a, b) => a.date.localeCompare(b.date));

//     if (sortedEntries.length > 0) {
//       setSelectedDate(new Date(sortedEntries[0].date));
//     } else {
//       // Go to tomorrow if no next entries
//       const tomorrow = new Date(selectedDate);
//       tomorrow.setDate(tomorrow.getDate() + 1);
//       setSelectedDate(tomorrow);
//     }
//   };

//   const goToToday = () => {
//     setSelectedDate(new Date());
//   };

//   // Entry management
//   const saveEntry = () => {
//     const content = editor.getEditorValue();
//     const dateStr = selectedDate.toISOString().split("T")[0];

//     if (currentEntry) {
//       // Update existing entry
//       setEntries(
//         entries.map((entry) =>
//           entry.id === currentEntry.id
//             ? { ...entry, content, updatedAt: new Date() }
//             : entry
//         )
//       );
//     } else {
//       // Create new entry
//       const newEntry: DiaryEntry = {
//         id: Date.now().toString(),
//         date: dateStr,
//         title: `Diary Entry - ${selectedDate.toLocaleDateString()}`,
//         content,
//         mood: "neutral",
//         tags: [],
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       };
//       setEntries([...entries, newEntry]);
//     }
//     setIsEditing(false);
//   };

//   const cancelEdit = () => {
//     if (currentEntry) {
//       editor.setEditorValue(currentEntry.content);
//     } else {
//       editor.setEditorValue({ blocks: {}, order: [] });
//     }
//     setIsEditing(false);
//   };

//   // Set editor content when entry changes
//   useEffect(() => {
//     // if (currentEntry && !isEditing) {
//     //   editor.setEditorValue(currentEntry.content);
//     // } else if (!currentEntry && isEditing) {
//     //   const defaultContent = {
//     //     blocks: {
//     //       '1': {
//     //         id: '1',
//     //         type: 'HeadingOne',
//     //         children: [{ text: `${selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}` }],
//     //         props: {}
//     //       },
//     //       '2': {
//     //         id: '2',
//     //         type: 'Paragraph',
//     //         children: [{ text: 'How was your day today?' }],
//     //         props: {}
//     //       }
//     //     },
//     //     order: ['1', '2']
//     //   };
//     //   editor.setEditorValue(defaultContent);
//     // }
//   }, [currentEntry, isEditing, selectedDate, editor]);

//   const monthNames = [
//     "January",
//     "February",
//     "March",
//     "April",
//     "May",
//     "June",
//     "July",
//     "August",
//     "September",
//     "October",
//     "November",
//     "December",
//   ];

//   const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

//   return (
//     <div className="h-full overflow-auto px-4 md:px-6">
//       <header className="mb-6">
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
//           <div>
//             <h1
//               className={`text-2xl sm:text-3xl font-bold ${
//                 theme === "dark" ? "text-white" : "text-gray-900"
//               }`}
//             >
//               Personal Diary
//             </h1>
//             <p
//               className={`mt-1 ${
//                 theme === "dark" ? "text-gray-300" : "text-gray-600"
//               }`}
//             >
//               Capture your thoughts, experiences, and memories
//             </p>
//           </div>

//           <div className="flex items-center gap-2">
//             <button
//               onClick={goToToday}
//               className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
//                 theme === "dark"
//                   ? "bg-gray-700 hover:bg-gray-600 text-white"
//                   : "bg-gray-100 hover:bg-gray-200 text-gray-900"
//               }`}
//             >
//               Today
//             </button>
//             <button
//               onClick={() => setShowCalendar(!showCalendar)}
//               className={`px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
//                 showCalendar
//                   ? theme === "dark"
//                     ? "bg-blue-600 text-white"
//                     : "bg-blue-500 text-white"
//                   : theme === "dark"
//                   ? "bg-gray-700 hover:bg-gray-600 text-white"
//                   : "bg-gray-100 hover:bg-gray-200 text-gray-900"
//               }`}
//             >
//               <CalendarIcon size={16} />
//               <span className="hidden sm:inline">Calendar</span>
//             </button>
//           </div>
//         </div>

//         {/* Date Navigation */}
//         <div className="flex items-center justify-between mb-4">
//           <div className="flex items-center space-x-2">
//             <button
//               onClick={goToPreviousEntry}
//               className={`p-2 rounded-lg transition-colors ${
//                 theme === "dark"
//                   ? "hover:bg-gray-700 text-gray-400 hover:text-white"
//                   : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
//               }`}
//               title="Previous entry"
//             >
//               <ArrowLeft size={20} />
//             </button>

//             <h2
//               className={`text-lg sm:text-xl font-semibold ${
//                 theme === "dark" ? "text-white" : "text-gray-900"
//               }`}
//             >
//               {selectedDate.toLocaleDateString("en-US", {
//                 weekday: "long",
//                 year: "numeric",
//                 month: "long",
//                 day: "numeric",
//               })}
//             </h2>

//             <button
//               onClick={goToNextEntry}
//               className={`p-2 rounded-lg transition-colors ${
//                 theme === "dark"
//                   ? "hover:bg-gray-700 text-gray-400 hover:text-white"
//                   : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
//               }`}
//               title="Next entry"
//             >
//               <ArrowRight size={20} />
//             </button>
//           </div>

//           <div className="flex items-center space-x-2">
//             {currentEntry && !isEditing && (
//               <button
//                 onClick={() => setIsEditing(true)}
//                 className={`px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
//                   theme === "dark"
//                     ? "bg-blue-600 hover:bg-blue-700 text-white"
//                     : "bg-blue-500 hover:bg-blue-600 text-white"
//                 }`}
//               >
//                 <Edit3 size={16} />
//                 <span className="hidden sm:inline">Edit</span>
//               </button>
//             )}

//             {!currentEntry && !isEditing && (
//               <button
//                 onClick={() => setIsEditing(true)}
//                 className={`px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
//                   theme === "dark"
//                     ? "bg-green-600 hover:bg-green-700 text-white"
//                     : "bg-green-500 hover:bg-green-600 text-white"
//                 }`}
//               >
//                 <Plus size={16} />
//                 <span className="hidden sm:inline">New Entry</span>
//               </button>
//             )}

//             {isEditing && (
//               <>
//                 <button
//                   onClick={saveEntry}
//                   className={`px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
//                     theme === "dark"
//                       ? "bg-green-600 hover:bg-green-700 text-white"
//                       : "bg-green-500 hover:bg-green-600 text-white"
//                   }`}
//                 >
//                   <Save size={16} />
//                   <span className="hidden sm:inline">Save</span>
//                 </button>
//                 <button
//                   onClick={cancelEdit}
//                   className={`px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
//                     theme === "dark"
//                       ? "bg-gray-700 hover:bg-gray-600 text-white"
//                       : "bg-gray-100 hover:bg-gray-200 text-gray-900"
//                   }`}
//                 >
//                   <X size={16} />
//                   <span className="hidden sm:inline">Cancel</span>
//                 </button>
//               </>
//             )}
//           </div>
//         </div>
//       </header>

//       {/* Calendar Modal */}
//       <AnimatePresence>
//         {showCalendar && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
//             onClick={() => setShowCalendar(false)}
//           >
//             <motion.div
//               initial={{ scale: 0.9, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.9, opacity: 0 }}
//               onClick={(e) => e.stopPropagation()}
//               className={`w-full max-w-md rounded-2xl p-6 ${
//                 theme === "dark" ? "bg-gray-800" : "bg-white"
//               } shadow-2xl`}
//             >
//               <div className="flex justify-between items-center mb-4">
//                 <h3
//                   className={`text-lg font-semibold ${
//                     theme === "dark" ? "text-white" : "text-gray-900"
//                   }`}
//                 >
//                   {monthNames[currentMonth.getMonth()]}{" "}
//                   {currentMonth.getFullYear()}
//                 </h3>
//                 <div className="flex items-center space-x-2">
//                   <button
//                     onClick={() =>
//                       setCurrentMonth(
//                         new Date(
//                           currentMonth.getFullYear(),
//                           currentMonth.getMonth() - 1
//                         )
//                       )
//                     }
//                     className={`p-1 rounded-lg ${
//                       theme === "dark"
//                         ? "hover:bg-gray-700"
//                         : "hover:bg-gray-100"
//                     }`}
//                   >
//                     <ChevronLeft size={20} />
//                   </button>
//                   <button
//                     onClick={() =>
//                       setCurrentMonth(
//                         new Date(
//                           currentMonth.getFullYear(),
//                           currentMonth.getMonth() + 1
//                         )
//                       )
//                     }
//                     className={`p-1 rounded-lg ${
//                       theme === "dark"
//                         ? "hover:bg-gray-700"
//                         : "hover:bg-gray-100"
//                     }`}
//                   >
//                     <ChevronRight size={20} />
//                   </button>
//                   <button
//                     onClick={() => setShowCalendar(false)}
//                     className={`p-1 rounded-lg ${
//                       theme === "dark"
//                         ? "hover:bg-gray-700"
//                         : "hover:bg-gray-100"
//                     }`}
//                   >
//                     <X size={20} />
//                   </button>
//                 </div>
//               </div>

//               <div className="grid grid-cols-7 gap-1 mb-2">
//                 {dayNames.map((day) => (
//                   <div
//                     key={day}
//                     className={`text-center text-sm font-medium py-2 ${
//                       theme === "dark" ? "text-gray-400" : "text-gray-600"
//                     }`}
//                   >
//                     {day}
//                   </div>
//                 ))}
//               </div>

//               <div className="grid grid-cols-7 gap-1">
//                 {getDaysInMonth(currentMonth).map((date, index) => (
//                   <div key={index} className="aspect-square">
//                     {date && (
//                       <button
//                         onClick={() => {
//                           setSelectedDate(date);
//                           setShowCalendar(false);
//                         }}
//                         className={`w-full h-full rounded-lg text-sm font-medium transition-colors relative ${
//                           isSelected(date)
//                             ? theme === "dark"
//                               ? "bg-blue-600 text-white"
//                               : "bg-blue-500 text-white"
//                             : isToday(date)
//                             ? theme === "dark"
//                               ? "bg-gray-700 text-blue-400 border border-blue-400"
//                               : "bg-blue-50 text-blue-600 border border-blue-200"
//                             : theme === "dark"
//                             ? "hover:bg-gray-700 text-gray-300"
//                             : "hover:bg-gray-100 text-gray-700"
//                         }`}
//                       >
//                         {date.getDate()}
//                         {hasEntry(date) && (
//                           <div
//                             className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
//                               isSelected(date) ? "bg-white" : "bg-blue-500"
//                             }`}
//                           />
//                         )}
//                       </button>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Main Content */}
//       <div
//         className={`rounded-xl ${
//           theme === "dark" ? "bg-gray-800" : "bg-white"
//         } shadow-lg overflow-hidden`}
//       >
//         {!currentEntry && !isEditing ? (
//           <div
//             className={`p-8 text-center ${
//               theme === "dark" ? "text-gray-400" : "text-gray-600"
//             }`}
//           >
//             <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
//             <p className="text-lg mb-4">No diary entry for this date</p>
//             <button
//               onClick={() => setIsEditing(true)}
//               className={`px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto transition-colors ${
//                 theme === "dark"
//                   ? "bg-blue-600 hover:bg-blue-700 text-white"
//                   : "bg-blue-500 hover:bg-blue-600 text-white"
//               }`}
//             >
//               <Plus size={16} />
//               <span>Write your first entry</span>
//             </button>
//           </div>
//         ) : (
//           <div className="h-[600px]">
//             <YooptaEditor
//               editor={editor}
//               plugins={plugins}
//               marks={marks}
//               tools={TOOLS}
//               readOnly={!isEditing}
//               className={`h-full ${
//                 theme === "dark" ? "yoopta-dark" : "yoopta-light"
//               }`}
//               style={{
//                 width: "100%",
//                 height: "100%",
//                 padding: "24px",
//                 backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
//                 color: theme === "dark" ? "#ffffff" : "#000000",
//               }}
//             />
//           </div>
//         )}
//       </div>

//       {/* Entry Info */}
//       {currentEntry && (
//         <div
//           className={`mt-4 p-4 rounded-lg ${
//             theme === "dark" ? "bg-gray-800" : "bg-gray-50"
//           }`}
//         >
//           <div className="flex flex-wrap items-center gap-4 text-sm">
//             <span
//               className={`${
//                 theme === "dark" ? "text-gray-400" : "text-gray-600"
//               }`}
//             >
//               Created: {currentEntry.createdAt.toLocaleDateString()} at{" "}
//               {currentEntry.createdAt.toLocaleTimeString()}
//             </span>
//             <span
//               className={`${
//                 theme === "dark" ? "text-gray-400" : "text-gray-600"
//               }`}
//             >
//               Last updated: {currentEntry.updatedAt.toLocaleDateString()} at{" "}
//               {currentEntry.updatedAt.toLocaleTimeString()}
//             </span>
//             {currentEntry.tags.length > 0 && (
//               <div className="flex items-center space-x-2">
//                 <span
//                   className={`${
//                     theme === "dark" ? "text-gray-400" : "text-gray-600"
//                   }`}
//                 >
//                   Tags:
//                 </span>
//                 {currentEntry.tags.map((tag) => (
//                   <span
//                     key={tag}
//                     className={`px-2 py-1 rounded-full text-xs ${
//                       theme === "dark"
//                         ? "bg-gray-700 text-gray-300"
//                         : "bg-gray-200 text-gray-700"
//                     }`}
//                   >
//                     {tag}
//                   </span>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Diary;

export default function Diary() {
  return (
    <div className="h-full flex items-center justify-center">
      <h1 className="text-2xl font-bold">Diary Component</h1>
    </div>
  );
}
