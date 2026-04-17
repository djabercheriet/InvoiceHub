export type POStatus = 'draft' | 'ordered' | 'received' | 'cancelled';

export interface PurchaseOrder {
  id: string;
  company_id: string;
  supplier_id: string | null;
  po_number: string;
  status: POStatus;
  total: number;
  expected_date: string | null;
  received_at: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  suppliers?: { name: string; email: string | null; phone: string | null };
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  product_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  created_at: string;
  // Joined
  products?: { name: string; sku: string | null; quantity: number };
}

export type CreatePOData = Partial<Omit<PurchaseOrder, 'id' | 'created_at' | 'updated_at'>>;
export type CreatePOItemData = Partial<Omit<PurchaseOrderItem, 'id' | 'created_at'>>;
