// REMOVE "use client"
import { ReactNode } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

interface Props {
  data: any;
  children: (data: any) => ReactNode;
}

export default function LoadingWrapper({ data, children }: Props) {
  if (!data) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return <>{children(data)}</>;
}
