const BASE_URL = "http://localhost:3001";

export async function fetchShoes() {
  const res = await fetch(`${BASE_URL}/shoes`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch shoes");
  return res.json();
}

export async function fetchReviews() {
  const res = await fetch(`${BASE_URL}/reviews`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch reviews");
  return res.json();
}
