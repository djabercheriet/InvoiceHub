"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Trash2, Edit2, ShieldAlert, UserPlus, Building2, ShieldCheck, Mail, Fingerprint, Activity } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { FormDialog } from "@/components/ui/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, companies(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (err: any) {
      toast.error("Failed to load global user directory: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      full_name: formData.get("full_name"),
      role: formData.get("role"),
    };
    try {
      if (selectedUser) {
        const { error } = await supabase.from("profiles").update(data).eq("id", selectedUser.id);
        if (error) throw error;
        toast.success("Identity protocol updated.");
      }
      setIsDialogOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast.error("Override failed: " + err.message);
    }
  };

  const handleDelete = async (user: any) => {
    if (!confirm(`AUTHORIZED ACTION: Deactivate security credentials for "${user.full_name}"? This terminates platform-wide access.`)) return;
    try {
      const { error } = await supabase.from("profiles").delete().eq("id", user.id);
      if (error) throw error;
      toast.success("Identity purged from global registry.");
      fetchUsers();
    } catch (err: any) {
      toast.error("Purging failed.");
    }
  };

  const columns = [
    {
      header: "Identity Signature",
      accessorKey: "full_name",
      cell: (row: any) => (
        <div className="flex items-center gap-4 py-1">
          <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 font-bold text-indigo-600 text-sm shrink-0 shadow-sm">
            {row.full_name?.substring(0, 1) || "U"}
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tight text-sm leading-none">{row.full_name || "Unidentified User"}</span>
            <div className="flex items-center gap-2 mt-1.5 opacity-60">
                <Fingerprint className="w-3 h-3 text-indigo-500" />
                <span className="text-[9px] font-mono tracking-widest">{row.id?.substring(0, 12).toUpperCase()}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Primary Authorization",
      accessorKey: "role",
      cell: (row: any) => (
        <div className="flex items-center gap-2">
            {row.role === 'admin' ? <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> : <Activity className="w-3.5 h-3.5 text-muted-foreground/60" />}
            <Badge className={cn(
              "font-bold text-[9px] tracking-widest px-3 py-0.5 border",
              row.role === "admin"
                ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
                : "bg-muted/50 text-muted-foreground border-border/40"
            )}>
              {row.role}
            </Badge>
        </div>
      ),
    },
    {
      header: "Owner Organization",
      accessorKey: "companies.name",
      cell: (row: any) => (
        <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-indigo-500/40" />
            <span className="font-bold tracking-tight text-xs text-muted-foreground">{row.companies?.name || "Independent Account"}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* Super Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Users className="w-8 h-8 text-indigo-600" />
            Global User Registry
          </h1>
          <p className="text-sm font-medium text-muted-foreground">
            Platform-wide identity management and authoritative access control.
          </p>
        </div>
        <Button disabled className="gap-2 font-bold tracking-widest bg-muted/20 text-muted-foreground cursor-not-allowed border-dashed border-border/40 py-6 px-8 rounded-2xl">
          <UserPlus className="w-5 h-5" /> Provision via Auth Protocol
        </Button>
      </div>

      {/* Analytics Insight */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card bg-indigo-600/5 border-indigo-600/10 shadow-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold tracking-[0.2em] text-indigo-600">Global Identity Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold tracking-tight text-indigo-700">{users.length}</div>
          </CardContent>
        </Card>
        <Card className="glass-card shadow-xl border-none">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground">Admin Privileged</CardTitle></CardHeader>
          <CardContent><div className="text-4xl font-bold tracking-tight">{users.filter(u=>u.role==='admin').length}</div></CardContent>
        </Card>
      </div>

      {/* User Directory Table */}
      <DataTable
        data={users}
        columns={columns}
        loading={loading}
        onDelete={handleDelete}
        onEdit={(row) => { setSelectedUser(row); setIsDialogOpen(true); }}
        searchPlaceholder="Scan global identity matrix..."
        actions={(row) => (
          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
            <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-indigo-500/10 hover:text-indigo-600 rounded-xl" onClick={() => { setSelectedUser(row); setIsDialogOpen(true); }}>
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 text-red-500 hover:bg-red-500/10 rounded-xl" onClick={() => handleDelete(row)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      />

      {/* Identity Override Dialog */}
      <FormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title="Protocol Override: Identity"
        description="Modify authorized profile data and security clearace levels."
        onSubmit={handleUpdate}
        size="lg"
      >
        <div className="space-y-6 pt-5">
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-[10px] font-bold text-muted-foreground tracking-[0.2em]">Full Identity Signature</Label>
            <Input id="full_name" name="full_name" defaultValue={selectedUser?.full_name} className="h-12 glass-card font-bold" placeholder="Operator Name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role" className="text-[10px] font-bold text-muted-foreground tracking-[0.2em]">Access Protocol (admin / member)</Label>
            <Input id="role" name="role" defaultValue={selectedUser?.role} className="h-12 glass-card font-mono tracking-widest" placeholder="admin" required />
          </div>
          <div className="flex items-center gap-4 p-5 bg-indigo-500/5 rounded-3xl border border-indigo-500/20">
            <ShieldAlert className="w-5 h-5 text-indigo-600 shrink-0 animate-pulse" />
            <p className="text-xs text-indigo-700 font-bold tracking-tight">
              AUTHORIZED ACTION: Role modifications grant full access to tenant administrative resources.
            </p>
          </div>
        </div>
      </FormDialog>
    </div>
  );
}
