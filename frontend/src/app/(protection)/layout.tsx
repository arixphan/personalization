import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AppLayout } from "@/shared/ui/layout/AppLayout";
import { Toaster } from "@/components/ui/sonner";
import "../globals.css";
import { Providers } from "./providers";
import { ServerApiHandler } from "@/lib/server-api";
import { UserEndpoint } from "@/constants/endpoints";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Personalization",
  description: "A premium personal management system for finance, trading, and productivity.",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
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

  let preferredTheme = "dark"; // Default
  try {
    const response = await ServerApiHandler.get(UserEndpoint.profile());
    if (response.data?.theme) {
      preferredTheme = response.data.theme;
    }
  } catch (e) {
    console.error("[RootLayout] Failed to fetch user theme:", e);
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Providers initialTheme={preferredTheme}>
            <Toaster position="top-center" duration={3000} />
            <AppLayout>{children}</AppLayout>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
