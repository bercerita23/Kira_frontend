"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/context/auth-context";

declare global {
  interface Window {
    pendo: any;
  }
}

interface PendoProviderProps {
  apiKey: string;
  children: React.ReactNode;
}

export default function PendoProvider({
  apiKey,
  children,
}: PendoProviderProps) {
  const { user } = useAuth();

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.pendo?.initialize) return;

    (function loadPendo(apiKey: string) {
      (function (p: any, e: Document, n: string, d: string) {
        var v: string[], w: number, x: number, y: HTMLScriptElement, z: Element;

        const o: any = (p[d] = p[d] || {});
        o._q = o._q || [];

        v = [
          "initialize",
          "identify",
          "updateOptions",
          "pageLoad",
          "track",
          "trackAgent",
        ];

        for (w = 0, x = v.length; w < x; ++w) {
          ((m: string) => {
            o[m] =
              o[m] ||
              function () {
                o._q[m === "initialize" ? "unshift" : "push"](
                  [m].concat([].slice.call(arguments, 0))
                );
              };
          })(v[w]);
        }

        y = e.createElement(n) as HTMLScriptElement;
        y.async = true;
        y.src = `https://cdn.pendo.io/agent/static/${apiKey}/pendo.js`;

        z = e.getElementsByTagName(n)[0]!;
        z.parentNode!.insertBefore(y, z);
      })(window, document, "script", "pendo");
      console.log("Pendo loaded");
    })(apiKey);
  }, [apiKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.pendo || !window.pendo.initialize) return;

    if (user) {
      window.pendo.initialize({
        visitor: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          role: user.role,
        },
        account: {
          id: user.school_id,
          accountName: `School ${user.school_id}`,
          payingStatus: "free",
        },
      });
    } else {
      window.pendo.initialize({
        visitor: {
          id: "anonymous-" + Math.random().toString(36).substring(2),
        },
      });
    }
    console.log("Pendo initialized");
  }, [user]);

  return <>{children}</>;
}
