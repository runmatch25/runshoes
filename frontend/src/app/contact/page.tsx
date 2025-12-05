import React from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 py-16 lg:py-24">
        {/* Header */}
        <div className="mb-12 animate-slide-up">
          <div className="inline-block px-4 py-1.5 border-2 border-[#007bff] mb-6">
            <span className="tracking-widest font-bold text-sm">GET IN TOUCH</span>
          </div>
          <h1 
            className="text-5xl lg:text-7xl leading-[0.9] mb-6" 
            style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.02em' }}
          >
            CONTACT<br />
            <span className="text-[#007bff] relative">
              US
              <div className="absolute -bottom-2 left-0 w-24 h-1 bg-[#007bff]"></div>
            </span>
          </h1>
        </div>

        {/* Content */}
        <div className="max-w-2xl animate-fade-in animate-delay-200">
          <div className="p-8 border-2 border-neutral-200 bg-neutral-50 shadow-sm hover:border-[#007bff] transition-colors duration-300">
            <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>
              WE WANT TO HEAR FROM YOU
            </h2>
            <p className="text-lg text-neutral-600 mb-8 leading-relaxed">
              Have a question, suggestion, or just want to say hello? We're always looking for ways to improve RunRated and help the running community.
            </p>
            
            <div className="flex flex-col items-start gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-white p-3 border-2 border-neutral-200 rounded-none">
                  <Mail className="size-6 text-[#007bff]" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500 tracking-wider font-bold uppercase mb-1">Email Us At</p>
                  <a href="mailto:runmatch25@gmail.com" className="text-xl font-medium hover:text-[#007bff] transition-colors">
                    runmatch25@gmail.com
                  </a>
                </div>
              </div>
              
              <Button 
                className="gradient-blue-vibrant text-white hover:opacity-90 px-8 h-12 tracking-wider rounded-none shadow-blue-md transition-all mt-4" 
                asChild
              >
                <a href="mailto:runmatch25@gmail.com">
                  SEND EMAIL
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

