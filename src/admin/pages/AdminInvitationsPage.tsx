import { useState, useEffect } from 'react';
import { supabase } from '../../shared/supabase';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { Mail, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import type { AdminInvitation } from '../adminPermissions';
import { getRoleBadgeColor, getRoleDisplayName } from '../adminPermissions';
import PermissionGate from '../components/PermissionGate';

export default function AdminInvitationsPage() {
  const { user: currentUser } = useAdminAuth();
  const [invitations, setInvitations] = useState<AdminInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvitations();
  }, []);

  async function loadInvitations() {
    setLoading(true);
    const { data } = await supabase
      .from('admin_invitations')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setInvitations(data as AdminInvitation[]);
    }
    setLoading(false);
  }

  async function handleResend(invitation: AdminInvitation) {
    const newToken = crypto.randomUUID();
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    await supabase
      .from('admin_invitations')
      .update({
        invitation_token: newToken,
        expires_at: newExpiresAt,
        status: 'pending'
      })
      .eq('id', invitation.id);

    await supabase.from('admin_logs').insert({
      admin_id: currentUser?.id,
      action: 'resend_invitation',
      content_type: 'admin_invitation',
      content_id: invitation.id,
      details: { email: invitation.email }
    });

    alert('Invitation resent successfully!');
    loadInvitations();
  }

  async function handleRevoke(invitation: AdminInvitation) {
    const confirmed = confirm(`Are you sure you want to revoke the invitation for ${invitation.email}?`);
    if (!confirmed) return;

    await supabase
      .from('admin_invitations')
      .update({ status: 'revoked' })
      .eq('id', invitation.id);

    await supabase.from('admin_logs').insert({
      admin_id: currentUser?.id,
      action: 'revoke_invitation',
      content_type: 'admin_invitation',
      content_id: invitation.id,
      details: { email: invitation.email }
    });

    loadInvitations();
  }

  const pendingInvitations = invitations.filter(i => i.status === 'pending');
  const acceptedInvitations = invitations.filter(i => i.status === 'accepted');
  const expiredInvitations = invitations.filter(i => i.status === 'expired');
  const revokedInvitations = invitations.filter(i => i.status === 'revoked');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <PermissionGate permission="manage_admins" showMessage>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Invitations</h2>
          <p className="text-gray-600 mt-1">Manage pending and past admin invitations</p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <StatCard
            label="Pending"
            count={pendingInvitations.length}
            icon={Clock}
            color="yellow"
          />
          <StatCard
            label="Accepted"
            count={acceptedInvitations.length}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            label="Expired"
            count={expiredInvitations.length}
            icon={XCircle}
            color="gray"
          />
          <StatCard
            label="Revoked"
            count={revokedInvitations.length}
            icon={XCircle}
            color="red"
          />
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="divide-y">
            {invitations.map(invitation => {
              const isExpired = new Date(invitation.expires_at) < new Date() && invitation.status === 'pending';
              const statusColor =
                invitation.status === 'accepted' ? 'bg-green-100 text-green-800' :
                invitation.status === 'pending' && !isExpired ? 'bg-yellow-100 text-yellow-800' :
                invitation.status === 'revoked' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800';

              return (
                <div key={invitation.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <Mail className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{invitation.email}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(invitation.role)}`}>
                            {getRoleDisplayName(invitation.role)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                            {isExpired ? 'Expired' : invitation.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1 space-y-1">
                          <p>Sent: {new Date(invitation.created_at).toLocaleDateString()}</p>
                          <p>Expires: {new Date(invitation.expires_at).toLocaleDateString()}</p>
                          {invitation.accepted_at && (
                            <p className="text-green-600">
                              Accepted: {new Date(invitation.accepted_at).toLocaleDateString()}
                            </p>
                          )}
                          {invitation.message && (
                            <p className="text-gray-500 italic mt-2">{invitation.message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {invitation.status === 'pending' && !isExpired && (
                        <>
                          <button
                            onClick={() => handleResend(invitation)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Resend invitation"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRevoke(invitation)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            title="Revoke invitation"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {isExpired && (
                        <button
                          onClick={() => handleResend(invitation)}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Resend
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {invitations.length === 0 && (
              <div className="text-center py-12">
                <Mail className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No invitations found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PermissionGate>
  );
}

interface StatCardProps {
  label: string;
  count: number;
  icon: any;
  color: 'yellow' | 'green' | 'gray' | 'red';
}

function StatCard({ label, count, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-700',
    red: 'bg-red-50 border-red-200 text-red-700'
  };

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color]}`}>
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5" />
        <span className="font-semibold">{label}: {count}</span>
      </div>
    </div>
  );
}
