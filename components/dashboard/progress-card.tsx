import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ProgressCardProps {
  level: number;
  xp: number;
  nextLevel: number;
}

export function ProgressCard({ level, xp, nextLevel }: ProgressCardProps) {
  const progressPercentage = Math.min(100, (xp / nextLevel) * 100);
  
  return (
    <Card className="border-2 rounded-3xl card-hover shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">Current Level</h3>
          <span className="text-xs font-medium bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full">
            Level {level}
          </span>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold">{xp} XP</span>
          <span className="text-sm text-muted-foreground">{nextLevel - xp} XP to Level {level + 1}</span>
        </div>
        
        <Progress value={progressPercentage} className="h-2.5" />
        
        <div className="mt-5 pt-4 border-t border-gray-100">
          <p className="text-sm font-medium mb-3">Recent achievements</p>
          <div className="flex -space-x-2.5">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm ring-2 ring-white">
              🏆
            </div>
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-sm ring-2 ring-white">
              🔥
            </div>
                          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-sm ring-2 ring-white">
              🎯
            </div>
                          <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 text-xs font-medium ring-2 ring-white">
              +3
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}