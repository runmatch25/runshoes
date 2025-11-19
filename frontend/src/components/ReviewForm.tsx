"use client";

import ReviewWizard from "./ReviewWizard";

interface ReviewFormProps {
  shoeId: number;
  onReviewAdded: () => void; // callback to refresh reviews
}

export default function ReviewForm({ shoeId, onReviewAdded }: ReviewFormProps) {
  return (
    <div className="mt-2">
      <ReviewWizard
        initialShoeId={shoeId}
        layout="modal"
        onSuccess={() => {
          onReviewAdded();
        }}
      />
    </div>
  );
}
