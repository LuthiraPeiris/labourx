import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HardHat, User, Wrench, Eye, EyeOff, CheckCircle, ChevronRight, ChevronLeft, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SPECIALTIES } from '../types';

export function RegisterPage() {
  const [role, setRole] = useState<'user' | 'technician'>('user');
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    age: '',
    address: '',
    city: '',
    specialty: '',
    yearsExperience: '',
    bio: '',
  });

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));

    login({
      id: `${role}-${Date.now()}`,
      name: form.name,
      email: form.email,
      role,
      specialty: role === 'technician' ? form.specialty : undefined,
      city: form.city,
    });

    navigate('/dashboard');
    setLoading(false);
  };

  const inputClass = "w-full px-4 py-2.5 rounded-lg border border-border bg-input-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-maroon/30 focus:border-maroon transition-colors text-sm";
  const labelClass = "block text-sm text-foreground mb-1.5";

  return (
    <div className="min-h-screen bg-maroon-light flex items-center justify-center py-12 px-4">

      {/* Back button — always top-left */}
      <button
        onClick={() => step === 1 ? navigate(-1) : setStep(s => s - 1)}
        className="absolute top-5 left-5 inline-flex items-center gap-1.5 text-maroon hover:text-maroon-dark transition-colors text-sm"
        style={{ fontWeight: 500 }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="w-full max-w-lg">
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
          <h1 className="text-foreground" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Create Your Account</h1>
          <p className="text-muted-foreground text-sm mt-1">Join Sri Lanka's premier construction marketplace</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          {/* Role Selection */}
          {step === 1 && (
            <div>
              <p className="text-foreground mb-4 text-center" style={{ fontWeight: 600 }}>I want to join as...</p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={`p-5 rounded-xl border-2 transition-all ${
                    role === 'user' ? 'border-maroon bg-maroon-light' : 'border-border hover:border-maroon/50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl ${role === 'user' ? 'bg-maroon' : 'bg-muted'} flex items-center justify-center mx-auto mb-3 transition-colors`}>
                    <User className={`w-6 h-6 ${role === 'user' ? 'text-white' : 'text-muted-foreground'}`} />
                  </div>
                  <p className="text-foreground text-sm" style={{ fontWeight: 600 }}>Client / Homeowner</p>
                  <p className="text-muted-foreground text-xs mt-1">Find professionals & post projects</p>
                  {role === 'user' && (
                    <div className="mt-2 flex justify-center">
                      <CheckCircle className="w-4 h-4 text-maroon" />
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setRole('technician')}
                  className={`p-5 rounded-xl border-2 transition-all ${
                    role === 'technician' ? 'border-maroon bg-maroon-light' : 'border-border hover:border-maroon/50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl ${role === 'technician' ? 'bg-maroon' : 'bg-muted'} flex items-center justify-center mx-auto mb-3 transition-colors`}>
                    <Wrench className={`w-6 h-6 ${role === 'technician' ? 'text-white' : 'text-muted-foreground'}`} />
                  </div>
                  <p className="text-foreground text-sm" style={{ fontWeight: 600 }}>Professional</p>
                  <p className="text-muted-foreground text-xs mt-1">Showcase skills & get hired</p>
                  {role === 'technician' && (
                    <div className="mt-2 flex justify-center">
                      <CheckCircle className="w-4 h-4 text-maroon" />
                    </div>
                  )}
                </button>
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full bg-maroon hover:bg-maroon-dark text-white py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                style={{ fontWeight: 600 }}
              >
                Continue as {role === 'user' ? 'Client' : 'Professional'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Basic Info */}
          {step === 2 && (
            <form onSubmit={role === 'user' ? handleRegister : (e) => { e.preventDefault(); setStep(3); }}>
              <div className="flex items-center gap-2 mb-5">
                <button type="button" onClick={() => setStep(1)} className="text-muted-foreground hover:text-foreground">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-foreground" style={{ fontWeight: 600 }}>Personal Information</h2>
                  <p className="text-muted-foreground text-xs">Step {step} of {role === 'user' ? 2 : 3}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass} style={{ fontWeight: 500 }}>Full Name *</label>
                    <input type="text" value={form.name} onChange={e => update('name', e.target.value)} placeholder="John Doe" className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass} style={{ fontWeight: 500 }}>City *</label>
                    <input type="text" value={form.city} onChange={e => update('city', e.target.value)} placeholder="Colombo" className={inputClass} required />
                  </div>
                </div>
                <div>
                  <label className={labelClass} style={{ fontWeight: 500 }}>Email Address *</label>
                  <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@example.com" className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass} style={{ fontWeight: 500 }}>Phone Number *</label>
                  <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+94 77 123 4567" className={inputClass} required />
                </div>
                {role === 'user' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass} style={{ fontWeight: 500 }}>Age</label>
                      <input type="number" value={form.age} onChange={e => update('age', e.target.value)} placeholder="35" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass} style={{ fontWeight: 500 }}>Address</label>
                      <input type="text" value={form.address} onChange={e => update('address', e.target.value)} placeholder="Your address" className={inputClass} />
                    </div>
                  </div>
                )}
                <div>
                  <label className={labelClass} style={{ fontWeight: 500 }}>Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => update('password', e.target.value)}
                      placeholder="Min 8 characters"
                      className={`${inputClass} pr-10`}
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-maroon hover:bg-maroon-dark disabled:opacity-60 text-white py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                  style={{ fontWeight: 600 }}
                >
                  {loading ? 'Creating account...' : role === 'user' ? 'Create Account' : (
                    <>Continue <ChevronRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Professional Details */}
          {step === 3 && role === 'technician' && (
            <form onSubmit={handleRegister}>
              <div className="flex items-center gap-2 mb-5">
                <button type="button" onClick={() => setStep(2)} className="text-muted-foreground hover:text-foreground">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-foreground" style={{ fontWeight: 600 }}>Professional Details</h2>
                  <p className="text-muted-foreground text-xs">Step 3 of 3</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={labelClass} style={{ fontWeight: 500 }}>Specialty / Trade *</label>
                  <select
                    value={form.specialty}
                    onChange={e => update('specialty', e.target.value)}
                    className={inputClass}
                    required
                  >
                    <option value="">Select your specialty</option>
                    {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass} style={{ fontWeight: 500 }}>Years of Experience *</label>
                  <input type="number" value={form.yearsExperience} onChange={e => update('yearsExperience', e.target.value)} placeholder="e.g. 8" className={inputClass} required min="1" max="50" />
                </div>
                <div>
                  <label className={labelClass} style={{ fontWeight: 500 }}>Professional Bio *</label>
                  <textarea
                    value={form.bio}
                    onChange={e => update('bio', e.target.value)}
                    placeholder="Describe your expertise, skills, and what makes your work stand out..."
                    className={`${inputClass} resize-none`}
                    rows={4}
                    required
                  />
                </div>
                <div className="p-3 rounded-lg bg-gold-light border border-gold/20 text-sm text-muted-foreground">
                  ✓ You can add portfolio projects, certifications, and more from your dashboard after registration.
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-maroon hover:bg-maroon-dark disabled:opacity-60 text-white py-3 rounded-xl transition-colors"
                  style={{ fontWeight: 600 }}
                >
                  {loading ? 'Creating account...' : 'Create Professional Account'}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-muted-foreground mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-maroon hover:underline" style={{ fontWeight: 500 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}