import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
        {/* Hero */}
        <section className="py-16 lg:py-24 border-b-2 border-black relative overflow-hidden bg-[#fafafa]">
          <div className="relative z-10">
            <span className="tracking-widest text-[#007bff] block mb-2 font-bold">RUNNING GUIDE</span>
            <h1 
              className="text-5xl lg:text-7xl leading-[0.9] mb-6 relative" 
              style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.02em' }}
            >
              LEARN THE<br />
              <span className="text-[#007bff] relative">
                BASICS
                <div className="absolute -bottom-2 left-0 w-24 h-1 bg-[#007bff]"></div>
              </span>
            </h1>
            <p className="text-neutral-600 text-lg leading-relaxed max-w-2xl">
              Essential information to help you understand running mechanics and make informed decisions about your gear.
            </p>
          </div>
        </section>

        {/* Pronation Section */}
        <section id="pronation" className="py-16 lg:py-24 border-b-2 border-black">
          <div className="mb-12">
            <span className="tracking-widest text-[#007bff] block mb-2 font-bold">UNDERSTANDING PRONATION</span>
            <h2 
              className="text-4xl lg:text-5xl tracking-tighter font-bold relative inline-block mb-6"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              WHAT IS PRONATION?
              <div className="absolute -bottom-1 left-0 w-16 h-1 bg-[#007bff]"></div>
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start mb-12">
            <div>
              <p className="text-neutral-700 text-lg leading-relaxed mb-6">
                Pronation is the natural inward rolling motion of your foot when it lands on the ground during walking or running. 
                It's your body's way of absorbing shock and adapting to the surface. Understanding your pronation type helps you 
                choose the right running shoes and prevent injuries.
              </p>
              <p className="text-neutral-700 text-lg leading-relaxed mb-6">
                When your foot strikes the ground, it naturally rolls inward to distribute the impact. This movement is essential 
                for shock absorption, but the degree of pronation varies from person to person. Too much or too little pronation 
                can lead to discomfort and injuries over time.
              </p>
            </div>

            {/* Pronation Visual */}
            <div className="bg-white border-2 border-black p-8 shadow-black-crisp">
              <h3 className="text-xl font-bold tracking-widest uppercase mb-6 text-center">PRONATION TYPES</h3>
              <div className="space-y-8">
                {/* Neutral Pronation */}
                <div className="text-center">
                  <div className="mb-4">
                    <svg viewBox="0 0 200 120" className="w-full h-auto">
                      {/* Ground line */}
                      <line x1="0" y1="100" x2="200" y2="100" stroke="#000" strokeWidth="3" />
                      {/* Foot outline - neutral */}
                      <ellipse cx="100" cy="80" rx="50" ry="20" fill="none" stroke="#007bff" strokeWidth="3" />
                      {/* Ankle */}
                      <line x1="100" y1="60" x2="100" y2="40" stroke="#000" strokeWidth="2" />
                      {/* Leg */}
                      <line x1="100" y1="40" x2="100" y2="20" stroke="#000" strokeWidth="2" />
                      {/* Arrow showing neutral roll */}
                      <path d="M 60 80 Q 100 70, 140 80" fill="none" stroke="#4CAF50" strokeWidth="2" markerEnd="url(#arrowhead)" />
                      <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                          <polygon points="0 0, 10 3, 0 6" fill="#4CAF50" />
                        </marker>
                      </defs>
                    </svg>
                  </div>
                  <h4 className="font-bold text-lg mb-2">NEUTRAL</h4>
                  <p className="text-sm text-neutral-600">Moderate inward roll, even wear pattern</p>
                </div>

                {/* Overpronation */}
                <div className="text-center">
                  <div className="mb-4">
                    <svg viewBox="0 0 200 120" className="w-full h-auto">
                      {/* Ground line */}
                      <line x1="0" y1="100" x2="200" y2="100" stroke="#000" strokeWidth="3" />
                      {/* Foot outline - overpronated (tilted inward) */}
                      <ellipse cx="110" cy="85" rx="50" ry="20" fill="none" stroke="#E53935" strokeWidth="3" transform="rotate(-15 110 85)" />
                      {/* Ankle */}
                      <line x1="110" y1="65" x2="115" y2="45" stroke="#000" strokeWidth="2" />
                      {/* Leg */}
                      <line x1="115" y1="45" x2="120" y2="20" stroke="#000" strokeWidth="2" />
                      {/* Arrow showing excessive roll */}
                      <path d="M 70 85 Q 110 75, 150 90" fill="none" stroke="#E53935" strokeWidth="2" markerEnd="url(#arrowhead-red)" />
                      <defs>
                        <marker id="arrowhead-red" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                          <polygon points="0 0, 10 3, 0 6" fill="#E53935" />
                        </marker>
                      </defs>
                    </svg>
                  </div>
                  <h4 className="font-bold text-lg mb-2">OVERPRONATION</h4>
                  <p className="text-sm text-neutral-600">Excessive inward roll, wear on inner edge</p>
                </div>

                {/* Supination */}
                <div className="text-center">
                  <div className="mb-4">
                    <svg viewBox="0 0 200 120" className="w-full h-auto">
                      {/* Ground line */}
                      <line x1="0" y1="100" x2="200" y2="100" stroke="#000" strokeWidth="3" />
                      {/* Foot outline - supinated (tilted outward) */}
                      <ellipse cx="90" cy="85" rx="50" ry="20" fill="none" stroke="#FF8A3D" strokeWidth="3" transform="rotate(15 90 85)" />
                      {/* Ankle */}
                      <line x1="90" y1="65" x2="85" y2="45" stroke="#000" strokeWidth="2" />
                      {/* Leg */}
                      <line x1="85" y1="45" x2="80" y2="20" stroke="#000" strokeWidth="2" />
                      {/* Arrow showing outward roll */}
                      <path d="M 130 85 Q 90 75, 50 90" fill="none" stroke="#FF8A3D" strokeWidth="2" markerEnd="url(#arrowhead-orange)" />
                      <defs>
                        <marker id="arrowhead-orange" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                          <polygon points="0 0, 10 3, 0 6" fill="#FF8A3D" />
                        </marker>
                      </defs>
                    </svg>
                  </div>
                  <h4 className="font-bold text-lg mb-2">SUPINATION</h4>
                  <p className="text-sm text-neutral-600">Insufficient inward roll, wear on outer edge</p>
                </div>
              </div>
            </div>
          </div>

          {/* How to Determine Section */}
          <div className="bg-white border-2 border-black p-8 lg:p-12 shadow-black-crisp">
            <h3 
              className="text-3xl lg:text-4xl font-bold tracking-tighter mb-8"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              HOW TO DETERMINE YOUR PRONATION TYPE
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <h4 className="text-xl font-bold tracking-wider uppercase text-[#007bff] mb-4">1. WET FOOT TEST</h4>
                <p className="text-neutral-700 leading-relaxed mb-4">
                  Step onto a dark surface (like cardboard or dark paper) with wet feet. Look at your footprint:
                </p>
                <ul className="space-y-2 text-neutral-700">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-[#007bff]">•</span>
                    <span><strong>Neutral:</strong> You'll see about half of your arch. The print shows a moderate curve on the inside.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-[#007bff]">•</span>
                    <span><strong>Overpronation:</strong> You'll see almost your entire foot. The print shows a very wide arch or no arch at all.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-[#007bff]">•</span>
                    <span><strong>Supination:</strong> You'll see very little of your arch. The print shows a very narrow curve or mostly just the ball and heel.</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="text-xl font-bold tracking-wider uppercase text-[#007bff] mb-4">2. SHOE WEAR PATTERN</h4>
                <p className="text-neutral-700 leading-relaxed mb-4">
                  Check the bottom of your old running shoes to see where they're most worn:
                </p>
                <ul className="space-y-2 text-neutral-700">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-[#007bff]">•</span>
                    <span><strong>Neutral:</strong> Even wear across the ball of the foot and heel.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-[#007bff]">•</span>
                    <span><strong>Overpronation:</strong> Excessive wear on the inner edge of the heel and under the big toe.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-[#007bff]">•</span>
                    <span><strong>Supination:</strong> Wear on the outer edge of the heel and under the pinky toe.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-[#f7f9fc] border-2 border-black p-6 mt-8">
              <h4 className="text-xl font-bold tracking-wider uppercase mb-4">3. PROFESSIONAL ASSESSMENT</h4>
              <p className="text-neutral-700 leading-relaxed">
                For the most accurate assessment, visit a running specialty store or a podiatrist. They can perform a gait analysis 
                by watching you run on a treadmill or using pressure mapping technology. This professional evaluation will give you 
                the most precise understanding of your pronation pattern and help you select the best shoes for your needs.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24">
          <div className="text-center max-w-2xl mx-auto">
            <h2 
              className="text-4xl lg:text-5xl tracking-tighter mb-6 font-bold relative inline-block"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              READY TO SHARE YOUR REVIEW?
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-24 h-1 bg-[#007bff]"></div>
            </h2>
            <p className="text-neutral-600 text-lg mb-8 leading-relaxed">
              Now that you understand pronation, you can provide more detailed and helpful reviews for the community.
            </p>
            <Button 
              className="bg-black text-white hover:bg-[#007bff] px-12 h-14 tracking-wider rounded-none shadow-black-crisp hover:shadow-blue-md transition-all" 
              asChild
            >
              <Link href="/review">SUBMIT A REVIEW</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

