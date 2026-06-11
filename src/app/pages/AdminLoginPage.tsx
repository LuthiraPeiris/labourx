import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HardHat, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';

export function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter admin email and password.');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password.trim()
      );

      const firebaseUser = userCredential.user;

      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await signOut(auth);
        setError('Admin profile not found.');
        return;
      }

      const userData = userSnap.data();

      if (userData.role !== 'admin') {
        await signOut(auth);
        setError('Access denied. This account is not an admin account.');
        return;
      }

      navigate('/admin');
    } catch (err: any) {
      console.error(err);
      setError('Invalid admin email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-maroon-light flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-maroon rounded-xl flex items-center justify-center">
              <HardHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-maroon font-bold text-xl">Labour</span>
              <span className="text-gold font-bold text-xl">X</span>
            </div>
          </Link>

          <div className="flex justify-center mb-3">
            <Shield className="w-10 h-10 text-maroon" />
          </div>

          <h1 className="text-foreground text-xl font-bold">Admin Login</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Secure access for LabourX administrators
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm mb-1.5 font-medium">
                Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full px-4 py-2.5 rounded-lg border"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1.5 font-medium">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full px-4 py-2.5 pr-10 rounded-lg border"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-maroon text-white py-3 rounded-xl disabled:opacity-60"
            >
              {loading ? 'Checking admin access...' : 'Login as Admin'}
            </button>
          </form>

          <p className="text-center text-sm mt-5">
            <Link to="/login" className="text-maroon">
              Back to normal login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}