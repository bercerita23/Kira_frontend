"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LandingCTA() {
  return (
    <section className="py-20 bg-[#113604] text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Transforming English Learning for Underserved Students
          </h2>
          <p className="text-xl text-white mb-8">
            KIRA was created to support Bercerita’s long standing English
            learning program. Designed to make English practice fun and
            accessible for children in rural Indonesian schools, it enables them
            to practice daily even without a live teacher.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-[#2D7017] text-lg">
              <Link href="/signup">Help Us Serve Students </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
