import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ThemeContext } from "@/shared/context/ThemeContext";
import { AppLayout } from "@/shared/ui/layout/AppLayout";
import { ApplicationContext } from "@/shared/context/ApplicationContext";
import { Toaster } from "@/components/ui/sonner";
import "../globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Providers } from "./providers";

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

import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Providers>
            <Toaster position="top-center" duration={3000} />
            <AppLayout>{children}</AppLayout>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
