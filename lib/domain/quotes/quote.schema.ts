import * as z from "zod";

export const quoteItemSchema = z.object({
  productId: z.string().optional(),
  description: z.string().min(1, "Description required"),
  quantity: z.coerce.number().min(0.01, "Min 0.01"),
  unitPrice: z.coerce.number().min(0, "Invalid price"),
  discountPercent: z.coerce.number().min(0).max(100).default(0),
  taxRate: z.coerce.number().min(0).max(100).default(0),
});

export const quoteSchema = z.object({
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  quoteNumber: z.string().min(1, "Quote number required"),
  issueDate: z.string(),
  validUntil: z.string().optional(),
  notes: z.string().optional(),
  currency: z.string().default("USD"),
  items: z.array(quoteItemSchema).min(1, "At least one line item required"),
});

export type QuoteSchema = z.infer<typeof quoteSchema>;
export type QuoteItemSchema = z.infer<typeof quoteItemSchema>;
