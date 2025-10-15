async function handleFetch(url: string) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch ${url}`);
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export const fetchShoes = () => handleFetch("http://localhost:3001/shoes");
export const fetchReviews = () => handleFetch("http://localhost:3001/reviews");
export const fetchUsers = () => handleFetch("http://localhost:3001/users");
