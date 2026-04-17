import * as companyRepository from './company.repository';

export const companyService = {
  async getCompanyByUserId(userId: string) {
    const { data, error } = await companyRepository.getCompanyByUserId(userId);
    if (error) throw error;
    return data;
  },

  async updateCompany(companyId: string, updates: any) {
    const { data, error } = await companyRepository.updateCompany(companyId, updates);
    if (error) throw error;
    return data;
  },

  async getCompanySubscription(companyId: string) {
    const { data, error } = await companyRepository.getCompanySubscription(companyId);
    if (error) throw error;
    return data;
  },

  async createSubscription(companyId: string, planId: string, type: 'monthly' | 'yearly' = 'monthly') {
    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    if (type === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const subscription = {
      plan_id: planId,
      subscription_type: type,
      current_period_start: startDate.toISOString().split('T')[0],
      current_period_end: endDate.toISOString().split('T')[0],
      status: 'trial',
      is_trial_active: true,
      trial_start_date: startDate.toISOString().split('T')[0],
      trial_end_date: new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };

    const { data, error } = await companyRepository.createSubscription(companyId, subscription);
    if (error) throw error;
    return data;
  },

  async upgradeSubscription(subscriptionId: string, newPlanId: string) {
    const { data, error } = await companyRepository.upgradeSubscription(subscriptionId, newPlanId);
    if (error) throw error;
    return data;
  },

  async cancelSubscription(subscriptionId: string) {
    const { data, error } = await companyRepository.cancelSubscription(subscriptionId);
    if (error) throw error;
    return data;
  },

  async getSubscriptionUsage(subscriptionId: string) {
    const { data, error } = await companyRepository.getSubscriptionUsage(subscriptionId);
    if (error) throw error;
    return data;
  }
};
