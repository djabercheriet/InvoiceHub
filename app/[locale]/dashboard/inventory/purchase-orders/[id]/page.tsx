"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft, ShoppingCart, TruckIcon, CheckCircle2, Clock,
  XCircle, Package, Building2, Calendar, Info, Activity as ActivityIcon
} from "lucide-react";
import { ActivityTimeline } from "@/components/activities/activity-timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [po, setPo] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchPO(); }, [params.id]);

  const fetchPO = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('*, suppliers(*), companies(*)')
        .eq('id', params.id)
        .single();
      if (error) throw error;
      setPo(data);

      const { data: itm, error: itmErr } = await supabase
        .from('purchase_order_items')
        .select('*, products(name, sku, quantity)')
        .eq('purchase_order_id', params.id);
      if (itmErr) throw itmErr;
      setItems(itm || []);
    } catch (err: any) {
      toast.error("Failed to load purchase order.");
      router.push('/dashboard/inventory/purchase-orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    setActionLoading(true);
    try {
      const { error } = await supabase.from('purchase_orders').update({ status: newStatus }).eq('id', po.id);
      if (error) throw error;
      toast.success(`Status updated to ${newStatus.toUpperCase()}`);
      fetchPO();
    } catch (err: any) {
      toast.error("Status update failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReceiveOrder = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/purchase-orders/${po.id}/receive`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to receive order.");
      toast.success("Purchase Order received! Stock updated automatically.", {
        description: `${items.length} product(s) have been restocked.`
      });
      fetchPO();
    } catch (err: any) {
      toast.error("Receive failed: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'received': return { label: 'Received', class: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: CheckCircle2 };
      case 'ordered': return { label: 'In Transit', class: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: TruckIcon };
      case 'cancelled': return { label: 'Cancelled', class: 'bg-red-500/10 text-red-600 border-red-500/20', icon: XCircle };
      default: return { label: 'Draft', class: 'bg-muted text-muted-foreground border-border/50', icon: Clock };
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-24 space-y-4">
      <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground animate-pulse">Loading Purchase Order</p>
    </div>
  );

  const statusConfig = getStatusConfig(po.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 px-4 lg:px-0">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-6">
        <Button variant="ghost" onClick={() => router.push('/dashboard/inventory/purchase-orders')} className="gap-2 font-bold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Button>
        <div className="flex items-center gap-3">
          {po.status === 'draft' && (
            <Button variant="outline" size="sm" onClick={() => handleUpdateStatus('ordered')} disabled={actionLoading}
              className="gap-2 font-bold border-blue-500/20 text-blue-600 hover:bg-blue-500/5">
              <TruckIcon className="w-4 h-4" /> Mark as Ordered
            </Button>
          )}
          {(po.status === 'draft' || po.status === 'ordered') && (
            <Button size="sm" onClick={handleReceiveOrder} disabled={actionLoading}
              className="gap-2 font-bold bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20">
              <CheckCircle2 className="w-4 h-4" /> Receive Order
            </Button>
          )}
          {po.status !== 'received' && po.status !== 'cancelled' && (
            <Button variant="ghost" size="sm" onClick={() => handleUpdateStatus('cancelled')} disabled={actionLoading}
              className="gap-2 font-bold text-red-500 hover:bg-red-500/10">
              <XCircle className="w-4 h-4" /> Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main PO Card */}
        <Card className="lg:col-span-2 border-none shadow-2xl glass-card">
          <CardHeader className="bg-violet-500/5 border-b border-border/40 p-8">
            <div className="flex items-start justify-between">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-violet-600 flex items-center justify-center shadow-xl shadow-violet-600/20">
                  <ShoppingCart className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Purchase Order</h1>
                  <p className="text-muted-foreground font-mono text-sm opacity-70">Reference: {po.po_number}</p>
                </div>
              </div>
              <div className="text-right space-y-2">
                <Badge className={cn("font-bold tracking-widest px-4 py-1 text-xs", statusConfig.class)}>
                  {statusConfig.label}
                </Badge>
                <div className="flex flex-col text-[10px] font-bold text-muted-foreground tracking-widest gap-1">
                  <div className="flex items-center justify-end gap-1">
                    <Calendar className="w-3 h-3" /> Created: {po.created_at?.split('T')[0]}
                  </div>
                  {po.expected_date && (
                    <div className="flex items-center justify-end gap-1 text-blue-600">
                      <TruckIcon className="w-3 h-3" /> Expected: {po.expected_date}
                    </div>
                  )}
                  {po.received_at && (
                    <div className="flex items-center justify-end gap-1 text-emerald-600">
                      <CheckCircle2 className="w-3 h-3" /> Received: {po.received_at?.split('T')[0]}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-10">
            {/* Supplier Info */}
            <div className="grid grid-cols-2 gap-12">
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-muted-foreground tracking-widest border-b border-border/20 pb-2">ISSUING COMPANY</h3>
                <div>
                  <p className="font-bold">{po.companies?.name}</p>
                  <p className="text-xs text-muted-foreground">{po.companies?.email}</p>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-muted-foreground tracking-widest border-b border-border/20 pb-2">SUPPLIER</h3>
                {po.suppliers ? (
                  <div>
                    <p className="font-bold">{po.suppliers.name}</p>
                    <p className="text-xs text-muted-foreground">{po.suppliers.email}</p>
                    <p className="text-xs text-muted-foreground">{po.suppliers.phone}</p>
                  </div>
                ) : (
                  <p className="text-sm italic text-muted-foreground opacity-50">No supplier assigned</p>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold text-muted-foreground tracking-widest border-b border-border/20 pb-2">PROCUREMENT ITEMS</h3>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/40">
                    <TableHead className="text-[10px] font-bold tracking-widest px-0">ITEM</TableHead>
                    <TableHead className="text-[10px] font-bold tracking-widest text-center">QTY ORDERED</TableHead>
                    <TableHead className="text-[10px] font-bold tracking-widest text-center">CURRENT STOCK</TableHead>
                    <TableHead className="text-[10px] font-bold tracking-widest text-center">UNIT PRICE</TableHead>
                    <TableHead className="text-[10px] font-bold tracking-widest text-right pr-0">LINE TOTAL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, idx) => (
                    <TableRow key={idx} className="border-border/10">
                      <TableCell className="px-0 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{item.description}</span>
                          <span className="text-[10px] font-mono opacity-40">{item.products?.sku || 'MANUAL'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-bold text-violet-600">{item.quantity}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={cn("text-[10px] font-bold",
                          (item.products?.quantity || 0) <= 5
                            ? "bg-red-500/10 text-red-600 border-red-500/20"
                            : "bg-muted text-muted-foreground"
                        )}>
                          {item.products?.quantity ?? '—'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-xs font-bold">${item.unit_price.toLocaleString()}</TableCell>
                      <TableCell className="text-right pr-0 font-bold text-violet-600">
                        ${item.total.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Total */}
            <div className="flex justify-end">
              <div className="w-64 space-y-3">
                <div className="pt-4 border-t border-violet-500/20 flex justify-between items-center bg-violet-500/5 p-4 rounded-xl">
                  <span className="text-[10px] font-bold text-violet-600">ORDER TOTAL</span>
                  <span className="text-2xl font-bold">${po.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {po.notes && (
              <div className="p-4 bg-muted/20 rounded-xl border border-border/40">
                <h4 className="text-[10px] font-bold text-muted-foreground tracking-widest mb-2 flex items-center gap-2">
                  <Info className="w-3 h-3" /> Internal Notes
                </h4>
                <p className="text-xs text-muted-foreground">{po.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border-none shadow-xl glass-card bg-violet-600/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold tracking-widest text-violet-600">Order Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", statusConfig.class)}>
                  <StatusIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">{statusConfig.label}</p>
                  <p className="text-[10px] text-muted-foreground">Updated: {new Date(po.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
              {po.status === 'draft' && (
                <p className="text-[10px] text-muted-foreground pt-2 border-t border-border/40">
                  Receiving this order will automatically update stock levels for all linked products.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl glass-card">
            <CardHeader className="pb-2 border-b border-border/40 mb-4">
              <CardTitle className="text-[10px] font-bold tracking-widest text-muted-foreground flex items-center gap-2">
                <ActivityIcon className="w-3 h-3" /> Event Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityTimeline entityId={po.id} entityType="purchase_order" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
