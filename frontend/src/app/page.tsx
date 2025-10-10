import { fetchShoes } from "../lib/api";

export default async function HomePage() {
  const shoes = await fetchShoes();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Popular Running Shoesss</h1>
      <ul>
        {shoes.map((shoe: any) => (
          <li key={shoe.id}>
            <strong>{shoe.brand} {shoe.model}</strong> — {shoe.type}
          </li>
        ))}
      </ul>
    </div>
  );
}
