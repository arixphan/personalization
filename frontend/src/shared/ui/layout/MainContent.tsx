import { ReactNode } from "react";

const MainContent = ({ children }: { children: ReactNode }) => {
  return (
    <main
      className={`ml-16 flex-1 min-w-0 p-3 sm:p-6 min-h-screen transition-colors duration-300 dark:bg-gray-900 bg-gray-50`}
    >
      <div className="h-full">{children}</div>
    </main>
  );
};

export default MainContent;
