import * as motion from "motion/react-client";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthContainer: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative z-10 w-full max-w-md"
    >
      <div className="rounded-2xl shadow-2xl p-8 bg-white/80 backdrop-blur-xl border border-white/50 dark:bg-gray-800/80 dark:backdrop-blur-xl dark:border dark:border-gray-700/50">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600"
          >
            <span className="text-2xl font-bold text-white">P</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-gray-900 dark:text-white"
          >
            {title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-2 text-gray-600 dark:text-gray-300"
          >
            {subtitle}
          </motion.p>
        </div>

        {children}
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400"
      >
        © 2024 Personal Dashboard. All rights reserved.
      </motion.div>
    </motion.div>
  );
};
