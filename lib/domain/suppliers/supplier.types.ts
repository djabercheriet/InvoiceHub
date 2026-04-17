export interface Supplier {
  id: string;
  company_id: string;
  name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CreateSupplierData = Partial<Omit<Supplier, 'id' | 'created_at' | 'updated_at'>>;
export type UpdateSupplierData = Partial<Supplier>;
