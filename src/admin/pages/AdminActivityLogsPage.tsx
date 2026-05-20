import { useState, useEffect } from 'react';
import { supabase } from '../../shared/supabase';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { Activity, Filter, Download, Calendar, User, FileText } from 'lucide-react';
import type { AdminLog } from '../adminPermissions';
import PermissionGate from '../components/PermissionGate';

export default function AdminActivityLogsPage() {
  const { user: currentUser } = useAdminAuth();
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [adminUsers, setAdminUsers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [filterAdmin, setFilterAdmin] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterContentType, setFilterContentType] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedLog, setSelectedLog] = useState<AdminLog | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const [logsResult, adminsResult] = await Promise.all([
      supabase
        .from('admin_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500),
      supabase.from('admin_users').select('id, email, display_name')
    ]);

    if (logsResult.data) {
      setLogs(logsResult.data as AdminLog[]);
    }

    if (adminsResult.data) {
      const adminMap: Record<string, string> = {};
      adminsResult.data.forEach(admin => {
        adminMap[admin.id] = admin.display_name || admin.email;
      });
      setAdminUsers(adminMap);
    }

    setLoading(false);
  }

  const filteredLogs = logs.filter(log => {
    const matchesAdmin = filterAdmin === 'all' || log.admin_id === filterAdmin;
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesContentType = filterContentType === 'all' || log.content_type === filterContentType;

    let matchesDateRange = true;
    if (dateFrom) {
      matchesDateRange = matchesDateRange && new Date(log.created_at) >= new Date(dateFrom);
    }
    if (dateTo) {
      matchesDateRange = matchesDateRange && new Date(log.created_at) <= new Date(dateTo);
    }

    return matchesAdmin && matchesAction && matchesContentType && matchesDateRange;
  });

  const uniqueActions = Array.from(new Set(logs.map(log => log.action)));
  const uniqueContentTypes = Array.from(new Set(logs.map(log => log.content_type)));

  async function handleExport() {
    const csvContent = [
      ['Date', 'Admin', 'Action', 'Content Type', 'Details'].join(','),
      ...filteredLogs.map(log => [
        new Date(log.created_at).toISOString(),
        adminUsers[log.admin_id || ''] || 'System',
        log.action,
        log.content_type,
        JSON.stringify(log.details)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  }

  function getActionColor(action: string): string {
    if (action.includes('approve')) return 'bg-green-100 text-green-800';
    if (action.includes('reject')) return 'bg-red-100 text-red-800';
    if (action.includes('delete') || action.includes('revoke')) return 'bg-red-100 text-red-800';
    if (action.includes('create') || action.includes('invite')) return 'bg-blue-100 text-blue-800';
    if (action.includes('update') || action.includes('edit')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <PermissionGate permission="view_logs" showMessage>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Activity Logs</h2>
            <p className="text-gray-600 mt-1">View and track all admin actions</p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filters</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <select
              value={filterAdmin}
              onChange={(e) => setFilterAdmin(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Admins</option>
              {Object.entries(adminUsers).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>

            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Actions</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>{action.replace(/_/g, ' ')}</option>
              ))}
            </select>

            <select
              value={filterContentType}
              onChange={(e) => setFilterContentType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              {uniqueContentTypes.map(type => (
                <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
              ))}
            </select>

            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="From date"
            />

            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="To date"
            />
          </div>

          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {filteredLogs.length} of {logs.length} logs
            </p>
            {(filterAdmin !== 'all' || filterAction !== 'all' || filterContentType !== 'all' || dateFrom || dateTo) && (
              <button
                onClick={() => {
                  setFilterAdmin('all');
                  setFilterAction('all');
                  setFilterContentType('all');
                  setDateFrom('');
                  setDateTo('');
                }}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="divide-y">
            {filteredLogs.map(log => (
              <div
                key={log.id}
                className="p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedLog(log)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm text-gray-600">
                        <User className="w-3 h-3 inline mr-1" />
                        {adminUsers[log.admin_id || ''] || 'System'}
                      </span>
                      <span className="text-sm text-gray-600">
                        <FileText className="w-3 h-3 inline mr-1" />
                        {log.content_type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm text-gray-500">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                    {log.ip_address && (
                      <p className="text-xs text-gray-500 mt-1">IP: {log.ip_address}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredLogs.length === 0 && (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No activity logs found</p>
              </div>
            )}
          </div>
        </div>

        {selectedLog && (
          <LogDetailModal
            log={selectedLog}
            adminName={adminUsers[selectedLog.admin_id || ''] || 'System'}
            onClose={() => setSelectedLog(null)}
          />
        )}
      </div>
    </PermissionGate>
  );
}

interface LogDetailModalProps {
  log: AdminLog;
  adminName: string;
  onClose: () => void;
}

function LogDetailModal({ log, adminName, onClose }: LogDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Activity Log Details</h2>

        <div className="space-y-4">
          <DetailRow label="Action" value={log.action.replace(/_/g, ' ')} />
          <DetailRow label="Admin User" value={adminName} />
          <DetailRow label="Content Type" value={log.content_type.replace(/_/g, ' ')} />
          <DetailRow label="Content ID" value={log.content_id} />
          <DetailRow label="Date" value={new Date(log.created_at).toLocaleString()} />
          {log.ip_address && <DetailRow label="IP Address" value={log.ip_address} />}
          {log.user_agent && <DetailRow label="User Agent" value={log.user_agent} />}

          {log.details && Object.keys(log.details).length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Details</h3>
              <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
                {JSON.stringify(log.details, null, 2)}
              </pre>
            </div>
          )}

          {log.before_state && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Before State</h3>
              <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
                {JSON.stringify(log.before_state, null, 2)}
              </pre>
            </div>
          )}

          {log.after_state && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">After State</h3>
              <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
                {JSON.stringify(log.after_state, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300"
        >
          Close
        </button>
      </div>
    </div>
  );
}

interface DetailRowProps {
  label: string;
  value: string;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div>
      <span className="text-sm font-medium text-gray-700">{label}:</span>
      <p className="text-gray-900 mt-1">{value}</p>
    </div>
  );
}
