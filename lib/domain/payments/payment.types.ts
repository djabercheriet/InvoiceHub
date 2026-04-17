import { z } from 'zod';

export type PaymentMethod = 'cash' | 'transfer' | 'card' | 'paypal' | 'other';

export interface Payment {
  id: string;
  company_id: string;
  customer_id: string;
  invoice_id: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  payment_date: string;
  reference?: string;
  status: string;
  notes?: string;
  created_at: string;
  created_by?: string;
}

export type CreatePaymentInput = Omit<Payment, 'id' | 'created_at'>;
