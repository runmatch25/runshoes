import Link from "next/link";
import { fetchShoes } from "../lib/api";
import { formatDateISOToMMDDYYYY } from "../lib/formatDate";

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

  const recentTop5 = withLatest
    .sort((a, b) => new Date(b.latestReviewISO).getTime() - new Date(a.latestReviewISO).getTime())
    .slice(0, 5);

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Top 5 Rated Shoes</h1>
      {top5.length === 0 ? (
        <p>No shoes available yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {top5.map((shoe) => (
            <li
              key={shoe.id}
              style={{
                marginBottom: "1rem",
                padding: "1rem",
                borderRadius: 8,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <Link
                href={`/shoes/${shoe.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <strong>
                  {shoe.brand} {shoe.model}
                </strong>
                  <div style={{ marginTop: 6, color: "#5C5C5C" }}>
                  {shoe.type} • {shoe.reviews?.length ?? 0} review
                  {shoe.reviews && shoe.reviews.length !== 1 ? "s" : ""} •{' '}
                  <span style={{ fontWeight: 700 }}>{shoe.avg.toFixed(1)}</span> ⭐
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <section style={{ marginTop: 32 }}>
        <h2>Most Recently Reviewed Shoes</h2>
        {recentTop5.length === 0 ? (
          <p>No recent reviews yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {recentTop5.map((shoe) => (
              <li
                key={shoe.id}
                style={{
                  marginBottom: "1rem",
                  padding: "1rem",
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <Link href={`/shoes/${shoe.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <strong>
                    {shoe.brand} {shoe.model}
                  </strong>
                    <div style={{ marginTop: 6, color: "#5C5C5C" }}>
                    {shoe.type} • {shoe.reviews?.length ?? 0} review
                    {shoe.reviews && shoe.reviews.length !== 1 ? "s" : ""} •{' '}
                    <span style={{ fontWeight: 700 }}>{formatDateISOToMMDDYYYY(shoe.latestReviewISO)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
