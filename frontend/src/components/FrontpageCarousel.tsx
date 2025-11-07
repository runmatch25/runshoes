"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

const images = [
  "/images/frontpage/istockphoto-1478466587-2048x2048.jpg",
  "/images/frontpage/istockphoto-1995160630-2048x2048.jpg",
  "/images/frontpage/istockphoto-523268364-2048x2048.jpg",
  "/images/frontpage/istockphoto-533329293-2048x2048.jpg",
];

const DURATION = 5000;

const FrontpageCarousel = () => {
  const [index, setIndex] = useState(0);
  const [term, setTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, DURATION);
    return () => clearInterval(interval);
  }, []);

  const submit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = term.trim();
    router.push(q ? `/shoes?q=${encodeURIComponent(q)}` : "/shoes");
  };

  return (
    <div className="relative mb-8 h-[280px] w-full overflow-hidden rounded-3xl border border-border/60 bg-muted/30 sm:h-[360px]">
      {images.map((src, i) => (
        <div
          key={src}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000",
            index === i ? "opacity-100" : "pointer-events-none opacity-0"
          )}
        >
          <Image src={src} alt="carousel" fill style={{ objectFit: "cover" }} sizes="100vw" priority={i === 0} />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/20 to-background/10" />
      <div className="absolute left-1/2 top-1/2 w-[88%] max-w-xl -translate-x-1/2 -translate-y-1/2">
        <form onSubmit={submit} className="flex items-center gap-2 rounded-full border border-border bg-card/90 p-2 shadow-lg backdrop-blur">
          <Search className="ml-2 h-5 w-5 text-muted-foreground" />
          <Input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search shoes by brand or model"
            className="border-0 bg-transparent text-base focus-visible:ring-0"
          />
          <Button type="submit" className="rounded-full px-6">
            Search
          </Button>
        </form>
      </div>
    </div>
  );
};

export default FrontpageCarousel;
