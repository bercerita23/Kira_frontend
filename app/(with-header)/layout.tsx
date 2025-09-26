import { LandingFooter } from "@/components/landing/footer";
import { LandingHeader } from "@/components/landing/header";

export default function WithHeaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <LandingHeader />
      <main>{children}</main>
      <LandingFooter />
    </div>
  );
}
