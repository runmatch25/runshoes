import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-10 w-full border-t border-border bg-card text-card-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 text-sm md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 uppercase tracking-[0.18em] text-xs">
          <Link href="/shoes" className="transition hover:text-foreground">Shoes</Link>
          <Link href="/reviews" className="transition hover:text-foreground">Reviews</Link>
          <Link href="/profile" className="transition hover:text-foreground">Profile</Link>
        </div>
        <div className="flex flex-col gap-3 text-sm">
          <Link href="/legal" className="underline-offset-4 hover:underline">Legal Disclaimer</Link>
          <Link href="/privacy" className="underline-offset-4 hover:underline">Privacy Policy</Link>
          <Link href="/about" className="underline-offset-4 hover:underline">About Page</Link>
        </div>
        <div className="flex items-center gap-4 text-card-foreground/80">
          <a href="#" aria-label="Instagram" className="transition hover:text-card-foreground">
            <Instagram className="h-6 w-6" />
          </a>
          <a href="#" aria-label="Twitter" className="transition hover:text-card-foreground">
            <Twitter className="h-6 w-6" />
          </a>
          <a href="#" aria-label="Facebook" className="transition hover:text-card-foreground">
            <Facebook className="h-6 w-6" />
          </a>
        </div>
      </div>
    </footer>
  );
}
