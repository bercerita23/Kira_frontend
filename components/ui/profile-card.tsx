import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProfileCardProps {
  imageUrl?: string;
  title: string;
  subtitle: string;
  className?: string;
}

export function ProfileCard({
  imageUrl,
  title,
  subtitle,
  className,
}: ProfileCardProps) {
  return (
    <div
      className={cn(
        "rounded-[6px] bg-[#E7F7E2] border-1 flex flex-col items-center text-center p-6 gap-8",
        className
      )}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={title}
          width={300}
          height={300}
          className="object-cover rounded-[6px] aspect-square"
        />
      ) : (
        <span className="text-gray-400 font-lato">No Image</span>
      )}
      <div className="gap-[12px] flex flex-col items-center">
        <h3 className="font-bold font-lato text-sm">{title}</h3>
        <p className="text-muted-foreground font-lato text-sm">{subtitle}</p>
      </div>
    </div>
  );
}
