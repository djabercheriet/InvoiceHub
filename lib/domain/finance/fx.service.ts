import { createClient } from '@/lib/supabase/server';

const API_SOURCE = 'https://open.er-api.com/v6/latest'; // Free ExchangeRate-API (no key needed for latest)

interface CachedRates {
  rates: Record<string, number>;
  timestamp: number;
}

const rateCache: Record<string, CachedRates> = {};

export const fxService = {
  /**
   * Gets the exchange rate between two currencies.
   * Prioritizes "Square Market" (Parallel) rates for DZD pairs if defined in company preferences.
   */
  async getExchangeRate(companyId: string, from: string, to: string): Promise<number> {
    if (from === to) return 1;

    const supabase = await createClient();

    // 1. Check for Square Market (Parallel) Rates in Company Preferences
    const { data: company } = await supabase
      .from('companies')
      .select('preferences')
      .eq('id', companyId)
      .single();

    const parallelRates = company?.preferences?.parallel_rates || {};
    const pairKey = `${from}_${to}`;
    const inverseKey = `${to}_${from}`;

    if (parallelRates[pairKey]) {
      return Number(parallelRates[pairKey]);
    }
    
    if (parallelRates[inverseKey]) {
      return 1 / Number(parallelRates[inverseKey]);
    }

    // 2. Fetch from Official API (with 24h local cache)
    const now = Date.now();
    if (rateCache[from] && (now - rateCache[from].timestamp) < 24 * 60 * 60 * 1000) {
      const rate = rateCache[from].rates[to];
      if (rate) return rate;
    }

    try {
      const res = await fetch(`${API_SOURCE}/${from}`);
      const data = await res.json();
      
      if (data.result === 'success') {
        rateCache[from] = {
          rates: data.rates,
          timestamp: now
        };
        return data.rates[to] || 1;
      }
    } catch (error) {
      console.error('[FX Service] API Fetch failed:', error);
    }

    return 1; // Fallback
  },

  /**
   * Converts an amount from one currency to another.
   */
  async convert(amount: number, from: string, to: string, companyId: string): Promise<{ convertedAmount: number, rate: number }> {
    const rate = await this.getExchangeRate(companyId, from, to);
    return {
      convertedAmount: Number((amount * rate).toFixed(2)),
      rate
    };
  }
};
