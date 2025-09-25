"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LandingHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "font-lato fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "bg-white shadow-md py-2" : "bg-transparent py-4"
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <img
            src="/assets/header.png"
            alt="Kira Auth"
            style={{
              height: 40,
              width: "auto",
              objectFit: "contain",
              marginBottom: 0,
            }}
          ></img>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/about"
            className="text-foreground hover:text-primary transition-colors"
          >
            About
          </Link>
          <Link
            href="/team"
            className="text-foreground hover:text-primary transition-colors"
          >
            Our Team
          </Link>
          <div className="ml-4 flex space-x-4">
            <Button variant="greenoutline" asChild>
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild variant="defaultgreen">
              <Link href="/signup">Try A Demo</Link>
            </Button>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-t py-4">
          <div className="container mx-auto px-4 flex flex-col space-y-4">
            <Link
              href="/about"
              className="text-foreground hover:text-primary transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/team"
              className="text-foreground hover:text-primary transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Our Team
            </Link>
            <div className="flex flex-col space-y-2 pt-2">
              <Button variant="greenoutline" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild variant="defaultgreen">
                <Link href="/signup">Try A Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
