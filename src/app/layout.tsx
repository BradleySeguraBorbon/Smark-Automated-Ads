import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { NavbarWrapper } from "@/components/NavbarWrapper";
import { cn } from "@/lib/utils";
import GlobalAlert from "@/components/GlobalAlert";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AutoSmark",
  description: "Automated and Smart Marketing Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={cn(
          `${geistSans.variable} ${geistMono.variable}`,
          "antialiased overflow-x-hidden max-w-screen w-full"
        )}
      >
        <Providers>
          <NavbarWrapper />
          <GlobalAlert />
          {children}
        </Providers>
      </body>
    </html>
  );
}
