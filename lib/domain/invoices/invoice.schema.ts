import * as z from "zod";

export const itemSchema = z.object({
  productId: z.string().optional(),
  designation: z.string().min(1, "Description required"),
  quantity: z.coerce.number().min(0.01, "Min 0.01"),
  unitType: z.enum(["unit", "kg", "lb", "ln", "m", "L", "ton"]).default("unit"),
  unitPrice: z.coerce.number().min(0, "Invalid price"),
  discount: z.coerce.number().min(0).max(100).default(0),
  taxRate: z.coerce.number().min(0).max(100).default(0),
});

export const invoiceSchema = z.object({
  invoiceType: z.enum(["sale", "purchase"]).default("sale"),
  customerName: z.string().optional(),
  supplierName: z.string().optional(),
  issueDate: z.string(),
  dueDate: z.string(),
  notes: z.string().optional(),
  currency: z.string().default("USD"),
  items: z.array(itemSchema).min(1, "At least one line item required"),
  public_token: z.string().uuid().optional(),
});
