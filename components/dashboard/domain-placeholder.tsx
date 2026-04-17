"use client";

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Hammer } from "lucide-react";

export default function DomainPlaceholderPage({ domain = "Finance" }: { domain?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] space-y-6 animate-in fade-in duration-1000">
      <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-2xl shadow-primary/10">
        <Hammer className="w-10 h-10 text-primary animate-bounce-slow" />
      </div>
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tighter uppercase">{domain} Intelligence Under Construction</h1>
        <p className="text-muted-foreground font-medium max-w-md mx-auto italic">
          We are currently deploying advanced analytical protocols for the {domain} domain. This interface will be online shortly.
        </p>
      </div>
      <Card className="glass-card max-w-sm border-none shadow-xl">
        <CardHeader className="pb-2">
           <CardTitle className="text-[10px] font-bold tracking-widest text-primary uppercase">Current Status</CardTitle>
        </CardHeader>
        <CardContent>
           <p className="text-xs font-mono opacity-60">PHASE_01_RESTRUCTURE_COMPLETE</p>
           <p className="text-xs font-mono opacity-60 mt-1">WAITING_FOR_DATA_SYNDICATION...</p>
        </CardContent>
      </Card>
    </div>
  );
}
