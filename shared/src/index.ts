// DTOs
export { RegisterUserDto, RegisterUserSchema } from "./dtos/auth/register-user.dto";
export { LoginDto, LoginSchema } from "./dtos/auth/login.dto";
export { CreateProjectDto, CreateProjectSchema } from "./dtos/projects/create-project.dto";
export { UpdateProjectDto, UpdateProjectSchema } from "./dtos/projects/update-project.dto";
export { UpdateProjectStatusDto, UpdateProjectStatusSchema } from "./dtos/projects/update-project-status.dto";
export { CreateTicketDto, CreateTicketSchema } from "./dtos/tickets/create-ticket.dto";
export { UpdateTicketDto, UpdateTicketSchema } from "./dtos/tickets/update-ticket.dto";

// Constants
export { AUTH_CONFIG } from "./constants/auth";
export { TICKET_TYPES } from "./constants/ticket";
export type { TicketType } from "./constants/ticket";

export {
  PROJECT_STATUS_LABELS,
  PROJECT_TYPE_LABELS,
  ProjectStatus,
  ProjectType,
  DEFAULT_PROJECT_STATUSES,
} from "./constants/project";
export { USER_ROLE, USER_ROLE_NAME } from "./constants/user";
export { PERMISSIONS } from "./constants/permission";
