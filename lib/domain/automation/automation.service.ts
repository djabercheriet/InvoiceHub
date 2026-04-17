import { createClient } from '@/lib/supabase/client';
import type { AutomationRuleForm } from './automation.types';

export const automationService = {
  
  async getRules(companyId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createRule(companyId: string, data: AutomationRuleForm) {
    const supabase = createClient();
    const { error } = await supabase
      .from('automation_rules')
      .insert({
        company_id: companyId,
        ...data
      });

    if (error) throw error;
    return true;
  },

  async toggleRuleActive(ruleId: string, isActive: boolean) {
    const supabase = createClient();
    const { error } = await supabase
      .from('automation_rules')
      .update({ is_active: isActive })
      .eq('id', ruleId);

    if (error) throw error;
    return true;
  },

  async deleteRule(ruleId: string) {
    const supabase = createClient();
    const { error } = await supabase.from('automation_rules').delete().eq('id', ruleId);
    if (error) throw error;
    return true;
  },

  async getLogs(companyId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('automation_logs')
      .select('*, automation_rules(name, action_type)')
      .eq('company_id', companyId)
      .order('executed_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return data || [];
  },

  /**
   * The core engine event trigger. Other services call this when important things happen.
   * e.g., automationService.triggerEvent(companyId, 'inventory.low_stock', `Product ${p.name} drops below threshold.`);
   */
  async triggerEvent(companyId: string, eventName: string, contextMessage: string) {
    const supabase = createClient();
    
    // 1. Find active rules matching this event
    const { data: rules, error: rulesErr } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .eq('trigger_event', eventName);

    if (rulesErr || !rules || rules.length === 0) return; // No workflows care about this event

    // 2. Execute actions and log them
    for (const rule of rules) {
      try {
        // [SIMULATED ACTION EXECUTION]
        // In a complex app, we'd switch(rule.action_type) and call an EmailService or Slack API.
        // For our MVP, we simulate success immediately.
        const resultMessage = `Action [${rule.action_type}] executed: ${contextMessage}`;

        await supabase.from('automation_logs').insert({
          company_id: companyId,
          rule_id: rule.id,
          status: 'success',
          message: resultMessage
        });
      } catch (err: any) {
        await supabase.from('automation_logs').insert({
          company_id: companyId,
          rule_id: rule.id,
          status: 'failed',
          message: `Action Failed: ${err.message}`
        });
      }
    }
  }
};
