import { useState, useEffect } from 'react';
import { supabase } from '../../shared/supabase';
import { CheckCircle, XCircle, Clock, MapPin, Calendar } from 'lucide-react';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { canManageContent, canViewContent } from '../adminPermissions';

interface ReviewItem {
  id: string;
  type: 'property' | 'gem' | 'adventure' | 'guide';
  title: string;
  description: string;
  status: string;
  created_at: string;
  user_email?: string;
  location?: string;
  rejection_reason?: string;
}

interface ReviewQueueProps {
  type: 'property' | 'gem' | 'adventure' | 'guide';
}

// Maps a DB row (which may use different status column names per table) to a unified ReviewItem.
// hidden_gems uses `verification_status`; property_listings and others use `status`.
function getRowStatus(item: any, type: string): string {
  if (type === 'gem') return item.verification_status || 'pending';
  return item.status || 'pending';
}

export default function ReviewQueue({ type }: ReviewQueueProps) {
  const { permissions, user: currentUser } = useAdminAuth();
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ReviewItem | null>(null);
  const [feedback, setFeedback] = useState('');
  const [processing, setProcessing] = useState(false);

  const canView = canViewContent(permissions, type);
  const canManage = canManageContent(permissions, type);

  useEffect(() => {
    if (canView) {
      loadItems();
    }
  }, [type, canView]);

  async function loadItems() {
    setLoading(true);
    const tableName = type === 'property' ? 'property_listings' :
                      type === 'gem' ? 'hidden_gems' :
                      type === 'adventure' ? 'adventures' : 'tour_guides';

    console.log(`[ReviewQueue] Querying ${tableName} for type="${type}"`);

    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`[ReviewQueue] Error fetching from ${tableName}:`, error);
    } else {
      console.log(`[ReviewQueue] Fetched ${data?.length || 0} items from ${tableName}`, data);
    }

    const mapped = (data || []).map(item => ({
      id: item.id,
      type,
      title: item.title || item.name || item.full_name || 'Untitled',
      description: item.description || item.bio || '',
      status: getRowStatus(item, type),
      created_at: item.created_at,
      location: item.location || item.location_city || '',
      rejection_reason: item.rejection_reason
    }));

    setItems(mapped);
    setLoading(false);
  }

  async function handleAction(itemId: string, action: 'approve' | 'reject') {
    if (!canManage) {
      alert('You do not have permission to perform this action');
      return;
    }

    setProcessing(true);
    const tableName = type === 'property' ? 'property_listings' :
                      type === 'gem' ? 'hidden_gems' :
                      type === 'adventure' ? 'adventures' : 'tour_guides';

    // hidden_gems uses `verification_status` with values 'verified'/'featured'/'pending'/'rejected'.
    // Other tables use `status` with 'approved'/'rejected'/'pending'.
    const update: any = {};
    if (type === 'gem') {
      update.verification_status = action === 'approve' ? 'verified' : 'rejected';
    } else {
      update.status = action === 'approve' ? 'approved' : 'rejected';
    }
    if (action === 'reject' && feedback) {
      update.rejection_reason = feedback;
    }
    update.updated_at = new Date().toISOString();

    console.log(`[ReviewQueue] Updating ${tableName} id=${itemId}`, update);

    const { error: updateError } = await supabase.from(tableName).update(update).eq('id', itemId);

    if (updateError) {
      console.error(`[ReviewQueue] Error updating ${tableName}:`, updateError);
    } else {
      console.log(`[ReviewQueue] Successfully updated ${tableName} id=${itemId}`);
    }

    // Log to admin_logs if the table exists (non-blocking — don't fail the action if logging fails)
    try {
      const { error: logError } = await supabase.from('admin_logs').insert({
        admin_id: currentUser?.id,
        action,
        content_type: type,
        content_id: itemId,
        details: { feedback }
      });
      if (logError) {
        console.warn('[ReviewQueue] Could not write to admin_logs (table may not exist):', logError.message);
      }
    } catch (e) {
      console.warn('[ReviewQueue] admin_logs insert failed:', e);
    }

    // Update activity stats if the table exists (non-blocking)
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: existingStat, error: statError } = await supabase
        .from('admin_activity_stats')
        .select('*')
        .eq('admin_id', currentUser?.id)
        .eq('date', today)
        .maybeSingle();

      if (statError && statError.code !== '42P01') {
        console.warn('[ReviewQueue] admin_activity_stats query failed:', statError.message);
      } else if (existingStat) {
        await supabase
          .from('admin_activity_stats')
          .update({
            items_reviewed: existingStat.items_reviewed + 1,
            approvals_count: existingStat.approvals_count + (action === 'approve' ? 1 : 0),
            rejections_count: existingStat.rejections_count + (action === 'reject' ? 1 : 0)
          })
          .eq('id', existingStat.id);
      } else {
        await supabase.from('admin_activity_stats').insert({
          admin_id: currentUser?.id,
          date: today,
          items_reviewed: 1,
          approvals_count: action === 'approve' ? 1 : 0,
          rejections_count: action === 'reject' ? 1 : 0
        });
      }
    } catch (e) {
      console.warn('[ReviewQueue] admin_activity_stats update failed:', e);
    }

    setSelectedItem(null);
    setFeedback('');
    setProcessing(false);
    loadItems();
  }

  if (!canView) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">You don't have permission to view this content</p>
      </div>
    );
  }

  if (loading) return <div className="text-center py-8">Loading...</div>;

  const pending = items.filter(i => i.status === 'pending');
  const approved = items.filter(i => i.status === 'approved' || i.status === 'verified' || i.status === 'featured');
  const rejected = items.filter(i => i.status === 'rejected');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-700">
            <Clock className="w-5 h-5" />
            <span className="font-semibold">Pending: {pending.length}</span>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Approved: {approved.length}</span>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700">
            <XCircle className="w-5 h-5" />
            <span className="font-semibold">Rejected: {rejected.length}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="divide-y">
          {items.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No {type === 'gem' ? 'hidden gems' : type + 's'} found.
            </div>
          )}
          {items.map(item => (
            <div key={item.id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">{item.description}</p>
                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    {item.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {item.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {item.rejection_reason && (
                    <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                      {item.rejection_reason}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    item.status === 'approved' || item.status === 'verified' || item.status === 'featured' ? 'bg-green-100 text-green-800' :
                    item.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.status}
                  </span>
                  {item.status === 'pending' && canManage && (
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Review
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Review Item</h2>
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">{selectedItem.title}</h3>
              <p className="text-gray-600">{selectedItem.description}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback / Rejection Reason (optional)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                rows={4}
                placeholder="Provide feedback or reason for rejection..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleAction(selectedItem.id, 'approve')}
                disabled={processing}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
              >
                Approve
              </button>
              <button
                onClick={() => handleAction(selectedItem.id, 'reject')}
                disabled={processing}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setFeedback('');
                }}
                className="px-6 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
