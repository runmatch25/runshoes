"use client";

import { ReactNode, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Chrome, Facebook } from "lucide-react";

interface SocialButtonProps {
  provider: string;
  label: string;
  icon: ReactNode;
}

function SocialButton({ provider, label, icon }: SocialButtonProps) {
  return (
    <Button
      onClick={() => signIn(provider)}
      variant="outline"
      className="mb-3 flex w-full items-center justify-start gap-3 text-base font-semibold"
    >
      <span className="inline-flex h-6 w-6 items-center justify-center">{icon}</span>
      {label}
    </Button>
  );
}

export default function AuthForm({ type }: { type: "login" | "signup" }) {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const endpoint = type === "login" ? "login" : "signup";
    const res = await fetch(`http://localhost:3001/auth/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      login(data.token, data.user);
      router.push("/");
    } else {
      alert(data.message || "Authentication failed");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border border-border bg-card/90 backdrop-blur-sm">
        <CardContent className="space-y-6 p-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Image src="/images/logo.png" alt="Logo" width={93} height={42} priority />
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                {type === "login" ? "Welcome back" : "Create account"}
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Sign {type === "login" ? "in" : "up"}
            </h1>
            <form className="space-y-4" onSubmit={handleSubmit} autoComplete="off">
              {type === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Runner"
                    required
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(Boolean(checked))} />
                <Label htmlFor="remember" className="text-sm text-muted-foreground">
                  Remember me
                </Label>
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Please wait..." : type === "login" ? "Sign in" : "Create account"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                <a href="#" className="font-medium text-foreground underline-offset-4 hover:underline">
                  Forgot your password?
                </a>
              </p>
            </form>
          </div>
          <div className="space-y-4">
            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                or
              </span>
            </div>
            <div className="space-y-2">
              <SocialButton
                provider="google"
                label="Sign in with Google"
                icon={<Chrome className="h-5 w-5" />}
              />
              <SocialButton
                provider="facebook"
                label="Sign in with Facebook"
                icon={<Facebook className="h-5 w-5" />}
              />
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            {type === "login" ? (
              <span>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/signup")}
                  className={cn("font-semibold text-primary underline-offset-4 hover:underline")}
                >
                  Sign up
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className={cn("font-semibold text-primary underline-offset-4 hover:underline")}
                >
                  Sign in
                </button>
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
