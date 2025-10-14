import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Rating from "@mui/material/Rating";
import LoadingWrapper from "../../components/LoadingWrapper";
import { fetchReviews } from "../../lib/api";

export default async function ReviewsPage() {
    const reviews = await fetchReviews(); // Server fetch
  return (
      <LoadingWrapper data={reviews}>
        {(reviews: any[]) => {
          if (!reviews || reviews.length === 0) {
            return <Typography>No reviews found. Add some via the backend!</Typography>;
          }

        return (
          <Grid container spacing={3} sx={{ padding: "2rem" }}>
            {reviews.map((review) => (
              <Grid item xs={12} sm={6} md={4} key={review.id}>
                <Card sx={{ ":hover": { boxShadow: 6 } }}>
                  <CardContent>
                    <Typography variant="h6">
                      {review.shoe?.brand} {review.shoe?.model}
                    </Typography>
                    <Rating value={review.rating} readOnly />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {review.comment}
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Runner: {review.user?.name} — Pace: {review.pace} min/km
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        );
      }}
    </LoadingWrapper>
  );
}
