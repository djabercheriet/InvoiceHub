import * as z from "zod";

export const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name is required"),
  sku: z.string().min(2, "SKU is required"),
  category: z.string().min(2, "Category is required"),
  buy_price: z.coerce.number().min(0, "Buy price must be >= 0"),
  unit_price: z.coerce.number().min(0, "Retail price must be >= 0"),
  quantity: z.coerce.number().min(0, "Quantity cannot be negative"),
  min_stock_level: z.coerce.number().min(0, "Min stock cannot be negative"),
  unit_type: z.string().default("unit"),
  image_url: z.string().optional(),
  supplier_id: z.string().optional().nullable(),
});

export const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Category name is required"),
});
