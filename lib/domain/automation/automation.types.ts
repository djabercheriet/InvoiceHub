import { z } from 'zod';

export const automationRuleSchema = z.object({
  name: z.string().min(2, "Rule name is required"),
  trigger_event: z.string().min(1, "Trigger event is required"),
  action_type: z.string().min(1, "Action type is required"),
});

export type AutomationRuleForm = z.infer<typeof automationRuleSchema>;

export interface AutomationRule {
  id: string;
  company_id: string;
  name: string;
  trigger_event: string;
  action_type: string;
  is_active: boolean;
  created_at: string;
}

export interface AutomationLog {
  id: string;
  company_id: string;
  rule_id: string;
  status: 'success' | 'failed';
  message: string;
  executed_at: string;
  automation_rules?: {
    name: string;
    action_type: string;
  };
}

export const TRIGGER_EVENTS = [
  { id: 'product.stock_low', label: 'Inventory Low Stock' },
  { id: 'invoice.status_changed', label: 'Invoice Status Changed' },
  { id: 'payment.recorded', label: 'Payment Recorded' },
];

export const ACTION_TYPES = [
  { id: 'send_email', label: 'Send Email Notification' },
  { id: 'system_alert', label: 'Trigger System Alert' },
];
