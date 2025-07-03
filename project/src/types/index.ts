export type Theme = 'light' | 'dark';

export interface AppProps {
  children?: React.ReactNode;
}

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export interface AppIconProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  isActive?: boolean;
}

export interface DockProps {
  children?: React.ReactNode;
}

export interface NavLinkProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  isActive?: boolean;
}

export interface DashboardProps {
  children?: React.ReactNode;
}

export interface MainContentProps {
  children?: React.ReactNode;
}

export type ProjectType = 'Software' | 'Marketing' | 'Design' | 'Research' | 'Business';

export interface Project {
  id: string;
  name: string;
  description: string;
  type: ProjectType;
  status: 'active' | 'completed' | 'on-hold';
  createdAt: Date;
  settings: ProjectSettings;
}

export interface ProjectSettings {
  sprintDuration: number; // in days
  columnStatuses: string[];
  epics: Epic[];
}

export interface Epic {
  id: string;
  name: string;
  description: string;
}