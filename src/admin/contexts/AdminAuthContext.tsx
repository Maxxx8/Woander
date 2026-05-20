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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        checkAdminRole(session.user);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (session?.user) {
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

  async function loadPermissions(role: string) {
    const { data } = await supabase
      .from('admin_role_permissions')
      .select('permission_key')
      .eq('role', role);

    if (data) {
      setPermissions(data.map(p => p.permission_key));
    }
  }

  async function checkAdminRole(authUser: User) {
    const { data } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    if (data) {
      if (!data.is_active) {
        await supabase.auth.signOut();
        setLoading(false);
        throw new Error('Account is deactivated');
      }

      if (data.locked_until && new Date(data.locked_until) > new Date()) {
        await supabase.auth.signOut();
        setLoading(false);
        throw new Error('Account is temporarily locked');
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
      await loadPermissions(data.role);

      await supabase
        .from('admin_users')
        .update({
          last_login: new Date().toISOString(),
          failed_login_attempts: 0,
          locked_until: null
        })
        .eq('id', authUser.id);
    } else {
      await supabase.auth.signOut();
    }
    setLoading(false);
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('id, failed_login_attempts')
        .eq('id', error.message)
        .maybeSingle();

      if (adminData) {
        const attempts = (adminData.failed_login_attempts || 0) + 1;
        const updates: any = { failed_login_attempts: attempts };

        if (attempts >= 5) {
          updates.locked_until = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        }

        await supabase
          .from('admin_users')
          .update(updates)
          .eq('id', adminData.id);
      }
      throw error;
    }
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
