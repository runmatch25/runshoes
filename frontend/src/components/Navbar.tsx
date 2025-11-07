"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import React, { useEffect, useRef, useState } from "react";
import { Bitcount_Grid_Single } from 'next/font/google';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const bitcount = Bitcount_Grid_Single({ subsets: ['latin'], weight: '400' });

export default function Navbar() {
  const { user, logout } = useAuth();
  const [show, setShow] = useState(true);
  const lastScroll = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      const goingDown = current > lastScroll.current;
      if (current < 10) {
        setShow(true); // Always show at the very top
      } else if (goingDown && current > 40) {
        setShow(false);
      } else if (!goingDown) {
        setShow(true);
      }
      lastScroll.current = current;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const linkClass = "text-xs font-semibold uppercase tracking-[0.18em] text-foreground/90 transition hover:text-foreground";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-md transition-transform duration-500",
        show ? "translate-y-0" : "-translate-y-full"
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center">
          <span className={cn(bitcount.className, "text-2xl text-foreground tracking-widest")}>RUNRATED</span>
        </Link>
        <nav className="hidden gap-8 md:flex">
          <Link href="/shoes" className={linkClass}>Shoes</Link>
          <Link href="/reviews" className={linkClass}>Reviews</Link>
          <Link href="/review" className={linkClass}>Review Shoe</Link>
        </nav>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/profile" className={linkClass}>Profile</Link>
              <Button variant="ghost" size="sm" onClick={logout} className="uppercase tracking-[0.18em] text-xs">
                Logout
              </Button>
            </>
          ) : (
            <Button variant="default" size="sm" className="uppercase tracking-[0.2em] text-xs" asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
