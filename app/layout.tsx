import "./globals.css";
import type { Metadata } from "next";
import { Inter, Lato } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/context/auth-context";
import PendoProvider from "@/components/pendo-provider";
import GAUser from "@/components/ga-analytics";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const lato = Lato({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-lato",
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
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${lato.variable}`}
    >
      <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-5QXFD717FT"
          strategy="afterInteractive"
        />
      <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
          `}
      </Script>
      <body>
        <AuthProvider>
            <GAUser/>
            <ThemeProvider>
              {children}
              <Toaster />
            </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
