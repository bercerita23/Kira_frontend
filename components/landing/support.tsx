import Link from "next/link";
import { Button } from "../ui/button";
import Image from "next/image";

export default function Support() {
  return (
    <div className="bg-[#E7F7E2] flex flex-col gap-y-1 w-full text-center py-20">
      <img
        src="/assets/children_picture.png"
        className="w-[60%] h-auto self-center rounded-xl"
      />
      <h1 className="text-3xl mt-12">Want to support our mission?</h1>
      <span className="text-xl mt-3">
        Our Platform is fueled by generous donations. Support KIRA today
      </span>
      <Button
        size="lg"
        className="bg-[#2D7017] text-[#F5F5F5] text-lg w-min self-center mt-12"
        asChild
      >
        <Link href="/support">Support KIRA</Link>
      </Button>
    </div>
  );
}
