import Link from 'next/link';
import { LockIcon, CheckIcon, ChevronRightIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { CircularProgress } from '@/components/ui/circular-progress';

interface SkillTreeNodeProps {
  title: string;
  icon: string;
  lessons: number;
  completedLessons: number;
  href: string;
  completed?: boolean;
  active?: boolean;
  locked?: boolean;
}

export function SkillTreeNode({
  title,
  icon,
  lessons,
  completedLessons,
  href,
  completed = false,
  active = false,
  locked = false
}: SkillTreeNodeProps) {
  const progress = Math.round((completedLessons / lessons) * 100);
  
  return (
    <div className="w-full md:max-w-md">
      <div 
        className={cn(
          "skill-node w-full rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-200 border-2",
          completed ? "border-green-500" : 
          active ? "border-primary" : 
          locked ? "border-gray-200 opacity-70" : 
          "border-gray-200"
        )}
      >
        <div className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              {/* Circle Progress Ring */}
              <div className="relative w-14 h-14 md:w-16 md:h-16">
                {!locked && (
                  <CircularProgress 
                    value={progress} 
                    size={56}
                    strokeWidth={4}
                    color={completed ? "green" : "primary"}
                    className="md:hidden"
                  />
                )}
                
                {!locked && (
                  <CircularProgress 
                    value={progress} 
                    size={64}
                    strokeWidth={4}
                    color={completed ? "green" : "primary"}
                    className="hidden md:block"
                  />
                )}
                
                <div 
                  className={cn(
                    "absolute inset-0 rounded-full flex items-center justify-center text-xl md:text-2xl",
                    locked ? "bg-gray-100" : 
                    completed ? "bg-green-50" : 
                    active ? "bg-primary/10" : 
                    "bg-gray-50"
                  )}
                >
                  {locked ? (
                    <LockIcon className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
                  ) : (
                    completed ? (
                      <div className="relative">
                        <span className="absolute -inset-1 flex items-center justify-center">
                          {icon}
                        </span>
                        <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-0.5">
                          <CheckIcon className="h-3 w-3" />
                        </div>
                      </div>
                    ) : (
                      icon
                    )
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg truncate">{title}</h3>
              
              {!locked && (
                <div className="text-sm text-muted-foreground mt-1">
                  {completedLessons} of {lessons} lessons completed
                </div>
              )}
              
              {locked && (
                <div className="text-sm text-muted-foreground mt-1">
                  Complete previous skills to unlock
                </div>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-full shrink-0", 
                locked ? "text-muted-foreground" : 
                completed ? "text-green-500" : 
                "text-primary"
              )}
              disabled={locked}
              asChild
            >
              <Link href={locked ? "#" : href}>
                <ChevronRightIcon className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 