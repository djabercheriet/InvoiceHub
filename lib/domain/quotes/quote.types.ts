// Json type inline since this project uses database.ts (not database.types)
type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';

export interface Quote {
  id: string;
  company_id: string;
  customer_id: string | null;
  quote_number: string;
  status: QuoteStatus;
  issue_date: string;
  valid_until: string | null;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  currency: string;
  notes: string | null;
  metadata: Json;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  customers?: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  profiles?: {
    full_name: string;
  };
}

export interface QuoteItem {
  id: string;
  quote_id: string;
  product_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  tax_rate: number;
  total: number;
  created_at: string;
  // Joined fields
  products?: {
    name: string;
    sku: string | null;
  };
}

export type CreateQuoteData = Partial<Omit<Quote, 'id' | 'created_at' | 'updated_at'>>;
export type UpdateQuoteData = Partial<Quote>;
export type CreateQuoteItemData = Partial<Omit<QuoteItem, 'id' | 'created_at'>>;
