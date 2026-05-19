import { useState, useEffect } from 'react';
import { supabase } from '../../shared/supabase';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { Users, Search, Plus, Edit2, Ban, CheckCircle, XCircle, Mail } from 'lucide-react';
import type { AdminUser } from '../adminPermissions';
import { getRoleBadgeColor, getRoleDisplayName, ADMIN_ROLES } from '../adminPermissions';
import PermissionGate from '../components/PermissionGate';

export default function AdminUsersPage() {
  const { user: currentUser } = useAdminAuth();
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    loadAdminUsers();
  }, []);

  async function loadAdminUsers() {
    setLoading(true);
    const { data } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setAdminUsers(data as AdminUser[]);
    }
    setLoading(false);
  }

  const filteredUsers = adminUsers.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.display_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'active' && user.is_active) ||
                         (filterStatus === 'inactive' && !user.is_active);
    return matchesSearch && matchesRole && matchesStatus;
  });

  async function handleToggleActive(userId: string, currentStatus: boolean) {
    if (userId === currentUser?.id) {
      alert('You cannot deactivate your own account');
      return;
    }

    const { data: userToUpdate } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (userToUpdate?.role === 'super_admin' && currentUser?.role !== 'super_admin') {
      alert('Only super admins can modify other super admins');
      return;
    }

    const confirmed = confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this admin user?`);
    if (!confirmed) return;

    await supabase
      .from('admin_users')
      .update({ is_active: !currentStatus })
      .eq('id', userId);

    await supabase.from('admin_logs').insert({
      admin_id: currentUser?.id,
      action: currentStatus ? 'deactivate_admin' : 'activate_admin',
      content_type: 'admin_user',
      content_id: userId,
      details: { previous_status: currentStatus }
    });

    loadAdminUsers();
  }

  function handleEdit(user: AdminUser) {
    if (user.role === 'super_admin' && currentUser?.role !== 'super_admin') {
      alert('Only super admins can edit other super admins');
      return;
    }
    setSelectedUser(user);
    setShowEditModal(true);
  }

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
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Admin Users</h2>
            <p className="text-gray-600 mt-1">Manage administrator accounts and permissions</p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Invite Admin
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by email or name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="moderator">Moderator</option>
              <option value="support">Support</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="space-y-3">
            {filteredUsers.map(user => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {user.display_name || user.email}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                        {getRoleDisplayName(user.role)}
                      </span>
                      {!user.is_active && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Inactive
                        </span>
                      )}
                      {user.id === currentUser?.id && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    {user.department && (
                      <p className="text-sm text-gray-500">{user.department}</p>
                    )}
                    {user.last_login && (
                      <p className="text-xs text-gray-400 mt-1">
                        Last login: {new Date(user.last_login).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(user)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Edit admin"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {user.id !== currentUser?.id && (
                    <button
                      onClick={() => handleToggleActive(user.id, user.is_active)}
                      className={`p-2 rounded-lg ${
                        user.is_active
                          ? 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                          : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                      }`}
                      title={user.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {user.is_active ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No admin users found</p>
              </div>
            )}
          </div>
        </div>

        {showEditModal && selectedUser && (
          <EditAdminModal
            user={selectedUser}
            currentUser={currentUser}
            onClose={() => {
              setShowEditModal(false);
              setSelectedUser(null);
            }}
            onSave={() => {
              loadAdminUsers();
              setShowEditModal(false);
              setSelectedUser(null);
            }}
          />
        )}

        {showInviteModal && (
          <InviteAdminModal
            onClose={() => setShowInviteModal(false)}
            onSent={() => {
              setShowInviteModal(false);
              alert('Invitation sent successfully!');
            }}
          />
        )}
      </div>
    </PermissionGate>
  );
}

interface EditAdminModalProps {
  user: AdminUser;
  currentUser: AdminUser | null;
  onClose: () => void;
  onSave: () => void;
}

function EditAdminModal({ user, currentUser, onClose, onSave }: EditAdminModalProps) {
  const [formData, setFormData] = useState({
    display_name: user.display_name || '',
    department: user.department || '',
    phone_number: user.phone_number || '',
    role: user.role
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);

    const updates: any = {
      display_name: formData.display_name || null,
      department: formData.department || null,
      phone_number: formData.phone_number || null
    };

    if (formData.role !== user.role && currentUser?.role === 'super_admin') {
      updates.role = formData.role;
    }

    await supabase
      .from('admin_users')
      .update(updates)
      .eq('id', user.id);

    await supabase.from('admin_logs').insert({
      admin_id: currentUser?.id,
      action: 'update_admin',
      content_type: 'admin_user',
      content_id: user.id,
      details: { updates, previous: user }
    });

    setSaving(false);
    onSave();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Edit Admin User</h2>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
            <input
              type="text"
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Content Moderation"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="+1 234 567 8900"
            />
          </div>

          {currentUser?.role === 'super_admin' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={user.id === currentUser.id}
              >
                <option value={ADMIN_ROLES.SUPER_ADMIN}>Super Admin</option>
                <option value={ADMIN_ROLES.MODERATOR}>Moderator</option>
                <option value={ADMIN_ROLES.SUPPORT}>Support</option>
              </select>
              {user.id === currentUser.id && (
                <p className="text-sm text-gray-500 mt-1">You cannot change your own role</p>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={onClose}
            className="px-6 bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

interface InviteAdminModalProps {
  onClose: () => void;
  onSent: () => void;
}

function InviteAdminModal({ onClose, onSent }: InviteAdminModalProps) {
  const { user: currentUser } = useAdminAuth();
  const [formData, setFormData] = useState({
    email: '',
    role: 'moderator' as 'super_admin' | 'moderator' | 'support',
    message: ''
  });
  const [sending, setSending] = useState(false);

  async function handleSend() {
    if (!formData.email) {
      alert('Please enter an email address');
      return;
    }

    setSending(true);

    const { error } = await supabase.from('admin_invitations').insert({
      email: formData.email,
      role: formData.role,
      invited_by: currentUser?.id,
      message: formData.message,
      status: 'pending'
    });

    if (error) {
      alert('Failed to send invitation: ' + error.message);
      setSending(false);
      return;
    }

    await supabase.from('admin_logs').insert({
      admin_id: currentUser?.id,
      action: 'invite_admin',
      content_type: 'admin_invitation',
      content_id: formData.email,
      details: { role: formData.role }
    });

    setSending(false);
    onSent();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold">Invite Admin User</h2>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="moderator">Moderator</option>
              <option value="support">Support</option>
              {currentUser?.role === 'super_admin' && (
                <option value="super_admin">Super Admin</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Personal Message (optional)
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Welcome to the team! Looking forward to working with you."
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSend}
            disabled={sending}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {sending ? 'Sending...' : 'Send Invitation'}
          </button>
          <button
            onClick={onClose}
            className="px-6 bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
