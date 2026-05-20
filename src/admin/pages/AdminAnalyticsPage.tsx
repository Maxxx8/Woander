import { useState, useEffect } from 'react';
import { supabase } from '../../shared/supabase';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { BarChart3, TrendingUp, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { AdminActivityStat } from '../adminPermissions';
import { getRoleBadgeColor, getRoleDisplayName } from '../adminPermissions';
import PermissionGate from '../components/PermissionGate';

interface AdminStats {
  admin_id: string;
  admin_email: string;
  admin_name: string;
  role: string;
  total_approvals: number;
  total_rejections: number;
  total_reviews: number;
}

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<AdminStats[]>([]);
  const [activityStats, setActivityStats] = useState<AdminActivityStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7' | '30' | '90'>('30');

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  async function loadAnalytics() {
    setLoading(true);

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(dateRange));

    const [logsResult, adminsResult, statsResult] = await Promise.all([
      supabase
        .from('admin_logs')
        .select('admin_id, action')
        .gte('created_at', daysAgo.toISOString())
        .in('action', ['approve', 'reject']),
      supabase.from('admin_users').select('id, email, display_name, role'),
      supabase
        .from('admin_activity_stats')
        .select('*')
        .gte('date', daysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false })
    ]);

    if (adminsResult.data && logsResult.data) {
      const adminMap = new Map(adminsResult.data.map(a => [a.id, a]));
      const statsMap = new Map<string, AdminStats>();

      adminsResult.data.forEach(admin => {
        statsMap.set(admin.id, {
          admin_id: admin.id,
          admin_email: admin.email,
          admin_name: admin.display_name || admin.email,
          role: admin.role,
          total_approvals: 0,
          total_rejections: 0,
          total_reviews: 0
        });
      });

      logsResult.data.forEach(log => {
        if (!log.admin_id) return;
        const stat = statsMap.get(log.admin_id);
        if (stat) {
          if (log.action === 'approve') stat.total_approvals++;
          if (log.action === 'reject') stat.total_rejections++;
          stat.total_reviews++;
        }
      });

      setStats(Array.from(statsMap.values()).sort((a, b) => b.total_reviews - a.total_reviews));
    }

    if (statsResult.data) {
      setActivityStats(statsResult.data as AdminActivityStat[]);
    }

    setLoading(false);
  }

  const totalApprovals = stats.reduce((sum, s) => sum + s.total_approvals, 0);
  const totalRejections = stats.reduce((sum, s) => sum + s.total_rejections, 0);
  const totalReviews = stats.reduce((sum, s) => sum + s.total_reviews, 0);
  const activeAdmins = stats.filter(s => s.total_reviews > 0).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <PermissionGate permission="view_analytics" showMessage>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Admin Analytics</h2>
            <p className="text-gray-600 mt-1">Performance metrics and activity insights</p>
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            label="Total Reviews"
            value={totalReviews}
            icon={BarChart3}
            color="blue"
          />
          <MetricCard
            label="Approvals"
            value={totalApprovals}
            icon={CheckCircle}
            color="green"
          />
          <MetricCard
            label="Rejections"
            value={totalRejections}
            icon={XCircle}
            color="red"
          />
          <MetricCard
            label="Active Admins"
            value={activeAdmins}
            icon={Users}
            color="purple"
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-gray-600" />
            <h3 className="text-xl font-semibold text-gray-900">Admin Leaderboard</h3>
          </div>

          <div className="space-y-3">
            {stats.map((stat, index) => (
              <div
                key={stat.admin_id}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">#{index + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">{stat.admin_name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(stat.role)}`}>
                      {getRoleDisplayName(stat.role)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{stat.admin_email}</p>
                </div>
                <div className="flex gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-gray-900">{stat.total_reviews}</div>
                    <div className="text-gray-600">Reviews</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-green-600">{stat.total_approvals}</div>
                    <div className="text-gray-600">Approved</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-red-600">{stat.total_rejections}</div>
                    <div className="text-gray-600">Rejected</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-blue-600">
                      {stat.total_reviews > 0 ? Math.round((stat.total_approvals / stat.total_reviews) * 100) : 0}%
                    </div>
                    <div className="text-gray-600">Approval Rate</div>
                  </div>
                </div>
              </div>
            ))}

            {stats.length === 0 && (
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No activity data available</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-gray-600" />
            <h3 className="text-xl font-semibold text-gray-900">Recent Daily Activity</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Admin</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Reviews</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Approvals</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Rejections</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {activityStats.slice(0, 20).map(stat => {
                  const admin = stats.find(s => s.admin_id === stat.admin_id);
                  return (
                    <tr key={stat.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(stat.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {admin?.admin_name || 'Unknown'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-center">
                        {stat.items_reviewed}
                      </td>
                      <td className="px-4 py-3 text-sm text-green-600 text-center font-medium">
                        {stat.approvals_count}
                      </td>
                      <td className="px-4 py-3 text-sm text-red-600 text-center font-medium">
                        {stat.rejections_count}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {activityStats.length === 0 && (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No daily activity recorded yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PermissionGate>
  );
}

interface MetricCardProps {
  label: string;
  value: number;
  icon: any;
  color: 'blue' | 'green' | 'red' | 'purple';
}

function MetricCard({ label, value, icon: Icon, color }: MetricCardProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value.toLocaleString()}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}
