"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  FileText, Send, Eye, CheckCircle, XCircle, 
  AlertCircle, Clock, Info, CreditCard 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  activity_type: string;
  created_at: string;
  metadata: any;
}

import type { EntityType } from "@/lib/domain/activities/activity.service";

export function ActivityTimeline({ entityId, entityType }: { entityId: string, entityType: EntityType }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchActivities();
  }, [entityId]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("entity_id", entityId)
        .eq("entity_type", entityType)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (err) {
      console.error("Failed to load activities:", err);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'invoice.created':
      case 'quote.created':
        return <FileText className="w-3 h-3" />;
      case 'invoice.sent':
      case 'quote.sent':
        return <Send className="w-3 h-3" />;
      case 'invoice.viewed':
        return <Eye className="w-3 h-3" />;
      case 'invoice.paid':
      case 'quote.accepted':
        return <CheckCircle className="w-3 h-3" />;
      case 'invoice.canceled':
      case 'quote.rejected':
        return <XCircle className="w-3 h-3" />;
      case 'invoice.partially_paid':
        return <CreditCard className="w-3 h-3" />;
      default:
        return <Info className="w-3 h-3" />;
    }
  };

  const getColor = (type: string) => {
    if (type.includes('created')) return "bg-indigo-500 text-white";
    if (type.includes('paid') || type.includes('accepted')) return "bg-emerald-500 text-white";
    if (type.includes('sent')) return "bg-blue-500 text-white";
    if (type.includes('viewed')) return "bg-amber-500 text-white";
    if (type.includes('rejected') || type.includes('canceled')) return "bg-red-500 text-white";
    return "bg-slate-500 text-white";
  };

  const getLabel = (type: string) => {
    return type.replace(/\./g, ' ').toUpperCase();
  };

  if (loading) return <div className="animate-pulse space-y-4">
    {[1, 2, 3].map(i => (
      <div key={i} className="flex gap-3">
        <div className="w-6 h-6 rounded-full bg-muted" />
        <div className="space-y-1">
          <div className="h-3 w-24 bg-muted rounded" />
          <div className="h-2 w-16 bg-muted rounded" />
        </div>
      </div>
    ))}
  </div>;

  if (activities.length === 0) return (
    <div className="flex flex-col items-center justify-center py-6 text-center">
      <Clock className="w-6 h-6 text-muted-foreground/30 mb-2" />
      <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">No activity logs found</p>
    </div>
  );

  return (
    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-3 before:-translate-x-px before:h-full before:w-0.5 before:bg-linear-to-b before:from-border before:via-border/50 before:to-transparent">
      {activities.map((activity) => (
        <div key={activity.id} className="relative flex items-start gap-4 group">
          <div className={cn(
            "mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full shadow-sm ring-4 ring-white dark:ring-slate-900 transition-transform group-hover:scale-110",
            getColor(activity.activity_type)
          )}>
            {getIcon(activity.activity_type)}
          </div>
          <div className="flex flex-col">
            <p className="text-[10px] font-black tracking-widest text-foreground group-hover:text-primary transition-colors">
              {getLabel(activity.activity_type)}
            </p>
            <p className="text-[9px] font-mono text-muted-foreground opacity-60">
              {new Date(activity.created_at).toLocaleString()}
            </p>
            {activity.metadata && Object.keys(activity.metadata).length > 0 && (
              <div className="mt-1 p-2 bg-muted/30 rounded-lg border border-border/40 overflow-hidden">
                 <pre className="text-[8px] font-mono text-muted-foreground leading-tight">
                   {JSON.stringify(activity.metadata, null, 2)}
                 </pre>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
