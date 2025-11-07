import Link from "next/link";
import { fetchShoes } from "../lib/api";
import FrontpageCarousel from "@/components/FrontpageCarousel";
import Footer from "@/components/Footer";
import ShoeCard from "@/components/ShoeCard";
import RecentReviewsCarousel from "@/components/RecentReviewsCarousel";

type Shoe = {
  id: number;
  brand: string;
  model: string;
  type: string;
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
    <main style={{ padding: 0 }}>
      <FrontpageCarousel />

      {/* Review Promo Section */}
      <section style={{
        padding: '56px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ maxWidth: 880, textAlign: 'center' }}>
          <h1 style={{
            margin: 0,
            fontSize: 48,
            fontWeight: 800,
            letterSpacing: 0.5,
            lineHeight: 1.15,
            color: 'var(--foreground)',
          }}>
            Join Thousands of Runners Improving Their Training
          </h1>
          <p style={{
            marginTop: 14,
            fontSize: 18,
            color: 'var(--muted-foreground)',
            lineHeight: 1.6,
          }}>
            Your experience helps others make smarter choices. Review your shoes, compare results, and see which models perform best across different paces and distances.
          </p>
          <div style={{ marginTop: 20 }}>
            <Link href="/review" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
              borderRadius: 9999,
              padding: '12px 20px',
              textDecoration: 'none',
              fontWeight: 700,
            }}>
              Review your shoe
              <span style={{ display: 'inline-block', transform: 'translateY(1px)' }}>➜</span>
            </Link>
          </div>
        </div>
      </section>

      <h1 style={{ textAlign: 'center', marginTop: 24, marginBottom: 18, color: 'var(--foreground)' }}>Top 5 Rated Shoes</h1>
      {top5.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--foreground)' }}>No shoes available yet.</p>
      ) : (
        <ul style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '1.5rem',
          listStyle: 'none',
          padding: 0,
          margin: 0,
          alignItems: 'stretch',
        }}>
          {top5.map((shoe) => (
            <li
              key={shoe.id}
              style={{
                minWidth: 210,
                maxWidth: 270,
                flex: '1 1 210px',
                display: 'flex',
              }}
            >
              <ShoeCard
                id={shoe.id}
                brand={shoe.brand}
                model={shoe.model}
                type={shoe.type}
                reviews={shoe.reviews}
                avgRating={shoe.avg}
              />
            </li>
          ))}
        </ul>
      )}
      <section style={{ marginTop: 44 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 18, color: 'var(--foreground)' }}>Most Recently Reviewed Shoes</h2>
        {recentTop10.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--foreground)' }}>No recent reviews yet.</p>
        ) : (
          <RecentReviewsCarousel
            shoes={recentTop10.map((shoe) => ({
              ...shoe,
              latestReviewISO: shoe.latestReviewISO,
            }))}
          />
        )}
      </section>
      <Footer />
    </main>
  );
}
