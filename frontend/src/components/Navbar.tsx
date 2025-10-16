"use client";

import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check auth status initially
    setIsLoggedIn(!!localStorage.getItem("token"));

    // Listen for login/logout events
    function handleAuthChange() {
      setIsLoggedIn(!!localStorage.getItem("token"));
    }

    window.addEventListener("authChange", handleAuthChange);

    return () => {
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("authChange")); // <— notify Navbar
    setIsLoggedIn(false);
    router.push("/");
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>
            RunRate
          </Link>
        </Typography>

        <Button color="inherit" component={Link} href="/shoes">
          Shoes
        </Button>
        <Button color="inherit" component={Link} href="/reviews">
          Reviews
        </Button>

        {isLoggedIn ? (
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        ) : (
          <>
            <Button color="inherit" component={Link} href="/login">
              Login
            </Button>
            <Button color="inherit" component={Link} href="/signup">
              Signup
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
