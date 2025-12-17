import Link from "next/link";
import { Button } from "@/components/ui/button";

export function JoinTeam() {
  return (
    <div className="w-full flex flex-col items-center justify-center py-20 px-16 bg-[#AFD8A1]">
      <div className="max-w-3xl w-full flex flex-col items-center justify-center bg-[#E7F7E2] p-8 rounded-[8px]">
        <section className="font-lato flex flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-medium text-[#113604] tracking-[-0.02em] text-center align-middle">
            {" "}
            Want to join our team?
          </h1>
          <p className=""> We need volunteers!</p>
          <Button className="bg-[#2D7017] hover:bg-[#255c13]" asChild>
            <Link href="/opportunities/">See Internship Opportunities</Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
