"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { UnitPreferencesProvider } from "@/context/UnitPreferencesContext";
import { Space_Grotesk, Bebas_Neue } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"], 
  display: "swap", 
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"]
});
const bebasNeue = Bebas_Neue({ 
  subsets: ["latin"], 
  display: "swap", 
  variable: "--font-bebas",
  weight: "400"
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${bebasNeue.variable}`}>
      <body>
        <AuthProvider>
          <UnitPreferencesProvider>
            <div className="min-h-screen bg-background text-foreground">
              <Navbar />
              {children}
              <Footer />
            </div>
          </UnitPreferencesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
