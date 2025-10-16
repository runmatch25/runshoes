"use client";

import { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "", weight: "", pace: "" });

  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit() {
    const endpoint = isLogin ? "login" : "register";
    const body = isLogin
      ? { email: form.email, password: form.password }
      : {
          email: form.email,
          password: form.password,
          name: form.name,
          weight: form.weight ? Number(form.weight) : undefined,
          pace: form.pace ? Number(form.pace) : undefined,
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
    <Box maxWidth={400} mx="auto" mt={8}>
      <Typography variant="h5" mb={2}>
        {isLogin ? "Login" : "Register"}
      </Typography>

      {!isLogin && (
        <>
          <TextField label="Name" name="name" fullWidth margin="normal" value={form.name} onChange={handleChange} />
          <TextField label="Weight (kg)" name="weight" fullWidth margin="normal" value={form.weight} onChange={handleChange} />
          <TextField label="Pace (min/km)" name="pace" fullWidth margin="normal" value={form.pace} onChange={handleChange} />
        </>
      )}
      <TextField label="Email" name="email" fullWidth margin="normal" value={form.email} onChange={handleChange} />
      <TextField label="Password" name="password" type="password" fullWidth margin="normal" value={form.password} onChange={handleChange} />

      <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleSubmit}>
        {isLogin ? "Login" : "Register"}
      </Button>
      <Button fullWidth sx={{ mt: 1 }} onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Need an account? Register" : "Already have an account? Login"}
      </Button>
    </Box>
  );
}
