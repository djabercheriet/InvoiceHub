export type EventType = 
  | 'invoice.created'
  | 'invoice.updated'
  | 'invoice.deleted'
  | 'customer.created'
  | 'customer.updated'
  | 'product.created'
  | 'product.stock_low'
  | 'payment.recorded';

export interface AppEventPayload {
  'invoice.created': { invoiceId: string; companyId: string; userId: string; total: number };
  'invoice.updated': { invoiceId: string; companyId: string; userId: string; status?: string };
  'invoice.deleted': { invoiceId: string; companyId: string; userId: string };
  'customer.created': { customerId: string; companyId: string; name: string };
  'customer.updated': { customerId: string; companyId: string };
  'product.created': { productId: string; companyId: string; name: string };
  'product.stock_low': { productId: string; companyId: string; quantity: number; min_stock_level: number };
  'payment.recorded': { paymentId: string; invoiceId: string; amount: number; companyId: string; customerId: string };
}

export type AppEvent<T extends EventType = EventType> = {
  type: T;
  payload: AppEventPayload[T];
  timestamp: string;
};
