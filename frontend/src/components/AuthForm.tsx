"use client";

import { ReactNode, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { signIn } from 'next-auth/react';
import Link from "next/link";
import { Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface SocialButtonProps {
  provider: string;
  label: string;
  icon: ReactNode;
}

function SocialButton({ provider, label, icon }: SocialButtonProps) {
  return (
    <Button
      onClick={() => signIn(provider, { callbackUrl: "/" })}
      variant="outline"
      type="button"
      className="w-full h-12 border-black hover:bg-neutral-50 tracking-wider rounded-none"
    >
      <span className="inline-flex h-5 w-5 items-center justify-center mr-2">{icon}</span>
      {label}
    </Button>
  );
}

export default function AuthForm({ type }: { type: "login" | "signup" }) {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const endpoint = type === "login" ? "login" : "register";
      const res = await fetch(`http://localhost:3001/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        login(data.token, data.user);
        router.push("/");
        return;
      }

      const message =
        res.status === 401 && type === "login"
          ? "Invalid email or password. Please try again."
          : data?.message || "Authentication failed. Please try again.";

      setErrorMessage(message);
    } catch (error) {
      console.error("Auth error", error);
      setErrorMessage("Unable to connect right now. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left Side - Form */}
        <div className="flex flex-col justify-center px-6 lg:px-16 py-12">
          <div className="max-w-md w-full mx-auto">
            {/* Logo/Brand */}
            <Link 
              href="/"
              className="text-2xl mb-12 tracking-tighter hover:text-[#007bff] transition-colors inline-block"
            >
              <span className="text-[#007bff]">RUN</span>
              <span className="text-black">RATED</span>
            </Link>

            {/* Header */}
            <div className="mb-10">
              <h1 
                className="text-4xl lg:text-5xl leading-[0.9] mb-4" 
                style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.02em' }}
              >
                {type === "login" ? (
                  <>
                    WELCOME<br />
                    <span className="text-[#007bff]">BACK</span>
                  </>
                ) : (
                  <>
                    JOIN THE<br />
                    <span className="text-[#007bff]">COMMUNITY</span>
                  </>
                )}
              </h1>
              <p className="text-neutral-600 tracking-wide">
                {type === "login" 
                  ? "Sign in to your account to continue"
                  : "Create your account to start reviewing shoes"
                }
              </p>
            </div>

            {/* Form */}
            {errorMessage && (
              <div className="mb-6 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email" className="tracking-wider mb-2 block">EMAIL</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-neutral-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="your@email.com"
                    className="border-black h-12 pl-12 tracking-wide rounded-none"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="tracking-wider mb-2 block">PASSWORD</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-neutral-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="••••••••"
                    className="border-black h-12 pl-12 pr-12 tracking-wide rounded-none"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {type === "login" && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    />
                    <Label htmlFor="remember" className="tracking-wide text-sm cursor-pointer">
                      Remember me
                    </Label>
                  </div>

                  <a href="#" className="text-sm text-[#007bff] hover:underline tracking-wide">
                    Forgot password?
                  </a>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-[#007bff] text-white hover:bg-[#0056b3] h-12 tracking-wider group rounded-none"
                disabled={loading}
              >
                {loading 
                  ? "Please wait..." 
                  : type === "login" ? "SIGN IN" : "SIGN UP"
                }
                {!loading && (
                  <ArrowRight className="size-4 ml-2 group-hover:translate-x-1 transition-transform" />
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-sm text-neutral-500 tracking-wider">OR</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="space-y-3">
              <SocialButton
                provider="google"
                label="CONTINUE WITH GOOGLE"
                icon={
                  <svg className="size-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                }
              />
            </div>

            {/* Sign Up/Sign In Link */}
            <p className="text-center mt-8 text-neutral-600 tracking-wide">
              {type === "login" ? (
                <>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => router.push("/signup")}
                    className="text-[#007bff] hover:underline font-medium"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => router.push("/login")}
                    className="text-[#007bff] hover:underline font-medium"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="hidden lg:block relative bg-neutral-100">
          <img
            src="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydW5uaW5nJTIwdHJhY2t8ZW58MXx8fHwxNzYzNDE2NjU1fDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Running track"
            className="w-full h-full object-cover grayscale"
          />
          
          {/* Overlay Text */}
          <div className="absolute inset-0 bg-black/20 flex items-end p-12">
            <div className="text-white">
              <h2 
                className="text-5xl mb-4" 
                style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.02em' }}
              >
                YOUR RUNNING<br />
                COMMUNITY<br />
                AWAITS
              </h2>
              <p className="text-white/80 tracking-wide max-w-md">
                Join thousands of runners sharing honest reviews and finding their perfect shoes.
              </p>
            </div>
          </div>

          {/* Attribution */}
          <div className="absolute top-4 right-4 bg-white px-3 py-1.5 border border-black">
            <span className="tracking-wider text-xs">UNSPLASH</span>
          </div>
        </div>
      </div>
    </div>
  );
}
