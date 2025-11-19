import Link from "next/link";
import { Users, Target, Heart, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
        {/* Hero */}
        <section className="py-16 lg:py-24 border-b-2 border-neutral-200 relative overflow-hidden">
          {/* Animated background accent */}
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-5 pointer-events-none">
            <div className="w-full h-full gradient-blue-light"></div>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
            <div className="animate-slide-in-left">
              <span className="tracking-widest text-[#007bff] block mb-2 font-bold">OUR MISSION</span>
              <h1 
                className="text-5xl lg:text-7xl leading-[0.9] mb-6 relative" 
                style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.02em' }}
              >
                BUILT BY<br />
                RUNNERS,<br />
                <span className="text-[#007bff] relative">
                  FOR RUNNERS
                  <div className="absolute -bottom-2 left-0 w-24 h-1 bg-[#007bff]"></div>
                </span>
              </h1>
              <p className="text-neutral-600 text-lg leading-relaxed animate-fade-in animate-delay-200">
                RunRated is a community-driven platform where runners share honest reviews of running shoes. We believe in transparent, real-world feedback that helps every runner find their perfect shoe.
              </p>
            </div>

            <div className="aspect-square bg-gradient-to-br from-[#e6f2ff] to-[#b3d9ff] overflow-hidden border-2 border-black shadow-black-crisp-lg hover:shadow-blue-lg transition-all duration-500 animate-slide-in-right">
              <img
                src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydW5uZXJzJTIwZ3JvdXB8ZW58MXx8fHwxNzYzNDE2NjU1fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Running community"
                className="w-full h-full object-cover grayscale"
              />
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 lg:py-24 border-b-2 border-neutral-200 gradient-gray-subtle">
          <div className="mb-12 animate-fade-in">
            <span className="tracking-widest text-[#007bff] block mb-2 font-bold">WHAT WE STAND FOR</span>
            <h2 className="text-4xl lg:text-5xl tracking-tighter font-bold relative inline-block">
              OUR VALUES
              <div className="absolute -bottom-1 left-0 w-16 h-1 bg-[#007bff]"></div>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="border-2 border-neutral-200 p-8 hover:border-[#007bff] hover:shadow-blue-md transition-all duration-300 animate-scale-in">
              <Users className="size-12 text-[#007bff] mb-6" />
              <h3 className="text-2xl mb-4 tracking-wider font-bold">COMMUNITY FIRST</h3>
              <p className="text-neutral-600 leading-relaxed">
                Every review comes from real runners sharing genuine experiences. No sponsored content, no biased ratings—just honest feedback from the community.
              </p>
            </div>

            <div className="border-2 border-neutral-200 p-8 hover:border-[#007bff] hover:shadow-blue-md transition-all duration-300 animate-scale-in animate-delay-100">
              <Target className="size-12 text-[#007bff] mb-6" />
              <h3 className="text-2xl mb-4 tracking-wider font-bold">TRANSPARENCY</h3>
              <p className="text-neutral-600 leading-relaxed">
                We maintain complete transparency in our review process. Every rating, every comment is visible and accessible to help you make informed decisions.
              </p>
            </div>

            <div className="border-2 border-neutral-200 p-8 hover:border-[#007bff] hover:shadow-blue-md transition-all duration-300 animate-scale-in animate-delay-200">
              <Heart className="size-12 text-[#007bff] mb-6" />
              <h3 className="text-2xl mb-4 tracking-wider font-bold">PASSION FOR RUNNING</h3>
              <p className="text-neutral-600 leading-relaxed">
                Built by runners who understand the importance of finding the right shoe. We're passionate about helping every runner perform their best.
              </p>
            </div>

            <div className="border-2 border-neutral-200 p-8 hover:border-[#007bff] hover:shadow-blue-md transition-all duration-300 animate-scale-in animate-delay-300">
              <TrendingUp className="size-12 text-[#007bff] mb-6" />
              <h3 className="text-2xl mb-4 tracking-wider font-bold">CONTINUOUS IMPROVEMENT</h3>
              <p className="text-neutral-600 leading-relaxed">
                We're constantly evolving based on community feedback. Your suggestions help us build a better platform for all runners.
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 lg:py-24 border-b-2 border-neutral-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center animate-scale-in">
              <div className="text-5xl lg:text-6xl mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                <span className="text-[#007bff]">2,500+</span>
              </div>
              <p className="text-neutral-600 tracking-wider font-bold">REVIEWS</p>
            </div>

            <div className="text-center animate-scale-in animate-delay-100">
              <div className="text-5xl lg:text-6xl mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                <span className="text-[#007bff]">1,200+</span>
              </div>
              <p className="text-neutral-600 tracking-wider font-bold">RUNNERS</p>
            </div>

            <div className="text-center animate-scale-in animate-delay-200">
              <div className="text-5xl lg:text-6xl mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                <span className="text-[#007bff]">450+</span>
              </div>
              <p className="text-neutral-600 tracking-wider font-bold">SHOE MODELS</p>
            </div>

            <div className="text-center animate-scale-in animate-delay-300">
              <div className="text-5xl lg:text-6xl mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                <span className="text-[#007bff]">35+</span>
              </div>
              <p className="text-neutral-600 tracking-wider font-bold">BRANDS</p>
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="py-16 lg:py-24 border-b-2 border-neutral-200">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 animate-fade-in">
              <span className="tracking-widest text-[#007bff] block mb-2 font-bold">THE STORY</span>
              <h2 className="text-4xl lg:text-5xl tracking-tighter mb-6 font-bold relative inline-block">
                HOW IT STARTED
                <div className="absolute -bottom-1 left-0 w-16 h-1 bg-[#007bff]"></div>
              </h2>
            </div>

            <div className="space-y-6 text-neutral-600 leading-relaxed text-lg">
              <p>
                RunRated was born from a simple frustration: finding honest, detailed reviews of running shoes was surprisingly difficult. Most reviews were either sponsored content or lacked the specific details runners actually care about.
              </p>
              <p>
                We wanted to create a space where runners could share their real experiences—the good, the bad, and everything in between. A place where you could learn from someone who runs the same pace as you, on the same surfaces, for the same distances.
              </p>
              <p>
                Today, RunRated has grown into a thriving community of runners helping runners. Every review brings us closer to our goal: helping every runner find their perfect shoe.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 lg:py-24">
          <div className="text-center max-w-2xl mx-auto animate-fade-in">
            <h2 className="text-4xl lg:text-5xl tracking-tighter mb-6 font-bold relative inline-block">
              JOIN THE COMMUNITY
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-24 h-1 bg-[#007bff]"></div>
            </h2>
            <p className="text-neutral-600 text-lg mb-8 leading-relaxed">
              Share your experiences, help fellow runners, and find your next perfect pair of shoes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="gradient-blue-vibrant text-white hover:opacity-90 px-12 h-14 tracking-wider rounded-none shadow-blue-md transition-all" 
                asChild
              >
                <Link href="/review">SUBMIT A REVIEW</Link>
              </Button>
              <Button 
                className="bg-black text-white hover:bg-[#007bff] px-12 h-14 tracking-wider rounded-none shadow-black-crisp hover:shadow-blue-md transition-all" 
                asChild
              >
                <Link href="/shoes">BROWSE SHOES</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
