import { redirect } from "next/navigation";

export default function TopShoesPage() {
  redirect("/shoes?sort=highest_rating");
}

