import Link from "next/link";
import { Input } from "@/components/ui/input";

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-white mt-20">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          <div>
            <h3 className="tracking-wider mb-6">LEGAL</h3>
            <div className="space-y-3">
              <Link href="/legal" className="block text-neutral-400 hover:text-white transition-colors tracking-wide">
                DISCLAIMER
              </Link>
              <Link href="/privacy" className="block text-neutral-400 hover:text-white transition-colors tracking-wide">
                PRIVACY
              </Link>
              <Link href="/about" className="block text-neutral-400 hover:text-white transition-colors tracking-wide">
                ABOUT
              </Link>
            </div>
          </div>
          <div>
            <h3 className="tracking-wider mb-6">COMMUNITY</h3>
            <div className="space-y-3">
              <a href="#" className="block text-neutral-400 hover:text-white transition-colors tracking-wide">
                GUIDELINES
              </a>
              <a href="#" className="block text-neutral-400 hover:text-white transition-colors tracking-wide">
                FAQ
              </a>
            </div>
          </div>
          <div>
            <h3 className="tracking-wider mb-6">SOCIAL</h3>
            <div className="space-y-3">
              <a href="#" className="block text-neutral-400 hover:text-white transition-colors tracking-wide">
                TWITTER
              </a>
              <a href="#" className="block text-neutral-400 hover:text-white transition-colors tracking-wide">
                INSTAGRAM
              </a>
              <a href="#" className="block text-neutral-400 hover:text-white transition-colors tracking-wide">
                GITHUB
              </a>
            </div>
          </div>
          <div>
            <h3 className="tracking-wider mb-6">NEWSLETTER</h3>
            <p className="text-neutral-400 mb-4 tracking-wide">
              Weekly insights from the running community
            </p>
            <div className="border border-white/20">
              <Input
                type="email"
                placeholder="EMAIL"
                className="border-0 bg-transparent text-white placeholder:text-neutral-500 focus-visible:ring-0 focus-visible:ring-offset-0 tracking-wider"
              />
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-neutral-400 tracking-wide">© 2025 RUNRATED. ALL RIGHTS RESERVED.</p>
            <div className="text-2xl tracking-tighter">
              <span className="text-[#007bff]">RUN</span>
              <span className="text-white">RATED</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
