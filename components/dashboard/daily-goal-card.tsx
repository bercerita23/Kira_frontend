import { Card, CardContent } from '@/components/ui/card';
import { CircularProgressBar } from '@/components/dashboard/circular-progress';

interface DailyGoalCardProps {
  progress: number;
}

export function DailyGoalCard({ progress }: DailyGoalCardProps) {
  return (
    <Card className="border-2 rounded-3xl card-hover shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-medium text-muted-foreground">Daily Goal</h3>
          <span className="text-xs font-medium bg-green-100 text-green-800 px-2.5 py-1 rounded-full">
            75% Complete
          </span>
        </div>
        
        <div className="flex items-center">
          <div className="mr-5">
            <CircularProgressBar progress={progress} size={90} />
          </div>
          <div>
            <div className="text-2xl font-bold mb-2">15 / 20</div>
            <p className="text-sm text-muted-foreground mb-3">Minutes today</p>
            <button className="text-sm font-medium text-primary hover:underline transition-all">
              Continue Learning →
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}