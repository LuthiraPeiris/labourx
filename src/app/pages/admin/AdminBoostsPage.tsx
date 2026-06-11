import { useEffect, useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  FileText,
  Search,
  Trash2,
} from 'lucide-react';
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  where,
  updateDoc,
  setDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';

import { db } from '../../../firebase/config';

type BoostStatus = 'pending' | 'approved' | 'rejected' | 'deactivated';

interface BoostRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterEmail?: string;
  requesterAvatar: string;
  type: 'profile' | 'post';
  targetId: string;
  targetName: string;
  plan: string;
  amount: number;
  paymentRef: string;
  requestedAt: string;
  status: BoostStatus;
  badge: 'Top' | 'Verified' | 'Featured';
}

const badgeColors: Record<string, string> = {
  Top: 'bg-gold/10 text-gold border border-gold/30',
  Verified: 'bg-blue-50 text-blue-700 border border-blue-200',
  Featured: 'bg-purple-50 text-purple-700 border border-purple-200',
};

const statusConfig: Record<
  string,
  {
    label: string;
    color: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  pending: {
    label: 'Pending',
    color: 'bg-amber-100 text-amber-700',
    icon: Clock,
  },
  approved: {
    label: 'Approved',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle,
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-700',
    icon: XCircle,
  },
  deactivated: {
    label: 'Deactivated',
    color: 'bg-gray-100 text-gray-600',
    icon: XCircle,
  },
};

function formatDate(value: any) {
  if (!value) return '-';

  if (value instanceof Timestamp) {
    return value.toDate().toLocaleDateString('en-LK');
  }

  if (value?.toDate) {
    return value.toDate().toLocaleDateString('en-LK');
  }

  return String(value);
}

function normalizeStatus(value: any): BoostStatus {
  const status = String(value || 'pending').toLowerCase();

  if (
    status === 'pending' ||
    status === 'approved' ||
    status === 'rejected' ||
    status === 'deactivated'
  ) {
    return status;
  }

  return 'pending';
}

function calculateBoostExpiry(plan: string) {
  const now = new Date();
  const lowerPlan = plan.toLowerCase();

  if (lowerPlan.includes('lifetime')) {
    return null;
  }

  if (lowerPlan.includes('14 days')) {
    now.setDate(now.getDate() + 14);
    return now.toISOString();
  }

  if (lowerPlan.includes('30 days')) {
    now.setDate(now.getDate() + 30);
    return now.toISOString();
  }

  now.setDate(now.getDate() + 7);
  return now.toISOString();
}

export function AdminBoostsPage() {
  const [boosts, setBoosts] = useState<BoostRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | BoostStatus>('all');
  const [search, setSearch] = useState('');

  const fetchBoosts = async () => {
    try {
      setLoading(true);

      const q = query(
        collection(db, 'boostRequests'),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((docSnap) => {
        const item: any = docSnap.data();

        return {
          id: docSnap.id,
          requesterId: item.requesterId || '',
          requesterName: item.requesterName || 'Unknown User',
          requesterEmail: item.requesterEmail || '',
          requesterAvatar: item.requesterAvatar || '',
          type: item.type || 'profile',
          targetId: item.targetId || item.requesterId || '',
          targetName: item.targetName || 'Unknown Target',
          plan: item.plan || 'Boost Plan',
          amount: Number(item.amount || 0),
          paymentRef: item.paymentRef || '-',
          requestedAt: formatDate(item.requestedAt || item.createdAt),
          status: normalizeStatus(item.status),
          badge: item.badge || 'Featured',
        };
      }) as BoostRequest[];

      setBoosts(data);
    } catch (error) {
      console.error('Error loading boost requests:', error);
      setBoosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoosts();
  }, []);

  const handleAction = async (
  boost: BoostRequest,
  action: 'approved' | 'rejected'
) => {
  try {
    await updateDoc(doc(db, 'boostRequests', boost.id), {
      status: action,
      reviewedAt: new Date().toISOString(),
    });

    let deactivatedOldBoostIds: string[] = [];

    if (action === 'approved' && boost.type === 'profile' && boost.targetId) {
      const oldBoostsQuery = query(
        collection(db, 'boostRequests'),
        where('targetId', '==', boost.targetId),
        where('type', '==', 'profile'),
        where('status', '==', 'approved')
      );

      const oldBoostsSnapshot = await getDocs(oldBoostsQuery);

      deactivatedOldBoostIds = oldBoostsSnapshot.docs
        .filter((docSnap) => docSnap.id !== boost.id)
        .map((docSnap) => docSnap.id);

      await Promise.all(
        deactivatedOldBoostIds.map((oldBoostId) =>
          updateDoc(doc(db, 'boostRequests', oldBoostId), {
            status: 'deactivated',
            deactivatedAt: new Date().toISOString(),
            deactivationReason: 'Replaced by newer boost',
          })
        )
      );

      const userUpdateData: any = {
        isBoosted: true,
        boostBadge: boost.badge,
        boostPlan: boost.plan,
        boostStatus: 'active',
        boostApprovedAt: new Date().toISOString(),
        boostExpiresAt: calculateBoostExpiry(boost.plan),
      };

      if (boost.badge === 'Verified') {
        userUpdateData.isVerified = true;
      }

      await setDoc(doc(db, 'users', boost.targetId), userUpdateData, {
        merge: true,
      });
    }

    setBoosts((prev) =>
      prev.map((b) => {
        if (b.id === boost.id) {
          return { ...b, status: action };
        }

        if (deactivatedOldBoostIds.includes(b.id)) {
          return { ...b, status: 'deactivated' };
        }

        return b;
      })
    );
  } catch (error) {
    console.error('Error updating boost request:', error);
    alert('Failed to update boost request.');
  }
};

  const handleDeactivateBoost = async (boost: BoostRequest) => {
    const confirmed = window.confirm(
      'Deactivate this professional boost? The request will stay, but the user will no longer be boosted.'
    );

    if (!confirmed) return;

    try {
      await setDoc(
        doc(db, 'users', boost.targetId),
        {
          isBoosted: false,
          boostBadge: '',
          boostPlan: '',
          boostStatus: 'inactive',
          boostExpiresAt: null,
          boostDeactivatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      await updateDoc(doc(db, 'boostRequests', boost.id), {
        status: 'deactivated',
        deactivatedAt: new Date().toISOString(),
      });

      setBoosts((prev) =>
        prev.map((item) =>
          item.id === boost.id ? { ...item, status: 'deactivated' } : item
        )
      );
    } catch (error) {
      console.error('Error deactivating boost:', error);
      alert('Failed to deactivate boost.');
    }
  };

  const handleCheckExpiredBoosts = async () => {
  const confirmed = window.confirm('Check and deactivate expired boosts?');

  if (!confirmed) return;

  try {
    const now = Date.now();
    let expiredCount = 0;

    for (const boost of boosts) {
      if (boost.status !== 'approved') continue;
      if (boost.type !== 'profile') continue;
      if (!boost.targetId) continue;

      const userRef = doc(db, 'users', boost.targetId);
      const userSnap = await getDocs(query(collection(db, 'users')));

      const matchedUser = userSnap.docs.find((docSnap) => docSnap.id === boost.targetId);

      if (!matchedUser) continue;

      const userData: any = matchedUser.data();
      const boostExpiresAt = userData.boostExpiresAt || null;

      if (!boostExpiresAt) continue;

      const isExpired = new Date(boostExpiresAt).getTime() <= now;

      if (!isExpired) continue;

      await setDoc(
        userRef,
        {
          isBoosted: false,
          boostBadge: '',
          boostPlan: '',
          boostStatus: 'expired',
          boostExpiresAt: null,
          boostExpiredAt: new Date().toISOString(),
        },
        { merge: true }
      );

      await updateDoc(doc(db, 'boostRequests', boost.id), {
        status: 'deactivated',
        expiredAt: new Date().toISOString(),
      });

      expiredCount++;
    }

    alert(`${expiredCount} expired boost(s) deactivated.`);
    fetchBoosts();
  } catch (error) {
    console.error('Error checking expired boosts:', error);
    alert('Failed to check expired boosts.');
  }
};

  const handleDelete = async (boostId: string) => {
    const confirmed = window.confirm('Delete this boost request?');

    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, 'boostRequests', boostId));
      setBoosts((prev) => prev.filter((boost) => boost.id !== boostId));
    } catch (error) {
      console.error('Error deleting boost request:', error);
      alert('Failed to delete boost request.');
    }
  };

  const filtered = boosts.filter((b) => {
    const matchesFilter = filter === 'all' || b.status === filter;
    const searchText = search.toLowerCase();

    const matchesSearch =
      !search ||
      b.requesterName.toLowerCase().includes(searchText) ||
      b.targetName.toLowerCase().includes(searchText) ||
      b.paymentRef.toLowerCase().includes(searchText);

    return matchesFilter && matchesSearch;
  });

  const counts = {
    all: boosts.length,
    pending: boosts.filter((b) => b.status === 'pending').length,
    approved: boosts.filter((b) => b.status === 'approved').length,
    rejected: boosts.filter((b) => b.status === 'rejected').length,
    deactivated: boosts.filter((b) => b.status === 'deactivated').length,
  };

  return (
    <div className="space-y-5">
      <div>
        <h2
          className="text-gray-900"
          style={{ fontSize: '1.4rem', fontWeight: 700 }}
        >
          Boost Requests
        </h2>
        <p className="text-gray-500 text-sm mt-0.5">
          Review and approve paid profile and post boost requests
        </p>
        <button
          onClick={handleCheckExpiredBoosts}
          className="mt-3 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-900 text-white text-sm transition-colors"
          style={{ fontWeight: 600 }}
        >
          Check Expired Boosts
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {(['all', 'pending', 'approved', 'rejected', 'deactivated'] as const).map(
          (s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`p-3 rounded-xl border text-left transition-all ${
                filter === s
                  ? 'border-maroon bg-maroon/5'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <p
                className={`text-xl ${
                  filter === s ? 'text-maroon' : 'text-gray-800'
                }`}
                style={{ fontWeight: 700 }}
              >
                {counts[s]}
              </p>
              <p className="text-gray-500 text-xs capitalize mt-0.5">
                {s === 'all' ? 'Total' : s}
              </p>
            </button>
          )
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, post title, or payment reference..."
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="divide-y divide-gray-50">
          {loading && (
            <div className="p-8 text-center text-gray-400">
              Loading boost requests...
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              No boost requests found.
            </div>
          )}

          {!loading &&
            filtered.map((boost) => {
              const statusInfo = statusConfig[boost.status] || statusConfig.pending;
              const StatusIcon = statusInfo.icon;

              return (
                <div key={boost.id} className="p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {boost.requesterAvatar ? (
                        <img
                          src={boost.requesterAvatar}
                          alt={boost.requesterName}
                          className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-maroon-light flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-maroon" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="text-gray-800 text-sm"
                            style={{ fontWeight: 600 }}
                          >
                            {boost.requesterName}
                          </span>

                          <span
                            className={`text-xs px-1.5 py-0.5 rounded-md inline-flex items-center gap-1 ${
                              boost.type === 'profile'
                                ? 'bg-gray-100 text-gray-600'
                                : 'bg-indigo-50 text-indigo-600'
                            }`}
                            style={{ fontWeight: 500 }}
                          >
                            {boost.type === 'profile' ? (
                              <User className="w-3 h-3" />
                            ) : (
                              <FileText className="w-3 h-3" />
                            )}
                            {boost.type === 'profile' ? 'Profile' : 'Post'}
                          </span>

                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${badgeColors[boost.badge]}`}
                            style={{ fontWeight: 600 }}
                          >
                            {boost.badge === 'Top'
                              ? '⭐ Top'
                              : boost.badge === 'Verified'
                              ? '✓ Verified'
                              : '✦ Featured'}
                          </span>
                        </div>

                        <p className="text-gray-500 text-xs mt-0.5 truncate">
                          {boost.targetName}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 mt-1">
                          <span className="text-xs text-gray-400">
                            {boost.plan}
                          </span>
                          <span className="text-xs text-gray-400">
                            Ref: {boost.paymentRef}
                          </span>
                          <span className="text-xs text-gray-400">
                            {boost.requestedAt}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 flex-shrink-0 ml-13 sm:ml-0">
                      <span
                        className="text-gray-700 text-sm"
                        style={{ fontWeight: 700 }}
                      >
                        Rs. {boost.amount.toLocaleString()}
                      </span>

                      <span
                        className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${statusInfo.color}`}
                        style={{ fontWeight: 500 }}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {statusInfo.label}
                      </span>

                      {boost.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAction(boost, 'approved')}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs transition-colors"
                            style={{ fontWeight: 600 }}
                          >
                            Approve
                          </button>

                          <button
                            onClick={() => handleAction(boost, 'rejected')}
                            className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs transition-colors"
                            style={{ fontWeight: 600 }}
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {boost.status === 'approved' && boost.type === 'profile' && (
                        <button
                          onClick={() => handleDeactivateBoost(boost)}
                          className="px-3 py-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-xs transition-colors"
                          style={{ fontWeight: 600 }}
                        >
                          Deactivate
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(boost.id)}
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
                        title="Delete request"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}