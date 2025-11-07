"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-sans" });
const playfairDisplay = Playfair_Display({ subsets: ["latin"], display: "swap", variable: "--font-serif" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], display: "swap", variable: "--font-mono" });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfairDisplay.variable} ${jetbrainsMono.variable}`}>
      <body>
        <AuthProvider>
          <div className="min-h-screen bg-background text-foreground pb-8 pt-20 md:pt-24">
            <Navbar />
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
