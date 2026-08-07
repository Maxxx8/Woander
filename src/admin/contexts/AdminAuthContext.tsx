import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../../shared/supabase';
import type { User } from '@supabase/supabase-js';
import type { AdminUser } from '../adminPermissions';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '../adminPermissions';

interface AdminAuthContextType {
  user: AdminUser | null;
  permissions: string[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  refreshPermissions: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadPermissions(role: string) {
    try {
      const { data, error } = await supabase
        .from('admin_role_permissions')
        .select('permission_key')
        .eq('role', role);

      if (error) {
        console.error('[AdminAuth] Error loading permissions:', error);
      } else if (data) {
        const keys = data.map(p => p.permission_key);
        console.log('[AdminAuth] Permissions loaded:', keys);
        setPermissions(keys);
      }
    } catch (e) {
      console.error('[AdminAuth] Failed to load permissions:', e);
    }
  }

  async function checkAdminRole(authUser: User): Promise<boolean> {
    console.log('[AdminAuth] Authenticated user:', authUser.id, authUser.email);

    let data: any = null;
    try {
      const result = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (result.error) {
        console.error('[AdminAuth] Error querying admin_users:', result.error);
      }
      data = result.data;
    } catch (e) {
      console.error('[AdminAuth] Failed to query admin_users:', e);
    }

    console.log('[AdminAuth] Admin lookup result:', data);

    if (data) {
      if (!data.is_active) {
        console.warn('[AdminAuth] Account is deactivated, signing out');
        await supabase.auth.signOut();
        setUser(null);
        setPermissions([]);
        setLoading(false);
        return false;
      }

      if (data.locked_until && new Date(data.locked_until) > new Date()) {
        console.warn('[AdminAuth] Account is locked until:', data.locked_until);
        await supabase.auth.signOut();
        setUser(null);
        setPermissions([]);
        setLoading(false);
        return false;
      }

      const adminUser: AdminUser = {
        id: authUser.id,
        role: data.role,
        email: authUser.email || '',
        display_name: data.display_name,
        department: data.department,
        phone_number: data.phone_number,
        profile_image: data.profile_image,
        is_active: data.is_active,
        invited_by: data.invited_by,
        failed_login_attempts: data.failed_login_attempts || 0,
        locked_until: data.locked_until,
        created_at: data.created_at,
        last_login: data.last_login
      };

      setUser(adminUser);
      console.log('[AdminAuth] Admin user set:', adminUser.role);
      await loadPermissions(data.role);

      try {
        await supabase
          .from('admin_users')
          .update({
            last_login: new Date().toISOString(),
            failed_login_attempts: 0,
            locked_until: null
          })
          .eq('id', authUser.id);
      } catch (e) {
        console.warn('[AdminAuth] Could not update last_login:', e);
      }

      setLoading(false);
      return true;
    } else {
      console.warn('[AdminAuth] No admin record found for user, signing out');
      await supabase.auth.signOut();
      setUser(null);
      setPermissions([]);
      setLoading(false);
      return false;
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await checkAdminRole(session.user);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (session?.user) {
          // Re-check admin role on session changes (e.g., token refresh).
          // The signIn function also calls checkAdminRole directly to avoid
          // a race between navigation and the admin lookup.
          await checkAdminRole(session.user);
        } else {
          setUser(null);
          setPermissions([]);
          setLoading(false);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    console.log('[AdminAuth] Attempting sign-in for:', email);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('[AdminAuth] Sign-in error:', error);
      throw error;
    }

    console.log('[AdminAuth] Auth succeeded for user:', data.user?.id);
    // Directly run the admin check instead of waiting for onAuthStateChange.
    // This eliminates the race between navigation and the admin lookup.
    const isAdmin = await checkAdminRole(data.user!);
    console.log('[AdminAuth] Permission decision: isAdmin =', isAdmin);
    if (!isAdmin) {
      throw new Error('Not authorized as admin');
    }
    console.log('[AdminAuth] Sign-in complete, redirecting to /admin/dashboard');
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setPermissions([]);
  }

  async function refreshPermissions() {
    if (user) {
      await loadPermissions(user.role);
    }
  }

  console.log('[AdminAuth] State:', { isAdmin: !!user, loading, userRole: user?.role });

  return (
    <AdminAuthContext.Provider value={{
      user,
      permissions,
      loading,
      signIn,
      signOut,
      isAdmin: !!user,
      isSuperAdmin: user?.role === 'super_admin',
      hasPermission: (permission: string) => hasPermission(permissions, permission),
      hasAnyPermission: (perms: string[]) => hasAnyPermission(permissions, perms),
      hasAllPermissions: (perms: string[]) => hasAllPermissions(permissions, perms),
      refreshPermissions
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return context;
}
