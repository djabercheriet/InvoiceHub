import { customerSchema } from './customer.schema';
import { CustomerSchema } from './customer.types';
import * as customerRepository from './customer.repository';
import { Customer } from './customer.types';
import { emitEvent } from '@/lib/events';

export const customerService = {
  async getCustomers(companyId: string) {
    const { data, error } = await customerRepository.getCustomers(companyId);
    if (error) throw error;
    return data;
  },

  async getCustomerById(customerId: string) {
    const { data, error } = await customerRepository.getCustomerById(customerId);
    if (error) throw error;
    return data;
  },

  async createCustomer(companyId: string, customerData: CustomerSchema) {
    const validated = customerSchema.parse(customerData);
    const { data, error } = await customerRepository.createCustomer(companyId, validated);
    if (error) throw error;

    emitEvent('customer.created', {
      customerId: data.id,
      companyId,
      name: data.name
    });

    return data;
  },

  async updateCustomer(customerId: string, updates: Partial<Customer>) {
    const { data, error } = await customerRepository.updateCustomer(customerId, updates);
    if (error) throw error;
    return data;
  },

  async deleteCustomer(customerId: string) {
    const { error } = await customerRepository.deleteCustomer(customerId);
    if (error) throw error;
    return true;
  }
};
