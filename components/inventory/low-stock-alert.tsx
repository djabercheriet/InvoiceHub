"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { AlertTriangle, Package, ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LowStockProduct {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  min_stock_level: number;
}

export default function LowStockAlert({ companyId }: { companyId: string }) {
  const [lowStockItems, setLowStockItems] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (companyId) fetchLowStock();
  }, [companyId]);

  const fetchLowStock = async () => {
    try {
      // Fetch products where quantity <= min_stock_level
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sku, quantity, min_stock_level')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .filter('min_stock_level', 'gt', 0); // Only products with a configured threshold

      if (error) throw error;

      const low = (data as LowStockProduct[] || []).filter((p: LowStockProduct) => p.quantity <= p.min_stock_level);
      setLowStockItems(low);
    } catch (err) {
      // Silent fail — this is an enhancement, not critical
    } finally {
      setLoading(false);
    }
  };

  if (loading || lowStockItems.length === 0) return null;

  return (
    <div className="space-y-3 animate-in slide-in-from-top-2 duration-500">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-500" />
        <h2 className="text-[10px] font-bold tracking-widest text-amber-600 uppercase">
          Low Stock Alert — {lowStockItems.length} product{lowStockItems.length !== 1 ? 's' : ''} need restocking
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {lowStockItems.map(product => {
          const isOutOfStock = product.quantity === 0;
          return (
            <Card key={product.id} className={cn(
              "border shadow-md transition-all duration-200 hover:shadow-lg",
              isOutOfStock
                ? "border-red-500/30 bg-red-500/5"
                : "border-amber-500/30 bg-amber-500/5"
            )}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                      isOutOfStock ? "bg-red-500/20 text-red-600" : "bg-amber-500/20 text-amber-600"
                    )}>
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-sm tracking-tight">{product.name}</p>
                      <p className="text-[10px] font-mono opacity-50">{product.sku}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={cn(
                    "font-bold text-[10px] shrink-0",
                    isOutOfStock
                      ? "bg-red-500/10 text-red-600 border-red-500/20"
                      : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                  )}>
                    {product.quantity} left
                  </Badge>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">
                    Threshold: {product.min_stock_level} units
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className={cn(
                      "h-7 text-[10px] font-bold gap-1",
                      isOutOfStock
                        ? "border-red-500/20 text-red-600 hover:bg-red-500/10"
                        : "border-amber-500/20 text-amber-600 hover:bg-amber-500/10"
                    )}
                    onClick={() => window.location.href = `/dashboard/inventory/purchase-orders?product=${product.id}`}
                  >
                    <ShoppingCart className="w-3 h-3" />
                    Create PO
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
