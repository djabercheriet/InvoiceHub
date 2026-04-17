import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, icon: Icon, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="relative mb-8 group">
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 group-hover:scale-110 transition-transform duration-1000" />
        <div className="relative bg-card border border-border/50 shadow-2xl rounded-3xl p-6 transform group-hover:-translate-y-2 transition-all duration-500">
          <Icon className="w-16 h-16 text-primary/80 stroke-[1.5]" />
        </div>
      </div>
      
      <h3 className="text-2xl font-extrabold tracking-tight mb-2 text-foreground">
        {title}
      </h3>
      
      <p className="text-muted-foreground font-medium max-w-[400px] mb-8 leading-relaxed">
        {description}
      </p>
      
      {actionLabel && onAction && (
        <Button 
          onClick={onAction} 
          size="lg" 
          className="font-bold tracking-widest shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
