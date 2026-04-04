"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Save, ShieldCheck, Mail, Database, Terminal } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    } catch (err: any) {
      toast.error("Failed to load settings: " + err.message);
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
    };
    try {
      if (settings?.id) {
        const { error } = await supabase.from("platform_settings").update(data).eq("id", settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("platform_settings").insert(data);
        if (error) throw error;
      }
      toast.success("Platform settings saved.");
      fetchSettings();
    } catch (err: any) {
      toast.error("Save failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center p-24 space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs uppercase font-semibold tracking-wider text-muted-foreground animate-pulse">Loading settings</p>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-7">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2.5">
            <Globe className="w-6 h-6 text-indigo-500" />
            Platform Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Global platform configuration and defaults.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Infrastructure */}
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/40 py-4">
              <CardTitle className="text-xs uppercase font-semibold tracking-wider flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-500" />
                Platform Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="site_name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Platform Name</Label>
                <Input id="site_name" name="site_name" defaultValue={settings?.site_name} placeholder="InvoiceHub" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support_email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Support Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                  <Input id="support_email" name="support_email" defaultValue={settings?.support_email} placeholder="support@platform.io" className="pl-9" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-500/5 rounded-lg border border-red-500/20">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">Maintenance Mode</span>
                  <span className="text-xs text-red-600/60 font-medium">Lock all platform access</span>
                </div>
                <Switch name="is_maintenance_mode" defaultChecked={settings?.is_maintenance_mode} />
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/40 py-4">
              <CardTitle className="text-xs uppercase font-semibold tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-500" />
                SEO & Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="meta_title" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Meta Title</Label>
                <Input id="meta_title" name="meta_title" defaultValue={settings?.meta_title} placeholder="InvoiceHub — Invoice Management" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta_description" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Meta Description</Label>
                <Textarea id="meta_description" name="meta_description" defaultValue={settings?.meta_description} className="min-h-[100px] resize-none" placeholder="Streamline your invoicing..." />
              </div>
            </CardContent>
          </Card>

          {/* Fiscal defaults */}
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/40 py-4">
              <CardTitle className="text-xs uppercase font-semibold tracking-wider flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-500" />
                Fiscal Defaults
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="global_currency" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Currency</Label>
                  <Input id="global_currency" name="global_currency" defaultValue={settings?.global_currency} placeholder="USD" className="text-center font-mono" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="global_tax_rate" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tax Rate %</Label>
                  <Input id="global_tax_rate" name="global_tax_rate" type="number" step="0.01" defaultValue={settings?.global_tax_rate} className="text-center" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save card */}
          <Card className="border-border/50 shadow-sm bg-indigo-500/3">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/10 rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">Save Changes</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Changes apply globally across all organizations.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Verify all parameters before saving. Settings changes affect every connected workspace immediately.
              </p>
            </CardContent>
            <CardFooter className="pt-5 border-t border-border/40 bg-muted/20">
              <Button
                type="submit"
                disabled={saving}
                className="w-full h-11 font-semibold bg-indigo-600 hover:bg-indigo-700 shadow-sm active:scale-[0.98] transition-all"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="w-4 h-4" /> Save Settings
                  </span>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
}
