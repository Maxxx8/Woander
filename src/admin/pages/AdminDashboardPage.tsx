import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import ReviewQueue from '../components/ReviewQueue';
import { LogOut, Home, MapPin, Compass, Users, Settings, BarChart3, Activity, Mail } from 'lucide-react';
import { getRoleBadgeColor, getRoleDisplayName, PERMISSIONS } from '../adminPermissions';

export default function AdminDashboardPage() {
  const { user, signOut, permissions, hasPermission } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<'property' | 'gem' | 'adventure' | 'guide'>('property');
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/admin/login');
  }

  const tabs = [
    { id: 'property' as const, label: 'Properties', icon: Home, permission: PERMISSIONS.VIEW_PROPERTIES },
    { id: 'gem' as const, label: 'Hidden Gems', icon: MapPin, permission: PERMISSIONS.VIEW_GEMS },
    { id: 'adventure' as const, label: 'Adventures', icon: Compass, permission: PERMISSIONS.VIEW_ADVENTURES },
    { id: 'guide' as const, label: 'Tour Guides', icon: Users, permission: PERMISSIONS.VIEW_GUIDES }
  ].filter(tab => hasPermission(tab.permission));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-gray-600">{user?.display_name || user?.email}</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user?.role || '')}`}>
                  {getRoleDisplayName(user?.role || '')}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasPermission(PERMISSIONS.VIEW_ANALYTICS) && (
                <button
                  onClick={() => navigate('/admin/analytics')}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </button>
              )}
              {hasPermission(PERMISSIONS.VIEW_LOGS) && (
                <button
                  onClick={() => navigate('/admin/activity')}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  <Activity className="w-4 h-4" />
                  Logs
                </button>
              )}
              {hasPermission(PERMISSIONS.MANAGE_ADMINS) && (
                <>
                  <button
                    onClick={() => navigate('/admin/users')}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    <Settings className="w-4 h-4" />
                    Users
                  </button>
                  <button
                    onClick={() => navigate('/admin/invitations')}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    <Mail className="w-4 h-4" />
                    Invites
                  </button>
                </>
              )}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>

          {user?.last_login && (
            <p className="text-xs text-gray-500">
              Last login: {new Date(user.last_login).toLocaleString()}
            </p>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b border-gray-200">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-6 py-4 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <ReviewQueue type={activeTab} />
      </div>
    </div>
  );
}
