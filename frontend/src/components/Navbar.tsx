"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useUnitPreferences } from "@/context/UnitPreferencesContext";
import React, { useState } from "react";
import { Menu, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { distanceUnit, weightUnit, toggleDistanceUnit, toggleWeightUnit, distanceLabel, weightLabel } = useUnitPreferences();

  // Determine active tab based on pathname
  const getActiveTab = () => {
    if (pathname?.startsWith("/shoes")) return "shoes";
    if (pathname?.startsWith("/reviews")) return "reviews";
    if (pathname?.startsWith("/review")) return "submit";
    if (pathname?.startsWith("/profile")) return "profile";
    if (pathname?.startsWith("/about")) return "about";
    return "shoes";
  };

  const activeTab = getActiveTab();

  return (
    <header className="bg-white border-b-2 border-black sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-2xl tracking-tighter hover:opacity-80 transition-all relative group"
            >
              <span className="text-[#007bff]">RUN</span>
              <span className="group-hover:text-[#007bff] transition-colors">RATED</span>
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#007bff] group-hover:w-full transition-all duration-300"></div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              href="/shoes" 
              className={cn(
                "tracking-wider transition-all relative py-2",
                activeTab === "shoes"
                  ? "text-[#007bff]"
                  : "text-neutral-600 hover:text-[#007bff]"
              )}
            >
              SHOES
              {activeTab === "shoes" && (
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-[#007bff] shadow-blue-sm"></div>
              )}
            </Link>
            <Link 
              href="/reviews" 
              className={cn(
                "tracking-wider transition-all relative py-2",
                activeTab === "reviews"
                  ? "text-[#007bff]"
                  : "text-neutral-600 hover:text-[#007bff]"
              )}
            >
              REVIEWS
              {activeTab === "reviews" && (
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-[#007bff] shadow-blue-sm"></div>
              )}
            </Link>
            <Link 
              href="/review" 
              className={cn(
                "tracking-wider transition-all relative py-2",
                activeTab === "submit"
                  ? "text-[#007bff]"
                  : "text-neutral-600 hover:text-[#007bff]"
              )}
            >
              SUBMIT
              {activeTab === "submit" && (
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-[#007bff] shadow-blue-sm"></div>
              )}
            </Link>
            <Link 
              href="/about" 
              className={cn(
                "tracking-wider transition-all relative py-2",
                activeTab === "about"
                  ? "text-[#007bff]"
                  : "text-neutral-600 hover:text-[#007bff]"
              )}
            >
              ABOUT
              {activeTab === "about" && (
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-[#007bff] shadow-blue-sm"></div>
              )}
            </Link>
          </nav>

          {/* User Actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href="/profile"
                  className="hidden lg:flex tracking-wider text-neutral-600 hover:text-[#007bff] transition-colors relative py-2"
                >
                  PROFILE
                  {activeTab === "profile" && (
                    <div className="absolute -bottom-2 left-0 right-0 h-1 bg-[#007bff] shadow-blue-sm"></div>
                  )}
                </Link>
                <Button
                  onClick={logout}
                  variant="ghost"
                  size="sm"
                  className="hidden lg:flex tracking-wider hover:bg-[#007bff] hover:text-white transition-all border-2 border-transparent hover:border-[#007bff] shadow-sm hover:shadow-blue-sm rounded-none"
                >
                  LOGOUT
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="hidden lg:flex tracking-wider hover:bg-[#007bff] hover:text-white transition-all border-2 border-transparent hover:border-[#007bff] shadow-sm hover:shadow-blue-sm rounded-none"
                asChild
              >
                <Link href="/login">LOGIN</Link>
              </Button>
            )}

            {/* Unit Toggles */}
            <div className="hidden sm:flex items-center gap-2 ml-6">
              {/* Distance Toggle - MI on left, KM on right */}
              <div className="flex items-center gap-0 border-2 border-black overflow-hidden">
                <button
                  onClick={() => distanceUnit !== "miles" && toggleDistanceUnit()}
                  className={cn(
                    "px-3 py-1.5 transition-all tracking-wider text-xs",
                    distanceUnit === "miles"
                      ? "gradient-blue-vibrant text-white hover:opacity-90"
                      : "hover:bg-[#e6f2ff] hover:text-[#007bff]"
                  )}
                >
                  MI
                </button>
                <button
                  onClick={() => distanceUnit !== "kilometers" && toggleDistanceUnit()}
                  className={cn(
                    "px-3 py-1.5 transition-all tracking-wider text-xs",
                    distanceUnit === "kilometers"
                      ? "gradient-blue-vibrant text-white hover:opacity-90"
                      : "hover:bg-[#e6f2ff] hover:text-[#007bff]"
                  )}
                >
                  KM
                </button>
              </div>
              {/* Weight Toggle - LBS on left, KG on right */}
              <div className="flex items-center gap-0 border-2 border-black overflow-hidden">
                <button
                  onClick={() => weightUnit !== "lbs" && toggleWeightUnit()}
                  className={cn(
                    "px-3 py-1.5 transition-all tracking-wider text-xs",
                    weightUnit === "lbs"
                      ? "gradient-blue-vibrant text-white hover:opacity-90"
                      : "hover:bg-[#e6f2ff] hover:text-[#007bff]"
                  )}
                >
                  LBS
                </button>
                <button
                  onClick={() => weightUnit !== "kg" && toggleWeightUnit()}
                  className={cn(
                    "px-3 py-1.5 transition-all tracking-wider text-xs",
                    weightUnit === "kg"
                      ? "gradient-blue-vibrant text-white hover:opacity-90"
                      : "hover:bg-[#e6f2ff] hover:text-[#007bff]"
                  )}
                >
                  KG
                </button>
              </div>
            </div>

            {/* Mobile menu */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden hover:bg-[#007bff] hover:text-white transition-all rounded-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="size-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t-2 border-black py-4 space-y-4">
            <Link
              href="/shoes"
              className={cn(
                "block tracking-wider transition-all relative py-2",
                activeTab === "shoes"
                  ? "text-[#007bff]"
                  : "text-neutral-600 hover:text-[#007bff]"
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              SHOES
              {activeTab === "shoes" && (
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-[#007bff]"></div>
              )}
            </Link>
            <Link
              href="/reviews"
              className={cn(
                "block tracking-wider transition-all relative py-2",
                activeTab === "reviews"
                  ? "text-[#007bff]"
                  : "text-neutral-600 hover:text-[#007bff]"
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              REVIEWS
              {activeTab === "reviews" && (
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-[#007bff]"></div>
              )}
            </Link>
            <Link
              href="/review"
              className={cn(
                "block tracking-wider transition-all relative py-2",
                activeTab === "submit"
                  ? "text-[#007bff]"
                  : "text-neutral-600 hover:text-[#007bff]"
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              SUBMIT
              {activeTab === "submit" && (
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-[#007bff]"></div>
              )}
            </Link>
            <Link
              href="/about"
              className={cn(
                "block tracking-wider transition-all relative py-2",
                activeTab === "about"
                  ? "text-[#007bff]"
                  : "text-neutral-600 hover:text-[#007bff]"
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              ABOUT
              {activeTab === "about" && (
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-[#007bff]"></div>
              )}
            </Link>
            {/* Unit Toggles - Mobile */}
            <div className="flex items-center gap-2 py-2">
              {/* Distance Toggle - MI on left, KM on right */}
              <div className="flex items-center gap-0 border-2 border-black overflow-hidden">
                <button
                  onClick={() => distanceUnit !== "miles" && toggleDistanceUnit()}
                  className={cn(
                    "px-3 py-1.5 transition-all tracking-wider text-xs",
                    distanceUnit === "miles"
                      ? "gradient-blue-vibrant text-white hover:opacity-90"
                      : "hover:bg-[#e6f2ff] hover:text-[#007bff]"
                  )}
                >
                  MI
                </button>
                <button
                  onClick={() => distanceUnit !== "kilometers" && toggleDistanceUnit()}
                  className={cn(
                    "px-3 py-1.5 transition-all tracking-wider text-xs",
                    distanceUnit === "kilometers"
                      ? "gradient-blue-vibrant text-white hover:opacity-90"
                      : "hover:bg-[#e6f2ff] hover:text-[#007bff]"
                  )}
                >
                  KM
                </button>
              </div>
              {/* Weight Toggle - LBS on left, KG on right */}
              <div className="flex items-center gap-0 border-2 border-black overflow-hidden">
                <button
                  onClick={() => weightUnit !== "lbs" && toggleWeightUnit()}
                  className={cn(
                    "px-3 py-1.5 transition-all tracking-wider text-xs",
                    weightUnit === "lbs"
                      ? "gradient-blue-vibrant text-white hover:opacity-90"
                      : "hover:bg-[#e6f2ff] hover:text-[#007bff]"
                  )}
                >
                  LBS
                </button>
                <button
                  onClick={() => weightUnit !== "kg" && toggleWeightUnit()}
                  className={cn(
                    "px-3 py-1.5 transition-all tracking-wider text-xs",
                    weightUnit === "kg"
                      ? "gradient-blue-vibrant text-white hover:opacity-90"
                      : "hover:bg-[#e6f2ff] hover:text-[#007bff]"
                  )}
                >
                  KG
                </button>
              </div>
            </div>
            {user ? (
              <>
                <Link
                  href="/profile"
                  className="block tracking-wider text-neutral-600 hover:text-[#007bff] transition-colors relative py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  PROFILE
                  {activeTab === "profile" && (
                    <div className="absolute -bottom-2 left-0 right-0 h-1 bg-[#007bff]"></div>
                  )}
                </Link>
                <Button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  variant="ghost"
                  size="sm"
                  className="tracking-wider hover:bg-[#007bff] hover:text-white transition-all w-full justify-start rounded-none"
                >
                  LOGOUT
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="tracking-wider hover:bg-[#007bff] hover:text-white transition-all w-full justify-start rounded-none"
                asChild
              >
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  LOGIN
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
