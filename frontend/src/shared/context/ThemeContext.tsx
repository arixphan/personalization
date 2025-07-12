import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";

interface ThemeContextProps {
  children: ReactNode;
}

export const ThemeContext = ({ children }: ThemeContextProps) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      value={{ light: "light", dark: "dark" }}
      themes={["light", "dark"]}
      enableSystem={true}
      enableColorScheme={true}
      disableTransitionOnChange={false}
      storageKey="theme"
    >
      {children}
    </ThemeProvider>
  );
};
