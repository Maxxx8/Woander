import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
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

  // Track the current admin user ID so onAuthStateChange can detect if the
  // session actually changed users, versus a token refresh of the same user.
  const currentUserId = useRef<string | null>(null);
  const isInitialized = useRef(false);

  async function loadPermissions(role: string) {
    try {
      const { data, error } = await supabase
        .from('admin_role_permissions')
        .select('permission_key')
        .eq('role', role);

      if (error) {
        console.error('[AdminAuth] Error loading permissions:', error);
        return;
      }
      const keys = data?.map(p => p.permission_key) ?? [];
      console.log('[AdminAuth] Permissions loaded for role', role + ':', keys);
      setPermissions(keys);
    } catch (e) {
      console.error('[AdminAuth] Failed to load permissions:', e);
    }
  }

  async function checkAdminRole(authUser: User): Promise<boolean> {
    console.log('[AdminAuth] checkAdminRole — authenticated user:', authUser.id, authUser.email);

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
        console.warn('[AdminAuth] Account is deactivated — signing out');
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

      console.log('[AdminAuth] setUser:', adminUser.role, 'loading: false');
      setUser(adminUser);
      currentUserId.current = authUser.id;
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
      console.log('[AdminAuth] Permission decision: isAdmin = true');
      return true;
    } else {
      console.warn('[AdminAuth] No admin record found — signing out');
      await supabase.auth.signOut();
      setUser(null);
      setPermissions([]);
      setLoading(false);
      console.log('[AdminAuth] Permission decision: isAdmin = false');
      return false;
    }
  }

  useEffect(() => {
    console.log('[AdminAuth] Provider mounted');

    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) console.error('[AdminAuth] getSession error:', error);
      console.log('[AdminAuth] getSession result:', session?.user?.id ?? 'no session');
      if (session?.user) {
        await checkAdminRole(session.user);
      } else {
        console.log('[AdminAuth] No session on init — loading: false');
        setLoading(false);
      }
      isInitialized.current = true;
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AdminAuth] onAuthStateChange:', event, 'user:', session?.user?.id ?? 'null', 'currentUserId:', currentUserId.current);

      (async () => {
        if (event === 'SIGNED_OUT') {
          console.log('[AdminAuth] SIGNED_OUT — resetting admin state');
          setUser(null);
          setPermissions([]);
          currentUserId.current = null;
          setLoading(false);
          return;
        }

        // No session — don't wipe state if we already have a valid admin
        // (Supabase sometimes fires intermediate events with null sessions).
        if (!session?.user) {
          console.log('[AdminAuth] No session in event, keeping current state');
          return;
        }

        // Same user — token refresh or redundant event. Don't re-check unless
        // we somehow lost the admin user (shouldn't happen, but guard anyway).
        if (session.user.id === currentUserId.current && user) {
          console.log('[AdminAuth] Same user, already initialized — skipping re-check');
          return;
        }

        // Different user or first time seeing this user — run admin check.
        console.log('[AdminAuth] New user detected — running admin check');
        await checkAdminRole(session.user);
      })();
    });

    return () => {
      console.log('[AdminAuth] Provider unmounting');
      subscription.unsubscribe();
    };
  }, []);

  async function signIn(email: string, password: string) {
    console.log('[AdminAuth] signIn called for:', email);
    setLoading(true);
    console.log('[AdminAuth] loading set to true');

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('[AdminAuth] Sign-in error:', error);
      setLoading(false);
      throw error;
    }

    console.log('[AdminAuth] Auth succeeded for user:', data.user?.id);
    // Directly run the admin check — do NOT rely on onAuthStateChange.
    const isAdmin = await checkAdminRole(data.user!);
    console.log('[AdminAuth] Permission decision: isAdmin =', isAdmin);
    if (!isAdmin) {
      throw new Error('Not authorized as admin');
    }
    console.log('[AdminAuth] Sign-in complete, admin state fully initialized');
  }

  async function signOut() {
    console.log('[AdminAuth] signOut called');
    await supabase.auth.signOut();
    setUser(null);
    setPermissions([]);
    currentUserId.current = null;
    setLoading(false);
  }

  async function refreshPermissions() {
    if (user) {
      await loadPermissions(user.role);
    }
  }

  console.log('[AdminAuth] Render:', { isAdmin: !!user, loading, userRole: user?.role });

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
