"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/context/auth-context";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export default function GAUser() {
  const { user } = useAuth();
  const lastUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (!window.gtag) return;

    const currentId = user?.id ?? null;

    if (lastUserIdRef.current === currentId) return;
    lastUserIdRef.current = currentId;

    if (user?.id) {
      window.gtag("config", "G-5QXFD717FT", {
        user_id: user.id,
      });
    } else if (lastUserIdRef.current !== undefined) {
      window.gtag("config", "G-5QXFD717FT", {
        user_id: null,
      });
    } else {
    }
  }, [user]);

  return null;
}
