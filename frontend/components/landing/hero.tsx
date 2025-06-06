"use client"

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function LandingHero() {
  return (
    <section className="pt-32 pb-20 md:pt-36 md:pb-24 bg-gradient-to-b from-sky-50 to-white dark:from-gray-900 dark:to-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tighter mb-4">
              Learn English Through 
              <span className="text-primary"> Stories</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-lg mx-auto md:mx-0">
              Master English naturally with interactive lessons and engaging stories at your own pace.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Start Learning Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/courses">Browse Courses</Link>
              </Button>
            </div>
            <div className="mt-8 font-medium text-sm">
              <p className="text-muted-foreground">
                Join over 10,000 language learners worldwide
              </p>
            </div>
          </div>
          <div className="flex-1 relative">
            <div className="relative z-10 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden max-w-md mx-auto border border-gray-100 dark:border-gray-700">
              <div className="h-12 bg-sky-500 flex items-center px-4">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="p-6">
                <div className="mb-6 bg-sky-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-lg font-medium mb-4">Translate this sentence:</p>
                  <p className="text-xl font-bold mb-4">"She reads a book every day."</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button variant="outline" className="rounded-full">Dia</Button>
                    <Button variant="outline" className="rounded-full">membaca</Button>
                    <Button variant="outline" className="rounded-full">sebuah</Button>
                    <Button variant="outline" className="rounded-full">buku</Button>
                    <Button variant="outline" className="rounded-full">setiap</Button>
                    <Button variant="outline" className="rounded-full">hari</Button>
                  </div>
                </div>
                <Button className="w-full">Check Answer</Button>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-purple-200 dark:bg-purple-900/20 rounded-full blur-3xl -z-10 opacity-70"></div>
            <div className="absolute -top-10 -left-10 w-72 h-72 bg-blue-200 dark:bg-blue-900/20 rounded-full blur-3xl -z-10 opacity-70"></div>
          </div>
        </div>
      </div>
    </section>
  );
}