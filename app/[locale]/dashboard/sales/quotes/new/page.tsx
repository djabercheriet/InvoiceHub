"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import NewQuoteBuilder from "@/components/quotes/new-quote-builder";

export default function NewQuotePage() {
  const router = useRouter();

  return (
    <div className="space-y-6 page-fade-in px-4 lg:px-0 mt-4">
      <Button 
        variant="ghost" 
        onClick={() => router.push("/dashboard/sales/quotes")} 
        className="gap-2 font-bold tracking-tight text-muted-foreground hover:text-foreground group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
        Back to Proposals
      </Button>
      
      <NewQuoteBuilder onSaveSuccess={() => router.push("/dashboard/sales/quotes")} />
    </div>
  );
}
