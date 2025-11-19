"use client";

import { ChangeEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useUnitPreferences } from "@/context/UnitPreferencesContext";

const KM_PER_MILE = 1.60934;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "", weight: "", pace: "" });
  const { distanceUnit, distanceLabel, weightLabel, toBaseWeight } = useUnitPreferences();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit() {
    const endpoint = isLogin ? "login" : "register";
    const weightNumber =
      form.weight.trim() === "" ? undefined : Number.parseFloat(form.weight);
    const baseWeight =
      weightNumber !== undefined && Number.isFinite(weightNumber)
        ? toBaseWeight(weightNumber)
        : undefined;

    const paceNumber =
      form.pace.trim() === "" ? undefined : Number.parseFloat(form.pace);
    const basePace =
      paceNumber !== undefined && Number.isFinite(paceNumber)
        ? distanceUnit === "kilometers"
          ? paceNumber
          : paceNumber / KM_PER_MILE
        : undefined;

    const body = isLogin
      ? { email: form.email, password: form.password }
      : {
          email: form.email,
          password: form.password,
          name: form.name,
          weight: baseWeight,
          pace: basePace,
        };

    const res = await fetch(`http://localhost:3001/auth/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    alert(JSON.stringify(data, null, 2));
  }

  return (
    <div className="mx-auto mt-10 max-w-sm">
      <Card className="border border-border/70 bg-card/80">
        <CardContent className="space-y-4 p-6">
          <div className="space-y-2 text-center">
            <h1 className="text-xl font-semibold text-foreground">{isLogin ? "Login" : "Register"}</h1>
            <p className="text-sm text-muted-foreground">Debug form for direct auth endpoints</p>
          </div>

          {!isLogin && (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" value={form.name} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="weight">Weight ({weightLabel})</Label>
                <Input id="weight" name="weight" value={form.weight} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="pace">Pace (min/{distanceLabel})</Label>
                <Input id="pace" name="pace" value={form.pace} onChange={handleChange} />
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" value={form.email} onChange={handleChange} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" value={form.password} onChange={handleChange} />
            </div>
          </div>

          <Button className="w-full" onClick={handleSubmit}>
            {isLogin ? "Login" : "Register"}
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Need an account? Register" : "Already have an account? Login"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
