"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Lock, Building2, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const settingsSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Company name is required"),
  email: z.string().email("Valid email required"),
  // Since address/phone etc. are not strictly in standard missing_logic.sql, we'll store them safely if they exist, or ignore for now.
  // Assuming the user runs standard Supabase migrations. We'll stick to what we know exists: Name & Email.
});

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: { name: "", email: "" },
  });

  useEffect(() => {
    async function loadCompany() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: companies } = await supabase.from('companies').select('*').eq('user_id', user.id).single();
      if (companies) {
        form.reset({
          id: companies.id,
          name: companies.name,
          email: companies.email,
        });
      }
      setLoading(false);
    }
    loadCompany();
  }, [form, supabase]);

  const onSubmit = async (values: z.infer<typeof settingsSchema>) => {
    setIsSaving(true);
    try {
      if (!values.id) throw new Error("No company found to update.");
      const { error } = await supabase.from("companies").update({
        name: values.name,
        email: values.email
      }).eq("id", values.id);
      
      if (error) throw error;
      toast.success("Settings saved successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading settings...</div>;

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account and business preferences</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <div>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Update your business details stored in the database</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Company Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Billing Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="flex justify-end pt-4 border-t border-border mt-6">
                <Button type="submit" disabled={isSaving} className="gap-2">
                  <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Static Mock sections for UI aesthetics until extended DB schema is confirmed */}
      <Card className="opacity-70 pointer-events-none grayscale">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <div>
              <CardTitle>Notifications (Coming Soon)</CardTitle>
              <CardDescription>Notification preferences require additional database setup</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div><p className="font-medium text-sm">Invoice Reminders</p></div>
            <input type="checkbox" checked={true} readOnly className="w-5 h-5 rounded border-input" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
