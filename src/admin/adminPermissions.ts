export const PERMISSIONS = {
  VIEW_PROPERTIES: 'view_properties',
  MANAGE_PROPERTIES: 'manage_properties',
  VIEW_GEMS: 'view_gems',
  MANAGE_GEMS: 'manage_gems',
  VIEW_ADVENTURES: 'view_adventures',
  MANAGE_ADVENTURES: 'manage_adventures',
  VIEW_GUIDES: 'view_guides',
  MANAGE_GUIDES: 'manage_guides',
  VIEW_USERS: 'view_users',
  MANAGE_USERS: 'manage_users',
  VIEW_LOGS: 'view_logs',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_ADMINS: 'manage_admins',
  SYSTEM_SETTINGS: 'system_settings',
} as const;

export const PERMISSION_CATEGORIES = {
  PROPERTIES: 'properties',
  GEMS: 'gems',
  ADVENTURES: 'adventures',
  GUIDES: 'guides',
  USERS: 'users',
  SYSTEM: 'system',
} as const;

export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  MODERATOR: 'moderator',
  SUPPORT: 'support',
} as const;

export interface Permission {
  id: string;
  permission_key: string;
  permission_name: string;
  description: string;
  category: string;
  created_at: string;
}

export interface AdminUser {
  id: string;
  role: 'super_admin' | 'moderator' | 'support';
  email: string;
  display_name: string | null;
  department: string | null;
  phone_number: string | null;
  profile_image: string | null;
  is_active: boolean;
  invited_by: string | null;
  failed_login_attempts: number;
  locked_until: string | null;
  created_at: string;
  last_login: string | null;
}

export interface AdminInvitation {
  id: string;
  email: string;
  role: 'super_admin' | 'moderator' | 'support';
  invited_by: string | null;
  invitation_token: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  expires_at: string;
  accepted_at: string | null;
  message: string;
  created_at: string;
}

export interface AdminActivityStat {
  id: string;
  admin_id: string;
  date: string;
  approvals_count: number;
  rejections_count: number;
  items_reviewed: number;
  created_at: string;
}

export interface AdminLog {
  id: string;
  admin_id: string | null;
  action: string;
  content_type: string;
  content_id: string;
  details: any;
  ip_address: string | null;
  user_agent: string | null;
  before_state: any | null;
  after_state: any | null;
  created_at: string;
}

export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
  return userPermissions.includes(requiredPermission);
}

export function hasAnyPermission(userPermissions: string[], requiredPermissions: string[]): boolean {
  return requiredPermissions.some(permission => userPermissions.includes(permission));
}

export function hasAllPermissions(userPermissions: string[], requiredPermissions: string[]): boolean {
  return requiredPermissions.every(permission => userPermissions.includes(permission));
}

export function canManageContent(userPermissions: string[], contentType: 'property' | 'gem' | 'adventure' | 'guide'): boolean {
  const permissionMap: Record<string, string> = {
    property: PERMISSIONS.MANAGE_PROPERTIES,
    gem: PERMISSIONS.MANAGE_GEMS,
    adventure: PERMISSIONS.MANAGE_ADVENTURES,
    guide: PERMISSIONS.MANAGE_GUIDES,
  };
  return hasPermission(userPermissions, permissionMap[contentType]);
}

export function canViewContent(userPermissions: string[], contentType: 'property' | 'gem' | 'adventure' | 'guide'): boolean {
  const permissionMap: Record<string, string> = {
    property: PERMISSIONS.VIEW_PROPERTIES,
    gem: PERMISSIONS.VIEW_GEMS,
    adventure: PERMISSIONS.VIEW_ADVENTURES,
    guide: PERMISSIONS.VIEW_GUIDES,
  };
  return hasPermission(userPermissions, permissionMap[contentType]);
}

export function getRoleBadgeColor(role: string): string {
  switch (role) {
    case ADMIN_ROLES.SUPER_ADMIN:
      return 'bg-purple-100 text-purple-800 border-purple-300';
    case ADMIN_ROLES.MODERATOR:
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case ADMIN_ROLES.SUPPORT:
      return 'bg-green-100 text-green-800 border-green-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

export function getRoleDisplayName(role: string): string {
  switch (role) {
    case ADMIN_ROLES.SUPER_ADMIN:
      return 'Super Admin';
    case ADMIN_ROLES.MODERATOR:
      return 'Moderator';
    case ADMIN_ROLES.SUPPORT:
      return 'Support';
    default:
      return role;
  }
}
