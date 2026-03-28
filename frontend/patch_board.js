const fs = require('fs');
const file = 'src/app/(protection)/projects/[id]/board/_ui/components/kanban-board.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "const finalTicket = tickets.find((t) => t.id === ticketId);",
  "const finalTicket = tickets.find((t) => t.id === ticketId);\n    console.log('[DragEnd] Final ticket:', finalTicket);"
);

fs.writeFileSync(file, code);
