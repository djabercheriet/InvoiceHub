import { productSchema, categorySchema } from './inventory.schema';
import * as inventoryRepository from './inventory.repository';
import { emitEvent } from '@/lib/events';
import { createClient } from '@/lib/supabase/server';

export const inventoryService = {
  async getProducts(companyId: string) {
    const { data, error } = await inventoryRepository.getProducts(companyId);
    if (error) throw error;
    return data;
  },

  async getProductById(productId: string) {
    const { data, error } = await inventoryRepository.getProductById(productId);
    if (error) throw error;
    return data;
  },

  async createProduct(companyId: string, productData: any) {
    const validated = productSchema.parse(productData);
    
    // Logic to resolve category name to ID
    let categoryId = null;
    if (validated.category) {
      const categories = await this.getCategories(companyId);
      const existing = categories.find((c: any) => c.name.toLowerCase() === validated.category.toLowerCase());
      
      if (existing) {
        categoryId = existing.id;
      } else {
        const newCat = await this.createCategory(companyId, { name: validated.category });
        categoryId = newCat.id;
      }
    }

    const { data, error } = await inventoryRepository.createProduct(companyId, {
      ...validated,
      category_id: categoryId,
      category: undefined, // Remove the name before insert
    });

    if (error) throw error;

    emitEvent('product.created', {
      productId: data.id,
      companyId,
      name: data.name
    });

    // Check for low stock immediately
    if (data.quantity <= data.min_stock_level) {
      emitEvent('product.stock_low', {
        productId: data.id,
        companyId,
        quantity: data.quantity,
        min_stock_level: data.min_stock_level
      });
    }

    return data;
  },

  async updateProduct(productId: string, updates: any) {
    const { data, error } = await inventoryRepository.updateProduct(productId, updates);
    if (error) throw error;
    return data;
  },

  async deleteProduct(productId: string) {
    const { error } = await inventoryRepository.deleteProduct(productId);
    if (error) throw error;
    return true;
  },

  async getCategories(companyId: string) {
    const { data, error } = await inventoryRepository.getCategories(companyId);
    if (error) throw error;
    return data;
  },

  async createCategory(companyId: string, categoryData: any) {
    const validated = categorySchema.parse(categoryData);
    const { data, error } = await inventoryRepository.createCategory(companyId, validated);
    if (error) throw error;
    return data;
  },

  async deleteCategory(categoryId: string) {
    const { error } = await inventoryRepository.deleteCategory(categoryId);
    if (error) throw error;
    return true;
  },

  /**
   * Canonical stock adjustment method.
   * All stock changes (sale, PO, manual) should flow through here.
   */
  async adjustStock(
    productId: string,
    companyId: string,
    delta: number,
    type: 'in' | 'out',
    note: string
  ) {
    const supabase = await createClient();

    const { data: product, error: fetchErr } = await supabase
      .from('products')
      .select('quantity, min_stock_level, name')
      .eq('id', productId)
      .single();

    if (fetchErr || !product) throw new Error('Product not found');

    const newQty = type === 'in'
      ? (product.quantity || 0) + delta
      : Math.max(0, (product.quantity || 0) - delta);

    await supabase.from('products').update({ quantity: newQty }).eq('id', productId);

    await supabase.from('stock_movements').insert({
      company_id: companyId,
      product_id: productId,
      movement_type: type,
      quantity: delta,
      note,
    });

    // Emit low stock event if threshold crossed
    if (newQty <= product.min_stock_level && product.min_stock_level > 0) {
      emitEvent('product.stock_low', {
        productId,
        companyId,
        quantity: newQty,
        min_stock_level: product.min_stock_level
      });
    }

    return { productId, newQty, type, delta };
  }
};
