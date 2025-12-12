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
      <h1 className="font-lato text-[32px] font-[500] mt-12 leading-[40px]">
        Want to support our mission?
      </h1>
      <span className="font-lato text-[20px] font-[400] mt-3 leading-[28px] text-[#4B4B4E]">
        Our Platform is fueled by generous donations. Support KIRA today
      </span>
      <Button
        size="lg"
        className="bg-[#2D7017] hover:bg-[#1e4a0f] text-[#F5F5F5] font-lato text-[18px] font-[500] w-min self-center mt-12"
        asChild
      >
        <Link href="/support">Support KIRA</Link>
      </Button>
    </div>
  );
}
