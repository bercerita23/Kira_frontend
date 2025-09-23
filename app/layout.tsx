import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/context/auth-context";
import { LandingHeader } from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/footer";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-din",
});

export const metadata: Metadata = {
  title: "Kira | English Learning Platform",
  description:
    "Learn English through interactive stories and engaging exercises with Kira - the modern language learning platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <LandingHeader />
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
        <LandingFooter />
      </body>
    </html>
  );
}
