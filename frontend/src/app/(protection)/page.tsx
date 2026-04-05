"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";

export default function Home() {
  const t = useTranslations("Home");
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return null;

  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const seconds = time.getSeconds().toString().padStart(2, "0");

  const getGreeting = () => {
    const hour = time.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <main className="relative flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 overflow-hidden font-sans transition-colors duration-500">
      {/* Subtle background glow - changes color slightly in light mode */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 dark:bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="z-10 flex flex-col items-center text-center space-y-6"
      >
        {/* Modern Minimalist Clock */}
        <div className="flex items-center space-x-4 tabular-nums">
          <span className="text-8xl md:text-[12rem] font-extralight tracking-tighter text-neutral-900 dark:text-white drop-shadow-sm leading-none">
            {hours}:{minutes}
          </span>
          <span className="text-2xl md:text-4xl font-light text-neutral-400 dark:text-neutral-500 mt-auto pb-4 md:pb-8">
            {seconds}
          </span>
        </div>

        {/* Dynamic Greeting */}
        <div className="flex flex-col items-center space-y-2">
          <h1 className="text-2xl md:text-4xl font-medium tracking-tight text-neutral-700 dark:text-neutral-300">
            {getGreeting()}, <span className="text-neutral-900 dark:text-white italic">Time to focus.</span>
          </h1>
          <p className="text-neutral-400 dark:text-neutral-500 text-sm md:text-base font-light tracking-widest uppercase">
            {time.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Minimalist Action */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="pt-12"
        >
          <div className="px-6 py-2 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all cursor-pointer group shadow-sm">
            <span className="text-neutral-500 dark:text-neutral-400 text-sm font-medium group-hover:text-neutral-700 dark:group-hover:text-neutral-200">
              Welcome back to your workspace
            </span>
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}
