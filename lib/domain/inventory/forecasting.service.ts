import { createClient } from '@/lib/supabase/server';

export interface ForecastingResult {
  productId: string;
  dailyBurnRate: number;
  daysRemaining: number;
  outOfStockDate: Date | null;
  status: 'healthy' | 'warning' | 'critical';
}

export const forecastingService = {
  /**
   * Calculates the daily burn rate and estimated out-of-stock date for a product.
   */
  async getProductForecast(productId: string, companyId: string): Promise<ForecastingResult> {
    const supabase = await createClient();

    // 1. Get company forecasting window preference
    const { data: company } = await supabase
      .from('companies')
      .select('preferences')
      .eq('id', companyId)
      .single();

    const windowDays = Number(company?.preferences?.inventory_forecasting_window || 30);

    // 2. Fetch stock movements (type: 'out') for the window
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - windowDays);

    const { data: movements } = await supabase
      .from('stock_movements')
      .select('quantity, created_at')
      .eq('product_id', productId)
      .eq('movement_type', 'out')
      .gte('created_at', startDate.toISOString());

    // 3. Calculate Daily Burn Rate
    const totalQtyOut = movements?.reduce((sum, m) => sum + Number(m.quantity), 0) || 0;
    const dailyBurnRate = totalQtyOut / windowDays;

    // 4. Get Current Quantity
    const { data: product } = await supabase
      .from('products')
      .select('quantity, min_stock_level')
      .eq('id', productId)
      .single();

    const currentQty = product?.quantity || 0;
    const minStock = product?.min_stock_level || 0;

    // 5. Calculate Days Remaining
    let daysRemaining = Infinity;
    let outOfStockDate = null;

    if (dailyBurnRate > 0) {
      daysRemaining = currentQty / dailyBurnRate;
      outOfStockDate = new Date();
      outOfStockDate.setDate(outOfStockDate.getDate() + Math.floor(daysRemaining));
    }

    // 6. Determine Health Status
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (currentQty <= minStock || daysRemaining < 7) {
      status = 'critical';
    } else if (daysRemaining < 14) {
      status = 'warning';
    }

    return {
      productId,
      dailyBurnRate: parseFloat(dailyBurnRate.toFixed(2)),
      daysRemaining: daysRemaining === Infinity ? 999 : Math.round(daysRemaining),
      outOfStockDate,
      status
    };
  }
};
