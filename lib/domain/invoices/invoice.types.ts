import * as z from "zod";
import { invoiceSchema, itemSchema } from "./invoice.schema";

export type InvoiceSchema = z.infer<typeof invoiceSchema>;
export type InvoiceItemSchema = z.infer<typeof itemSchema>;

export interface Invoice {
  id: string;
  company_id: string;
  created_at: string;
  updated_at?: string;
  invoice_number: string;
  total: number;
  status: "draft" | "sent" | "viewed" | "paid" | "partially_paid" | "overdue" | "canceled";
  created_by: string;
  invoice_type: "sale" | "purchase";
  issue_date: string;
  due_date: string;
  notes?: string;
  currency: string;
  customer_name?: string;
  supplier_name?: string;
  public_token?: string;
  quote_id?: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  company_id: string;
  designation: string;
  quantity: number;
  unit_price: number;
  unit_type: string;
  discount: number;
  tax_rate: number;
  total: number;
  product_id?: string;
  weight_kg?: number | null;
}
