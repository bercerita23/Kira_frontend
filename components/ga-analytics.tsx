"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/context/auth-context";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: Object[];  }
}

export default function GAUser() {
  const { user } = useAuth();
  const hasEverLoggedInRef = useRef(false);

  useEffect(() => {
    if (!window.gtag) return;

    if (user?.id) {
      hasEverLoggedInRef.current = true;

      window.gtag("config", "G-YY3RP0GTW4", {
        user_id: user.id,
      });
      return;
    }

    if (!user && hasEverLoggedInRef.current) {
      window.gtag("config", "G-YY3RP0GTW4", {
        user_id: null,
      });
      return;
    }

  }, [user?.id]);
  return null;
}
