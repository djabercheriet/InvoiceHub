-- Migration: Create Automation Schema
-- Phase 6: Automation Module

CREATE TABLE IF NOT EXISTS public.automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    trigger_event TEXT NOT NULL, -- e.g., 'inventory.low_stock'
    action_type TEXT NOT NULL, -- e.g., 'send_email', 'system_notification'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.automation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    rule_id UUID NOT NULL REFERENCES public.automation_rules(id) ON DELETE CASCADE,
    status TEXT NOT NULL, -- 'success', 'failed'
    message TEXT,
    executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Rules
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view automation rules of their company" ON public.automation_rules;
CREATE POLICY "Users can view automation rules of their company"
  ON public.automation_rules FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.companies WHERE id = automation_rules.company_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert automation rules" ON public.automation_rules;
CREATE POLICY "Users can insert automation rules"
  ON public.automation_rules FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update automation rules" ON public.automation_rules;
CREATE POLICY "Users can update automation rules"
  ON public.automation_rules FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.companies WHERE id = automation_rules.company_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete automation rules" ON public.automation_rules;
CREATE POLICY "Users can delete automation rules"
  ON public.automation_rules FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.companies WHERE id = automation_rules.company_id AND user_id = auth.uid()));

-- RLS: Logs
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view automation logs of their company" ON public.automation_logs;
CREATE POLICY "Users can view automation logs of their company"
  ON public.automation_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.companies WHERE id = automation_logs.company_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert automation logs" ON public.automation_logs;
CREATE POLICY "Users can insert automation logs"
  ON public.automation_logs FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND user_id = auth.uid()));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_auto_rules_company ON public.automation_rules(company_id);
CREATE INDEX IF NOT EXISTS idx_auto_logs_company ON public.automation_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_auto_logs_rule ON public.automation_logs(rule_id);

-- Triggers
DROP TRIGGER IF EXISTS update_auto_rules_updated_at ON public.automation_rules;
CREATE TRIGGER update_auto_rules_updated_at BEFORE UPDATE ON public.automation_rules
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

COMMENT ON TABLE public.automation_rules IS 'Stores user-defined workflow rules mapping events to actions.';
COMMENT ON TABLE public.automation_logs IS 'Execution logs for automation triggers.';
