import { Flame } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from "@/lib/utils";

interface StreakCardProps {
  streak: number;
}

export function StreakCard({ streak }: StreakCardProps) {
  return (
    <Card className="border-2 rounded-3xl card-hover shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10">
            <Flame className="h-9 w-9 text-accent" />
          </div>
          <div className="ml-5">
            <p className="text-sm text-muted-foreground">Current Streak</p>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">{streak}</span>
              <span className="ml-1.5 text-muted-foreground">days</span>
            </div>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-7 gap-2">
          {[...Array(7)].map((_, i) => {
            const isActive = i < 5;
            const isCurrent = i === 4;
            
            return (
              <div key={i} className="relative flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center",
                    isActive ? "bg-accent text-accent-foreground" : "bg-muted",
                    isCurrent && "ring-2 ring-accent ring-offset-2"
                  )}
                >
                  <Flame className={cn("h-5 w-5", !isActive && "opacity-40")} />
                </div>
                <span className="text-xs mt-1.5 text-muted-foreground">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}