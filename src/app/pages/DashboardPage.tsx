import { useNavigate, Navigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, Star, Briefcase, FileText, TrendingUp,
  Eye, MessageSquare, Users, Plus, ArrowRight, CheckCircle,
  Clock, MapPin, Award, Zap, Edit
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockTechnicians, mockWorkPosts } from '../data/mockData';
import { PostCard } from '../components/PostCard';
import { ReviewCard } from '../components/ReviewCard';

export function DashboardPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Find technician data if user is a technician
  const techData = currentUser.role === 'technician'
    ? mockTechnicians.find(t => t.id === currentUser.id) || mockTechnicians[0]
    : null;

  if (currentUser.role === 'technician' && techData) {
    return <TechnicianDashboard tech={techData} />;
  }

  return <UserDashboard userName={currentUser.name} />;
}

function TechnicianDashboard({ tech }: { tech: typeof mockTechnicians[0] }) {
  const stats = [
    { icon: Eye, label: 'Profile Views', value: '1,284', change: '+12% this month', color: 'text-blue-500' },
    { icon: Star, label: 'Average Rating', value: tech.rating.toFixed(1), change: `${tech.reviewCount} reviews`, color: 'text-gold' },
    { icon: Briefcase, label: 'Projects Done', value: tech.completedProjects.toString(), change: 'Total completed', color: 'text-green-500' },
    { icon: MessageSquare, label: 'Active Bids', value: '3', change: '1 awaiting response', color: 'text-maroon' },
  ];

  const activeBids = mockWorkPosts.filter(p => p.bids.some(b => b.technicianId === tech.id));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-maroon to-maroon-dark py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative">
              <img
                src={tech.avatar}
                alt={tech.name}
                className="w-20 h-20 rounded-2xl object-cover border-4 border-white/20"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(tech.name)}&background=6E1425&color=fff&size=200`;
                }}
              />
              {tech.isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-gold rounded-full p-1">
                  <CheckCircle className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-white" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Welcome, {tech.name.split(' ')[0]}!</h1>
                <span className="bg-gold/20 border border-gold/40 text-gold text-xs px-2 py-0.5 rounded-full" style={{ fontWeight: 500 }}>Professional</span>
              </div>
              <p className="text-white/80 text-sm">{tech.specialty} · {tech.location}</p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 fill-gold text-gold" />
                <span className="text-white" style={{ fontWeight: 600 }}>{tech.rating}</span>
                <span className="text-white/70 text-sm">({tech.reviewCount} reviews)</span>
              </div>
            </div>
            <div className="sm:ml-auto flex gap-2">
              <Link
                to={`/technician/${tech.id}`}
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
                <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-foreground" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stat.value}</p>
              <p className="text-foreground text-sm" style={{ fontWeight: 500 }}>{stat.label}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{stat.change}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Bids */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-foreground" style={{ fontWeight: 600 }}>Your Active Bids</h2>
                <Link to="/posts" className="text-sm text-maroon hover:underline flex items-center gap-1" style={{ fontWeight: 500 }}>
                  Browse more <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              {activeBids.length > 0 ? (
                <div className="space-y-3">
                  {activeBids.map(post => (
                    <Link key={post.id} to={`/posts/${post.id}`} className="block">
                      <div className="flex items-start justify-between p-3 rounded-lg bg-muted hover:bg-maroon-light transition-colors border border-border">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate" style={{ fontWeight: 600 }}>{post.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {post.location}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-3">
                          <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full dark:bg-green-900/30 dark:text-green-400">Bid Submitted</span>
                          <span className="text-xs text-muted-foreground">{post.bids.length} total bids</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm mb-3">No active bids yet</p>
                  <Link to="/posts" className="bg-maroon text-white px-4 py-2 rounded-lg text-sm hover:bg-maroon-dark transition-colors" style={{ fontWeight: 500 }}>
                    Browse Available Jobs
                  </Link>
                </div>
              )}
            </div>

            {/* Recent Reviews */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-foreground" style={{ fontWeight: 600 }}>Recent Reviews</h2>
                <Link to={`/technician/${tech.id}`} className="text-sm text-maroon hover:underline flex items-center gap-1" style={{ fontWeight: 500 }}>
                  All reviews <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="space-y-4">
                {tech.reviews.slice(0, 2).map(review => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Profile Completion */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-foreground mb-3" style={{ fontWeight: 600 }}>Profile Strength</h3>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Completion</span>
                <span className="text-maroon" style={{ fontWeight: 700 }}>85%</span>
              </div>
              <div className="h-2 bg-muted rounded-full mb-4">
                <div className="h-full bg-maroon rounded-full" style={{ width: '85%' }} />
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Profile photo', done: true },
                  { label: 'Bio added', done: true },
                  { label: 'Skills listed', done: true },
                  { label: 'Portfolio projects', done: tech.projects.length > 0 },
                  { label: 'Education added', done: tech.education.length > 0 },
                  { label: 'Reviews received', done: tech.reviews.length > 0 },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className={`w-3.5 h-3.5 flex-shrink-0 ${item.done ? 'text-green-500' : 'text-muted-foreground'}`} />
                    <span className={item.done ? 'text-foreground' : 'text-muted-foreground'}>{item.label}</span>
                  </div>
                ))}
              </div>
              <Link to="/profile" className="mt-4 w-full flex items-center justify-center gap-2 border border-maroon text-maroon hover:bg-maroon hover:text-white py-2 rounded-lg text-sm transition-colors" style={{ fontWeight: 500 }}>
                <Edit className="w-4 h-4" /> Edit Profile
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-foreground mb-3" style={{ fontWeight: 600 }}>Quick Actions</h3>
              <div className="space-y-2">
                <Link to="/posts" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                  <div className="w-8 h-8 bg-maroon-light rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-maroon" />
                  </div>
                  <span className="text-sm text-foreground" style={{ fontWeight: 500 }}>Find New Projects</span>
                </Link>
                <Link to={`/technician/${tech.id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                  <div className="w-8 h-8 bg-maroon-light rounded-lg flex items-center justify-center">
                    <Eye className="w-4 h-4 text-maroon" />
                  </div>
                  <span className="text-sm text-foreground" style={{ fontWeight: 500 }}>View Public Profile</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserDashboard({ userName }: { userName: string }) {
  const myPosts = mockWorkPosts.slice(0, 2);

  const stats = [
    { icon: FileText, label: 'Posted Jobs', value: '3', change: '2 open, 1 closed', color: 'text-maroon' },
    { icon: Users, label: 'Total Bids Received', value: '11', change: 'Across all posts', color: 'text-blue-500' },
    { icon: CheckCircle, label: 'Projects Done', value: '1', change: 'Completed projects', color: 'text-green-500' },
    { icon: Star, label: 'Reviews Given', value: '2', change: 'Ratings submitted', color: 'text-gold' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-maroon to-maroon-dark py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <span className="text-white" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-white" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Welcome, {userName.split(' ')[0]}!</h1>
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
              <p className="text-foreground" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stat.value}</p>
              <p className="text-foreground text-sm" style={{ fontWeight: 500 }}>{stat.label}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{stat.change}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* My Posts */}
            <div className="bg-card border border-border rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-foreground" style={{ fontWeight: 600 }}>My Job Posts</h2>
                <Link to="/posts" className="text-sm text-maroon hover:underline flex items-center gap-1" style={{ fontWeight: 500 }}>
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="space-y-4">
                {myPosts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Quick Actions */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-foreground mb-3" style={{ fontWeight: 600 }}>Quick Actions</h3>
              <div className="space-y-2">
                <Link to="/posts/create" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                  <div className="w-8 h-8 bg-maroon-light rounded-lg flex items-center justify-center">
                    <Plus className="w-4 h-4 text-maroon" />
                  </div>
                  <span className="text-sm text-foreground" style={{ fontWeight: 500 }}>Post a New Job</span>
                </Link>
                <Link to="/search" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                  <div className="w-8 h-8 bg-maroon-light rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-maroon" />
                  </div>
                  <span className="text-sm text-foreground" style={{ fontWeight: 500 }}>Find Professionals</span>
                </Link>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gold-light border border-gold/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-4 h-4 text-gold" />
                <h3 className="text-foreground text-sm" style={{ fontWeight: 600 }}>Pro Tips</h3>
              </div>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-1.5">
                  <CheckCircle className="w-3 h-3 text-gold mt-0.5 flex-shrink-0" />
                  <span>Add reference images to get more relevant bids</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle className="w-3 h-3 text-gold mt-0.5 flex-shrink-0" />
                  <span>Check a professional's portfolio before selecting</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle className="w-3 h-3 text-gold mt-0.5 flex-shrink-0" />
                  <span>Always leave reviews after project completion</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}