import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Megaphone,
  TrendingUp,
  DollarSign,
  Users,
  Eye,
  ArrowRight,
  Star,
  Coffee,
  Heart,
  MousePointerClick,
  BarChart3,
  BadgeCheck,
  FileText,
} from 'lucide-react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

import { db } from '../../../firebase/config';

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    active: 'bg-green-100 text-green-700',
    scheduled: 'bg-blue-100 text-blue-700',
    paused: 'bg-amber-100 text-amber-700',
    expired: 'bg-gray-100 text-gray-600',
  };

  return map[status] || 'bg-gray-100 text-gray-600';
};

function formatDate(value: any) {
  if (!value) return '-';

  if (value?.toDate) {
    return value.toDate().toLocaleDateString('en-LK');
  }

  return String(value);
}

export function AdminDashboardPage() {
  const [boosts, setBoosts] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);

        const usersSnapshot = await getDocs(collection(db, 'users'));
        const postsSnapshot = await getDocs(collection(db, 'posts'));

        const boostsSnapshot = await getDocs(
          query(collection(db, 'boostRequests'), orderBy('createdAt', 'desc'))
        );

        const donationsSnapshot = await getDocs(
          collection(db, 'donations')
        );

        let adsData: any[] = [];

        try {
          const adsSnapshot = await getDocs(collection(db, 'ads'));
          adsData = adsSnapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));
        } catch {
          adsData = [];
        }

        const usersData = usersSnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        const postsData = postsSnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        const boostsData = boostsSnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        const donationsData = donationsSnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        setUsers(usersData);
        setPosts(postsData);
        setBoosts(boostsData);
        setDonations(donationsData);
        setAds(adsData);
      } catch (error) {
        console.error('Error loading admin dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  const stats = useMemo(() => {
  const activeAds = ads.filter(
    (ad) => String(ad.status || '').toLowerCase() === 'active'
  ).length;

  const pendingBoosts = boosts.filter(
    (boost) => String(boost.status || '').toLowerCase() === 'pending'
  ).length;

  const profileBoostRevenue = boosts
    .filter(
      (boost) =>
        String(boost.paymentStatus || '').toLowerCase() === 'paid' &&
        String(boost.type || '').toLowerCase() === 'profile'
    )
    .reduce((sum, boost) => sum + Number(boost.amount || 0), 0);

  const postBoostRevenue = boosts
    .filter(
      (boost) =>
        String(boost.paymentStatus || '').toLowerCase() === 'paid' &&
        String(boost.type || '').toLowerCase() === 'post'
    )
    .reduce((sum, boost) => sum + Number(boost.amount || 0), 0);

  const donationRevenue = donations
    .filter(
      (donation) =>
        String(donation.paymentStatus || '').toLowerCase() === 'paid'
    )
    .reduce((sum, donation) => sum + Number(donation.amount || 0), 0);

  const totalRevenue = profileBoostRevenue + postBoostRevenue + donationRevenue;

  return [
    {
      label: 'Active Ads',
      value: loading ? '...' : String(activeAds),
      icon: Megaphone,
      color: 'bg-blue-50 text-blue-600',
      border: 'border-blue-100',
    },
    {
      label: 'Pending Boosts',
      value: loading ? '...' : String(pendingBoosts),
      icon: TrendingUp,
      color: 'bg-amber-50 text-amber-600',
      border: 'border-amber-100',
    },
    {
      label: 'Total Revenue',
      value: loading ? '...' : `Rs. ${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-50 text-green-600',
      border: 'border-green-100',
    },
    {
      label: 'Active Users',
      value: loading ? '...' : String(users.length),
      icon: Users,
      color: 'bg-purple-50 text-purple-600',
      border: 'border-purple-100',
    },
  ];
}, [ads, boosts, donations, users, loading]);

  const recentBoosts = boosts.slice(0, 4).map((boost) => ({
    id: boost.id,
    name: boost.targetName || boost.requesterName || 'Unknown Boost',
    type: boost.type === 'post' ? 'Post Boost' : 'Profile Boost',
    amount: `Rs. ${Number(boost.amount || 0).toLocaleString()}`,
    status: String(boost.status || 'pending').toLowerCase(),
    date: formatDate(boost.requestedAt || boost.createdAt),
  }));

  const recentAds = ads.slice(0, 3).map((ad) => ({
    id: ad.id,
    title: ad.title || 'Untitled Advertisement',
    status: String(ad.status || 'active').toLowerCase(),
    views: Number(ad.views || 0),
    clicks: Number(ad.clicks || 0),
  }));

  const analyticsCards = useMemo(() => {
  const totalAdViews = ads.reduce(
    (sum, ad) => sum + Number(ad.views || 0),
    0
  );

  const totalAdClicks = ads.reduce(
    (sum, ad) => sum + Number(ad.clicks || 0),
    0
  );

  const averageCtr =
    totalAdViews > 0 ? ((totalAdClicks / totalAdViews) * 100).toFixed(1) : '0.0';

  const profileBoostRevenue = boosts
    .filter(
      (boost) =>
        String(boost.paymentStatus || '').toLowerCase() === 'paid' &&
        String(boost.type || '').toLowerCase() === 'profile'
    )
    .reduce((sum, boost) => sum + Number(boost.amount || 0), 0);

  const postBoostRevenue = boosts
    .filter(
      (boost) =>
        String(boost.paymentStatus || '').toLowerCase() === 'paid' &&
        String(boost.type || '').toLowerCase() === 'post'
    )
    .reduce((sum, boost) => sum + Number(boost.amount || 0), 0);

  const donationRevenue = donations
    .filter(
      (donation) =>
        String(donation.paymentStatus || '').toLowerCase() === 'paid'
    )
    .reduce((sum, donation) => sum + Number(donation.amount || 0), 0);

  const activeBoostedProfessionals = users.filter(
    (user) =>
      String(user.role || '').toLowerCase() === 'technician' &&
      user.isBoosted === true &&
      String(user.boostStatus || '').toLowerCase() === 'active'
  ).length;

  const activeBoostedPosts = posts.filter(
    (post) =>
      post.isBoosted === true &&
      String(post.boostStatus || '').toLowerCase() === 'active'
  ).length;

  return [
    {
      label: 'Total Ad Views',
      value: loading ? '...' : totalAdViews.toLocaleString(),
      icon: Eye,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Average CTR',
      value: loading ? '...' : `${averageCtr}%`,
      icon: BarChart3,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Profile Boost Revenue',
      value: loading ? '...' : `Rs. ${profileBoostRevenue.toLocaleString()}`,
      icon: BadgeCheck,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Post Boost Revenue',
      value: loading ? '...' : `Rs. ${postBoostRevenue.toLocaleString()}`,
      icon: FileText,
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      label: 'Donation Revenue',
      value: loading ? '...' : `Rs. ${donationRevenue.toLocaleString()}`,
      icon: Coffee,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Boosted Posts',
      value: loading ? '...' : String(activeBoostedPosts),
      icon: TrendingUp,
      color: 'bg-gold/10 text-gold',
    },
  ];
}, [ads, boosts, donations, users, posts, loading]);

const chartData = useMemo(() => {
  const profileBoostRevenue = boosts
    .filter(
      (boost) =>
        String(boost.paymentStatus || '').toLowerCase() === 'paid' &&
        String(boost.type || '').toLowerCase() === 'profile'
    )
    .reduce((sum, boost) => sum + Number(boost.amount || 0), 0);

  const postBoostRevenue = boosts
    .filter(
      (boost) =>
        String(boost.paymentStatus || '').toLowerCase() === 'paid' &&
        String(boost.type || '').toLowerCase() === 'post'
    )
    .reduce((sum, boost) => sum + Number(boost.amount || 0), 0);

  const donationRevenue = donations
    .filter(
      (donation) =>
        String(donation.paymentStatus || '').toLowerCase() === 'paid'
    )
    .reduce((sum, donation) => sum + Number(donation.amount || 0), 0);

  const totalAdViews = ads.reduce((sum, ad) => sum + Number(ad.views || 0), 0);
  const totalAdClicks = ads.reduce((sum, ad) => sum + Number(ad.clicks || 0), 0);

  return {
    profileBoostRevenue,
    postBoostRevenue,
    boostRevenue: profileBoostRevenue + postBoostRevenue,
    donationRevenue,
    totalRevenue: profileBoostRevenue + postBoostRevenue + donationRevenue,
    totalAdViews,
    totalAdClicks,
  };
}, [ads, boosts, donations]);

const platformHealth = useMemo(() => {
  const clients = users.filter(
    (user) => String(user.role || '').toLowerCase() === 'client'
  ).length;

  const professionals = users.filter((user) => {
    const role = String(user.role || '').toLowerCase();
    return role === 'professional' || role === 'technician';
  }).length;

  const openJobs = posts.filter((post) => {
  const status = String(post.status || '').toLowerCase();

  return (
    status === 'open' ||
    status === 'pending' ||
    status === 'active' ||
    status === ''
  );
}).length;

  const activeAds = ads.filter(
    (ad) => String(ad.status || '').toLowerCase() === 'active'
  ).length;

  const pendingBoosts = boosts.filter(
    (boost) => String(boost.status || '').toLowerCase() === 'pending'
  ).length;

  const totalDonations = donations
    .filter(
      (donation) =>
        String(donation.paymentStatus || '').toLowerCase() === 'paid'
    )
    .reduce((sum, donation) => sum + Number(donation.amount || 0), 0);

  return [
    {
      label: 'Clients',
      value: loading ? '...' : String(clients),
    },
    {
      label: 'Professionals',
      value: loading ? '...' : String(professionals),
    },
    {
      label: 'Open Jobs',
      value: loading ? '...' : String(openJobs),
    },
    {
      label: 'Active Ads',
      value: loading ? '...' : String(activeAds),
    },
    {
      label: 'Pending Boosts',
      value: loading ? '...' : String(pendingBoosts),
    },
    {
      label: 'Total Donations',
      value: loading ? '...' : `Rs. ${totalDonations.toLocaleString()}`,
    },
  ];
}, [users, posts, ads, boosts, donations, loading]);

  const recentActivity = useMemo(() => {
  const userActivities = users.slice(0, 3).map((user) => ({
    id: `user-${user.id}`,
    title: `${user.fullName || user.name || 'New user'} joined`,
    description: `${user.role || 'User'} account created`,
    date: formatDate(user.createdAt),
  }));

  const boostActivities = boosts.slice(0, 3).map((boost) => ({
    id: `boost-${boost.id}`,
    title: 'New boost request',
    description: boost.targetName || boost.requesterName || 'Boost request submitted',
    date: formatDate(boost.requestedAt || boost.createdAt),
  }));

  const adActivities = ads.slice(0, 2).map((ad) => ({
    id: `ad-${ad.id}`,
    title: 'Advertisement created',
    description: ad.title || 'Untitled advertisement',
    date: formatDate(ad.createdAt),
  }));

  const donationActivities = donations.slice(0, 2).map((donation) => ({
    id: `donation-${donation.id}`,
    title: 'Donation received',
    description: `Rs. ${Number(donation.amount || 0).toLocaleString()}`,
    date: formatDate(donation.donatedAt || donation.createdAt),
  }));

  return [
    ...boostActivities,
    ...adActivities,
    ...donationActivities,
    ...userActivities,
  ].slice(0, 6);
}, [users, boosts, ads, donations]);



  const recentDonations = donations
  .filter(
    (donation) =>
      String(donation.paymentStatus || '').toLowerCase() === 'paid'
  )
  .slice(0, 4)
  .map((donation) => ({
    id: donation.id,
    amount: `Rs. ${Number(donation.amount || 0).toLocaleString()}`,
    message: donation.message || 'No message',
    date: formatDate(donation.donatedAt),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-900 mb-1" style={{ fontSize: '1.4rem', fontWeight: 700 }}>
          Dashboard Overview
        </h2>
        <p className="text-gray-500 text-sm">
          Welcome back! Here's what's happening on LabourX.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className={`bg-white border ${stat.border} rounded-xl p-4`}>
            <div className={`w-9 h-9 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <p className="text-gray-900" style={{ fontWeight: 700, fontSize: '1.25rem' }}>
              {stat.value}
            </p>
            <p className="text-gray-500 text-xs mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
  {analyticsCards.map((card, i) => (
    <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
      <div
        className={`w-9 h-9 rounded-lg ${card.color} flex items-center justify-center mb-3`}
      >
        <card.icon className="w-4 h-4" />
      </div>

      <p
        className="text-gray-900"
        style={{ fontWeight: 700, fontSize: '1.1rem' }}
      >
        {card.value}
      </p>

      <p className="text-gray-500 text-xs mt-0.5">{card.label}</p>
    </div>
  ))}
</div>

<div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
  {/* Revenue Breakdown */}
  <div className="bg-white border border-gray-200 rounded-xl p-5">
    <h3 className="text-gray-800 mb-4" style={{ fontWeight: 700 }}>
      Revenue Breakdown
    </h3>

    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600">Profile Boost Revenue</span>
          <span className="text-gray-900" style={{ fontWeight: 700 }}>
            Rs. {chartData.profileBoostRevenue.toLocaleString()}
          </span>
        </div>

        <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full bg-gold rounded-full"
            style={{
              width:
                chartData.totalRevenue > 0
                  ? `${(chartData.profileBoostRevenue / chartData.totalRevenue) * 100}%`
                  : '0%'
            }}
          />
        </div>
      </div>

            <div>
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600">Post Boost Revenue</span>
          <span className="text-gray-900" style={{ fontWeight: 700 }}>
            Rs. {chartData.postBoostRevenue.toLocaleString()}
          </span>
        </div>

        <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full"
            style={{
              width:
                chartData.totalRevenue > 0
                  ? `${(chartData.postBoostRevenue / chartData.totalRevenue) * 100}%`
                  : '0%',
            }}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600">Donation Revenue</span>
          <span className="text-gray-900" style={{ fontWeight: 700 }}>
            Rs. {chartData.donationRevenue.toLocaleString()}
          </span>
        </div>

        <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full bg-amber-500 rounded-full"
            style={{
              width:
                chartData.totalRevenue > 0
                  ? `${(chartData.donationRevenue / chartData.totalRevenue) * 100}%`
                  : '0%',
            }}
          />
        </div>
      </div>
    </div>
  </div>

  {/* Advertisement Performance */}
  <div className="bg-white border border-gray-200 rounded-xl p-5">
    <h3 className="text-gray-800 mb-4" style={{ fontWeight: 700 }}>
      Advertisement Performance
    </h3>

    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600">Views</span>
          <span className="text-gray-900" style={{ fontWeight: 700 }}>
            {chartData.totalAdViews.toLocaleString()}
          </span>
        </div>

        <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full"
            style={{
              width: chartData.totalAdViews > 0 ? '100%' : '0%',
            }}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600">Clicks</span>
          <span className="text-gray-900" style={{ fontWeight: 700 }}>
            {chartData.totalAdClicks.toLocaleString()}
          </span>
        </div>

        <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full"
            style={{
              width:
                chartData.totalAdViews > 0
                  ? `${Math.min(
                      (chartData.totalAdClicks / chartData.totalAdViews) * 100,
                      100
                    )}%`
                  : '0%',
            }}
          />
        </div>
      </div>
    </div>
  </div>
</div>


<div className="bg-white border border-gray-200 rounded-xl p-5">
  <div className="mb-4">
    <h3 className="text-gray-800" style={{ fontWeight: 700 }}>
      Platform Health
    </h3>
    <p className="text-gray-500 text-sm mt-1">
      Quick overview of the whole LabourX platform.
    </p>
  </div>

  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
    {platformHealth.map((item, i) => (
      <div
        key={i}
        className="rounded-xl border border-gray-100 bg-gray-50 p-4"
      >
        <p
          className="text-gray-900"
          style={{ fontWeight: 700, fontSize: '1.15rem' }}
        >
          {item.value}
        </p>
        <p className="text-gray-500 text-xs mt-0.5">{item.label}</p>
      </div>
    ))}
  </div>
</div>

    <div className="bg-white border border-gray-200 rounded-xl">
  <div className="flex items-center justify-between p-4 border-b border-gray-100">
    <div>
      <h3 className="text-gray-800" style={{ fontWeight: 700 }}>
        Recent Activity Feed
      </h3>
      <p className="text-gray-500 text-sm mt-1">
        Latest actions happening across the platform.
      </p>
    </div>
  </div>

  <div className="divide-y divide-gray-50">
    {recentActivity.length === 0 ? (
      <div className="px-4 py-6 text-center text-sm text-gray-400">
        No recent activity yet.
      </div>
    ) : (
      recentActivity.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start justify-between gap-4 px-4 py-3"
        >
          <div>
            <p
              className="text-gray-800 text-sm"
              style={{ fontWeight: 600 }}
            >
              {activity.title}
            </p>
            <p className="text-gray-500 text-xs mt-0.5">
              {activity.description}
            </p>
          </div>

          <span className="text-xs text-gray-400 flex-shrink-0">
            {activity.date}
          </span>
        </div>
      ))
    )}
  </div>
</div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="text-gray-800" style={{ fontWeight: 600 }}>
              Recent Boost Requests
            </h3>
            <Link to="/admin/boosts" className="text-xs text-maroon hover:underline flex items-center gap-1" style={{ fontWeight: 500 }}>
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-gray-50">
            {recentBoosts.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-400">
                No boost requests yet.
              </div>
            ) : (
              recentBoosts.map((b) => (
                <div key={b.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-gray-800 text-sm" style={{ fontWeight: 500 }}>
                      {b.name}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {b.type} · {b.date}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-gray-700 text-sm" style={{ fontWeight: 600 }}>
                      {b.amount}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusBadge(b.status)}`} style={{ fontWeight: 500 }}>
                      {b.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="text-gray-800" style={{ fontWeight: 600 }}>
              Advertisements
            </h3>
            <Link to="/admin/ads" className="text-xs text-maroon hover:underline flex items-center gap-1" style={{ fontWeight: 500 }}>
              Manage <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-gray-50">
            {recentAds.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-400">
                No advertisements yet.
              </div>
            ) : (
              recentAds.map((ad) => (
                <div key={ad.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-gray-800 text-sm" style={{ fontWeight: 500 }}>
                      {ad.title}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-gray-400 text-xs flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {ad.views.toLocaleString()} views
                      </span>
                      <span className="text-gray-400 text-xs">{ad.clicks} clicks</span>
                    </div>
                  </div>

                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusBadge(ad.status)}`} style={{ fontWeight: 500 }}>
                    {ad.status}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-gray-100">
            <Link
              to="/admin/ads"
              className="w-full flex items-center justify-center gap-2 bg-maroon hover:bg-maroon-dark text-white py-2 rounded-lg text-sm transition-colors"
              style={{ fontWeight: 600 }}
            >
              <Megaphone className="w-4 h-4" />
              Create New Advertisement
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl">
  <div className="flex items-center justify-between p-4 border-b border-gray-100">
    <div className="flex items-center gap-2">
      <Coffee className="w-4 h-4 text-amber-500" />
      <h3 className="text-gray-800" style={{ fontWeight: 600 }}>
        Recent Donations
      </h3>
    </div>
  </div>

  <div className="divide-y divide-gray-50">
    {recentDonations.length === 0 ? (
      <div className="px-4 py-6 text-center text-sm text-gray-400">
        No donations yet.
      </div>
    ) : (
      recentDonations.map((donation) => (
        <div
          key={donation.id}
          className="flex items-start justify-between gap-4 px-4 py-3"
        >
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Heart className="w-4 h-4" />
            </div>

            <div className="min-w-0">
              <p
                className="text-gray-800 text-sm"
                style={{ fontWeight: 600 }}
              >
                {donation.amount}
              </p>
              <p className="text-gray-500 text-xs truncate">
                {donation.message}
              </p>
            </div>
          </div>

          <span className="text-xs text-gray-400 flex-shrink-0">
            {donation.date}
          </span>
        </div>
      ))
    )}
  </div>
</div>

      <div className="bg-gradient-to-r from-maroon/5 to-gold/5 border border-maroon/10 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <Star className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-gray-800 mb-1" style={{ fontWeight: 600 }}>
              Quick Actions
            </h4>
            <div className="flex flex-wrap gap-3 mt-2">
              <Link to="/admin/ads" className="inline-flex items-center gap-2 bg-maroon text-white px-4 py-2 rounded-lg text-sm hover:bg-maroon-dark transition-colors" style={{ fontWeight: 500 }}>
                <Megaphone className="w-3.5 h-3.5" /> Post New Ad
              </Link>
              <Link to="/admin/boosts" className="inline-flex items-center gap-2 bg-gold text-white px-4 py-2 rounded-lg text-sm hover:bg-gold-dark transition-colors" style={{ fontWeight: 500 }}>
                <TrendingUp className="w-3.5 h-3.5" /> Review Boosts
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}