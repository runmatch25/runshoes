import React from "react";

export default function LegalDisclaimerPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 py-16 lg:py-24">
        {/* Header */}
        <div className="mb-12 animate-slide-up">
          <div className="inline-block px-4 py-1.5 border-2 border-[#007bff] mb-6">
            <span className="tracking-widest font-bold text-sm">LEGAL INFO</span>
          </div>
          <h1 
            className="text-5xl lg:text-7xl leading-[0.9] mb-6" 
            style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.02em' }}
          >
            LEGAL<br />
            <span className="text-[#007bff] relative">
              DISCLAIMER
              <div className="absolute -bottom-2 left-0 w-24 h-1 bg-[#007bff]"></div>
            </span>
          </h1>
        </div>

        {/* Content */}
        <div className="max-w-3xl animate-fade-in animate-delay-200 space-y-8 text-lg text-neutral-600 leading-relaxed">
          <div className="p-8 border-2 border-neutral-200 bg-neutral-50 shadow-sm">
            <p className="mb-6">
              The information provided on RunRated is for general informational purposes only. All information on the site is provided in good faith, however we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the site.
            </p>
            
            <h2 className="text-2xl text-black font-bold mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>
              NO ENDORSEMENT
            </h2>
            <p className="mb-6">
              Products and brand names mentioned on this website are for identification purposes only. Reference to any specific commercial product, process, or service by trade name, trademark, manufacturer, or otherwise does not constitute or imply an endorsement, recommendation, or favoring by RunRated.
            </p>

            <h2 className="text-2xl text-black font-bold mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>
              USE AT YOUR OWN RISK
            </h2>
            <p className="mb-6">
              Under no circumstance shall we have any liability to you for any loss or damage of any kind incurred as a result of the use of the site or reliance on any information provided on the site. Your use of the site and your reliance on any information on the site is solely at your own risk.
            </p>
            
            <div className="pt-6 border-t border-neutral-300 mt-8 text-sm text-neutral-500">
              &copy; {new Date().getFullYear()} RunRated. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
