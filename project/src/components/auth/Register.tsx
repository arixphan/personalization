import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { Eye, EyeOff, User, Lock, Mail, Chrome } from 'lucide-react';
import AuthLayout from './AuthLayout';
import SocialButton from './SocialButton';

interface RegisterProps {
  onSwitchToLogin: () => void;
  onRegister: (data: { username: string; password: string; confirmPassword: string }) => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin, onRegister }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      onRegister(formData);
      setIsLoading(false);
    }, 1500);
  };

  const handleSocialAuth = (provider: 'google' | 'facebook') => {
    console.log(`Register with ${provider}`);
    // Implement social authentication logic here
  };

  const inputVariants = {
    focus: { scale: 1.02, transition: { duration: 0.2 } },
    blur: { scale: 1, transition: { duration: 0.2 } }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join us and start managing your productivity"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Username Field */}
        <motion.div variants={inputVariants}>
          <label className={`block text-sm font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
          }`}>
            Username
          </label>
          <div className="relative">
            <User className={`absolute left-3 top-1/2 -translate-y-1/2 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`} size={20} />
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 ${
                errors.username
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : theme === 'dark'
                  ? 'bg-gray-700/50 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500/20'
                  : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
              } focus:outline-none focus:ring-4`}
              placeholder="Enter your username"
            />
          </div>
          {errors.username && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm mt-1"
            >
              {errors.username}
            </motion.p>
          )}
        </motion.div>

        {/* Password Field */}
        <motion.div variants={inputVariants}>
          <label className={`block text-sm font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
          }`}>
            Password
          </label>
          <div className="relative">
            <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`} size={20} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={`w-full pl-10 pr-12 py-3 rounded-lg border transition-all duration-200 ${
                errors.password
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : theme === 'dark'
                  ? 'bg-gray-700/50 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500/20'
                  : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
              } focus:outline-none focus:ring-4`}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm mt-1"
            >
              {errors.password}
            </motion.p>
          )}
        </motion.div>

        {/* Confirm Password Field */}
        <motion.div variants={inputVariants}>
          <label className={`block text-sm font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
          }`}>
            Confirm Password
          </label>
          <div className="relative">
            <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`} size={20} />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className={`w-full pl-10 pr-12 py-3 rounded-lg border transition-all duration-200 ${
                errors.confirmPassword
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : theme === 'dark'
                  ? 'bg-gray-700/50 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500/20'
                  : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
              } focus:outline-none focus:ring-4`}
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm mt-1"
            >
              {errors.confirmPassword}
            </motion.p>
          )}
        </motion.div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
          } text-white`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Creating Account...</span>
            </div>
          ) : (
            'Create Account'
          )}
        </motion.button>

        {/* Divider */}
        <div className="relative my-6">
          <div className={`absolute inset-0 flex items-center ${
            theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
          }`}>
            <div className={`w-full border-t ${
              theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
            }`}></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className={`px-4 ${
              theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'
            }`}>
              Or continue with
            </span>
          </div>
        </div>

        {/* Social Authentication */}
        <div className="space-y-3">
          <SocialButton provider="google" onClick={() => handleSocialAuth('google')}>
            <Chrome size={20} />
            <span className="font-medium">Continue with Google</span>
          </SocialButton>

          <SocialButton provider="facebook" onClick={() => handleSocialAuth('facebook')}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span className="font-medium">Continue with Facebook</span>
          </SocialButton>
        </div>

        {/* Login Link */}
        <div className={`text-center text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className={`font-medium ${
              theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
            } transition-colors`}
          >
            Sign in
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Register;