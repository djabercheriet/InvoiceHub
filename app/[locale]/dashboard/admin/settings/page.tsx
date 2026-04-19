"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  Save, 
  ShieldCheck, 
  Mail, 
  Database, 
  Terminal, 
  Settings2, 
  Code, 
  FileCode2, 
  Zap,
  Activity,
  Cpu,
  Lock,
  Wifi,
  Radio,
  History,
  Fingerprint,
  Layers,
  HardDrive,
  MonitorSmartphone,
  Server,
  Loader2,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function SuperAdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // SMTP settings
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [emailFromName, setEmailFromName] = useState("");
  
  // Theme Toggle for Email Preview
  const [previewDark, setPreviewDark] = useState(true);

  const supabase = createClient();

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("platform_settings")
        .select("*")
        .single();
      if (error && error.code !== "PGRST116") throw error;
      setSettings(data || {});
      
      const emailConfig = data?.email_config || {};
      setSmtpHost(emailConfig.host || "smtp.mailgun.org");
      setSmtpPort(emailConfig.port || "587");
      setSmtpUser(emailConfig.user || "");
      setSmtpPass(emailConfig.pass || "");
      setEmailFromName(emailConfig.from_name || data?.site_name || "Bntec Cloud");
      
    } catch (err: any) {
      toast.error("Failed to load platform configurations: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      site_name: formData.get("site_name"),
      meta_title: formData.get("meta_title"),
      meta_description: formData.get("meta_description"),
      support_email: formData.get("support_email"),
      global_currency: formData.get("global_currency"),
      global_tax_rate: parseFloat((formData.get("global_tax_rate") as string) || "0"),
      is_maintenance_mode: formData.get("is_maintenance_mode") === "on",
      email_config: {
         host: smtpHost,
         port: smtpPort,
         user: smtpUser,
         pass: smtpPass,
         from_name: emailFromName
      }
    };
    try {
      if (settings?.id) {
        const { error } = await supabase.from("platform_settings").update(data).eq("id", settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("platform_settings").insert(data);
        if (error) throw error;
      }
      toast.success("Core settings deployed successfully.");
      fetchSettings();
    } catch (err: any) {
      toast.error("Deployment failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center p-32 space-y-6">
        <div className="relative">
           <div className="w-16 h-16 border-4 border-indigo-500/10 rounded-full" />
           <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
        </div>
        <div className="text-center">
           <p className="text-[10px] uppercase font-black tracking-[0.3em] text-indigo-400 animate-pulse">Mounting Operating System Kernel</p>
           <p className="text-[9px] text-muted-foreground mt-2 font-mono italic opacity-50">Authorized access confirmed...</p>
        </div>
      </div>
    );

  return (
    <div className="space-y-10">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                <Globe className="w-6 h-6 text-indigo-400" />
             </div>
             <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">System <span className="text-indigo-500">Parameters</span></h1>
          </div>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            <Server className="w-4 h-4 text-indigo-500" />
            Managing root identity, infrastructure protocols, and dispatch layers.
          </p>
        </div>

        <div className="flex items-center gap-3 p-3 bg-surface-alpha border border-white/10 rounded-2xl">
           <Fingerprint className="w-5 h-5 text-indigo-400 animate-pulse" />
           <p className="text-[10px] font-black tracking-widest text-white/40 uppercase">Root Authority Verified</p>
        </div>
      </div>

      <form onSubmit={handleSave}>
         <Tabs defaultValue="infrastructure" className="w-full">
            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 mb-10">
                <TabsList className="bg-surface-alpha border border-white/5 p-1 rounded-2xl">
                    <TabsTrigger value="infrastructure" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-xl px-6 font-black tracking-widest text-[9px] uppercase transition-all">Infrastructure</TabsTrigger>
                    <TabsTrigger value="mail" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-xl px-6 font-black tracking-widest text-[9px] uppercase transition-all">Transport Layer</TabsTrigger>
                    <TabsTrigger value="templates" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-xl px-6 font-black tracking-widest text-[9px] uppercase transition-all">Visual Scaffolding</TabsTrigger>
                </TabsList>
                
                <Button type="submit" disabled={saving} className="h-14 px-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} 
                    Deploy Configurations
                </Button>
            </div>

            {/* TAB 1: INFRASTRUCTURE */}
            <TabsContent value="infrastructure" className="mt-0 space-y-8">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Platform Identity */}
                  <Card className="glass-dashboard border-white/5 overflow-hidden">
                    <CardHeader className="p-8 pb-4">
                      <div className="flex items-center justify-between">
                         <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                           <Terminal className="w-4 h-4 text-indigo-500" /> Platform Signature
                         </CardTitle>
                         <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] uppercase font-black px-2 py-0.5">Online</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-8 pt-4 space-y-6">
                      <div className="space-y-2 group">
                        <Label htmlFor="site_name" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 group-focus-within:text-indigo-400 transition-colors">Operational Brand Name</Label>
                        <Input id="site_name" name="site_name" defaultValue={settings?.site_name} placeholder="Bntec Platform" className="h-14 bg-surface-alpha border-white/5 focus:border-indigo-500/50 rounded-2xl font-black italic tracking-tight text-white" />
                      </div>
                      <div className="space-y-2 group">
                        <Label htmlFor="support_email" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 group-focus-within:text-indigo-400 transition-colors">Primary Support Node</Label>
                        <Input id="support_email" name="support_email" defaultValue={settings?.support_email} placeholder="support@bntec.io" className="h-14 bg-surface-alpha border-white/5 focus:border-indigo-500/50 rounded-2xl font-mono text-sm font-bold tracking-tight text-white" />
                      </div>
                      
                      <div className="p-6 bg-red-500/3 rounded-[24px] border border-red-500/10 hover:border-red-500/30 transition-all flex items-center justify-between group/emergency">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                             <ShieldCheck className="w-4 h-4 text-red-500" />
                             <span className="text-xs font-black text-red-500 uppercase tracking-widest italic">Protocol 99: Lockdown</span>
                          </div>
                          <p className="text-[9px] text-red-500/40 font-black uppercase tracking-widest leading-relaxed max-w-[280px]">Disables all tenant sessions and returns a 503 maintenance standard.</p>
                        </div>
                        <Switch name="is_maintenance_mode" defaultChecked={settings?.is_maintenance_mode} className="data-[state=checked]:bg-red-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-8">
                      {/* SEO */}
                      <Card className="glass-dashboard border-white/5 overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                          <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                            <Globe className="w-4 h-4 text-sky-400" /> SEO Matrix FALLBACK
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-4 space-y-6">
                          <div className="space-y-2 group">
                            <Label htmlFor="meta_title" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 group-focus-within:text-sky-400 transition-colors">Global Document Title</Label>
                            <Input id="meta_title" name="meta_title" defaultValue={settings?.meta_title} placeholder="Bntec Platform" className="h-14 bg-surface-alpha border-white/5 focus:border-sky-500/50 rounded-2xl font-bold tracking-tight text-white text-sm" />
                          </div>
                          <div className="space-y-2 group">
                            <Label htmlFor="meta_description" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 group-focus-within:text-sky-400 transition-colors">Global Header Registry</Label>
                            <Textarea id="meta_description" name="meta_description" defaultValue={settings?.meta_description} className="min-h-[120px] bg-surface-alpha border-white/5 focus:border-sky-500/50 rounded-2xl font-medium text-white/60 resize-none p-4 text-xs leading-relaxed" placeholder="Default search engine index fallback description." />
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Fiscal defaults */}
                      <Card className="glass-dashboard border-white/5 overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                          <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                            <Database className="w-4 h-4 text-emerald-400" /> Operational Constants
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-4">
                          <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2 group">
                              <Label htmlFor="global_currency" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 group-focus-within:text-emerald-400 transition-colors">Base Currency Code</Label>
                              <Input id="global_currency" name="global_currency" defaultValue={settings?.global_currency} placeholder="USD" className="h-14 bg-surface-alpha border-white/5 focus:border-emerald-500/50 rounded-2xl font-black text-center text-white tracking-widest uppercase italic" />
                            </div>
                            <div className="space-y-2 group">
                              <Label htmlFor="global_tax_rate" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 group-focus-within:text-emerald-400 transition-colors">Default Tax Vector (%)</Label>
                              <Input id="global_tax_rate" name="global_tax_rate" type="number" step="0.01" defaultValue={settings?.global_tax_rate} className="h-14 bg-surface-alpha border-white/5 focus:border-emerald-500/50 rounded-2xl font-black text-center text-white text-lg tracking-widest" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                  </div>
               </div>
            </TabsContent>

            {/* TAB 2: TRANSPORT LAYER */}
            <TabsContent value="mail" className="mt-0 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                 <Card className="glass-dashboard border-indigo-500/10 bg-linear-to-br from-indigo-500/3 to-transparent overflow-hidden">
                    <CardHeader className="p-10 pb-6 border-b border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                               <Mail className="w-6 h-6" />
                            </div>
                            <div>
                               <CardTitle className="text-xl font-black tracking-tighter text-white uppercase italic">Secure SMTP Tunnels</CardTitle>
                               <CardDescription className="text-muted-foreground font-medium mt-1">Authorized mail gateway for system-wide dispatch and Magic Link authentication.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-10 pt-8 space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                             <div className="space-y-6">
                                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2 opacity-50"><Wifi className="w-3.5 h-3.5" /> Connection Grid</h4>
                                <div className="space-y-4">
                                   <div className="space-y-2 group">
                                     <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 group-focus-within:text-indigo-400 transition-colors">SMTP Relay Host</Label>
                                     <Input value={smtpHost} onChange={e=>setSmtpHost(e.target.value)} placeholder="smtp.mailgun.org" className="h-14 bg-black/40 border-white/5 focus:border-indigo-500/50 rounded-2xl font-mono text-white text-sm tracking-tight" />
                                   </div>
                                   <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2 group">
                                        <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Port</Label>
                                        <Input value={smtpPort} onChange={e=>setSmtpPort(e.target.value)} placeholder="587" className="h-14 bg-black/40 border-white/5 focus:border-indigo-500/50 rounded-2xl font-mono text-center text-white" />
                                      </div>
                                      <div className="space-y-2 group">
                                        <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Encryption</Label>
                                        <div className="h-14 flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-[10px] font-black text-indigo-400 uppercase tracking-widest italic shadow-[0_0_10px_rgba(99,102,241,0.1)]">
                                           STARTTLS
                                        </div>
                                      </div>
                                   </div>
                                   <div className="space-y-2 group">
                                     <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 group-focus-within:text-indigo-400 transition-colors">Identity Signature (From)</Label>
                                     <Input value={emailFromName} onChange={e=>setEmailFromName(e.target.value)} placeholder="Bntec Platform Admin" className="h-14 bg-black/40 border-white/5 focus:border-indigo-500/50 rounded-2xl font-black text-white italic tracking-tight" />
                                   </div>
                                </div>
                             </div>

                             <div className="space-y-6">
                                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2 opacity-50"><Lock className="w-3.5 h-3.5" /> Handshake Credentials</h4>
                                <div className="space-y-4">
                                   <div className="space-y-2 group">
                                     <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 group-focus-within:text-indigo-400 transition-colors">Relay Username</Label>
                                     <Input value={smtpUser} onChange={e=>setSmtpUser(e.target.value)} placeholder="postmaster@yourdomain.io" className="h-14 bg-black/40 border-white/5 focus:border-indigo-500/50 rounded-2xl font-mono text-white text-xs tracking-tight" />
                                   </div>
                                   <div className="space-y-2 group">
                                     <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 group-focus-within:text-indigo-400 transition-colors">Secure PassportToken</Label>
                                     <Input type="password" value={smtpPass} onChange={e=>setSmtpPass(e.target.value)} placeholder="••••••••••••••••" className="h-14 bg-black/40 border-white/5 focus:border-indigo-500/50 rounded-2xl font-mono text-white tracking-widest" />
                                   </div>
                                   <div className="pt-6">
                                       <Button variant="ghost" className="w-full h-14 bg-surface-alpha border border-white/5 hover:bg-surface-alpha hover:border-indigo-500/30 rounded-2xl font-black tracking-widest uppercase text-[10px] text-white transition-all flex items-center gap-3">
                                           <Zap className="w-4 h-4 text-amber-500 animate-pulse" /> Ping Transport Node
                                       </Button>
                                   </div>
                                </div>
                             </div>
                        </div>
                    </CardContent>
                    <CardFooter className="p-10 pt-0 bg-white/1">
                        <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] italic">
                           <ShieldCheck className="w-3 h-3" /> Encrypted RSA-4096 Auth Endpoints Active
                        </div>
                    </CardFooter>
                 </Card>
            </TabsContent>

            {/* TAB 3: TEMPLATES BUILDER */}
            <TabsContent value="templates" className="mt-0 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 items-start">
                    
                    {/* The Controls / Editor */}
                    <Card className="glass-dashboard border-white/5 sticky top-24">
                        <CardHeader className="p-8 pb-4 border-b border-white/5 flex flex-row items-center justify-between bg-white/1">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                                <Code className="w-4 h-4 text-purple-400" /> Scaffold Engine
                            </CardTitle>
                            <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[9px] uppercase font-black">Reactive</Badge>
                        </CardHeader>
                        <CardContent className="p-8 pt-8 space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Template Hook</Label>
                                <Select defaultValue="invoice_dispatch">
                                    <SelectTrigger className="h-14 bg-surface-alpha border-white/5 rounded-2xl font-black text-white uppercase italic tracking-tight"><SelectValue /></SelectTrigger>
                                    <SelectContent className="bg-[#0b0e14] border-white/10 rounded-2xl shadow-2xl">
                                        <SelectItem value="invoice_dispatch" className="text-[10px] font-black uppercase tracking-widest focus:bg-indigo-600 focus:text-white rounded-xl py-3">Invoice Dispatch Protocol</SelectItem>
                                        <SelectItem value="magic_link" className="text-[10px] font-black uppercase tracking-widest focus:bg-indigo-600 focus:text-white rounded-xl py-3">Magic Link Logic</SelectItem>
                                        <SelectItem value="low_stock" className="text-[10px] font-black uppercase tracking-widest focus:bg-indigo-600 focus:text-white rounded-xl py-3">Asset Depletion Alert</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 group">
                                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 group-focus-within:text-purple-400 transition-colors">Primary Branding Hex</Label>
                                <div className="flex gap-4 items-center">
                                    <div className="w-14 h-14 bg-indigo-500 rounded-2xl border border-white/10 shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                                    <Input defaultValue="#6366f1" className="h-14 bg-surface-alpha border-white/5 focus:border-purple-500/50 rounded-2xl font-mono tracking-widest uppercase text-white font-black" />
                                </div>
                            </div>
                            
                            <div className="space-y-2 group">
                                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 group-focus-within:text-purple-400 transition-colors">HTML Payload Body (Support Liquid)</Label>
                                <div className="relative group/textarea">
                                   <div className="absolute -inset-1 bg-linear-to-r from-indigo-500 to-purple-500 rounded-[26px] opacity-0 group-focus-within/textarea:opacity-10 blur-sm transition-all"></div>
                                   <Textarea className="h-[350px] bg-black/40 border-white/5 focus:border-purple-500/50 rounded-[24px] font-mono text-[10px] text-white/40 group-focus-within/textarea:text-white flex shadow-2xl transition-all resize-y p-6 leading-relaxed scrollbar-thin scrollbar-thumb-white/5" 
                                       defaultValue={`<div class="header">\n  <h1>New Invoice Ready</h1>\n</div>\n\n<p>Hello {{client.name}},</p>\n\n<p>Please find attached Invoice <strong>{{invoice.prefix}}-{{invoice.year}}-{{invoice.number}}</strong>.</p>\n\n<a href="{{invoice.download_url}}" class="btn-primary">Download PDF Document</a>\n\n<div class="footer">\n   <p>Thank you for doing business with {{company.name}}.</p>\n</div>`}
                                   />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* The Live Visual Preview */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FileCode2 className="w-5 h-5 text-indigo-400" />
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white italic">Neural Render Simulation</h3>
                            </div>
                            <div className="flex bg-surface-alpha p-1.5 rounded-2xl border border-white/5">
                                <button type="button" onClick={()=>setPreviewDark(false)} className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", !previewDark ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white")}>Day</button>
                                <button type="button" onClick={()=>setPreviewDark(true)} className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", previewDark ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]" : "text-white/40 hover:text-white")}>Night</button>
                            </div>
                        </div>

                        {/* --- PIXEL PERFECT EMAIL PREVIEW (Dark / Light responsive state) --- */}
                        <div className={cn("rounded-[32px] border transition-all duration-700 overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative", previewDark ? "bg-[#0b0e14] border-white/10" : "bg-white border-slate-200")}>
                            {/* Decorative MacOS Top Bar */}
                            <div className={cn("h-12 flex items-center px-6 border-b", previewDark ? "bg-white/2 border-white/5" : "bg-slate-50 border-slate-100")}>
                                <div className="flex gap-2.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.3)]"></div>
                                    <div className="w-3 h-3 rounded-full bg-amber-500/80 shadow-[0_0_8px_rgba(245,158,11,0.3)]"></div>
                                    <div className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.3)]"></div>
                                </div>
                                <div className={cn("flex-1 text-center font-black text-[9px] uppercase tracking-[0.2em] transform -translate-x-6", previewDark ? "text-white/20" : "text-slate-300")}>
                                   Email Protocol v4.2
                                </div>
                            </div>
                            
                            {/* Email Canvas View */}
                            <div className="p-8 md:p-16">
                                <div className="max-w-[480px] mx-auto space-y-10 font-sans">
                                    
                                    {/* Company Logo Header */}
                                    <div className="flex items-center gap-4">
                                        <div className={cn("w-12 h-12 rounded-[18px] flex items-center justify-center bg-indigo-600 shrink-0 shadow-lg")}>
                                            <Zap className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                           <h1 className={cn("font-black tracking-tighter leading-none text-2xl italic uppercase", previewDark ? "text-white" : "text-slate-900")}>Bntec <span className="text-indigo-500">Cloud</span></h1>
                                           <div className="flex items-center gap-2 mt-1.5 font-black uppercase tracking-widest text-[10px]">
                                              <span className={cn(previewDark ? "text-white/40" : "text-slate-400")}>Infrastructure</span>
                                              <div className="w-1 h-1 rounded-full bg-indigo-500"></div>
                                              <span className="text-indigo-500">Authorized Node</span>
                                           </div>
                                        </div>
                                    </div>

                                    {/* Email Body */}
                                    <div className="space-y-6">
                                        <h2 className={cn("text-3xl font-black tracking-tighter leading-tight", previewDark ? "text-white" : "text-slate-900 uppercase italic")}>Digital Ledger <br/>Dispatch Protocol</h2>
                                        <div className={cn("h-px w-20 bg-indigo-500")}></div>
                                        <p className={cn("text-base leading-relaxed font-medium", previewDark ? "text-white/60" : "text-slate-600")}>
                                            Salutations <span className={cn("font-black", previewDark ? "text-white" : "text-slate-900 italic")}>Operator #404</span>,<br/><br/>
                                            An authoritative digital ledger document has been compiled and is securely awaiting your review at the node endpoint. Sum Valuation is anchored at <strong className="text-indigo-500 font-black">$4,500.00 USD</strong>.
                                        </p>
                                    </div>

                                    {/* Call to action Block */}
                                    <div className={cn("p-8 rounded-[32px] border relative group/preview", previewDark ? "bg-white/2 border-white/5" : "bg-slate-50 border-slate-200")}>
                                        <div className="flex flex-col gap-5">
                                            <div className={cn("flex justify-between items-center border-b pb-5", previewDark ? "border-white/5" : "border-slate-200")}>
                                                <span className={cn("font-black uppercase tracking-widest text-[9px]", previewDark ? "text-white/30" : "text-slate-400")}>PROTOCOL ID</span>
                                                <span className={cn("font-mono font-black tracking-widest text-[11px]", previewDark ? "text-indigo-400" : "text-indigo-600")}>INV-2025-0142</span>
                                            </div>
                                            <div className="flex justify-between items-center border-b border-transparent">
                                                <span className={cn("font-black uppercase tracking-widest text-[9px]", previewDark ? "text-white/30" : "text-slate-500")}>TIMESTAMP</span>
                                                <span className={cn("font-black uppercase tracking-widest text-[10px]", previewDark ? "text-white" : "text-slate-900")}>APRIL 15, 2026</span>
                                            </div>

                                            <button type="button" className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black tracking-widest text-[10px] uppercase shadow-2xl shadow-indigo-600/30 mt-4 transition-all active:scale-[0.98]">
                                                Access Encrypted Node
                                            </button>
                                        </div>
                                    </div>

                                    {/* Sub-footer */}
                                    <div className={cn("pt-8 border-t space-y-4", previewDark ? "border-white/5" : "border-slate-100")}>
                                        <div className="flex items-center gap-3">
                                           <div className={cn("w-2 h-2 rounded-full", previewDark ? "bg-emerald-500" : "bg-emerald-600")}></div>
                                           <span className={cn("text-[9px] font-black uppercase tracking-widest", previewDark ? "text-white/40" : "text-slate-400")}>Carrier Grade Encryption Active</span>
                                        </div>
                                        <p className={cn("text-[10px] leading-relaxed font-bold tracking-tight", previewDark ? "text-white/20" : "text-slate-300")}>
                                           Automated transmission. Reply headers will be discarded at the gateway. For physical node support contact primary infrastructure desk.
                                        </p>
                                        <div className="flex items-center justify-between pt-2">
                                           <p className="text-[10px] font-black text-indigo-500/50 tracking-[0.2em] uppercase italic">© 2026 Bntec Matrix Systems</p>
                                           <div className="flex gap-4">
                                              <Globe className={cn("w-3.5 h-3.5", previewDark ? "text-white/10" : "text-slate-200")} />
                                              <ShieldCheck className={cn("w-3.5 h-3.5", previewDark ? "text-white/10" : "text-slate-200")} />
                                           </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>

                        <Card className="glass-dashboard border-white/5 bg-linear-to-r from-purple-500/5 to-indigo-500/5">
                           <CardContent className="p-6 flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                                 <Sparkles className="w-5 h-5" />
                              </div>
                              <div className="flex-1">
                                 <p className="text-[10px] font-black text-white uppercase tracking-widest">A.I. Component Assist</p>
                                 <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest opacity-60">Neural rendering generates pixel-perfect previews for cross-client compatibility.</p>
                              </div>
                           </CardContent>
                        </Card>

                    </div>
                </div>
            </TabsContent>

         </Tabs>
      </form>
    </div>
  );
}
