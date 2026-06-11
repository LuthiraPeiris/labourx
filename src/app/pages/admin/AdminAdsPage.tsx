import { useEffect, useState } from 'react';
import { Plus, Eye, Pencil, Trash2, Megaphone, X, Image, Link as LinkIcon, Calendar } from 'lucide-react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';

import { db, storage } from '../../../firebase/config';

interface Ad {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  badgeText: string;
  badgeColor: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'scheduled' | 'paused' | 'expired';
  views: number;
  clicks: number;
}

type AdStatus = Ad['status'];
type AdForm = Omit<Ad, 'id' | 'views' | 'clicks'>;

const initialAds: Ad[] = [
  {
    id: 'ad-1',
    title: 'Mahindra Building Materials',
    description: 'Premium quality cement, steel, and building supplies at wholesale prices. Delivered across Sri Lanka.',
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&fit=crop',
    linkUrl: 'https://mahindra.lk',
    badgeText: 'Special Offer',
    badgeColor: '#C9A84C',
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    status: 'active',
    views: 1240,
    clicks: 89,
  },
  {
    id: 'ad-2',
    title: 'SriLanka Tiles & Ceramics',
    description: 'Explore our wide range of premium tiles for every room. Visit our showroom in Colombo or Kandy.',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&fit=crop',
    linkUrl: 'https://sltiles.lk',
    badgeText: 'New Arrivals',
    badgeColor: '#6E1425',
    startDate: '2026-06-05',
    endDate: '2026-07-05',
    status: 'active',
    views: 980,
    clicks: 63,
  },
  {
    id: 'ad-3',
    title: 'Ceylinco Home Insurance',
    description: 'Protect your investment with comprehensive home insurance. Get a free quote today.',
    imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&fit=crop',
    linkUrl: 'https://ceylinco.lk',
    badgeText: 'Partner',
    badgeColor: '#1a6e3c',
    startDate: '2026-06-15',
    endDate: '2026-07-15',
    status: 'scheduled',
    views: 0,
    clicks: 0,
  },
];

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  scheduled: 'bg-blue-100 text-blue-700',
  paused: 'bg-amber-100 text-amber-700',
  expired: 'bg-gray-100 text-gray-600',
};

const emptyForm: AdForm = {
  title: '',
  description: '',
  imageUrl: '',
  linkUrl: '',
  badgeText: 'Sponsored',
  badgeColor: '#C9A84C',
  startDate: '',
  endDate: '',
  status: 'active',
};

export function AdminAdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AdForm>(emptyForm);
  const [preview, setPreview] = useState(false);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
  const fetchAds = async () => {
    try {
      setLoading(true);

      const q = query(collection(db, 'ads'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      const adsData = snapshot.docs.map((docSnap) => {
        const data: any = docSnap.data();

        return {
          id: docSnap.id,
          title: data.title || '',
          description: data.description || '',
          imageUrl: data.imageUrl || '',
          linkUrl: data.linkUrl || '',
          badgeText: data.badgeText || 'Sponsored',
          badgeColor: data.badgeColor || '#C9A84C',
          startDate: data.startDate || '',
          endDate: data.endDate || '',
          status: data.status || 'active',
          views: Number(data.views || 0),
          clicks: Number(data.clicks || 0),
        };
      }) as Ad[];

      setAds(adsData);
    } catch (error) {
      console.error('Error loading ads:', error);
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  fetchAds();
}, []);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setPreview(false);
  };

  const openEdit = (ad: Ad) => {
    setForm({
      title: ad.title,
      description: ad.description,
      imageUrl: ad.imageUrl,
      linkUrl: ad.linkUrl,
      badgeText: ad.badgeText,
      badgeColor: ad.badgeColor,
      startDate: ad.startDate,
      endDate: ad.endDate,
      status: ad.status,
    });
    setEditingId(ad.id);
    setShowForm(true);
    setPreview(false);
  };

  const handleDelete = async (id: string) => {
  const confirmed = window.confirm('Delete this advertisement?');

  if (!confirmed) return;

  try {
    await deleteDoc(doc(db, 'ads', id));
    setAds((prev) => prev.filter((ad) => ad.id !== id));
  } catch (error) {
    console.error('Error deleting ad:', error);
    alert('Failed to delete advertisement.');
  }
};

  const handleSave = async () => {
  if (!form.title || !form.description) return;

  try {
    let uploadedImageUrl = form.imageUrl;

if (selectedImage) {
  setUploadingImage(true);

  const storageRef = ref(
    storage,
    `ads/${Date.now()}_${selectedImage.name}`
  );

  await uploadBytes(storageRef, selectedImage);

  uploadedImageUrl = await getDownloadURL(storageRef);

  setUploadingImage(false);
}

    if (editingId) {
      await updateDoc(doc(db, 'ads', editingId), {
        ...form,
        imageUrl: uploadedImageUrl,
        updatedAt: serverTimestamp(),
      });

      setAds((prev) =>
        prev.map((ad) => (ad.id === editingId ? { ...ad, ...form } : ad))
      );
    } else {
      const newAdData = {
        ...form,
        imageUrl: uploadedImageUrl,
        views: 0,
        clicks: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'ads'), newAdData);

      const newAd: Ad = {
        id: docRef.id,
        ...form,
        imageUrl: uploadedImageUrl,
        views: 0,
        clicks: 0,
      };

      setAds((prev) => [newAd, ...prev]);
    }

    setShowForm(false);
  } catch (error) {
    console.error('Error saving ad:', error);
    alert('Failed to save advertisement.');
  }
};

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900" style={{ fontSize: '1.4rem', fontWeight: 700 }}>Advertisements</h2>
          <p className="text-gray-500 text-sm mt-0.5">Manage personalized ads displayed on the homepage</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-maroon hover:bg-maroon-dark text-white px-4 py-2 rounded-xl text-sm transition-colors"
          style={{ fontWeight: 600 }}
        >
          <Plus className="w-4 h-4" />
          New Ad
        </button>
      </div>

      {/* Ad list */}
      <div className="grid gap-4">
  {loading && (
    <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400">
      Loading advertisements...
    </div>
  )}

  {!loading && ads.length === 0 && (
    <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400">
      No advertisements found.
    </div>
  )}

  {!loading && ads.map(ad => (
          <div key={ad.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex flex-col sm:flex-row">
              <div className="w-full sm:w-40 h-28 sm:h-auto flex-shrink-0">
                <img
                  src={ad.imageUrl || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&fit=crop'}
                  alt={ad.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-gray-800" style={{ fontWeight: 600 }}>{ad.title}</h3>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: ad.badgeColor, fontWeight: 600 }}
                      >
                        {ad.badgeText}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColors[ad.status]}`} style={{ fontWeight: 500 }}>
                        {ad.status}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mb-2 line-clamp-1">{ad.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {ad.views.toLocaleString()} views</span>
                      <span>{ad.clicks} clicks</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {ad.startDate} → {ad.endDate}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => openEdit(ad)}
                      className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-maroon hover:border-maroon/30 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(ad.id)}
                      className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-4">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-maroon" />
                <h3 className="text-gray-900" style={{ fontWeight: 700 }}>
                  {editingId ? 'Edit Advertisement' : 'Create Advertisement'}
                </h3>
              </div>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Preview toggle */}
              <div className="flex gap-2 border-b border-gray-100 pb-4">
                <button
                  onClick={() => setPreview(false)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${!preview ? 'bg-maroon text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                  style={{ fontWeight: 500 }}
                >
                  Edit
                </button>
                <button
                  onClick={() => setPreview(true)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${preview ? 'bg-maroon text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                  style={{ fontWeight: 500 }}
                >
                  Preview
                </button>
              </div>

              {preview ? (
                /* Live preview of how ad looks on homepage */
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <div className="relative h-36">
                    <img
                      src={form.imageUrl || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&fit=crop'}
                      alt="Ad preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent flex items-center px-6">
                      <div>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full text-white mb-2 inline-block"
                          style={{ backgroundColor: form.badgeColor, fontWeight: 600 }}
                        >
                          {form.badgeText || 'Sponsored'}
                        </span>
                        <h4 className="text-white mb-1" style={{ fontWeight: 700, fontSize: '1.1rem' }}>{form.title || 'Ad Title'}</h4>
                        <p className="text-white/80 text-sm">{form.description || 'Ad description goes here...'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Form fields */
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1" style={{ fontWeight: 500 }}>Ad Title *</label>
                      <input
                        value={form.title}
                        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                        placeholder="e.g. Mahindra Building Materials"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1" style={{ fontWeight: 500 }}>Badge Text</label>
                      <input
                        value={form.badgeText}
                        onChange={e => setForm(f => ({ ...f, badgeText: e.target.value }))}
                        placeholder="e.g. Sponsored, New Arrivals"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1" style={{ fontWeight: 500 }}>Description *</label>
                    <textarea
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Short promotional description..."
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
  <div>
    <label
      className="block text-sm text-gray-700 mb-2"
      style={{ fontWeight: 600 }}
    >
      Advertisement Image
    </label>

    <label className="block cursor-pointer rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors p-5 text-center">
      <Image className="w-8 h-8 mx-auto text-gray-400 mb-2" />
      <p className="text-sm text-gray-700" style={{ fontWeight: 600 }}>
        Click to upload advertisement image
      </p>
      <p className="text-xs text-gray-400 mt-1">
        Recommended: 1200 × 400 px, JPG / PNG / WEBP
      </p>

      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];

          if (!file) return;

          setSelectedImage(file);

          setForm((f) => ({
            ...f,
            imageUrl: URL.createObjectURL(file),
          }));
        }}
      />
    </label>

    {form.imageUrl && (
      <div className="mt-3 rounded-xl overflow-hidden border border-gray-200">
        <img
          src={form.imageUrl}
          alt="Advertisement preview"
          className="w-full h-36 object-cover"
        />
      </div>
    )}
  </div>

    <div>
    <label
      className="block text-sm text-gray-700 mb-1"
      style={{ fontWeight: 500 }}
    >
      <span className="flex items-center gap-1">
        <LinkIcon className="w-3.5 h-3.5" />
        Destination URL
      </span>
    </label>

    <input
      value={form.linkUrl}
      onChange={(e) =>
        setForm((f) => ({
          ...f,
          linkUrl: e.target.value,
        }))
      }
      placeholder="https://..."
      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
    />
  </div>
</div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1" style={{ fontWeight: 500 }}>Badge Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={form.badgeColor}
                          onChange={e => setForm(f => ({ ...f, badgeColor: e.target.value }))}
                          className="w-10 h-9 rounded border border-gray-200 cursor-pointer"
                        />
                        <input
                          value={form.badgeColor}
                          onChange={e => setForm(f => ({ ...f, badgeColor: e.target.value }))}
                          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1" style={{ fontWeight: 500 }}>Start Date</label>
                      <input
                        type="date"
                        value={form.startDate}
                        onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1" style={{ fontWeight: 500 }}>End Date</label>
                      <input
                        type="date"
                        value={form.endDate}
                        onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1" style={{ fontWeight: 500 }}>Status</label>
                    <select
                        value={form.status}
                        onChange={(e) =>
                            setForm((f) => ({
                            ...f,
                            status: e.target.value as AdStatus,
                            }))
                        }
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon bg-white"
                        >
                        <option value="active">Active</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="paused">Paused</option>
                        <option value="expired">Expired</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors"
                style={{ fontWeight: 500 }}
              >
                Cancel
              </button>
              <button
  onClick={handleSave}
  disabled={!form.title || !form.description || uploadingImage}
  className="px-4 py-2 rounded-xl bg-maroon hover:bg-maroon-dark disabled:opacity-50 text-white text-sm transition-colors"
  style={{ fontWeight: 600 }}
>
  {uploadingImage
    ? 'Uploading Image...'
    : editingId
    ? 'Save Changes'
    : 'Publish Ad'}
</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
