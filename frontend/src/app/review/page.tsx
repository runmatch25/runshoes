"use client";

import { useRouter, useSearchParams } from "next/navigation";
import ReviewWizard from "@/components/ReviewWizard";

export default function ReviewWizardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shoeIdParam = searchParams?.get("shoeId");
  const parsedId = shoeIdParam ? Number.parseInt(shoeIdParam, 10) : NaN;
  const initialShoeId = Number.isFinite(parsedId) ? parsedId : undefined;

  return (
    <ReviewWizard
      initialShoeId={initialShoeId}
      onSuccess={(shoeId) => router.push(`/shoes/${shoeId}`)}
      layout="page"
    />
  );
}

