"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, AlertTriangle, CheckCircle, Info, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Insight {
  type: 'warning' | 'success' | 'opportunity' | 'info';
  title: string;
  description: string;
  recommendedAction?: string;
  actionPayload?: Record<string, any>;
}

interface AdvisorData {
  overview: string;
  insights: Insight[];
}

export function AIAdvisor() {
  const [data, setData] = useState<AdvisorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInsights() {
      try {
        const res = await fetch('/api/ai/advisor');
        if (!res.ok) throw new Error("Failed to fetch insights");
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchInsights();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'opportunity': return <Sparkles className="w-5 h-5 text-indigo-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStyle = (type: string) => {
    switch (type) {
      case 'warning': return "border-amber-500/20 bg-amber-500/5";
      case 'success': return "border-emerald-500/20 bg-emerald-500/5";
      case 'opportunity': return "border-indigo-500/20 bg-indigo-500/5";
      default: return "border-blue-500/20 bg-blue-500/5";
    }
  };

  const handleAction = (insight: Insight) => {
    // In a full implementation, this could route to the appropriate page with query params
    // or trigger an API call based on insight.actionPayload
    console.log("Triggering Action:", insight.recommendedAction, insight.actionPayload);
    alert(`Action Initiated: ${insight.recommendedAction}`);
  };

  if (loading) {
    return (
      <Card className="border-indigo-500/30 shadow-xl shadow-indigo-500/10 bg-linear-to-br from-indigo-900/50 to-background backdrop-blur-md relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-500/10 animate-pulse z-0" />
        <CardContent className="flex flex-col items-center justify-center py-12 relative z-10">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-4" />
          <p className="text-sm font-medium tracking-widest text-indigo-300 uppercase">Analyzing Financials...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !data || !data.insights?.length) {
    return null; // Fail gracefully
  }

  return (
    <Card className="border-indigo-500/30 shadow-2xl shadow-indigo-500/10 bg-linear-to-br from-background via-background to-indigo-950/20 backdrop-blur-xl">
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              Bntec AI Advisor
            </CardTitle>
            <CardDescription className="text-xs font-medium max-w-[90%]">
              {data.overview}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {data.insights.map((insight, idx) => (
          <Card key={idx} className={cn("border transition-all hover:shadow-md", getStyle(insight.type))}>
            <CardHeader className="p-3 pb-2 flex flex-row items-center gap-2">
              {getIcon(insight.type)}
              <h4 className="font-bold text-sm tracking-tight">{insight.title}</h4>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <p className="text-xs text-muted-foreground leading-relaxed">
                {insight.description}
              </p>
            </CardContent>
            {insight.recommendedAction && (
              <CardFooter className="p-3 pt-0">
                <Button
                  onClick={() => handleAction(insight)}
                  variant="secondary"
                  size="sm"
                  className={cn("w-full text-xs font-bold tracking-tight group",
                    insight.type === 'opportunity' ? "hover:bg-indigo-500 hover:text-white" : ""
                  )}
                >
                  {insight.recommendedAction}
                  <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
