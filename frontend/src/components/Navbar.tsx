"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Plane, LogOut, User, Menu, X } from "lucide-react";
import { getUser, clearAuth, isAuthenticated } from "@/lib/auth";
import type { UserData } from "@/lib/auth";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setLoggedIn(isAuthenticated());
    setUser(getUser());
  }, []);

  const handleLogout = () => {
    clearAuth();
    setLoggedIn(false);
    setUser(null);
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
          <Plane className="h-6 w-6" />
          AI Trip Planner
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-4 sm:flex">
          {loggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-primary/10 hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/planner"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
              >
                Plan a Trip
              </Link>
              <div className="flex items-center gap-2 text-sm text-muted">
                <User className="h-4 w-4" />
                {user?.name || "User"}
              </div>
              <button
                onClick={handleLogout}
                className="rounded-lg p-2 text-muted hover:bg-danger/10 hover:text-danger transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted hover:text-foreground transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden rounded-lg p-2 text-muted hover:bg-primary/10"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-border bg-card px-4 py-3 sm:hidden">
          {loggedIn ? (
            <div className="flex flex-col gap-2">
              <Link href="/dashboard" className="rounded-lg px-3 py-2 text-sm hover:bg-primary/10">
                Dashboard
              </Link>
              <Link href="/planner" className="rounded-lg px-3 py-2 text-sm hover:bg-primary/10">
                Plan a Trip
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-lg px-3 py-2 text-left text-sm text-danger hover:bg-danger/10"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link href="/login" className="rounded-lg px-3 py-2 text-sm hover:bg-primary/10">
                Login
              </Link>
              <Link href="/register" className="rounded-lg px-3 py-2 text-sm hover:bg-primary/10">
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
