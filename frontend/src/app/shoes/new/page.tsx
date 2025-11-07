"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NewShoePage() {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [type, setType] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("http://localhost:3001/shoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brand, model, type }),
    });
    router.push("/shoes");
  };

  return (
    <div className="mx-auto mt-8 max-w-md">
      <Card className="border border-border/70 bg-card/80">
        <CardContent className="space-y-4 p-6">
          <h1 className="text-xl font-semibold text-foreground">Add a New Shoe</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
            <Input
              placeholder="Model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
            <Input
              placeholder="Type (easy, tempo, long, etc.)"
              value={type}
              onChange={(e) => setType(e.target.value)}
            />
            <Button type="submit" className="w-full">
              Add Shoe
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
