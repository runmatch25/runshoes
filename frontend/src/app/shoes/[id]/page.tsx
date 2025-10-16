// Do NOT use "use client" here
import ShoeClient from "./ShoeClient";

export default async function ShoePage({ params }: { params: { id: string } }) {
  const awaitedParams = await params;
  const shoeId = Number(awaitedParams.id);
  return <ShoeClient shoeId={shoeId} />;
}
