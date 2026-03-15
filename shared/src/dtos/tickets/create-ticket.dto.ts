import { z } from 'zod';
import { TICKET_TYPES } from '../../constants/ticket';

export const CreateTicketSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().nullish(),
  projectId: z.number(),
  phaseId: z.number().nullish(),
  status: z.string().optional(),
  type: z.nativeEnum(TICKET_TYPES).default(TICKET_TYPES.TASK),
  position: z.number().optional().default(0),
});

export type CreateTicketDto = z.infer<typeof CreateTicketSchema>;
