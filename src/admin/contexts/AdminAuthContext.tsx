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
  // Resolves when checkAdminRole has finished AND React has committed the
  // state update, so signIn() callers can safely navigate knowing the
  // provider state is fully consistent.
  const checkDoneRef = useRef<(() => void) | null>(null);

  async function loadPermissions(role: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('admin_role_permissions')
        .select('permission_key')
        .eq('role', role);

      if (error) return [];
      return data?.map(p => p.permission_key) ?? [];
    } catch (e) {
      return [];
    }
  }

  async function checkAdminRole(authUser: User): Promise<boolean> {
    try {
      const result = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (result.error) {
        setUser(null);
        currentUser.current = null;
        setPermissions([]);
        return false;
      }

      const data = result.data;

      if (data) {
        if (!data.is_active) {
          await supabase.auth.signOut();
          setUser(null);
          currentUser.current = null;
          setPermissions([]);
          return false;
        }

        if (data.locked_until && new Date(data.locked_until) > new Date()) {
          await supabase.auth.signOut();
          setUser(null);
          currentUser.current = null;
          setPermissions([]);
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

        const perms = await loadPermissions(data.role);

        // Set all state together so there's no window where user is set but
        // permissions aren't (or vice versa).
        setUser(adminUser);
        currentUser.current = adminUser;
        currentUserId.current = authUser.id;
        setPermissions(perms);

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

        return true;
      } else {
        // No admin record — sign out.
        await supabase.auth.signOut();
        setUser(null);
        currentUser.current = null;
        setPermissions([]);
        return false;
      }
    } catch (e) {
      setUser(null);
      currentUser.current = null;
      setPermissions([]);
      return false;
    } finally {
      // loading is always reset, regardless of success or failure.
      setLoading(false);
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
      initialized.current = true;
    });

    // 2. Subscribe to auth state changes.
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

        // Ignore all other events until the initial getSession completes.
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

  // After every render, if checkAdminRole just finished and a signIn is
  // waiting for the state to be committed, resolve the promise now.
  useEffect(() => {
    if (checkDoneRef.current && user !== null) {
      const resolve = checkDoneRef.current;
      checkDoneRef.current = null;
      resolve();
    }
  });

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

    // Run checkAdminRole directly — this is the ONLY call to it during
    // sign-in. onAuthStateChange's SIGNED_IN event is blocked by
    // checkInProgress.
    const isAdmin = await checkAdminRole(data.user!);
    checkInProgress.current = false;

    if (!isAdmin) {
      throw new Error('Not authorized as admin');
    }

    // checkAdminRole has set user state, but React hasn't committed the
    // re-render yet. Wait for the commit so that ProtectedAdminRoute sees
    // isAdmin = true when it renders after navigate().
    if (currentUser.current) {
      await new Promise<void>((resolve) => {
        checkDoneRef.current = resolve;
      });
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
      const perms = await loadPermissions(user.role);
      setPermissions(perms);
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
