import { ForwardRefExoticComponent, RefAttributes } from "react";
import { ClipboardList, LucideProps } from "lucide-react";

export interface AppModule {
  id: string;
  name: string;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  url: string;
  isActive: boolean;
  role?: string;
}

export const APP_MODULES: AppModule[] = [
  {
    id: "project",
    name: "Project Management",
    icon: ClipboardList,
    url: "/projects",
    isActive: true,
  },
];

export const MODULE_ROUTES: Record<
  string,
  { prefix: string; routes: Record<string, string> }
> = {
  project: {
    prefix: "projects",
    routes: {
      main: "/",
      new: "/new",
      update: "/[id]",
      board: "/board",
    },
  },
};
