import { useState } from 'react';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import ReviewQueue from '../components/ReviewQueue';
import { Home, MapPin, Compass, Users } from 'lucide-react';
import { PERMISSIONS } from '../adminPermissions';

export default function AdminDashboardPage() {
  const { hasPermission } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<'property' | 'gem' | 'adventure' | 'guide'>('property');

  const tabs = [
    { id: 'property' as const, label: 'Properties', icon: Home, permission: PERMISSIONS.VIEW_PROPERTIES },
    { id: 'gem' as const, label: 'Hidden Gems', icon: MapPin, permission: PERMISSIONS.VIEW_GEMS },
    { id: 'adventure' as const, label: 'Adventures', icon: Compass, permission: PERMISSIONS.VIEW_ADVENTURES },
    { id: 'guide' as const, label: 'Tour Guides', icon: Users, permission: PERMISSIONS.VIEW_GUIDES },
  ].filter(tab => hasPermission(tab.permission));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 mt-1">Review and manage submitted content</p>
      </div>

      <div className="bg-white rounded-lg shadow">
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
  );
}
