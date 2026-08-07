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

  // Refs mirror state so onAuthStateChange (which has a stale closure) can
  // read current values without depending on the state variable.
  const currentUserId = useRef<string | null>(null);
  const currentUser = useRef<AdminUser | null>(null);
  const checkInProgress = useRef(false);

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
      setPermissions(keys);
    } catch (e) {
      console.error('[AdminAuth] Failed to load permissions:', e);
    }
  }

  async function checkAdminRole(authUser: User): Promise<boolean> {
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

    if (data) {
      if (!data.is_active) {
        await supabase.auth.signOut();
        setUser(null);
        currentUser.current = null;
        setPermissions([]);
        setLoading(false);
        return false;
      }

      if (data.locked_until && new Date(data.locked_until) > new Date()) {
        await supabase.auth.signOut();
        setUser(null);
        currentUser.current = null;
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
      currentUser.current = adminUser;
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
        // Non-critical
      }

      setLoading(false);
      return true;
    } else {
      await supabase.auth.signOut();
      setUser(null);
      currentUser.current = null;
      setPermissions([]);
      setLoading(false);
      return false;
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) console.error('[AdminAuth] getSession error:', error);
      if (session?.user) {
        checkInProgress.current = true;
        await checkAdminRole(session.user);
        checkInProgress.current = false;
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          currentUser.current = null;
          setPermissions([]);
          currentUserId.current = null;
          setLoading(false);
          return;
        }

        if (!session?.user) {
          return;
        }

        // Skip if a check is already in progress (e.g., signIn called checkAdminRole
        // directly, or getSession is still running).
        if (checkInProgress.current) {
          return;
        }

        // Skip if this is the same user we already loaded.
        if (session.user.id === currentUserId.current && currentUser.current) {
          return;
        }

        // New or different user — run admin check.
        checkInProgress.current = true;
        await checkAdminRole(session.user);
        checkInProgress.current = false;
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      throw error;
    }

    // Set the guard BEFORE checkAdminRole so onAuthStateChange doesn't race.
    checkInProgress.current = true;
    const isAdmin = await checkAdminRole(data.user!);
    checkInProgress.current = false;

    if (!isAdmin) {
      throw new Error('Not authorized as admin');
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    currentUser.current = null;
    setPermissions([]);
    currentUserId.current = null;
    setLoading(false);
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
