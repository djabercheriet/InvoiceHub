import { z } from 'zod';

export const expenseSchema = z.object({
  title: z.string().min(2, "Title is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  date: z.string().min(1, "Date is required"),
  receipt_url: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;

export interface ExpenseRecord {
  id: string;
  company_id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  receipt_url?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export type TransactionType = 'IN' | 'OUT';
export type TransactionSource = 'invoice' | 'expense' | 'purchase_order';

export interface TransactionRecord {
  id: string; // The ID of the generic transaction, or synthetic ID
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  source: TransactionSource;
  source_id: string; 
  status: string;
  category: string;
}
