"use client";

import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Divider,
} from "@mui/material";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import Checkbox from '@mui/material/Checkbox';

function SocialButton({ provider, label, icon }) {
  return (
    <Button
      onClick={() => signIn(provider)}
      fullWidth
      variant="outlined"
      sx={{ mb: 1.2, fontWeight: 600, color: '#111', background: '#fff', borderColor: 'rgba(0,0,0,0.12)', '&:hover': { background: '#f4f4f4', borderColor: '#111' }, textTransform: 'none', fontSize: 16, display: 'flex', justifyContent: 'flex-start', gap: 1.6 }}
      startIcon={icon}
    >{label}</Button>
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
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: '#f5f6fa'
      }}
    >
      <Paper
        elevation={2}
        sx={{
          p: 0,
          width: '100%',
          maxWidth: 400,
          borderRadius: 2.5,
          overflow: 'hidden',
        }}
      >
        {/* Top: Logo */}
        <Box sx={{ px: 3.3, pt: 3.3, pb: 0 }}>
          <Image src="/images/logo.png" alt="Logo" width={93} height={42} style={{ display: 'block' }} priority />
        </Box>
        <Box sx={{ px: 3.3, pt: 1.5, pb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, fontSize: 28 }}>
            Sign in
          </Typography>
          <form onSubmit={handleSubmit} autoComplete="off">
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              margin="normal"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              InputProps={{ sx: { background: '#fff', borderRadius: 1 } }}
              placeholder="your@email.com"
            />
            <TextField
              label="Password"
              variant="outlined"
              fullWidth
              margin="normal"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              InputProps={{ sx: { background: '#fff', borderRadius: 1 } }}
              placeholder="••••••••"
            />
            <Box sx={{ display: 'flex', alignItems: 'center', mt: -1, mb: 2 }}>
              <Checkbox
                size="small"
                sx={{ mr: 1, p: 0.4, color: '#24292f' }}
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
              />
              <Typography sx={{ fontSize: 15, color: '#24292f' }}>Remember me</Typography>
            </Box>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                bgcolor: 'linear-gradient(#23272f,#0b101a)',
                color: '#fff',
                borderRadius: 2,
                fontWeight: 700,
                fontSize: 17,
                py: 1.3,
                boxShadow: '0 2px 6px #0001',
                mb: 1.4,
                '&:hover': { bgcolor: '#191b1e' },
              }}
              disabled={loading}
            >
              {loading ? 'Please wait...' : 'Sign in'}
            </Button>
            <Typography align="center" sx={{ mb: 1.1, fontSize: 14,date: '#666' }}>
              <a href="#" style={{ color: '#23272f', textDecoration: 'underline', fontWeight: 500, cursor: 'pointer' }}>Forgot your password?</a>
            </Typography>
          </form>
          <Divider sx={{ my: 2, fontSize: 14 }}><span style={{ color: '#787c94' }}>or</span></Divider>
          <Box sx={{ mb: 1 }}>
            <SocialButton provider="google" label="Sign in with Google" icon={<img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/google.svg" alt="G" style={{ width: 22, height: 22 }} />} />
            <SocialButton provider="facebook" label="Sign in with Facebook" icon={<img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/facebook.svg" alt="F" style={{ width: 22, height: 22 }} />} />
          </Box>
          <Typography align="center" sx={{ mt: 2, fontSize: 15, color: '#222' }}>
            Don't have an account?{' '}
            <span style={{ color: '#1565c0', fontWeight: 500, textDecoration: 'underline', cursor: 'pointer' }} onClick={() => router.push('/signup')}>
              Sign up
            </span>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
