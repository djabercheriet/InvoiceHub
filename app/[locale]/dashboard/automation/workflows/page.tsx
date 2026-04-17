"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Zap, Plus, Trash2, Power, PowerOff, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { FormDialog } from "@/components/ui/form-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { automationService } from "@/lib/domain/automation/automation.service";
import { automationRuleSchema, type AutomationRuleForm, TRIGGER_EVENTS, ACTION_TYPES } from "@/lib/domain/automation/automation.types";
import { cn } from "@/lib/utils";

export default function WorkflowsPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);

  const form = useForm<AutomationRuleForm>({
    resolver: zodResolver(automationRuleSchema),
    defaultValues: {
      name: "", trigger_event: TRIGGER_EVENTS[0].id, action_type: ACTION_TYPES[0].id
    },
  });

  useEffect(() => { fetchRules(); }, []);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: profile } = await supabase.from('profiles').select('company_id').eq('id', user.id).single();
      if (!profile?.company_id) return;
      setCompanyId(profile.company_id);

      const data = await automationService.getRules(profile.company_id);
      setRules(data);
    } catch (err: any) {
      toast.error("Failed to load automation rules");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: AutomationRuleForm) => {
    if (!companyId) return;
    try {
      await automationService.createRule(companyId, values);
      toast.success("Workflow rule activated.");
      setIsDialogOpen(false);
      form.reset();
      fetchRules();
    } catch (err: any) {
      toast.error("Failed to create rule.");
    }
  };

  const handleToggle = async (row: any) => {
    try {
      await automationService.toggleRuleActive(row.id, !row.is_active);
      toast.success(row.is_active ? "Rule deactivated" : "Rule activated");
      fetchRules();
    } catch (err: any) {
      toast.error("Failed to toggle state.");
    }
  };

  const handleDelete = async (row: any) => {
    if (!confirm(`Delete workflow: ${row.name}?`)) return;
    try {
      await automationService.deleteRule(row.id);
      toast.success("Workflow deleted.");
      fetchRules();
    } catch (err: any) {
      toast.error("Deletion failed.");
    }
  };

  const columns = [
    { 
      header: "Workflow Name", accessorKey: "name", 
      cell: (r: any) => <span className="font-bold text-sm tracking-tight">{r.name}</span> 
    },
    { 
      header: "Logic Mapping", accessorKey: "trigger_event", 
      cell: (r: any) => (
        <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase">
          <Badge variant="outline" className="text-indigo-500 border-indigo-500/20 bg-indigo-500/5 py-0">IF {r.trigger_event.split('.')[1]}</Badge>
          <ArrowRight className="w-3 h-3 text-muted-foreground" />
          <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/5 py-0">THEN {r.action_type}</Badge>
        </div>
      ) 
    },
    { 
      header: "Status", accessorKey: "is_active", 
      cell: (r: any) => (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => handleToggle(r)}
          className={cn("h-7 px-2 text-[10px] font-bold tracking-widest", r.is_active ? "text-emerald-600 bg-emerald-500/10" : "text-muted-foreground bg-muted")}
        >
          {r.is_active ? <Power className="w-3 h-3 mr-1" /> : <PowerOff className="w-3 h-3 mr-1" />}
          {r.is_active ? "ACTIVE" : "PAUSED"}
        </Button>
      ) 
    }
  ];

  return (
    <div className="space-y-8 page-fade-in px-4 lg:px-0 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/60 pb-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Zap className="w-8 h-8 text-amber-500" />
            Automation Workflows
          </h1>
          <p className="text-muted-foreground font-medium">Design event-driven rules to automate internal company processes.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} size="lg" className="gap-2 font-bold tracking-tight bg-amber-500 hover:bg-amber-600 shadow-xl shadow-amber-500/20 text-white rounded-xl">
          <Plus className="w-5 h-5" /> Create Rule
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card shadow-xl border-none">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] font-bold tracking-widest text-emerald-600">ACTIVE WORKFLOWS</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold tracking-tight text-emerald-600">{rules.filter(r => r.is_active).length}</div></CardContent>
        </Card>
        <Card className="glass-card shadow-xl border-none">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] font-bold tracking-widest text-muted-foreground">PAUSED RULES</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold tracking-tight">{rules.filter(r => !r.is_active).length}</div></CardContent>
        </Card>
      </div>

      <Card className="glass-card shadow-2xl border-none overflow-hidden">
        <DataTable 
          data={rules} 
          columns={columns} 
          loading={loading} 
          onDelete={handleDelete}
        />
      </Card>

      <FormDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} title="Create Workflow Automation" onSubmit={form.handleSubmit(onSubmit)}>
        <CardDescription className="mb-4">Link a system event to an automated response mechanism.</CardDescription>
        <Form {...form}>
          <div className="space-y-6">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-bold tracking-widest text-muted-foreground">WORKFLOW NAME</FormLabel>
                <FormControl><Input placeholder="e.g. Alert Admin on Low Stock" className="bg-background/50 h-11" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <FormField control={form.control} name="trigger_event" render={({ field }) => (
                <FormItem className="border p-4 rounded-xl bg-indigo-500/5 border-indigo-500/20">
                  <FormLabel className="text-[10px] font-bold tracking-widest text-indigo-500">IF THIS HAPPENS</FormLabel>
                  <FormControl>
                    <select {...field} className="w-full h-11 px-3 rounded-md border border-indigo-500/20 bg-background text-sm font-bold shadow-sm outline-none">
                      {TRIGGER_EVENTS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <div className="hidden md:flex justify-center -mx-4"><ArrowRight className="text-muted-foreground w-6 h-6"/></div>

              <FormField control={form.control} name="action_type" render={({ field }) => (
                <FormItem className="border p-4 rounded-xl bg-emerald-500/5 border-emerald-500/20">
                  <FormLabel className="text-[10px] font-bold tracking-widest text-emerald-500">THEN DO THIS</FormLabel>
                  <FormControl>
                    <select {...field} className="w-full h-11 px-3 rounded-md border border-emerald-500/20 bg-background text-sm font-bold shadow-sm outline-none">
                      {ACTION_TYPES.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>
        </Form>
      </FormDialog>
    </div>
  );
}
