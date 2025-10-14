import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import LoadingWrapper from "../../components/LoadingWrapper";
import { fetchShoes } from "../../lib/api";

export default async function ShoesPage() {
  const shoes = await fetchShoes(); // Server fetch

  return (
    <LoadingWrapper data={shoes}>
      {(shoes: any[]) => {
        if (!shoes || shoes.length === 0) {
          return <Typography>No shoes found. Add some via the backend!</Typography>;
        }

        return (
          <Grid container spacing={3} sx={{ padding: "2rem" }}>
            {shoes.map((shoe) => (
              <Grid item xs={12} sm={6} md={4} key={shoe.id}>
                <Card sx={{ ":hover": { boxShadow: 6 } }}>
                  <CardContent>
                    <Typography variant="h6">{shoe.brand} {shoe.model}</Typography>
                    <Typography color="text.secondary">Type: {shoe.type}</Typography>
                    <Typography variant="body2">
                      Reviews: {shoe.reviews?.length || 0}
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
