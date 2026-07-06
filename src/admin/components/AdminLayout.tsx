import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { LayoutDashboard, Users, Mail, Activity, BarChart3, LogOut, Shield } from 'lucide-react';
import { PERMISSIONS, getRoleBadgeColor, getRoleDisplayName } from '../adminPermissions';

export default function AdminLayout() {
  const { user, signOut, hasPermission } = useAdminAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/admin/login');
  }

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, show: true },
    { to: '/admin/analytics', label: 'Analytics', icon: BarChart3, show: hasPermission(PERMISSIONS.VIEW_ANALYTICS) },
    { to: '/admin/activity', label: 'Activity Logs', icon: Activity, show: hasPermission(PERMISSIONS.VIEW_LOGS) },
    { to: '/admin/users', label: 'Admin Users', icon: Users, show: hasPermission(PERMISSIONS.MANAGE_ADMINS) },
    { to: '/admin/invitations', label: 'Invitations', icon: Mail, show: hasPermission(PERMISSIONS.MANAGE_ADMINS) },
  ].filter(item => item.show);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed inset-y-0">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900">Admin Panel</span>
        </div>

        <div className="px-6 py-4 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-900 truncate">
            {user?.display_name || user?.email}
          </p>
          <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(user?.role || '')}`}>
            {getRoleDisplayName(user?.role || '')}
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pt-4 pb-4 border-t border-gray-200">
          {user?.last_login && (
            <p className="text-xs text-gray-400 px-3 mb-2">
              Last login: {new Date(user.last_login).toLocaleString()}
            </p>
          )}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 ml-64 min-h-screen">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
