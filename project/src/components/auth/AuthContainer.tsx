import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Login from "./Login";
import Register from "./Register";

interface AuthContainerProps {
  onAuthSuccess: (user: any) => void;
}

const AuthContainer: React.FC<AuthContainerProps> = ({ onAuthSuccess }) => {
  const [currentView, setCurrentView] = useState<"login" | "register">("login");

  const handleLogin = (data: { username: string; password: string }) => {
    console.log("Login data:", data);
    // Simulate successful login
    onAuthSuccess({
      id: "1",
      username: data.username,
      email: `${data.username}@example.com`,
    });
  };

  const handleRegister = (data: {
    username: string;
    password: string;
    confirmPassword: string;
  }) => {
    console.log("Register data:", data);
    // Simulate successful registration
    onAuthSuccess({
      id: "1",
      username: data.username,
      email: `${data.username}@example.com`,
    });
  };

  return (
    <AnimatePresence mode="wait">
      {currentView === "login" ? (
        <Login
          key="login"
          onSwitchToRegister={() => setCurrentView("register")}
          onLogin={handleLogin}
        />
      ) : (
        <Register
          key="register"
          onSwitchToLogin={() => setCurrentView("login")}
          onRegister={handleRegister}
        />
      )}
    </AnimatePresence>
  );
};

export default AuthContainer;
