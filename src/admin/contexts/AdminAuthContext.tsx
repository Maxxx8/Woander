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
  // Prevents concurrent checkAdminRole calls (signIn vs onAuthStateChange).
  const checkInProgress = useRef(false);
  // Blocks onAuthStateChange from doing anything until the initial
  // getSession + checkAdminRole sequence has completed.
  const initialized = useRef(false);

  async function loadPermissions(role: string) {
    try {
      const { data, error } = await supabase
        .from('admin_role_permissions')
        .select('permission_key')
        .eq('role', role);

      if (error) return;
      const keys = data?.map(p => p.permission_key) ?? [];
      setPermissions(keys);
    } catch (e) {
      // Non-critical — permissions will be empty
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
        // Don't sign out on query error — could be transient
        setUser(null);
        currentUser.current = null;
        setPermissions([]);
        setLoading(false);
        return false;
      }
      data = result.data;
    } catch (e) {
      setUser(null);
      currentUser.current = null;
      setPermissions([]);
      setLoading(false);
      return false;
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

      // Set user and refs BEFORE loading permissions so that
      // isAdmin is true as soon as possible.
      setUser(adminUser);
      currentUser.current = adminUser;
      currentUserId.current = authUser.id;

      await loadPermissions(data.role);

      // Update last_login in the background — don't block on it.
      supabase
        .from('admin_users')
        .update({
          last_login: new Date().toISOString(),
          failed_login_attempts: 0,
          locked_until: null
        })
        .eq('id', authUser.id)
        .then(() => {}, () => {});

      // loading is set to false ONLY after user + permissions are set.
      setLoading(false);
      return true;
    } else {
      // No admin record — sign out.
      await supabase.auth.signOut();
      setUser(null);
      currentUser.current = null;
      setPermissions([]);
      setLoading(false);
      return false;
    }
  }

  useEffect(() => {
    // 1. Restore any existing session on mount.
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        setLoading(false);
        initialized.current = true;
        return;
      }
      if (session?.user) {
        checkInProgress.current = true;
        await checkAdminRole(session.user);
        checkInProgress.current = false;
      } else {
        setLoading(false);
      }
      // Mark initialized AFTER getSession completes so onAuthStateChange
      // doesn't race with it.
      initialized.current = true;
    });

    // 2. Subscribe to auth state changes.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        // SIGNED_OUT always resets, regardless of initialization state.
        if (event === 'SIGNED_OUT') {
          setUser(null);
          currentUser.current = null;
          setPermissions([]);
          currentUserId.current = null;
          setLoading(false);
          return;
        }

        // Ignore all other events until the initial getSession completes.
        // This prevents INITIAL_SESSION from racing with getSession.
        if (!initialized.current) {
          return;
        }

        // Ignore events with no session.
        if (!session?.user) {
          return;
        }

        // Skip if a check is already in progress (e.g., signIn is handling it).
        if (checkInProgress.current) {
          return;
        }

        // Skip if this is the same user we already have loaded.
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

    // Set the guard BEFORE calling signInWithPassword. Supabase fires the
    // SIGNED_IN event during signInWithPassword, before this function
    // continues. If the guard isn't set yet, onAuthStateChange will start
    // a concurrent checkAdminRole call that races with ours.
    checkInProgress.current = true;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      checkInProgress.current = false;
      setLoading(false);
      throw error;
    }

    // checkAdminRole sets user, permissions, and loading=false.
    const isAdmin = await checkAdminRole(data.user!);
    checkInProgress.current = false;

    if (!isAdmin) {
      throw new Error('Not authorized as admin');
    }
  }

  async function signOut() {
    checkInProgress.current = true;
    await supabase.auth.signOut();
    setUser(null);
    currentUser.current = null;
    setPermissions([]);
    currentUserId.current = null;
    setLoading(false);
    checkInProgress.current = false;
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
