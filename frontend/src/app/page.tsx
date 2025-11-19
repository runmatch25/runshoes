import Link from "next/link";
import { fetchShoes } from "../lib/api";
import Footer from "@/components/Footer";
import ShoeCard from "@/components/ShoeCard";
import { ScrollingStats } from "@/components/ScrollingStats";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight } from "lucide-react";

type Shoe = {
  id: number;
  brand: string;
  model: string;
  type: string;
  imageUrl?: string | null;
  reviews?: { rating: number; comment?: string; createdAt?: string }[];
};

function averageRating(reviews: { rating: number }[] | undefined) {
  if (!reviews || reviews.length === 0) return 0;
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
}

function latestReviewDate(reviews?: { createdAt?: string }[] | undefined): string | null {
  if (!reviews || reviews.length === 0) return null;
  const dates = reviews
    .map((r) => (r.createdAt ? new Date(r.createdAt) : null))
    .filter((d): d is Date => d instanceof Date && !Number.isNaN(d.getTime()));
  if (dates.length === 0) return null;
  const latest = new Date(Math.max(...dates.map((d) => d.getTime())));
  return latest.toISOString();
}

export default async function HomePage() {
  const shoes: Shoe[] = await fetchShoes();

  // Compute average ratings and pick top 5
  const withAvg = shoes.map((s) => ({
    ...s,
    avg: averageRating(s.reviews),
  }));

  const top5 = withAvg
    .sort((a, b) => b.avg - a.avg || b.reviews!.length - a.reviews!.length)
    .slice(0, 5);

  // Compute most recently reviewed shoes (by latest review createdAt)
  const withLatest = shoes
    .map((s) => ({
      ...s,
      latestReviewISO: latestReviewDate(s.reviews),
    }))
    .filter((s) => s.latestReviewISO !== null) as (Shoe & { latestReviewISO: string })[];

  const recentTop10 = withLatest
    .sort((a, b) => new Date(b.latestReviewISO).getTime() - new Date(a.latestReviewISO).getTime())
    .slice(0, 10);

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        {/* Hero Section */}
        <section className="py-16 lg:py-24 border-b-2 border-black relative overflow-hidden">
          {/* Animated background accent */}
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-5 pointer-events-none">
            <div className="w-full h-full gradient-blue-light"></div>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
            {/* Left Content */}
            <div className="animate-slide-in-left">
              <div className="mb-8">
                <div className="inline-block px-4 py-1.5 border-2 border-[#007bff] mb-6 hover:bg-[#007bff] hover:text-white transition-all duration-300 cursor-default">
                  <span className="tracking-widest">COMMUNITY DRIVEN</span>
                </div>
                <h1 
                  className="text-6xl lg:text-8xl leading-[0.9] mb-6 animate-slide-up" 
                  style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.02em' }}
                >
                  EVERY MILE.<br />
                  EVERY SHOE.<br />
                  <span className="text-[#007bff] relative">
                    REAL REVIEWS.
                    <div className="absolute -bottom-2 left-0 w-24 h-1 bg-[#007bff]"></div>
                  </span>
                </h1>
                <p className="text-neutral-600 text-lg mb-8 max-w-md leading-relaxed animate-fade-in animate-delay-200">
                  Join thousands of runners sharing their experiences. Compare results across paces, distances, and running styles.
                </p>
              </div>

              {/* Search */}
              <div className="border-2 border-black flex items-center mb-8 hover:shadow-black-crisp transition-all duration-300 animate-fade-in animate-delay-300">
                <Search className="size-5 ml-4 text-neutral-400" />
                <Input
                  type="text"
                  placeholder="SEARCH BY BRAND OR MODEL"
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 tracking-wider placeholder:text-neutral-400 rounded-none"
                />
                <Button className="gradient-blue-vibrant text-white hover:opacity-90 rounded-none h-12 px-8 tracking-wider transition-all">
                  SEARCH
                </Button>
              </div>

              <Button 
                className="bg-black text-white hover:bg-[#007bff] w-full lg:w-auto px-12 h-14 tracking-wider group transition-all shadow-black-crisp hover:shadow-blue-md animate-fade-in animate-delay-400 rounded-none" 
                asChild
              >
                <Link href="/review">
                  SUBMIT REVIEW
                  <ArrowRight className="size-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>

            {/* Right Image */}
            <div className="relative animate-slide-in-right">
              <div className="aspect-[4/5] bg-gradient-to-br from-[#e6f2ff] to-[#b3d9ff] overflow-hidden border-2 border-black shadow-black-crisp-lg hover:shadow-blue-lg transition-all duration-500">
                <img
                  src="https://images.unsplash.com/photo-1758506971661-33fe941ca1e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydW5uZXIlMjB0cmFjayUyMGJsYWNrJTIwd2hpdGV8ZW58MXx8fHwxNzYzNDE2NjU1fDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Runner"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                />
              </div>
              <div className="absolute bottom-4 right-4 bg-white px-3 py-1.5 border-2 border-black shadow-black-crisp">
                <span className="tracking-wider">UNSPLASH</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Scrolling Stats Ticker */}
      <ScrollingStats />

      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        {/* Top 5 Rated */}
        <section className="py-16 lg:py-24 border-b-2 border-neutral-200 gradient-gray-subtle">
          <div className="flex items-end justify-between mb-12 animate-fade-in">
            <div>
              <span className="tracking-widest text-[#007bff] block mb-2 font-bold">001</span>
              <h2 className="text-4xl lg:text-5xl tracking-tighter relative inline-block font-bold">
                TOP RATED
                <div className="absolute -bottom-1 left-0 w-16 h-1 bg-[#007bff]"></div>
              </h2>
            </div>
            <Button 
              variant="ghost" 
              className="hover:bg-[#007bff] hover:text-white group tracking-wider transition-all border-2 border-transparent hover:border-[#007bff] rounded-none" 
              asChild
            >
              <Link href="/shoes">
                VIEW ALL
                <ArrowRight className="size-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
          
          {top5.length === 0 ? (
            <p className="text-center text-neutral-400">No shoes available yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {top5.map((shoe, index) => (
                <div 
                  key={shoe.id}
                  className="animate-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ShoeCard
                    id={shoe.id}
                    brand={shoe.brand}
                    model={shoe.model}
                    type={shoe.type}
                    imageUrl={shoe.imageUrl}
                    reviews={shoe.reviews}
                    avgRating={shoe.avg}
                    position={index}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recently Reviewed */}
        <section className="py-16 lg:py-24">
          <div className="flex items-end justify-between mb-12 animate-fade-in">
            <div>
              <span className="tracking-widest text-[#007bff] block mb-2 font-bold">002</span>
              <h2 className="text-4xl lg:text-5xl tracking-tighter relative inline-block font-bold">
                RECENT REVIEWS
                <div className="absolute -bottom-1 left-0 w-16 h-1 bg-[#007bff]"></div>
              </h2>
            </div>
            <Button 
              variant="ghost" 
              className="hover:bg-[#007bff] hover:text-white group tracking-wider transition-all border-2 border-transparent hover:border-[#007bff] rounded-none" 
              asChild
            >
              <Link href="/reviews">
                VIEW ALL
                <ArrowRight className="size-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
          
          {recentTop10.length === 0 ? (
            <p className="text-center text-neutral-400">No recent reviews yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentTop10.slice(0, 4).map((shoe, idx) => (
                <div 
                  key={`${shoe.id}-${idx}`}
                  className="animate-scale-in"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <ShoeCard
                    id={shoe.id}
                    brand={shoe.brand}
                    model={shoe.model}
                    type={shoe.type}
                    imageUrl={shoe.imageUrl}
                    reviews={shoe.reviews}
                    avgRating={averageRating(shoe.reviews)}
                    latestReviewDate={shoe.latestReviewISO}
                    showDate
                    position={idx}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <Footer />
    </main>
  );
}
