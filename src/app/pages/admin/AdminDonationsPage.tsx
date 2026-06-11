import { useEffect, useState } from 'react';
import { Coffee, Heart, Search, Trash2 } from 'lucide-react';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
} from 'firebase/firestore';

import { db } from '../../../firebase/config';

function formatDate(value: any) {
  if (!value) return '-';

  if (value?.toDate) {
    return value.toDate().toLocaleDateString('en-LK');
  }

  return String(value);
}

export function AdminDonationsPage() {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        setLoading(true);

        const q = query(collection(db, 'donations'), orderBy('donatedAt', 'desc'));
        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        setDonations(data);
      } catch (error) {
        console.error('Error loading donations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Delete this donation record?');

    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, 'donations', id));
      setDonations((prev) => prev.filter((donation) => donation.id !== id));
    } catch (error) {
      console.error('Error deleting donation:', error);
      alert('Failed to delete donation.');
    }
  };

  const filteredDonations = donations.filter((donation) => {
    const text = `${donation.amount || ''} ${donation.message || ''} ${donation.paymentMethod || ''}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const totalDonationRevenue = donations
    .filter((donation) => String(donation.paymentStatus || '').toLowerCase() === 'paid')
    .reduce((sum, donation) => sum + Number(donation.amount || 0), 0);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-gray-900" style={{ fontSize: '1.4rem', fontWeight: 700 }}>
          Donations
        </h2>
        <p className="text-gray-500 text-sm mt-0.5">
          View and manage Buy Us a Coffee donations
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-amber-100 rounded-xl p-4">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <Coffee className="w-4 h-4" />
          </div>
          <p className="text-gray-900" style={{ fontWeight: 700, fontSize: '1.25rem' }}>
            Rs. {totalDonationRevenue.toLocaleString()}
          </p>
          <p className="text-gray-500 text-xs mt-0.5">Total Donation Revenue</p>
        </div>

        <div className="bg-white border border-red-100 rounded-xl p-4">
          <div className="w-9 h-9 rounded-lg bg-red-50 text-red-500 flex items-center justify-center mb-3">
            <Heart className="w-4 h-4" />
          </div>
          <p className="text-gray-900" style={{ fontWeight: 700, fontSize: '1.25rem' }}>
            {donations.length}
          </p>
          <p className="text-gray-500 text-xs mt-0.5">Total Donations</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search donations..."
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="divide-y divide-gray-50">
          {loading && (
            <div className="p-8 text-center text-gray-400">Loading donations...</div>
          )}

          {!loading && filteredDonations.length === 0 && (
            <div className="p-8 text-center text-gray-400">No donations found.</div>
          )}

          {!loading &&
            filteredDonations.map((donation) => (
              <div key={donation.id} className="flex items-start justify-between gap-4 p-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                    <Coffee className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-gray-800 text-sm" style={{ fontWeight: 700 }}>
                      Rs. {Number(donation.amount || 0).toLocaleString()}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {donation.message || 'No message'}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      {donation.paymentMethod || 'Card'} · {formatDate(donation.donatedAt)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(donation.id)}
                  className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
                  title="Delete donation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}