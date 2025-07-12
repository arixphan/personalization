import * as motion from "motion/react-client";

interface SocialButtonProps {
  provider: "google" | "facebook";
  onClick: () => void;
  children: React.ReactNode;
}

const SocialButton: React.FC<SocialButtonProps> = ({
  provider,
  onClick,
  children,
}) => {
  const getProviderClasses = () => {
    switch (provider) {
      case "google":
        return `
          bg-white hover:bg-gray-50
          dark:bg-white dark:hover:bg-gray-100
          text-gray-700
          border border-gray-300
        `;
      case "facebook":
        return `
          bg-blue-600 hover:bg-blue-700
          text-white
          border border-blue-600
        `;
      default:
        return `
          bg-gray-100 hover:bg-gray-200
          dark:bg-gray-700 dark:hover:bg-gray-600
          text-gray-900 dark:text-white
          border border-gray-300 dark:border-gray-600
        `;
    }
  };

  const styles = getProviderClasses();
  const providerLabel = `Continue with ${
    provider.charAt(0).toUpperCase() + provider.slice(1)
  }`;

  return (
    <motion.button
      type="button"
      aria-label={providerLabel}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 ${styles}`}
    >
      {children}
    </motion.button>
  );
};

export default SocialButton;
