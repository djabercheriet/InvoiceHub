export type JobType =
  | 'INVOICE_PROCESS'
  | 'ANALYTICS_AGGREGATE'
  | 'EMAIL_SEND';

export interface JobPayload {
  'INVOICE_PROCESS': { invoiceId: string; companyId: string; userId: string; shouldSendEmail?: boolean };
  'ANALYTICS_AGGREGATE': { companyId: string; metricType: 'revenue' | 'customers' | 'products' };
  'EMAIL_SEND': {
    template: 'welcome' | 'password_reset' | 'invoice';
    to: string;
    data: any;
  };
}

export type Job<T extends JobType = JobType> = {
  id: string;
  type: T;
  payload: JobPayload[T];
  attempts: number;
  maxAttempts: number;
  createdAt: string;
};
