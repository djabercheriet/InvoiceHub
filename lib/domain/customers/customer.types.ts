import * as z from "zod";
import { customerSchema } from "./customer.schema";

export type CustomerSchema = z.infer<typeof customerSchema>;

export interface Customer extends CustomerSchema {
  id: string;
  company_id: string;
  created_at: string;
  updated_at?: string;
  status: "active" | "inactive";
}
