import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  Briefcase,
  FileText,
  Eye,
  MessageSquare,
  Users,
  Plus,
  ArrowRight,
  CheckCircle,
  MapPin,
  Zap,
  Edit,
  UserCircle2,
  Mail,
  Phone,
  CalendarDays,
  ClipboardList,
  Sparkles,
} from 'lucide-react';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';

import { useAuth } from '../context/AuthContext';
import { db } from '../../firebase/config';

type Review = {
  id?: string;
  userId?: string;
  userName?: string;
  technicianId?: string;
  projectType?: string;
  comment?: string;
  rating?: number;
  date?: string;
  submittedAt?: string;
};

type AppUser = {
  id?: string;
  uid?: string;
  name?: string;
  email?: string;
  role?: 'user' | 'technician';
  city?: string;
  address?: string;
  age?: string | number;
  specialty?: string;
  yearsExperience?: string | number;
  bio?: string;
  phone?: string;
  photoURL?: string;
  avatar?: string;
  rating?: number;
  totalReviews?: number;
  completedProjects?: number;
  reviews?: Review[];
};

type Bid = {
  id: string;
  technicianId: string;
  technicianName: string;
  technicianAvatar?: string;
  technicianSpecialty: string;
  technicianRating: number;
  description: string;
  budget: number;
  timeline: string;
  approach: string;
  submittedAt: string;
  isSelected?: boolean;
};

type WorkPost = {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userCity: string;
  title: string;
  description: string;
  category: string;
  location: string;
  budgetMin: number;
  budgetMax: number;
  timeline: string;
  postedAt: string;
  status: 'open' | 'in-progress' | 'closed';
  bids: Bid[];
  images?: string[];
};

type SortOrder = 'desc' | 'asc';

export function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">User not found. Please sign in again.</p>
      </div>
    );
  }

  if (user.role === 'technician') {
    return <TechnicianDashboard user={user as AppUser} />;
  }

  return <UserDashboard user={user as AppUser} />;
}

function TechnicianDashboard({ user }: { user: AppUser }) {
  const [loadingData, setLoadingData] = useState(true);
  const [dashboardUser, setDashboardUser] = useState<AppUser>(user);
  const [activeBids, setActiveBids] = useState<WorkPost[]>([]);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);

  useEffect(() => {
    const fetchTechnicianDashboardData = async () => {
      if (!user.uid) {
        setLoadingData(false);
        return;
      }

      try {
        setLoadingData(true);

        let latestUser: AppUser = user;

        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data() as AppUser;
          latestUser = {
            ...user,
            ...userData,
            uid: user.uid,
            id: user.uid,
          };
        }

        const postsSnapshot = await getDocs(collection(db, 'posts'));

        const allPosts = postsSnapshot.docs.map((docSnap) => {
          const data = docSnap.data();

          return {
            id: docSnap.id,
            ...data,
            bids: Array.isArray(data.bids) ? data.bids : [],
            images: Array.isArray(data.images) ? data.images : [],
          };
        }) as WorkPost[];

        const myActiveBids = allPosts.filter(
          (post) =>
            Array.isArray(post.bids) &&
            post.bids.some((bid) => bid.technicianId === user.uid)
        );

        const reviews = Array.isArray(latestUser.reviews) ? [...latestUser.reviews] : [];

        reviews.sort(
          (a, b) =>
            new Date(b.date || b.submittedAt || 0).getTime() -
            new Date(a.date || a.submittedAt || 0).getTime()
        );

        const completedProjectsFromPosts = allPosts.filter(
          (post) =>
            post.status === 'closed' &&
            Array.isArray(post.bids) &&
            post.bids.some((bid) => bid.technicianId === user.uid)
        ).length;

        setDashboardUser({
          ...latestUser,
          completedProjects:
            Number(latestUser.completedProjects || 0) > 0
              ? Number(latestUser.completedProjects || 0)
              : completedProjectsFromPosts,
        });
        setActiveBids(myActiveBids);
        setRecentReviews(reviews.slice(0, 3));
      } catch (error) {
        console.error('Error loading technician dashboard:', error);
        setDashboardUser(user);
        setActiveBids([]);
        setRecentReviews([]);
      } finally {
        setLoadingData(false);
      }
    };

    fetchTechnicianDashboardData();
  }, [user]);

  const profileCompletion = useMemo(
    () => getTechnicianProfileCompletion(dashboardUser),
    [dashboardUser]
  );

  const stats = useMemo(
    () => [
      {
        icon: Eye,
        label: 'Profile Views',
        value: '0',
        subtext: 'Will update when users visit your profile',
        color: 'text-blue-500',
        bg: 'bg-blue-50',
      },
      {
        icon: Star,
        label: 'Average Rating',
        value: Number(dashboardUser.rating || 0).toFixed(1),
        subtext:
          Number(dashboardUser.totalReviews || 0) > 0
            ? `${dashboardUser.totalReviews} review${
                Number(dashboardUser.totalReviews) === 1 ? '' : 's'
              } received`
            : 'No reviews yet',
        color: 'text-amber-500',
        bg: 'bg-amber-50',
      },
      {
        icon: Briefcase,
        label: 'Projects Done',
        value: String(Number(dashboardUser.completedProjects || 0)),
        subtext:
          Number(dashboardUser.completedProjects || 0) > 0
            ? 'Completed projects on your profile'
            : 'No completed projects yet',
        color: 'text-green-600',
        bg: 'bg-green-50',
      },
      {
        icon: MessageSquare,
        label: 'Active Bids',
        value: String(activeBids.length),
        subtext:
          activeBids.length > 0
            ? 'Bids currently waiting for selection'
            : 'No bids submitted yet',
        color: 'text-maroon',
        bg: 'bg-maroon-light',
      },
    ],
    [
      dashboardUser.rating,
      dashboardUser.totalReviews,
      dashboardUser.completedProjects,
      activeBids.length,
    ]
  );

  const checklist = [
    { label: 'Full name added', done: !!dashboardUser.name },
    { label: 'City added', done: !!dashboardUser.city },
    { label: 'Phone number added', done: !!dashboardUser.phone },
    { label: 'Specialty selected', done: !!dashboardUser.specialty },
    { label: 'Experience added', done: !!dashboardUser.yearsExperience },
    { label: 'Professional bio added', done: !!dashboardUser.bio },
  ];

  const completionText =
    profileCompletion >= 100
      ? 'Your profile looks complete'
      : profileCompletion >= 70
      ? 'Almost there'
      : 'Complete more profile details';

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-maroon via-maroon-dark to-[#43111e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
            <div className="xl:col-span-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-3xl p-6 sm:p-8 text-white">
              <div className="flex flex-col md:flex-row md:items-start gap-5">
                <div className="relative">
                  {dashboardUser.photoURL || dashboardUser.avatar ? (
                    <img
                      src={dashboardUser.photoURL || dashboardUser.avatar}
                      alt={dashboardUser.name || 'User'}
                      className="w-24 h-24 rounded-3xl object-cover border-4 border-white/20 shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-3xl bg-white/15 border-4 border-white/20 flex items-center justify-center shadow-lg">
                      <span className="text-white text-3xl font-bold">
                        {dashboardUser.name?.charAt(0)?.toUpperCase() || 'P'}
                      </span>
                    </div>
                  )}

                  <div className="absolute -bottom-2 -right-2 bg-gold rounded-full p-2 shadow-md">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gold/20 border border-gold/30 text-gold text-xs font-medium">
                      <Sparkles className="w-3.5 h-3.5" />
                      Professional Dashboard
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-bold">
                    Welcome back, {dashboardUser.name?.split(' ')[0] || 'Professional'}
                  </h1>

                  <p className="text-white/80 mt-2 text-sm sm:text-base">
                    {dashboardUser.specialty || 'Construction Professional'}
                    {dashboardUser.city ? ` · ${dashboardUser.city}` : ''}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-white/85">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 fill-gold text-gold" />
                      <span>{Number(dashboardUser.rating || 0).toFixed(1)} rating</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      <span>{Number(dashboardUser.completedProjects || 0)} projects done</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      <span>{activeBids.length} active bids</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-6">
                    <Link
                      to="/profile"
                      className="inline-flex items-center gap-2 bg-white text-maroon hover:bg-white/90 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Profile
                    </Link>

                    <Link
                      to="/profile"
                      className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Profile
                    </Link>

                    <Link
                      to="/posts"
                      className="inline-flex items-center gap-2 bg-gold hover:bg-gold-dark text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                    >
                      <Zap className="w-4 h-4" />
                      Find Jobs
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-border shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-foreground font-semibold">Profile Strength</h3>
                <span className="text-maroon font-bold">{profileCompletion}%</span>
              </div>

              <div className="h-3 bg-muted rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-gradient-to-r from-maroon to-gold rounded-full transition-all"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>

              <p className="text-sm text-muted-foreground mb-4">{completionText}</p>

              <div className="space-y-3">
                {checklist.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <CheckCircle
                      className={`w-4 h-4 flex-shrink-0 ${
                        item.done ? 'text-green-500' : 'text-muted-foreground'
                      }`}
                    />
                    <span className={item.done ? 'text-foreground' : 'text-muted-foreground'}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              <Link
                to="/profile"
                className="mt-5 w-full inline-flex items-center justify-center gap-2 border border-maroon text-maroon hover:bg-maroon hover:text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                <Edit className="w-4 h-4" />
                Complete Profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-muted-foreground text-sm mb-2">{stat.label}</p>
                  <p className="text-foreground text-3xl font-bold">
                    {loadingData ? '...' : stat.value}
                  </p>
                </div>

                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>

              <p className="text-muted-foreground text-xs mt-3">
                {loadingData ? 'Loading...' : stat.subtext}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8 space-y-6">
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-foreground text-lg font-semibold">Your Active Bids</h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Projects where you have already submitted proposals
                  </p>
                </div>

                <Link
                  to="/posts"
                  className="inline-flex items-center gap-1 text-sm text-maroon hover:underline font-medium"
                >
                  Browse jobs <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {loadingData ? (
                <div className="text-center py-14">
                  <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">Loading bids...</p>
                </div>
              ) : activeBids.length === 0 ? (
                <div className="text-center py-14">
                  <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-foreground text-sm font-medium mb-1">
                    You have not submitted any bids yet
                  </p>
                  <p className="text-muted-foreground text-sm mb-4">
                    Start applying for projects to see them here
                  </p>
                  <Link
                    to="/posts"
                    className="inline-flex items-center gap-2 bg-maroon text-white px-4 py-2.5 rounded-xl text-sm hover:bg-maroon-dark transition-colors font-medium"
                  >
                    <Zap className="w-4 h-4" />
                    Browse Available Jobs
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeBids.slice(0, 4).map((post) => {
                    const myBid = post.bids.find((b) => b.technicianId === user.uid);

                    return (
                      <div
                        key={post.id}
                        className="border border-border rounded-2xl p-5 hover:border-maroon/30 transition-colors"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="text-foreground text-base font-semibold">
                                {post.title}
                              </h3>
                              <span className="text-xs px-2.5 py-1 rounded-full bg-maroon-light text-maroon font-medium">
                                {post.category || 'General'}
                              </span>
                            </div>

                            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-4">
                              {post.description}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                              <div className="rounded-xl bg-muted/50 px-3 py-2">
                                <p className="text-muted-foreground text-xs mb-1">Location</p>
                                <p className="text-foreground font-medium">
                                  {post.location || '-'}
                                </p>
                              </div>

                              <div className="rounded-xl bg-muted/50 px-3 py-2">
                                <p className="text-muted-foreground text-xs mb-1">Your Budget</p>
                                <p className="text-foreground font-medium">
                                  {myBid?.budget ? `Rs. ${myBid.budget}` : '-'}
                                </p>
                              </div>

                              <div className="rounded-xl bg-muted/50 px-3 py-2">
                                <p className="text-muted-foreground text-xs mb-1">Timeline</p>
                                <p className="text-foreground font-medium">
                                  {myBid?.timeline || '-'}
                                </p>
                              </div>
                            </div>
                          </div>

                          <Link
                            to={`/posts/${post.id}`}
                            className="inline-flex items-center gap-1 text-sm text-maroon hover:underline font-medium whitespace-nowrap"
                          >
                            View <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-foreground text-lg font-semibold">Recent Reviews</h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Latest feedback from clients
                  </p>
                </div>

                <Link
                  to="/profile"
                  className="inline-flex items-center gap-1 text-sm text-maroon hover:underline font-medium"
                >
                  View profile <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {loadingData ? (
                <div className="text-center py-14">
                  <Star className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">Loading reviews...</p>
                </div>
              ) : recentReviews.length === 0 ? (
                <div className="text-center py-14">
                  <Star className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-foreground text-sm font-medium mb-1">No reviews yet</p>
                  <p className="text-muted-foreground text-sm">
                    Reviews from completed jobs will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentReviews.map((review, index) => (
                    <div
                      key={review.id || `${review.userId || 'review'}-${index}`}
                      className="border border-border rounded-2xl p-5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-foreground text-sm font-semibold">
                              {review.userName || 'User'}
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                              {review.projectType || 'Project'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-amber-500">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star
                              key={idx}
                              className={`w-4 h-4 ${
                                idx < Number(review.rating || 0)
                                  ? 'fill-amber-500 text-amber-500'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {review.comment || 'No comment provided.'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="xl:col-span-4 space-y-6">
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <h3 className="text-foreground text-lg font-semibold mb-4">Quick Actions</h3>

              <div className="space-y-3">
                <Link
                  to="/posts"
                  className="flex items-center gap-3 p-4 rounded-2xl border border-border hover:border-maroon/30 hover:bg-muted/40 transition-colors"
                >
                  <div className="w-11 h-11 bg-maroon-light rounded-2xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-maroon" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Find New Projects</p>
                    <p className="text-xs text-muted-foreground">Browse available jobs</p>
                  </div>
                </Link>

                <Link
                  to="/profile"
                  className="flex items-center gap-3 p-4 rounded-2xl border border-border hover:border-maroon/30 hover:bg-muted/40 transition-colors"
                >
                  <div className="w-11 h-11 bg-maroon-light rounded-2xl flex items-center justify-center">
                    <UserCircle2 className="w-5 h-5 text-maroon" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Update Profile</p>
                    <p className="text-xs text-muted-foreground">Edit your details</p>
                  </div>
                </Link>
              </div>
            </div>

            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <h3 className="text-foreground text-lg font-semibold mb-4">Your Details</h3>

              <div className="space-y-4">
                <InfoRow
                  icon={Mail}
                  label="Email"
                  value={dashboardUser.email || '-'}
                  breakAll
                />
                <InfoRow icon={Phone} label="Phone" value={dashboardUser.phone || '-'} />
                <InfoRow
                  icon={ClipboardList}
                  label="Specialty"
                  value={dashboardUser.specialty || '-'}
                />
                <InfoRow
                  icon={CalendarDays}
                  label="Experience"
                  value={
                    dashboardUser.yearsExperience
                      ? `${dashboardUser.yearsExperience} years`
                      : '-'
                  }
                />
                <InfoRow
                  icon={MapPin}
                  label="City"
                  value={dashboardUser.city || '-'}
                />
              </div>
            </div>

            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <h3 className="text-foreground text-lg font-semibold mb-3">About You</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {dashboardUser.bio?.trim()
                  ? dashboardUser.bio
                  : 'Add a short professional bio so clients can understand your background and skills.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserDashboard({ user }: { user: AppUser }) {
  const [loadingData, setLoadingData] = useState(true);
  const [dashboardUser, setDashboardUser] = useState<AppUser>(user);
  const [myPosts, setMyPosts] = useState<WorkPost[]>([]);
  const [reviewsGivenCount, setReviewsGivenCount] = useState(0);
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  useEffect(() => {
    const fetchUserDashboardData = async () => {
      if (!user.uid) {
        setLoadingData(false);
        return;
      }

      try {
        setLoadingData(true);

        let latestUser: AppUser = user;

        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data() as AppUser;
          latestUser = {
            ...user,
            ...userData,
            uid: user.uid,
            id: user.uid,
          };
        }

        const postsSnapshot = await getDocs(
          query(collection(db, 'posts'), where('userId', '==', user.uid))
        );

        const posts = postsSnapshot.docs.map((docSnap) => {
          const data = docSnap.data();

          return {
            id: docSnap.id,
            ...data,
            bids: Array.isArray(data.bids) ? data.bids : [],
            images: Array.isArray(data.images) ? data.images : [],
          };
        }) as WorkPost[];

        let totalReviewsGiven = 0;

        const techniciansSnapshot = await getDocs(
          query(collection(db, 'users'), where('role', '==', 'technician'))
        );

        techniciansSnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const reviews = Array.isArray(data.reviews) ? data.reviews : [];

          totalReviewsGiven += reviews.filter(
            (review: Review) => review.userId === user.uid
          ).length;
        });

        setDashboardUser(latestUser);
        setMyPosts(posts);
        setReviewsGivenCount(totalReviewsGiven);
      } catch (error) {
        console.error('Error loading user dashboard:', error);
        setDashboardUser(user);
        setMyPosts([]);
        setReviewsGivenCount(0);
      } finally {
        setLoadingData(false);
      }
    };

    fetchUserDashboardData();
  }, [user]);

  const profileCompletion = useMemo(
    () => getUserProfileCompletion(dashboardUser),
    [dashboardUser]
  );

  const sortedMyPosts = useMemo(() => {
    const postsCopy = [...myPosts];

    postsCopy.sort((a, b) => {
      const timeA = new Date(a.postedAt || 0).getTime();
      const timeB = new Date(b.postedAt || 0).getTime();

      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

    return postsCopy;
  }, [myPosts, sortOrder]);

  const totalBidsReceived = myPosts.reduce(
    (sum, post) => sum + (Array.isArray(post.bids) ? post.bids.length : 0),
    0
  );

  const completedProjects = myPosts.filter((post) => post.status === 'closed').length;

  const stats = [
    {
      icon: FileText,
      label: 'Posted Jobs',
      value: String(myPosts.length),
      subtext: myPosts.length > 0 ? 'Jobs you created on LabourX' : 'No jobs posted yet',
      color: 'text-maroon',
      bg: 'bg-maroon-light',
    },
    {
      icon: Users,
      label: 'Total Bids Received',
      value: String(totalBidsReceived),
      subtext: totalBidsReceived > 0 ? 'Across all your job posts' : 'No bids yet',
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      icon: CheckCircle,
      label: 'Projects Done',
      value: String(completedProjects),
      subtext:
        completedProjects > 0 ? 'Completed client projects' : 'No completed projects',
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      icon: Star,
      label: 'Reviews Given',
      value: String(reviewsGivenCount),
      subtext: reviewsGivenCount > 0 ? 'Reviews you submitted' : 'No reviews submitted',
      color: 'text-amber-500',
      bg: 'bg-amber-50',
    },
  ];

  const checklist = [
    { label: 'Full name added', done: !!dashboardUser.name },
    { label: 'Email added', done: !!dashboardUser.email },
    { label: 'Phone number added', done: !!dashboardUser.phone },
    { label: 'City added', done: !!dashboardUser.city },
    { label: 'Address added', done: !!dashboardUser.address },
    { label: 'Age added', done: !!dashboardUser.age },
  ];

  const completionText =
    profileCompletion >= 100
      ? 'Your profile looks complete'
      : profileCompletion >= 70
      ? 'Almost there'
      : 'Complete more profile details';

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-maroon via-maroon-dark to-[#43111e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
            <div className="xl:col-span-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-3xl p-6 sm:p-8 text-white">
              <div className="flex flex-col md:flex-row md:items-start gap-5">
                <div>
                  {dashboardUser.photoURL || dashboardUser.avatar ? (
                    <img
                      src={dashboardUser.photoURL || dashboardUser.avatar}
                      alt={dashboardUser.name || 'User'}
                      className="w-24 h-24 rounded-3xl object-cover border-4 border-white/20 shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-3xl bg-white/15 border-4 border-white/20 flex items-center justify-center shadow-lg">
                      <span className="text-white text-3xl font-bold">
                        {dashboardUser.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gold/20 border border-gold/30 text-gold text-xs font-medium">
                      <Sparkles className="w-3.5 h-3.5" />
                      Client Dashboard
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-bold">
                    Welcome back, {dashboardUser.name?.split(' ')[0] || 'User'}
                  </h1>

                  <p className="text-white/80 mt-2 text-sm sm:text-base">
                    Manage your job posts, bids, and profile from one place
                  </p>

                  <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-white/85">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>{myPosts.length} posted jobs</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{totalBidsReceived} total bids</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>{completedProjects} completed projects</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-6">
                    <Link
                      to="/posts/create"
                      className="inline-flex items-center gap-2 bg-gold hover:bg-gold-dark text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Post a New Job
                    </Link>

                    <Link
                      to="/profile"
                      className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Profile
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-border shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-foreground font-semibold">Profile Strength</h3>
                <span className="text-maroon font-bold">{profileCompletion}%</span>
              </div>

              <div className="h-3 bg-muted rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-gradient-to-r from-maroon to-gold rounded-full transition-all"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>

              <p className="text-sm text-muted-foreground mb-4">{completionText}</p>

              <div className="space-y-3">
                {checklist.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <CheckCircle
                      className={`w-4 h-4 flex-shrink-0 ${
                        item.done ? 'text-green-500' : 'text-muted-foreground'
                      }`}
                    />
                    <span className={item.done ? 'text-foreground' : 'text-muted-foreground'}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              <Link
                to="/profile"
                className="mt-5 w-full inline-flex items-center justify-center gap-2 border border-maroon text-maroon hover:bg-maroon hover:text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                <Edit className="w-4 h-4" />
                Complete Profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-muted-foreground text-sm mb-2">{stat.label}</p>
                  <p className="text-foreground text-3xl font-bold">
                    {loadingData ? '...' : stat.value}
                  </p>
                </div>

                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>

              <p className="text-muted-foreground text-xs mt-3">
                {loadingData ? 'Loading...' : stat.subtext}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8">
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-foreground text-lg font-semibold">My Job Posts</h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Manage and review all the jobs you have posted
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <label htmlFor="job-post-sort" className="text-sm text-muted-foreground">
                      Sort by Date:
                    </label>
                    <select
                      id="job-post-sort"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                      className="px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-maroon/30"
                    >
                      <option value="desc">Descending</option>
                      <option value="asc">Ascending</option>
                    </select>
                  </div>

                  <Link
                    to="/posts"
                    className="inline-flex items-center gap-1 text-sm text-maroon hover:underline font-medium"
                  >
                    View all <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {loadingData ? (
                <div className="text-center py-14">
                  <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">Loading your jobs...</p>
                </div>
              ) : sortedMyPosts.length === 0 ? (
                <div className="text-center py-14">
                  <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-foreground text-sm font-medium mb-1">
                    You haven&apos;t posted any jobs yet
                  </p>
                  <p className="text-muted-foreground text-sm mb-4">
                    Create your first job post to start getting bids
                  </p>
                  <Link
                    to="/posts/create"
                    className="inline-flex items-center gap-2 bg-maroon text-white px-4 py-2.5 rounded-xl text-sm hover:bg-maroon-dark transition-colors font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Create First Job
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedMyPosts.map((post) => (
                    <div
                      key={post.id}
                      className="border border-border rounded-2xl p-5 hover:border-maroon/30 transition-colors"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <h3 className="text-foreground text-base font-semibold">
                              {post.title}
                            </h3>
                            <span
                              className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                post.status === 'open'
                                  ? 'bg-green-100 text-green-700'
                                  : post.status === 'in-progress'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              {post.status}
                            </span>
                          </div>

                          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                            {post.description}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 text-sm">
                            <MiniInfoBox label="Category" value={post.category || '-'} />
                            <MiniInfoBox label="Location" value={post.location || '-'} />
                            <MiniInfoBox
                              label="Budget"
                              value={`Rs. ${Number(post.budgetMin || 0)} - Rs. ${Number(
                                post.budgetMax || 0
                              )}`}
                            />
                            <MiniInfoBox label="Timeline" value={post.timeline || '-'} />
                            <MiniInfoBox
                              label="Bids"
                              value={String(Array.isArray(post.bids) ? post.bids.length : 0)}
                            />
                            <MiniInfoBox
                              label="Posted"
                              value={
                                post.postedAt
                                  ? new Date(post.postedAt).toLocaleDateString('en-LK', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                    })
                                  : '-'
                              }
                            />
                          </div>
                        </div>

                        <Link
                          to={`/posts/${post.id}`}
                          className="inline-flex items-center gap-1 text-sm text-maroon hover:underline font-medium whitespace-nowrap"
                        >
                          View <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="xl:col-span-4 space-y-6">
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <h3 className="text-foreground text-lg font-semibold mb-4">Quick Actions</h3>

              <div className="space-y-3">
                <Link
                  to="/posts/create"
                  className="flex items-center gap-3 p-4 rounded-2xl border border-border hover:border-maroon/30 hover:bg-muted/40 transition-colors"
                >
                  <div className="w-11 h-11 bg-maroon-light rounded-2xl flex items-center justify-center">
                    <Plus className="w-5 h-5 text-maroon" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Post a New Job</p>
                    <p className="text-xs text-muted-foreground">Create a new requirement</p>
                  </div>
                </Link>

                <Link
                  to="/profile"
                  className="flex items-center gap-3 p-4 rounded-2xl border border-border hover:border-maroon/30 hover:bg-muted/40 transition-colors"
                >
                  <div className="w-11 h-11 bg-maroon-light rounded-2xl flex items-center justify-center">
                    <UserCircle2 className="w-5 h-5 text-maroon" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Update Profile</p>
                    <p className="text-xs text-muted-foreground">Edit your personal details</p>
                  </div>
                </Link>
              </div>
            </div>

            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <h3 className="text-foreground text-lg font-semibold mb-4">Your Details</h3>

              <div className="space-y-4">
                <InfoRow
                  icon={Mail}
                  label="Email"
                  value={dashboardUser.email || '-'}
                  breakAll
                />
                <InfoRow icon={Phone} label="Phone" value={dashboardUser.phone || '-'} />
                <InfoRow icon={MapPin} label="City" value={dashboardUser.city || '-'} />
                <InfoRow
                  icon={ClipboardList}
                  label="Address"
                  value={dashboardUser.address || '-'}
                />
                <InfoRow
                  icon={CalendarDays}
                  label="Age"
                  value={dashboardUser.age ? String(dashboardUser.age) : '-'}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  breakAll = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  breakAll?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-maroon" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className={`text-sm text-foreground font-medium ${breakAll ? 'break-all' : ''}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function MiniInfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/50 px-3 py-2">
      <p className="text-muted-foreground text-xs mb-1">{label}</p>
      <p className="text-foreground font-medium">{value}</p>
    </div>
  );
}

function getTechnicianProfileCompletion(user: AppUser): number {
  const fields = [
    user.name,
    user.email,
    user.phone,
    user.city,
    user.specialty,
    user.yearsExperience,
    user.bio,
  ];

  const completed = fields.filter((field) => {
    if (typeof field === 'number') return true;
    return !!String(field || '').trim();
  }).length;

  return Math.round((completed / fields.length) * 100);
}

function getUserProfileCompletion(user: AppUser): number {
  const fields = [user.name, user.email, user.phone, user.city, user.address, user.age];

  const completed = fields.filter((field) => {
    if (typeof field === 'number') return true;
    return !!String(field || '').trim();
  }).length;

  return Math.round((completed / fields.length) * 100);
}