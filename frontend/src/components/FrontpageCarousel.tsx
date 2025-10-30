"use client";
import React, { useEffect, useState } from "react";
import { Box, Fade, TextField } from "@mui/material";
import Image from "next/image";

const images = [
  "/images/frontpage/istockphoto-1478466587-2048x2048.jpg",
  "/images/frontpage/istockphoto-1995160630-2048x2048.jpg",
  "/images/frontpage/istockphoto-523268364-2048x2048.jpg",
  "/images/frontpage/istockphoto-533329293-2048x2048.jpg",
];

const DURATION = 5000;

const FrontpageCarousel = () => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, DURATION);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ position: "relative", width: "100%", height: { xs: 240, md: 380 }, maxHeight: 400, minHeight: 180, overflow: "hidden", marginBottom: 4 }}>
      {images.map((src, i) => (
        <Fade in={index === i} timeout={1000} key={src} unmountOnExit>
          <Box sx={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}>
            <Image src={src} alt="carousel" fill style={{ objectFit: "cover" }} sizes="100vw" priority={i === 0} />
          </Box>
        </Fade>
      ))}
      {/* Overlay search bar */}
      <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: { xs: "86%", md: 420 }, zIndex: 2 }}>
        <TextField fullWidth size="medium" variant="outlined" placeholder="Search..." sx={{ bgcolor: "rgba(255,255,255,0.95)", borderRadius: 2 }} inputProps={{ readOnly: true }} />
      </Box>
    </Box>
  );
};

export default FrontpageCarousel;
