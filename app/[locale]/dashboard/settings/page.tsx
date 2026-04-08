"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building2, Save, Globe, Scale, DollarSign, FileText, Hash,
  CheckCircle2, Loader2, Percent, Settings
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
  { code: "CHF", label: "Swiss Franc (CHF)" },
  { code: "JPY", label: "Japanese Yen (JPY)" },
  { code: "CNY", label: "Chinese Yuan (CNY)" },
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

export default function SettingsPage() {
  const supabase   = createClient();
  const [loading, setLoading]   = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved,    setSaved]    = useState(false);

  // Company basic info
  const [companyId,     setCompanyId]     = useState("");
  const [companyName,   setCompanyName]   = useState("");
  const [companyEmail,  setCompanyEmail]  = useState("");
  const [companyPhone,  setCompanyPhone]  = useState("");
  const [companyAddr,   setCompanyAddr]   = useState("");
  const [taxId,         setTaxId]         = useState("");
  const [website,       setWebsite]       = useState("");

  // Preferences
  const [currency,     setCurrency]     = useState("USD");
  const [weightUnit,   setWeightUnit]   = useState("kg");
  const [dateFormat,   setDateFormat]   = useState("YYYY-MM-DD");
  const [taxRate,      setTaxRate]      = useState<number>(0);
  const [invPrefix,    setInvPrefix]    = useState("INV");

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user.id).single();
        if (!profile?.company_id) return;

        const { data: co } = await supabase
          .from("companies")
          .select("*")
          .eq("id", profile.company_id)
          .single();

        if (co) {
          setCompanyId(co.id);
          setCompanyName(co.name || "");
          setCompanyEmail(co.email || co.billing_email || "");
          setCompanyPhone(co.phone || "");
          setCompanyAddr(co.address || "");
          setTaxId(co.tax_id || "");
          setWebsite(co.website || "");

          const prefs = co.preferences || {};
          setCurrency(prefs.currency  || co.currency || "USD");
          setWeightUnit(prefs.weight_unit || "kg");
          setDateFormat(prefs.date_format || "YYYY-MM-DD");
          setTaxRate(prefs.tax_rate ?? 0);
          setInvPrefix(prefs.invoice_prefix || "INV");
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
        name:          companyName,
        email:         companyEmail,
        phone:         companyPhone,
        address:       companyAddr,
        tax_id:        taxId,
        website:       website,
        currency:      currency,
        preferences: {
          currency,
          weight_unit:    weightUnit,
          date_format:    dateFormat,
          tax_rate:       taxRate,
          invoice_prefix: invPrefix,
        },
      }).eq("id", companyId);

      if (error) throw error;
      setSaved(true);
      toast.success("Settings saved successfully!");
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      toast.error("Save failed: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center p-24 gap-3 text-muted-foreground">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span className="text-sm font-medium">Loading settings…</span>
    </div>
  );

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500 px-4 lg:px-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-7">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary" />
            Configuration
          </h1>
          <p className="text-muted-foreground font-medium">
            Manage workspace preferences, currency, and business details.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          size="lg"
          className={cn(
            "gap-2 font-bold tracking-widest shadow-lg transition-all",
            saved && "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
          )}
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {isSaving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      {/* ── Company Info ─────────────────────────────────────────────────── */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <div>
              <CardTitle className="text-base font-bold">Company Information</CardTitle>
              <CardDescription>Your business identity and contact details.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground tracking-wider">Company Name</Label>
              <Input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Acme Corporation" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground tracking-wider">Billing Email</Label>
              <Input type="email" value={companyEmail} onChange={e => setCompanyEmail(e.target.value)} placeholder="billing@acme.io" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground tracking-wider">Phone</Label>
              <Input value={companyPhone} onChange={e => setCompanyPhone(e.target.value)} placeholder="+1 555-000-0000" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground tracking-wider">Website</Label>
              <Input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://acme.io" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground tracking-wider">Tax ID / VAT Number</Label>
              <Input value={taxId} onChange={e => setTaxId(e.target.value)} placeholder="FR-12345678" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground tracking-wider">Address</Label>
            <Input value={companyAddr} onChange={e => setCompanyAddr(e.target.value)} placeholder="123 Business Street, City, Country" />
          </div>
        </CardContent>
      </Card>

      {/* ── Invoice Preferences ──────────────────────────────────────────── */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <div>
              <CardTitle className="text-base font-bold">Invoice Preferences</CardTitle>
              <CardDescription>Default values applied to all new invoices.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Currency */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-3 h-3" />Currency
              </Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(c => (
                    <SelectItem key={c.code} value={c.code} className="font-medium text-sm">{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Weight Unit */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
                <Scale className="w-3 h-3" />Default Weight Unit
              </Label>
              <Select value={weightUnit} onValueChange={setWeightUnit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WEIGHT_UNITS.map(u => (
                    <SelectItem key={u.value} value={u.value} className="font-medium text-sm">{u.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Format */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
                <Globe className="w-3 h-3" />Date Format
              </Label>
              <Select value={dateFormat} onValueChange={setDateFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATE_FORMATS.map(d => (
                    <SelectItem key={d.value} value={d.value} className="font-medium text-sm">{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Default Tax Rate */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
                <Percent className="w-3 h-3" />Default Tax Rate (%)
              </Label>
              <Input
                type="number" step="0.5" min={0} max={100}
                value={taxRate}
                onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>

            {/* Invoice Prefix */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
                <Hash className="w-3 h-3" />Invoice Number Prefix
              </Label>
              <Input
                value={invPrefix}
                maxLength={8}
                onChange={e => setInvPrefix(e.target.value.toUpperCase())}
                placeholder="INV"
                className="font-mono font-bold"
              />
              <p className="text-[10px] text-muted-foreground">Preview: <span className="font-mono font-bold text-foreground">{invPrefix}-2025-0001</span></p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Preview / Info ────────────────────────────────────────────────── */}
      <Card className="border-primary/20 bg-primary/5 border-2">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { label: "Currency",     value: currency },
              { label: "Weight Unit",  value: weightUnit },
              { label: "Date Format",  value: dateFormat },
              { label: "Default Tax",  value: `${taxRate}%` },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <p className="text-[10px] font-bold tracking-widest text-muted-foreground">{item.label}</p>
                <p className="text-xl font-bold tracking-tight text-primary">{item.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
