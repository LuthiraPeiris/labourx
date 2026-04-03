import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HardHat, User, Eye, EyeOff, AlertCircle, Wrench, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockTechnicians } from '../data/mockData';

export function LoginPage() {
  const [role, setRole] = useState<'user' | 'technician'>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise(r => setTimeout(r, 800));

    // Simulate login
    if (role === 'user' && email && password) {
      login({
        id: 'user-1',
        name: 'Tharaka Silva',
        email: email,
        role: 'user',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        city: 'Colombo',
      });
      navigate('/dashboard');
    } else if (role === 'technician' && email && password) {
      const tech = mockTechnicians[0];
      login({
        id: tech.id,
        name: tech.name,
        email: email,
        role: 'technician',
        avatar: tech.avatar,
        specialty: tech.specialty,
        city: tech.city,
      });
      navigate('/dashboard');
    } else {
      setError('Please enter your email and password.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-maroon-light flex items-center justify-center py-12 px-4">

      {/* Back button — top-left */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-5 left-5 inline-flex items-center gap-1.5 text-maroon hover:text-maroon-dark transition-colors text-sm"
        style={{ fontWeight: 500 }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-maroon rounded-xl flex items-center justify-center">
              <HardHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-maroon" style={{ fontWeight: 700, fontSize: '1.3rem' }}>Labour</span>
              <span className="text-gold" style={{ fontWeight: 700, fontSize: '1.3rem' }}>X</span>
            </div>
          </Link>
          <h1 className="text-foreground" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Welcome Back</h1>
          <p className="text-muted-foreground text-sm mt-1">Sign in to your account to continue</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          {/* Role Toggle */}
          <div className="flex rounded-xl border border-border overflow-hidden mb-6">
            <button
              type="button"
              onClick={() => setRole('user')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm transition-colors ${
                role === 'user' ? 'bg-maroon text-white' : 'bg-transparent text-muted-foreground hover:bg-muted'
              }`}
              style={{ fontWeight: 500 }}
            >
              <User className="w-4 h-4" />
              I'm a Client
            </button>
            <button
              type="button"
              onClick={() => setRole('technician')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm transition-colors ${
                role === 'technician' ? 'bg-maroon text-white' : 'bg-transparent text-muted-foreground hover:bg-muted'
              }`}
              style={{ fontWeight: 500 }}
            >
              <Wrench className="w-4 h-4" />
              I'm a Professional
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm text-foreground mb-1.5" style={{ fontWeight: 500 }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-input-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-maroon/30 focus:border-maroon transition-colors text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-foreground mb-1.5" style={{ fontWeight: 500 }}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 pr-10 rounded-lg border border-border bg-input-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-maroon/30 focus:border-maroon transition-colors text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="text-right mt-1">
                <Link to="#" className="text-xs text-maroon hover:underline">Forgot password?</Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-maroon hover:bg-maroon-dark disabled:opacity-60 text-white py-3 rounded-xl transition-colors mt-2"
              style={{ fontWeight: 600 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-5 p-3 rounded-lg bg-gold-light border border-gold/20">
            <p className="text-xs text-center text-muted-foreground mb-1.5" style={{ fontWeight: 500 }}>Demo Credentials</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div className="p-2 rounded bg-card border border-border">
                <p style={{ fontWeight: 600 }} className="text-foreground">Client Login</p>
                <p>user@demo.com</p>
                <p>demo123</p>
              </div>
              <div className="p-2 rounded bg-card border border-border">
                <p style={{ fontWeight: 600 }} className="text-foreground">Pro Login</p>
                <p>tech@demo.com</p>
                <p>demo123</p>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-maroon hover:underline" style={{ fontWeight: 500 }}>
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}