"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setAuth } from "@/lib/auth";
import { authApi } from "@/lib/api";
import { Loader2 } from "lucide-react";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      router.push("/login");
      return;
    }

    localStorage.setItem("token", token);

    authApi
      .getProfile()
      .then((res) => {
        const user = res.data.data ?? res.data;
        setAuth(token, user);
        router.push("/dashboard");
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted">Completing sign in...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
