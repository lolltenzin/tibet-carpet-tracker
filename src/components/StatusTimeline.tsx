
import { Order } from "@/types";
import { getStatusDisplayInfo } from "@/lib/data";
import { Check } from "lucide-react";

interface StatusTimelineProps {
  timeline: Order['timeline'];
  currentStatus: Order['status'];
}

export function StatusTimeline({ timeline, currentStatus }: StatusTimelineProps) {
  return (
    <div className="relative space-y-8 py-2">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted" />
      
      {timeline.map(({ stage, date, completed }, index) => {
        const { label, description } = getStatusDisplayInfo(stage);
        const isLastCompleted = completed && index === timeline.filter(t => t.completed).length - 1;
        const isActive = stage === currentStatus;
        
        return (
          <div key={stage} className="relative pl-10">
            {/* Timeline marker */}
            <div 
              className={`absolute left-0 rounded-full p-1.5 ${
                completed 
                  ? isLastCompleted 
                    ? "bg-tibet-red text-white" 
                    : "bg-tibet-gold/70 text-white" 
                  : "bg-muted border border-muted-foreground/20"
              }`}
            >
              {completed && <Check className="h-3 w-3" />}
            </div>
            
            <div className={`${isActive ? "opacity-100" : "opacity-80"}`}>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium">{label}</h4>
                {isActive && (
                  <span className="text-xs bg-tibet-red/20 text-tibet-red px-2 py-0.5 rounded">
                    Current
                  </span>
                )}
              </div>
              
              {date && (
                <p className="text-xs text-muted-foreground">
                  {new Date(date).toLocaleDateString()}
                </p>
              )}
              
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
