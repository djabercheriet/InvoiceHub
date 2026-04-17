import * as supplierRepository from './supplier.repository';
import { CreateSupplierData, UpdateSupplierData } from './supplier.types';
import { activityService } from '@/lib/domain/activities/activity.service';

export const supplierService = {
  async getSuppliers(companyId: string) {
    const { data, error } = await supplierRepository.getSuppliers(companyId);
    if (error) throw error;
    return data;
  },

  async getSupplierById(supplierId: string) {
    const { data, error } = await supplierRepository.getSupplierById(supplierId);
    if (error) throw error;
    return data;
  },

  async createSupplier(companyId: string, userId: string, data: CreateSupplierData) {
    if (!data.name?.trim()) throw new Error('Supplier name is required');

    const { data: supplier, error } = await supplierRepository.createSupplier(companyId, data);
    if (error) throw error;

    await activityService.logActivity({
      companyId,
      entityType: 'supplier',
      entityId: supplier.id,
      activityType: 'supplier.created',
      userId,
      metadata: { name: supplier.name }
    });

    return supplier;
  },

  async updateSupplier(supplierId: string, updates: UpdateSupplierData) {
    const { data, error } = await supplierRepository.updateSupplier(supplierId, updates);
    if (error) throw error;
    return data;
  },

  async deleteSupplier(supplierId: string) {
    const { error } = await supplierRepository.deleteSupplier(supplierId);
    if (error) throw error;
    return true;
  }
};
