import Link from "next/link";
import {
  ExternalLink,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
} from "lucide-react";

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 border-t border-gray-200 pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-6">
          <div className="space-y-4 col-span-2 w-[80%]">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-[#2D7017]">Kira</span>
            </Link>
            <p className="text-muted-foreground">
              KIRA is an AI-powered, gamified tool created to support
              Bercerita’s long standing English learning program. Designed to
              make English practice fun and accessible for children in rural
              Indonesian schools, it enables them to practice daily even without
              a live teacher.
            </p>

            <Link href="/about" className="">
              <span className="text-lg text-[#2D7017]">
                Learn more about Bercerita’s program and impact here.
              </span>
            </Link>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/demo"
                  className="text-muted-foreground hover:text-primary"
                >
                  Try a Demo
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-muted-foreground hover:text-primary"
                >
                  Log In
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-primary"
                >
                  About Kira
                </Link>
              </li>
              <li>
                <Link
                  href="/team"
                  className="text-muted-foreground hover:text-primary"
                >
                  Our Team
                </Link>
              </li>

              <li>
                <Link
                  href="/opportunities"
                  className="text-muted-foreground hover:text-primary"
                >
                  Internship Opportunities
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-primary"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-primary"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-muted-foreground hover:text-primary"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-8 flex flex-col items-center text-center">
          <p className="self-center">
            &copy; {currentYear} Kira. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
