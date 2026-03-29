import { AnimatePresence } from "motion/react";

import { ThemeProvider } from "@/shared/context/ThemeProvider";
import "../globals.css";

import { NextIntlClientProvider } from "next-intl";
import { Metadata } from "next";
import { getMessages, getLocale } from "next-intl/server";

export const metadata: Metadata = {
  title: "Personalization",
  description: "A premium personal management system for finance, trading, and productivity.",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ThemeProvider>
            <AnimatePresence mode="wait">
              <div
                className={`min-h-screen relative flex items-center justify-center py-8 dark:bg-gray-800
                    dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900
                    bg-gradient-to-br from-blue-50 via-white to-purple-50`}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 overflow-hidden">
                  <div
                    className={`absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 dark:bg-blue-500  bg-blue-200`}
                  ></div>
                  <div
                    className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-20  dark:bg-purple-500 bg-purple-20 `}
                  ></div>
                </div>

                {children}
              </div>
            </AnimatePresence>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
