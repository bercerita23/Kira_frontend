"use client"

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function LandingCTA() {
  return (
    <section className="py-20 bg-gradient-to-r from-sky-500 to-indigo-600 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Learning Journey?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join Kira today and take the first step towards English fluency
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/signup">Get Started for Free</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent text-white hover:bg-white/10 border-white" asChild>
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
          <p className="mt-6 text-sm opacity-80">
            No credit card required. Start with a free account.
          </p>
        </div>
      </div>
    </section>
  );
}