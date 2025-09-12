export interface BadgeProps {
  name: badgeTypes;
  size: number;
  disabled?: boolean;
  className?: string;
}

const badgeURLS: Record<badgeTypes, string> = {
  ACH001: "/assets/achievements/first_quiz.png",
  ACH002: "/assets/achievements/ten_quiz.png",
  ACH003: "/assets/achievements/perfect_quiz.png",
  ACH004: "/assets/achievements/halfway_5_weeks.png",
  ACH005: "/assets/achievements/complete_10_weeks.png",
  ACH006: "/assets/achievements/mastermind.png",
  ACH007: "/assets/achievements/never_give_up.png",
  B001: "/assets/medals/bronze.png",
  B002: "/assets/medals/silver.png",
  B003: "/assets/medals/gold.png",
  B004: "/assets/medals/platinum.png",
  B005: "/assets/medals/diamond.png",
};

export type badgeTypes =
  | "ACH001"
  | "ACH002"
  | "ACH003"
  | "ACH004"
  | "ACH005"
  | "ACH006"
  | "ACH007"
  | "B001"
  | "B002"
  | "B003"
  | "B004"
  | "B005";

export default function AwardDisplay({
  name,
  size,
  disabled = false,
  className,
}: BadgeProps) {
  return (
    <div
      className={`inline-flex items-center ${
        disabled ? "opacity-50 grayscale" : ""
      } ${className}`}
    >
      <img
        src={badgeURLS[name]}
        alt={name}
        className="rounded-lg object-contain"
        style={{ width: `${size}px`, height: `${size}px` }}
      />
    </div>
  );
}
