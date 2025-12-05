import React from "react";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 py-16 lg:py-24">
        {/* Header */}
        <div className="mb-12 animate-slide-up">
          <div className="inline-block px-4 py-1.5 border-2 border-[#007bff] mb-6">
            <span className="tracking-widest font-bold text-sm">DATA PROTECTION</span>
          </div>
          <h1 
            className="text-5xl lg:text-7xl leading-[0.9] mb-6" 
            style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.02em' }}
          >
            PRIVACY<br />
            <span className="text-[#007bff] relative">
              POLICY
              <div className="absolute -bottom-2 left-0 w-24 h-1 bg-[#007bff]"></div>
            </span>
          </h1>
        </div>

        {/* Content */}
        <div className="max-w-3xl animate-fade-in animate-delay-200 space-y-8 text-lg text-neutral-600 leading-relaxed">
          <div className="p-8 border-2 border-neutral-200 bg-neutral-50 shadow-sm">
            <p className="mb-6">
              At RunRated, we value your trust and are committed to protecting your privacy. This policy outlines the types of information we collect, how we use it, and the measures we take to safeguard your data.
            </p>
            
            <h2 className="text-2xl text-black font-bold mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>
              INFORMATION WE COLLECT
            </h2>
            <p className="mb-4">
              We collect information that you voluntarily provide to us when you create an account or post a review:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>Account Information:</strong> Name and email address used for authentication.</li>
              <li><strong>Runner Profile:</strong> Optional details such as running pace and weight preferences to help contextualize your reviews for other runners.</li>
              <li><strong>User Content:</strong> Reviews, ratings, comments, preferences (fit, cushion, stability), and photos you post about running shoes.</li>
            </ul>

            <h2 className="text-2xl text-black font-bold mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>
              HOW WE USE YOUR DATA
            </h2>
            <p className="mb-6">
              Your information is used to:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Provide and personalize the RunRated experience.</li>
              <li>Display your reviews and runner profile to the community (email addresses remain private).</li>
              <li>Analyze usage patterns to improve our platform.</li>
            </ul>

            <h2 className="text-2xl text-black font-bold mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>
              DATA SECURITY
            </h2>
            <p className="mb-6">
              We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.
            </p>
            
            <div className="pt-6 border-t border-neutral-300 mt-8 text-sm text-neutral-500">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
