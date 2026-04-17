import * as z from "zod";

export const customerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(6, "Phone is required"),
  address: z.string().optional(),
  tax_number: z.string().optional(),
  auth_user_id: z.string().uuid().optional().nullable(),
});
