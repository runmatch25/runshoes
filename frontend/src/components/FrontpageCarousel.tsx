"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const heroImage = "/images/frontpage/Northface.png";

const FrontpageCarousel = () => {
  const [term, setTerm] = useState("");
  const router = useRouter();

  const submit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = term.trim();
    router.push(q ? `/shoes?q=${encodeURIComponent(q)}` : "/shoes");
  };

  return (
    <div className="relative mb-8 h-[500px] w-full overflow-hidden rounded-3xl border border-border/60 bg-muted/30 sm:h-[600px]">
      <Image src={heroImage} alt="Trail runner" fill style={{ objectFit: "cover" }} sizes="100vw" priority />
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
