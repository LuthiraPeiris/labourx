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
  Award,
  Zap,
  Edit,
  UserCircle2,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

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
};

export function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  if (user.role === 'technician') {
    return <TechnicianDashboard user={user as AppUser} />;
  }

  return <UserDashboard user={user as AppUser} />;
}

function TechnicianDashboard({ user }: { user: AppUser }) {
  const profileCompletion = getTechnicianProfileCompletion(user);

  const stats = [
    {
      icon: Eye,
      label: 'Profile Views',
      value: '0',
      change: 'Will update when users visit your profile',
      color: 'text-blue-500',
    },
    {
      icon: Star,
      label: 'Average Rating',
      value: '0.0',
      change: 'No reviews yet',
      color: 'text-gold',
    },
    {
      icon: Briefcase,
      label: 'Projects Done',
      value: '0',
      change: 'No completed projects yet',
      color: 'text-green-500',
    },
    {
      icon: MessageSquare,
      label: 'Active Bids',
      value: '0',
      change: 'No bids submitted yet',
      color: 'text-maroon',
    },
  ];

  const checklist = [
    { label: 'Full name added', done: !!user.name },
    { label: 'City added', done: !!user.city },
    { label: 'Phone number added', done: !!user.phone },
    { label: 'Specialty selected', done: !!user.specialty },
    { label: 'Experience added', done: !!user.yearsExperience },
    { label: 'Professional bio added', done: !!user.bio },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-maroon to-maroon-dark py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.name || 'User'}
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-white/20"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-white/15 border-4 border-white/20 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {user.name?.charAt(0)?.toUpperCase() || 'P'}
                  </span>
                </div>
              )}

              <div className="absolute -bottom-1 -right-1 bg-gold rounded-full p-1">
                <CheckCircle className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1
                  className="text-white"
                  style={{ fontSize: '1.5rem', fontWeight: 700 }}
                >
                  Welcome, {user.name?.split(' ')[0] || 'Professional'}!
                </h1>
                <span
                  className="bg-gold/20 border border-gold/40 text-gold text-xs px-2 py-0.5 rounded-full"
                  style={{ fontWeight: 500 }}
                >
                  Professional
                </span>
              </div>

              <p className="text-white/80 text-sm">
                {user.specialty || 'Construction Professional'}
                {user.city ? ` · ${user.city}` : ''}
              </p>

              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 fill-gold text-gold" />
                <span className="text-white" style={{ fontWeight: 600 }}>
                  0.0
                </span>
                <span className="text-white/70 text-sm">(0 reviews)</span>
              </div>
            </div>

            <div className="sm:ml-auto flex gap-2 flex-wrap">
              <Link
                to="/profile"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                style={{ fontWeight: 500 }}
              >
                <Eye className="w-4 h-4" /> View Profile
              </Link>

              <Link
                to="/posts"
                className="flex items-center gap-2 bg-gold hover:bg-gold-dark text-white px-4 py-2 rounded-lg text-sm transition-colors"
                style={{ fontWeight: 500 }}
              >
                <Zap className="w-4 h-4" /> Find Jobs
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <p
                className="text-foreground"
                style={{ fontSize: '1.5rem', fontWeight: 700 }}
              >
                {stat.value}
              </p>
              <p className="text-foreground text-sm" style={{ fontWeight: 500 }}>
                {stat.label}
              </p>
              <p className="text-muted-foreground text-xs mt-0.5">
                {stat.change}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left side */}
          <div className="lg:col-span-2">
            {/* Active Bids */}
            <div className="bg-card border border-border rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-foreground" style={{ fontWeight: 600 }}>
                  Your Active Bids
                </h2>
                <Link
                  to="/posts"
                  className="text-sm text-maroon hover:underline flex items-center gap-1"
                  style={{ fontWeight: 500 }}
                >
                  Browse jobs <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="text-center py-10">
                <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm mb-2">
                  You have not submitted any bids yet
                </p>
                <p className="text-muted-foreground text-xs mb-4">
                  Start applying for projects to see them here
                </p>
                <Link
                  to="/posts"
                  className="bg-maroon text-white px-4 py-2 rounded-lg text-sm hover:bg-maroon-dark transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  Browse Available Jobs
                </Link>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-foreground" style={{ fontWeight: 600 }}>
                  Recent Reviews
                </h2>
                <Link
                  to="/profile"
                  className="text-sm text-maroon hover:underline flex items-center gap-1"
                  style={{ fontWeight: 500 }}
                >
                  View profile <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="text-center py-10">
                <Star className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm mb-2">
                  No reviews yet
                </p>
                <p className="text-muted-foreground text-xs">
                  Reviews from completed jobs will appear here
                </p>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="space-y-5">
            {/* Profile Strength */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-foreground mb-3" style={{ fontWeight: 600 }}>
                Profile Strength
              </h3>

              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Completion</span>
                <span className="text-maroon" style={{ fontWeight: 700 }}>
                  {profileCompletion}%
                </span>
              </div>

              <div className="h-2 bg-muted rounded-full mb-4">
                <div
                  className="h-full bg-maroon rounded-full transition-all"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>

              <div className="space-y-2">
                {checklist.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle
                      className={`w-3.5 h-3.5 flex-shrink-0 ${
                        item.done ? 'text-green-500' : 'text-muted-foreground'
                      }`}
                    />
                    <span
                      className={
                        item.done ? 'text-foreground' : 'text-muted-foreground'
                      }
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              <Link
                to="/profile"
                className="mt-4 w-full flex items-center justify-center gap-2 border border-maroon text-maroon hover:bg-maroon hover:text-white py-2 rounded-lg text-sm transition-colors"
                style={{ fontWeight: 500 }}
              >
                <Edit className="w-4 h-4" /> Edit Profile
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-foreground mb-3" style={{ fontWeight: 600 }}>
                Quick Actions
              </h3>

              <div className="space-y-2">
                <Link
                  to="/posts"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="w-8 h-8 bg-maroon-light rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-maroon" />
                  </div>
                  <span className="text-sm text-foreground" style={{ fontWeight: 500 }}>
                    Find New Projects
                  </span>
                </Link>

                <Link
                  to="/profile"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="w-8 h-8 bg-maroon-light rounded-lg flex items-center justify-center">
                    <UserCircle2 className="w-4 h-4 text-maroon" />
                  </div>
                  <span className="text-sm text-foreground" style={{ fontWeight: 500 }}>
                    Update Profile
                  </span>
                </Link>
              </div>
            </div>

            {/* Contact / profile summary */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-foreground mb-3" style={{ fontWeight: 600 }}>
                Your Details
              </h3>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="text-foreground break-all">{user.email || '-'}</p>
                </div>

                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="text-foreground">{user.phone || '-'}</p>
                </div>

                <div>
                  <p className="text-muted-foreground">Specialty</p>
                  <p className="text-foreground">{user.specialty || '-'}</p>
                </div>

                <div>
                  <p className="text-muted-foreground">Experience</p>
                  <p className="text-foreground">
                    {user.yearsExperience ? `${user.yearsExperience} years` : '-'}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground">City</p>
                  <p className="text-foreground flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    {user.city || '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserDashboard({ user }: { user: AppUser }) {
  const profileCompletion = getUserProfileCompletion(user);

  const stats = [
    {
      icon: FileText,
      label: 'Posted Jobs',
      value: '0',
      change: 'No jobs posted yet',
      color: 'text-maroon',
    },
    {
      icon: Users,
      label: 'Total Bids Received',
      value: '0',
      change: 'No bids yet',
      color: 'text-blue-500',
    },
    {
      icon: CheckCircle,
      label: 'Projects Done',
      value: '0',
      change: 'No completed projects',
      color: 'text-green-500',
    },
    {
      icon: Star,
      label: 'Reviews Given',
      value: '0',
      change: 'No reviews submitted',
      color: 'text-gold',
    },
  ];

  const checklist = [
    { label: 'Full name added', done: !!user.name },
    { label: 'Email added', done: !!user.email },
    { label: 'Phone number added', done: !!user.phone },
    { label: 'City added', done: !!user.city },
    { label: 'Address added', done: !!user.address },
    { label: 'Age added', done: !!user.age },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-maroon to-maroon-dark py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <span
                  className="text-white"
                  style={{ fontSize: '1.5rem', fontWeight: 700 }}
                >
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>

              <div>
                <h1
                  className="text-white"
                  style={{ fontSize: '1.5rem', fontWeight: 700 }}
                >
                  Welcome, {user.name?.split(' ')[0] || 'User'}!
                </h1>
                <p className="text-white/70 text-sm">Client Account</p>
              </div>
            </div>

            <Link
              to="/posts/create"
              className="flex items-center gap-2 bg-gold hover:bg-gold-dark text-white px-5 py-2.5 rounded-xl transition-colors"
              style={{ fontWeight: 600 }}
            >
              <Plus className="w-4 h-4" /> Post a New Job
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-3">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p
                className="text-foreground"
                style={{ fontSize: '1.5rem', fontWeight: 700 }}
              >
                {stat.value}
              </p>
              <p className="text-foreground text-sm" style={{ fontWeight: 500 }}>
                {stat.label}
              </p>
              <p className="text-muted-foreground text-xs mt-0.5">
                {stat.change}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* My posts */}
            <div className="bg-card border border-border rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-foreground" style={{ fontWeight: 600 }}>
                  My Job Posts
                </h2>
                <Link
                  to="/posts"
                  className="text-sm text-maroon hover:underline flex items-center gap-1"
                  style={{ fontWeight: 500 }}
                >
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="text-center py-10">
                <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm mb-2">
                  You haven&apos;t posted any jobs yet
                </p>
                <p className="text-muted-foreground text-xs mb-4">
                  Create your first job post to start getting bids
                </p>
                <Link
                  to="/posts/create"
                  className="bg-maroon text-white px-4 py-2 rounded-lg text-sm hover:bg-maroon-dark transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  Create First Job
                </Link>
              </div>
            </div>

            {/* Recent activity */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-foreground" style={{ fontWeight: 600 }}>
                  Recent Activity
                </h2>
                <Link
                  to="/search"
                  className="text-sm text-maroon hover:underline flex items-center gap-1"
                  style={{ fontWeight: 500 }}
                >
                  Find professionals <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="text-center py-10">
                <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm mb-2">
                  No activity yet
                </p>
                <p className="text-muted-foreground text-xs">
                  When you post jobs and receive bids, they will appear here
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Profile Strength */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-foreground mb-3" style={{ fontWeight: 600 }}>
                Profile Strength
              </h3>

              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Completion</span>
                <span className="text-maroon" style={{ fontWeight: 700 }}>
                  {profileCompletion}%
                </span>
              </div>

              <div className="h-2 bg-muted rounded-full mb-4">
                <div
                  className="h-full bg-maroon rounded-full transition-all"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>

              <div className="space-y-2">
                {checklist.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle
                      className={`w-3.5 h-3.5 flex-shrink-0 ${
                        item.done ? 'text-green-500' : 'text-muted-foreground'
                      }`}
                    />
                    <span
                      className={
                        item.done ? 'text-foreground' : 'text-muted-foreground'
                      }
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              <Link
                to="/profile"
                className="mt-4 w-full flex items-center justify-center gap-2 border border-maroon text-maroon hover:bg-maroon hover:text-white py-2 rounded-lg text-sm transition-colors"
                style={{ fontWeight: 500 }}
              >
                <Edit className="w-4 h-4" /> Edit Profile
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-foreground mb-3" style={{ fontWeight: 600 }}>
                Quick Actions
              </h3>

              <div className="space-y-2">
                <Link
                  to="/posts/create"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="w-8 h-8 bg-maroon-light rounded-lg flex items-center justify-center">
                    <Plus className="w-4 h-4 text-maroon" />
                  </div>
                  <span className="text-sm text-foreground" style={{ fontWeight: 500 }}>
                    Post a New Job
                  </span>
                </Link>

                <Link
                  to="/search"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="w-8 h-8 bg-maroon-light rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-maroon" />
                  </div>
                  <span className="text-sm text-foreground" style={{ fontWeight: 500 }}>
                    Find Professionals
                  </span>
                </Link>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gold-light border border-gold/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-4 h-4 text-gold" />
                <h3 className="text-foreground text-sm" style={{ fontWeight: 600 }}>
                  Pro Tips
                </h3>
              </div>

              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-1.5">
                  <CheckCircle className="w-3 h-3 text-gold mt-0.5 flex-shrink-0" />
                  <span>Add clear job details to attract better bids</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle className="w-3 h-3 text-gold mt-0.5 flex-shrink-0" />
                  <span>Choose professionals based on profile and reviews</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle className="w-3 h-3 text-gold mt-0.5 flex-shrink-0" />
                  <span>Always leave reviews after project completion</span>
                </li>
              </ul>
            </div>

            {/* User info */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-foreground mb-3" style={{ fontWeight: 600 }}>
                Your Details
              </h3>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="text-foreground break-all">{user.email || '-'}</p>
                </div>

                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="text-foreground">{user.phone || '-'}</p>
                </div>

                <div>
                  <p className="text-muted-foreground">Age</p>
                  <p className="text-foreground">{user.age || '-'}</p>
                </div>

                <div>
                  <p className="text-muted-foreground">Address</p>
                  <p className="text-foreground">{user.address || '-'}</p>
                </div>

                <div>
                  <p className="text-muted-foreground">City</p>
                  <p className="text-foreground flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    {user.city || '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getTechnicianProfileCompletion(user: AppUser) {
  const fields = [
    user.name,
    user.email,
    user.phone,
    user.city,
    user.specialty,
    user.yearsExperience,
    user.bio,
  ];

  const completed = fields.filter(Boolean).length;
  return Math.round((completed / fields.length) * 100);
}

function getUserProfileCompletion(user: AppUser) {
  const fields = [
    user.name,
    user.email,
    user.phone,
    user.city,
    user.address,
    user.age,
  ];

  const completed = fields.filter(Boolean).length;
  return Math.round((completed / fields.length) * 100);
}