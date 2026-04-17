import { z } from 'zod';

export const paymentSchema = z.object({
  invoice_id: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  payment_method: z.enum(['cash', 'transfer', 'card', 'paypal', 'other']),
  payment_date: z.string().or(z.date()).transform(val => 
    typeof val === 'string' ? val : val.toISOString().split('T')[0]
  ),
  reference: z.string().optional(),
  status: z.string().default('completed'),
  notes: z.string().optional(),
  company_id: z.string().uuid(),
  customer_id: z.string().uuid(),
});

export type PaymentSchema = z.infer<typeof paymentSchema>;
