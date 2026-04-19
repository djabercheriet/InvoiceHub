"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Building2, Save, Globe, Scale, DollarSign, FileText, Hash,
  CheckCircle2, Loader2, Percent, Settings, LayoutTemplate, Zap,
  Fingerprint, CreditCard, Bell, ShieldCheck, Mail, Palette, Terminal,
  Workflow, Database, Cpu
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const CURRENCIES = [
  { code: "USD", label: "US Dollar (USD)" },
  { code: "EUR", label: "Euro (EUR)" },
  { code: "GBP", label: "British Pound (GBP)" },
  { code: "DZD", label: "Algerian Dinar (DZD)" },
  { code: "MAD", label: "Moroccan Dirham (MAD)" },
  { code: "TND", label: "Tunisian Dinar (TND)" },
  { code: "SAR", label: "Saudi Riyal (SAR)" },
  { code: "AED", label: "UAE Dirham (AED)" },
  { code: "CAD", label: "Canadian Dollar (CAD)" },
];

const WEIGHT_UNITS = [
  { value: "kg",  label: "Kilogram (kg)" },
  { value: "lb",  label: "Pound (lb)" },
  { value: "ton", label: "Metric Ton (ton)" },
];

const DATE_FORMATS = [
  { value: "YYYY-MM-DD", label: "2025-04-01 (ISO)" },
  { value: "DD/MM/YYYY", label: "01/04/2025 (EU)" },
  { value: "MM/DD/YYYY", label: "04/01/2025 (US)" },
];

export default function SettingsSuite() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Company basic info
  const [companyId, setCompanyId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyAddr, setCompanyAddr] = useState("");
  const [taxId, setTaxId] = useState("");
  const [website, setWebsite] = useState("");

  // Global Preferences (JSONB)
  const [currency, setCurrency] = useState("USD");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [dateFormat, setDateFormat] = useState("YYYY-MM-DD");
  const [taxRate, setTaxRate] = useState<number>(0);
  const [invPrefix, setInvPrefix] = useState("INV");
  const [parallelRates, setParallelRates] = useState<Record<string, number>>({ "EUR_DZD": 240, "USD_DZD": 220 });
  
  // Layout & UI Customization
  const [layoutDensity, setLayoutDensity] = useState<"comfortable" | "compact">("comfortable");
  const [enableSidebarCollapse, setEnableSidebarCollapse] = useState(true);
  
  // Workflows & Automation Rules
  const [autoDispatchInvoice, setAutoDispatchInvoice] = useState(false);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [requireApprovalForDiscounts, setRequireApprovalForDiscounts] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user.id).single();
        if (!profile?.company_id) return;
        const { data: co } = await supabase.from("companies").select("*").eq("id", profile.company_id).single();

        if (co) {
          setCompanyId(co.id);
          setCompanyName(co.name || "");
          setCompanyEmail(co.email || co.billing_email || "");
          setCompanyPhone(co.phone || "");
          setCompanyAddr(co.address || "");
          setTaxId(co.tax_id || "");
          setWebsite(co.website || "");

          const prefs = co.preferences || {};
          setCurrency(prefs.currency || co.currency || "USD");
          setWeightUnit(prefs.weight_unit || "kg");
          setDateFormat(prefs.date_format || "YYYY-MM-DD");
          setTaxRate(prefs.tax_rate ?? 0);
          setInvPrefix(prefs.invoice_prefix || "INV");
          setParallelRates(prefs.parallel_rates || { "EUR_DZD": 240, "USD_DZD": 220 });
          setLayoutDensity(prefs.layout_density || "comfortable");
          setEnableSidebarCollapse(prefs.sidebar_collapse ?? true);
          
          if(prefs.workflows) {
              setAutoDispatchInvoice(prefs.workflows.auto_dispatch_invoice ?? false);
              setLowStockAlerts(prefs.workflows.low_stock_alerts ?? true);
              setRequireApprovalForDiscounts(prefs.workflows.approval_discounts ?? true);
          }
        }
      } catch (err: any) {
        toast.error("Failed to load settings: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    if (!companyId) return;
    setIsSaving(true);
    setSaved(false);
    try {
      const { error } = await supabase.from("companies").update({
        name: companyName,
        email: companyEmail,
        phone: companyPhone,
        address: companyAddr,
        tax_id: taxId,
        website: website,
        currency: currency,
        preferences: {
          currency,
          weight_unit: weightUnit,
          date_format: dateFormat,
          tax_rate: taxRate,
          invoice_prefix: invPrefix,
          parallel_rates: parallelRates,
          layout_density: layoutDensity,
          sidebar_collapse: enableSidebarCollapse,
          workflows: {
              auto_dispatch_invoice: autoDispatchInvoice,
              low_stock_alerts: lowStockAlerts,
              approval_discounts: requireApprovalForDiscounts
          }
        },
      }).eq("id", companyId);

      if (error) throw error;
      setSaved(true);
      toast.success("Settings applied globally.");
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      toast.error("Save failed: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-24 gap-6 text-muted-foreground animate-pulse">
      <div className="p-4 bg-primary/10 rounded-3xl">
         <Cpu className="w-10 h-10 text-primary animate-spin" />
      </div>
      <span className="text-sm font-black tracking-[0.2em] uppercase">Booting Command Center...</span>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Dynamic Glass Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/60 pb-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary" />
            Command Center
          </h1>
          <p className="text-muted-foreground font-medium">
            Configure the platform's core DNA, visual language, and operational protocols.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
           <Button
             variant="outline"
             className="h-10 px-4 rounded-xl font-bold border-white/10 bg-surface-alpha text-xs text-muted-foreground hover:text-foreground"
           >
             Reset Default
           </Button>
           <Button
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
               "h-10 px-6 rounded-xl font-bold transition-all shadow-lg",
               saved ? "bg-emerald-600 shadow-emerald-600/20" : "bg-primary shadow-primary/20"
            )}
          >
            <div className="flex items-center gap-2">
               {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
               {isSaving ? "Syncing..." : saved ? "Applied" : "Save Changes"}
            </div>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="identity" className="w-full">
        <TabsList className="w-full justify-start h-auto p-2 bg-white/2 border border-white/5 rounded-2xl mb-8 overflow-x-auto flex-nowrap scrollbar-hide">
          <TabsTrigger value="identity" className="rounded-xl px-8 py-4 font-black tracking-widest text-[10px] uppercase data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-2xl transition-all">Identity</TabsTrigger>
          <TabsTrigger value="aesthetic" className="rounded-xl px-8 py-4 font-black tracking-widest text-[10px] uppercase data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-2xl transition-all">Aesthetic</TabsTrigger>
          <TabsTrigger value="finance" className="rounded-xl px-8 py-4 font-black tracking-widest text-[10px] uppercase data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-2xl transition-all">Finance</TabsTrigger>
          <TabsTrigger value="logic" className="rounded-xl px-8 py-4 font-black tracking-widest text-[10px] uppercase data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-2xl transition-all">Logic Engine</TabsTrigger>
        </TabsList>

        {/* ── IDENTITY TAB ────────────────────────────────────────────── */}
        <TabsContent value="identity" className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
           <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 space-y-8">
                 <Card className="glass-dashboard border-2 border-white/5 overflow-hidden">
                    <CardHeader className="p-8 border-b border-white/5">
                        <div className="flex items-center gap-4">
                           <div className="p-3 bg-primary/10 rounded-2xl">
                              <Building2 className="w-6 h-6 text-primary" />
                           </div>
                           <div>
                              <CardTitle className="text-2xl font-black tracking-tight">Organization Node</CardTitle>
                              <CardDescription className="text-muted-foreground font-semibold">Core branding and legal identity data.</CardDescription>
                           </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                             <Label className="text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase">Entity Name</Label>
                             <Input 
                                value={companyName} 
                                onChange={e => setCompanyName(e.target.value)} 
                                className="h-14 rounded-2xl bg-surface-alpha border-white/5 focus:border-primary/50 font-black text-lg px-6" 
                             />
                          </div>
                          <div className="space-y-3">
                             <Label className="text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase">Taxation ID</Label>
                             <Input 
                                value={taxId} 
                                onChange={e => setTaxId(e.target.value)} 
                                className="h-14 rounded-2xl bg-surface-alpha border-white/5 focus:border-primary/50 font-mono font-black text-lg px-6" 
                             />
                          </div>
                          <div className="space-y-3">
                             <Label className="text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase">Protocol Email</Label>
                             <Input 
                                type="email"
                                value={companyEmail} 
                                onChange={e => setCompanyEmail(e.target.value)} 
                                className="h-14 rounded-2xl bg-surface-alpha border-white/5 focus:border-primary/50 font-black text-lg px-6" 
                             />
                          </div>
                          <div className="space-y-3">
                             <Label className="text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase">Comm Line / Phone</Label>
                             <Input 
                                value={companyPhone} 
                                onChange={e => setCompanyPhone(e.target.value)} 
                                className="h-14 rounded-2xl bg-surface-alpha border-white/5 focus:border-primary/50 font-mono font-black text-lg px-6" 
                             />
                          </div>
                          <div className="space-y-3 md:col-span-2">
                             <Label className="text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase">HQ Coordinates / Address</Label>
                             <Input 
                                value={companyAddr} 
                                onChange={e => setCompanyAddr(e.target.value)} 
                                className="h-14 rounded-2xl bg-surface-alpha border-white/5 focus:border-primary/50 font-black text-lg px-6" 
                             />
                          </div>
                       </div>
                    </CardContent>
                 </Card>
              </div>

              <div className="space-y-8">
                 <Card className="glass-dashboard border-2 border-primary/20 bg-primary/5 overflow-hidden">
                    <CardHeader className="p-8">
                       <Zap className="w-10 h-10 text-primary mb-4" />
                       <CardTitle className="text-xl font-black tracking-tight">System Status</CardTitle>
                       <CardDescription className="text-primary/70 font-semibold">Your workspace is distributed across 12 global edge nodes.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-0">
                       <div className="space-y-4">
                          {[
                             { label: 'Latency', value: '14ms', icon: Cpu },
                             { label: 'Uptime', value: '99.99%', icon: ShieldCheck },
                             { label: 'Storage', value: '8.4 GB', icon: Database },
                          ].map((item, i) => (
                             <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-surface-alpha border border-white/10">
                                <div className="flex items-center gap-3">
                                   <item.icon className="w-4 h-4 text-muted-foreground" />
                                   <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{item.label}</span>
                                </div>
                                <span className="font-black text-sm">{item.value}</span>
                             </div>
                          ))}
                       </div>
                    </CardContent>
                 </Card>
              </div>
           </div>
        </TabsContent>

        {/* ── AESTHETIC TAB ────────────────────────────────────────── */}
        <TabsContent value="aesthetic" className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="glass-dashboard border-2 border-white/5 overflow-hidden">
                 <CardHeader className="p-8 border-b border-white/5">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-indigo-500/10 rounded-2xl">
                          <Palette className="w-6 h-6 text-indigo-500" />
                       </div>
                       <div>
                          <CardTitle className="text-2xl font-black tracking-tight">Visual Interface</CardTitle>
                          <CardDescription className="text-muted-foreground font-semibold">Define the density and structural behavior of the system.</CardDescription>
                       </div>
                    </div>
                 </CardHeader>
                 <CardContent className="p-8 space-y-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-3xl bg-surface-alpha border border-white/5 hover:border-primary/20 transition-all gap-6">
                       <div className="space-y-2">
                          <Label className="font-black text-base">Elastic Sidebar Navigation</Label>
                          <p className="text-xs text-muted-foreground font-semibold max-w-sm">Automatically collapse navigation on smaller viewports to prioritize data canvas.</p>
                       </div>
                       <Switch checked={enableSidebarCollapse} onCheckedChange={setEnableSidebarCollapse} className="data-[state=checked]:bg-primary" />
                    </div>

                    <div className="space-y-4">
                       <Label className="text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase">Interface Density Pattern</Label>
                       <Select value={layoutDensity} onValueChange={(val: any) => setLayoutDensity(val)}>
                          <SelectTrigger className="h-14 rounded-2xl bg-surface-alpha border-white/5 focus:border-primary/50 font-black text-lg px-6">
                             <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-white/10 bg-background/95 backdrop-blur-xl shadow-2xl">
                             <SelectItem value="comfortable" className="rounded-xl px-4 py-3 font-black text-sm focus:bg-primary/10">Comfortable / Spacious</SelectItem>
                             <SelectItem value="compact" className="rounded-xl px-4 py-3 font-black text-sm focus:bg-primary/10">Dense / Performance</SelectItem>
                          </SelectContent>
                       </Select>
                    </div>
                 </CardContent>
              </Card>

              <Card className="glass-dashboard border-2 border-white/5 overflow-hidden relative group">
                 <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent" />
                 <CardHeader className="p-8 border-b border-white/5 relative z-10">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-emerald-500/10 rounded-2xl">
                          <Terminal className="w-6 h-6 text-emerald-500" />
                       </div>
                       <div>
                          <CardTitle className="text-2xl font-black tracking-tight">System Theme</CardTitle>
                          <CardDescription className="text-muted-foreground font-semibold">Your UI is currently operating in High-Contrast Dark Mode.</CardDescription>
                       </div>
                    </div>
                 </CardHeader>
                 <CardContent className="p-8 space-y-8 relative z-10">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-6 rounded-3xl bg-surface-alpha border-2 border-primary shadow-2xl shadow-primary/10 relative">
                          <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary" />
                          <h4 className="font-black mb-1">Deep Carbon</h4>
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active</p>
                       </div>
                       <div className="p-6 rounded-3xl bg-white/2 border border-white/5 hover:border-white/10 transition-all cursor-not-allowed grayscale">
                          <h4 className="font-black mb-1 opacity-40">Liquid Light</h4>
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Coming Soon</p>
                       </div>
                    </div>
                 </CardContent>
              </Card>
           </div>
        </TabsContent>

        {/* ── FINANCE TAB ────────────────────────────────────────── */}
        <TabsContent value="finance" className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
           <Card className="glass-dashboard border-2 border-white/5 overflow-hidden">
              <CardHeader className="p-8 border-b border-white/5">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-2xl">
                       <DollarSign className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                       <CardTitle className="text-2xl font-black tracking-tight">Ledger Calibration</CardTitle>
                       <CardDescription className="text-muted-foreground font-semibold">Standards applied across all financial vectors.</CardDescription>
                    </div>
                 </div>
              </CardHeader>
              <CardContent className="p-8 space-y-10">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="space-y-4">
                       <Label className="text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase">Functional Currency</Label>
                       <Select value={currency} onValueChange={setCurrency}>
                          <SelectTrigger className="h-14 rounded-2xl bg-surface-alpha border-white/5 font-black text-lg px-6"><SelectValue /></SelectTrigger>
                          <SelectContent className="rounded-2xl border-white/10 bg-background/95 backdrop-blur-xl shadow-2xl">
                             {CURRENCIES.map(c => <SelectItem key={c.code} value={c.code} className="rounded-xl px-4 py-3 font-black text-sm">{c.label}</SelectItem>)}
                          </SelectContent>
                       </Select>
                    </div>

                    <div className="space-y-4">
                       <Label className="text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase">Chronos Format</Label>
                       <Select value={dateFormat} onValueChange={setDateFormat}>
                          <SelectTrigger className="h-14 rounded-2xl bg-surface-alpha border-white/5 font-black text-lg px-6"><SelectValue /></SelectTrigger>
                          <SelectContent className="rounded-2xl border-white/10 bg-background/95 backdrop-blur-xl shadow-2xl">
                             {DATE_FORMATS.map(d => <SelectItem key={d.value} value={d.value} className="rounded-xl px-4 py-3 font-black text-sm">{d.label}</SelectItem>)}
                          </SelectContent>
                       </Select>
                    </div>

                    <div className="space-y-4">
                       <Label className="text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase flex items-center justify-between">
                          Identity Prefix
                          <span className="text-primary tracking-tighter font-black">{invPrefix}-0001</span>
                       </Label>
                       <Input 
                          value={invPrefix} 
                          maxLength={6} 
                          onChange={e => setInvPrefix(e.target.value.toUpperCase())} 
                          className="h-14 rounded-2xl bg-surface-alpha border-white/5 font-mono font-black text-2xl tracking-[0.2em] px-6 text-center" 
                       />
                    </div>
                 </div>

                 <div className="p-8 rounded-[40px] bg-linear-to-br from-primary/10 via-background to-transparent border border-primary/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                       <Globe className="w-48 h-48 text-primary" />
                    </div>
                    <div className="flex items-center gap-4 mb-8">
                       <Globe className="w-8 h-8 text-primary" />
                       <h3 className="text-2xl font-black tracking-tight">Parallel Market Tracking</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       <div className="space-y-4">
                          <Label className="text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase">EUR → DZD Real Value</Label>
                          <div className="relative group/input">
                             <Input 
                                type="number" 
                                value={parallelRates.EUR_DZD} 
                                onChange={e => setParallelRates({...parallelRates, EUR_DZD: parseFloat(e.target.value) || 0})} 
                                className="h-14 rounded-2xl bg-surface-alpha border-white/5 focus:border-primary/50 font-black text-2xl px-12 pl-14 transition-all" 
                             />
                             <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-xl text-primary/50 group-focus-within/input:text-primary transition-colors">€</span>
                          </div>
                       </div>
                       <div className="space-y-4">
                          <Label className="text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase">USD → DZD Real Value</Label>
                          <div className="relative group/input">
                             <Input 
                                type="number" 
                                value={parallelRates.USD_DZD} 
                                onChange={e => setParallelRates({...parallelRates, USD_DZD: parseFloat(e.target.value) || 0})} 
                                className="h-14 rounded-2xl bg-surface-alpha border-white/5 focus:border-primary/50 font-black text-2xl px-12 pl-14 transition-all" 
                             />
                             <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-xl text-primary/50 group-focus-within/input:text-primary transition-colors">$</span>
                          </div>
                       </div>
                    </div>
                    <p className="mt-8 text-xs font-semibold text-muted-foreground leading-relaxed max-w-xl">
                       Critical for hyper-inflationary or unindexed parallel markets. Manual overrides here bypass system-wide exchange fetchers for invoice calculation.
                    </p>
                 </div>
              </CardContent>
           </Card>
        </TabsContent>

        {/* ── LOGIC ENGINE TAB ─────────────────────────────────────── */}
        <TabsContent value="logic" className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
           <Card className="glass-dashboard border-2 border-primary/20 shadow-2xl shadow-primary/5 overflow-hidden">
              <CardHeader className="p-8 border-b border-white/5">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-2xl">
                       <Workflow className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                       <CardTitle className="text-2xl font-black tracking-tight">Active Logic Guards</CardTitle>
                       <CardDescription className="text-muted-foreground font-semibold">Autonomous rules that enforce business policy in the background.</CardDescription>
                    </div>
                 </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                 {[
                    { title: 'Immediate PDF Dispatch', desc: 'Auto-generate and email invoices once state hits "FINISHED".', state: autoDispatchInvoice, setter: setAutoDispatchInvoice, color: 'text-emerald-500' },
                    { title: 'Critical Stock Defense', desc: 'Halt transaction threads if item volumes fall below defined thresholds.', state: lowStockAlerts, setter: setLowStockAlerts, color: 'text-amber-500' },
                    { title: 'Discount Authorization', desc: 'Force internal supervisor PIN if line-item discount exceeds 15% threshold.', state: requireApprovalForDiscounts, setter: setRequireApprovalForDiscounts, color: 'text-indigo-500' },
                 ].map((logic, i) => (
                    <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-8 rounded-[32px] bg-white/3 border border-white/5 hover:border-primary/30 transition-all gap-8">
                       <div className="space-y-2">
                          <Label className="font-black text-xl tracking-tight flex items-center gap-3">
                             <div className={cn("w-2 h-2 rounded-full", logic.state ? "bg-emerald-500 animate-pulse" : "bg-muted")} />
                             {logic.title}
                          </Label>
                          <p className="text-sm text-muted-foreground font-semibold max-w-2xl leading-relaxed">{logic.desc}</p>
                       </div>
                       <Switch checked={logic.state} onCheckedChange={logic.setter} className="data-[state=checked]:bg-primary h-8 w-14" />
                    </div>
                 ))}
              </CardContent>
              <CardFooter className="p-8 bg-surface-alpha border-t border-white/5">
                 <div className="flex items-center gap-3 text-muted-foreground font-bold text-xs uppercase tracking-[0.2em]">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    Governed by Role-Based Access Control
                 </div>
              </CardFooter>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
