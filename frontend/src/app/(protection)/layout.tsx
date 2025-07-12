import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ThemeContext } from "@/shared/context/ThemeContext";
import { AppLayout } from "@/shared/ui/layout/AppLayout";
import "../globals.css";
import { ApplicationContext } from "@/shared/context/ApplicationContext";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Personal Management System",
  description:
    "A personal management system to manage your tasks, projects, and notes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ApplicationContext>
          <ThemeContext>
            <AppLayout>{children}</AppLayout>
          </ThemeContext>
        </ApplicationContext>
      </body>
    </html>
  );
}
