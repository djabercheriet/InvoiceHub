/**
 * Permission Layer (PRD V2)
 * RBAC system to guard UI actions.
 */

export type ActionKey = 
  | 'create_invoice'
  | 'delete_invoice'
  | 'manage_inventory'
  | 'view_reports'
  | 'manage_settings'
  | 'access_admin';

export type UserRole = 'owner' | 'admin' | 'editor' | 'viewer';

const ROLE_PERMISSIONS: Record<UserRole, ActionKey[]> = {
  owner: [
    'create_invoice', 'delete_invoice', 'manage_inventory', 
    'view_reports', 'manage_settings', 'access_admin'
  ],
  admin: [
    'create_invoice', 'manage_inventory', 'view_reports', 
    'manage_settings'
  ],
  editor: [
    'create_invoice', 'manage_inventory'
  ],
  viewer: [
    'view_reports'
  ]
};

export function can(role: UserRole | string, action: ActionKey): boolean {
  const userRole = (role as UserRole) || 'viewer';
  const permissions = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS.viewer;
  return permissions.includes(action);
}
