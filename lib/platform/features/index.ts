/**
 * Feature Flag System (PRD V2)
 * Controls visibility of core modules without duplicating logic.
 */

export type FeatureKey = 
  | 'automation' 
  | 'payments' 
  | 'reports' 
  | 'inventory' 
  | 'sales' 
  | 'finance'
  | 'admin_panel';

export interface FeatureFlag {
  key: FeatureKey;
  enabled: boolean;
  minTier?: 'starter' | 'pro' | 'enterprise';
}

/**
 * Checks if a feature is enabled for the current context.
 * This can later be expanded to fetch from DB/Tenant settings.
 */
export async function isFeatureEnabled(
  key: FeatureKey, 
  tier: string = 'starter'
): Promise<boolean> {
  // Mapping tiers to numeric levels for easy comparison
  const tierLevels: Record<string, number> = {
    'starter': 1,
    'pro': 2,
    'enterprise': 3
  };

  const featureTierRequirements: Partial<Record<FeatureKey, number>> = {
    'automation': 2, // Pro+
    'reports': 2,    // Pro+
    'finance': 2,    // Pro+
  };

  const requiredLevel = featureTierRequirements[key] || 1;
  const currentLevel = tierLevels[tier] || 1;

  return currentLevel >= requiredLevel;
}
