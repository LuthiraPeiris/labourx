import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  TrendingUp, CreditCard, CheckCircle, ArrowLeft, Star,
  Shield, Zap, Award, User, FileText, Lock, HardHat
} from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../context/AuthContext';

const profilePlans = [
  {
    id: 'profile-basic',
    name: 'Basic Boost',
    duration: '7 days',
    price: 1000,
    badge: 'Featured',
    badgeColor: 'bg-purple-100 text-purple-700',
    features: ['Featured badge on profile', 'Higher search ranking', 'Highlighted card'],
  },
  {
    id: 'profile-pro',
    name: 'Pro Boost',
    duration: '30 days',
    price: 2500,
    badge: 'Top',
    badgeColor: 'bg-amber-100 text-amber-700',
    features: ['Top badge on profile', 'Priority in search results', 'Highlighted card', 'Featured on homepage'],
    popular: true,
  },
  {
    id: 'profile-verified',
    name: 'Verified Badge',
    duration: 'Lifetime',
    price: 5000,
    badge: 'Verified',
    badgeColor: 'bg-blue-100 text-blue-700',
    features: ['Permanent Verified badge', 'Trust signal for clients', 'Featured in verified listings', 'Priority support'],
  },
];

const postPlans = [
  {
    id: 'post-7',
    name: '7-Day Boost',
    duration: '7 days',
    price: 1000,
    badge: 'Featured',
    badgeColor: 'bg-purple-100 text-purple-700',
    features: ['Featured badge on post', 'Top of search results', 'More bid opportunities'],
  },
  {
    id: 'post-14',
    name: '14-Day Boost',
    duration: '14 days',
    price: 1500,
    badge: 'Featured',
    badgeColor: 'bg-purple-100 text-purple-700',
    features: ['Featured badge on post', 'Top of search results', 'More bid opportunities', 'Email alerts to pros'],
    popular: true,
  },
  {
    id: 'post-30',
    name: '30-Day Boost',
    duration: '30 days',
    price: 2500,
    badge: 'Top',
    badgeColor: 'bg-amber-100 text-amber-700',
    features: ['Top badge on post', 'Maximum visibility', 'Priority placement', 'Email alerts to pros', 'Featured on homepage'],
  },
];

type Step = 'plan' | 'payment' | 'success';

export function BoostPaymentPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const boostType = (searchParams.get('type') as 'profile' | 'post') || 'profile';
  const targetName = searchParams.get('name') || '';

  const plans = boostType === 'profile' ? profilePlans : postPlans;

  const [step, setStep] = useState<Step>('plan');
  const [selectedPlan, setSelectedPlan] = useState(plans[1].id);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
  });

  const plan = plans.find(p => p.id === selectedPlan)!;

  const formatCardNumber = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const handlePay = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!currentUser) {
    navigate('/login');
    return;
  }

  setLoading(true);

  try {
    const paymentRef = `PAY-${Date.now()}`;

    await addDoc(collection(db, 'boostRequests'), {
      requesterId: currentUser.uid,
      requesterName: currentUser.name || '',
      requesterEmail: currentUser.email || '',
      requesterAvatar: currentUser.avatar || currentUser.photoURL || '',

      type: boostType,
      targetName: targetName || currentUser.name || '',
      targetId: currentUser.uid,

      planId: plan.id,
      plan: `${plan.name} (${plan.duration})`,
      amount: plan.price,
      badge: plan.badge,

      paymentRef,
      paymentStatus: 'paid',
      status: 'pending',

      requestedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    });

    setStep('success');
  } catch (error) {
    console.error('Error saving boost request:', error);
    alert('Payment completed, but failed to submit boost request. Please contact admin.');
  } finally {
    setLoading(false);
  }
};

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-maroon-light flex items-center justify-center py-12 px-4">
        <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-foreground mb-2" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Boost Submitted!</h2>
          <p className="text-muted-foreground mb-2">
            Your payment of <span className="text-foreground font-semibold">Rs. {plan.price.toLocaleString()}</span> was received.
          </p>
          <p className="text-muted-foreground text-sm mb-6">
            Our admin team will review and activate your <strong>{plan.badge}</strong> badge within 24 hours.
          </p>
          <div className="bg-muted/50 rounded-xl p-4 mb-6 text-left">
            <p className="text-xs text-muted-foreground mb-1">Payment Reference</p>
            <p className="text-foreground text-sm" style={{ fontWeight: 600 }}>PAY-{Date.now().toString().slice(-8)}</p>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate(-2)}
              className="px-5 py-2.5 border border-border text-foreground rounded-xl text-sm hover:bg-muted transition-colors"
              style={{ fontWeight: 500 }}
            >
              Go Back
            </button>
            <Link
              to="/"
              className="px-5 py-2.5 bg-maroon hover:bg-maroon-dark text-white rounded-xl text-sm transition-colors"
              style={{ fontWeight: 600 }}
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-maroon-light py-12 px-4">
      {/* Header */}
      <div className="max-w-3xl mx-auto mb-6">
        <button
          onClick={() => step === 'payment' ? setStep('plan') : navigate(-1)}
          className="inline-flex items-center gap-1.5 text-maroon hover:text-maroon-dark text-sm mb-4"
          style={{ fontWeight: 500 }}
        >
          <ArrowLeft className="w-4 h-4" />
          {step === 'payment' ? 'Back to Plans' : 'Back'}
        </button>
        <div className="flex items-center gap-3 mb-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 bg-maroon rounded-lg flex items-center justify-center">
              <HardHat className="w-4 h-4 text-white" />
            </div>
            <span className="text-maroon" style={{ fontWeight: 700 }}>Labour<span style={{ color: '#C9A84C' }}>X</span></span>
          </Link>
          <span className="text-muted-foreground text-sm">/</span>
          <span className="text-foreground text-sm" style={{ fontWeight: 500 }}>
            Boost {boostType === 'profile' ? 'Profile' : 'Post'}
          </span>
        </div>
        {targetName && (
          <p className="text-muted-foreground text-sm flex items-center gap-1.5">
            {boostType === 'profile' ? <User className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            Boosting: <span className="text-foreground" style={{ fontWeight: 500 }}>{targetName}</span>
          </p>
        )}

        {/* Steps indicator */}
        <div className="flex items-center gap-2 mt-4">
          {(['plan', 'payment'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${step === s || (s === 'plan' && step === 'payment') ? 'bg-maroon text-white' : 'bg-muted text-muted-foreground'}`} style={{ fontWeight: 700 }}>
                {s === 'plan' && step === 'payment' ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs capitalize ${step === s ? 'text-foreground' : 'text-muted-foreground'}`} style={{ fontWeight: step === s ? 600 : 400 }}>
                {s === 'plan' ? 'Choose Plan' : 'Payment'}
              </span>
              {i < 1 && <div className="w-8 h-px bg-border" />}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        {step === 'plan' && (
          <div>
            <h1 className="text-foreground mb-1" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              Choose a Boost Plan
            </h1>
            <p className="text-muted-foreground text-sm mb-6">
              {boostType === 'profile'
                ? 'Increase your profile visibility and attract more clients'
                : 'Push your post to the top and get more professional bids'}
            </p>

            <div className="grid gap-4 mb-6">
              {plans.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlan(p.id)}
                  className={`w-full text-left border-2 rounded-xl p-4 transition-all relative ${
                    selectedPlan === p.id ? 'border-maroon bg-maroon/5' : 'border-border bg-card hover:border-maroon/40'
                  }`}
                >
                  {p.popular && (
                    <span className="absolute -top-2.5 left-4 bg-maroon text-white text-xs px-2.5 py-0.5 rounded-full" style={{ fontWeight: 600 }}>
                      Most Popular
                    </span>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPlan === p.id ? 'border-maroon' : 'border-border'}`}>
                        {selectedPlan === p.id && <div className="w-2.5 h-2.5 rounded-full bg-maroon" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-foreground" style={{ fontWeight: 600 }}>{p.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${p.badgeColor}`} style={{ fontWeight: 600 }}>
                            {p.badge} Badge
                          </span>
                        </div>
                        <p className="text-muted-foreground text-xs mt-0.5">{p.duration}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-foreground" style={{ fontWeight: 700, fontSize: '1.15rem' }}>Rs. {p.price.toLocaleString()}</p>
                    </div>
                  </div>
                  <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {p.features.map(f => (
                      <li key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep('payment')}
              className="w-full bg-maroon hover:bg-maroon-dark text-white py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              style={{ fontWeight: 700 }}
            >
              <TrendingUp className="w-5 h-5" />
              Continue to Payment — Rs. {plan.price.toLocaleString()}
            </button>
          </div>
        )}

        {step === 'payment' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* Payment form */}
            <div className="lg:col-span-3">
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <CreditCard className="w-5 h-5 text-maroon" />
                  <h2 className="text-foreground" style={{ fontWeight: 700 }}>Payment Details</h2>
                </div>

                <form onSubmit={handlePay} className="space-y-4">
                  <div>
                    <label className="block text-sm text-foreground mb-1.5" style={{ fontWeight: 500 }}>Card Number</label>
                    <input
                      value={form.cardNumber}
                      onChange={e => setForm(f => ({ ...f, cardNumber: formatCardNumber(e.target.value) }))}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-maroon/30 focus:border-maroon text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-foreground mb-1.5" style={{ fontWeight: 500 }}>Cardholder Name</label>
                    <input
                      value={form.cardName}
                      onChange={e => setForm(f => ({ ...f, cardName: e.target.value }))}
                      placeholder="Name on card"
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-maroon/30 focus:border-maroon text-sm"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-foreground mb-1.5" style={{ fontWeight: 500 }}>Expiry Date</label>
                      <input
                        value={form.expiry}
                        onChange={e => setForm(f => ({ ...f, expiry: formatExpiry(e.target.value) }))}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-maroon/30 focus:border-maroon text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-foreground mb-1.5" style={{ fontWeight: 500 }}>CVV</label>
                      <input
                        value={form.cvv}
                        onChange={e => setForm(f => ({ ...f, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                        placeholder="123"
                        maxLength={4}
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-maroon/30 focus:border-maroon text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2.5">
                    <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                    Your payment is secured with 256-bit SSL encryption
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-maroon hover:bg-maroon-dark disabled:opacity-60 text-white py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
                    style={{ fontWeight: 700 }}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Pay Rs. {plan.price.toLocaleString()}
                      </>
                    )}
                  </button>
                </form>

                <div className="flex items-center justify-center gap-4 mt-4">
                  {['Visa', 'Mastercard', 'Amex'].map(c => (
                    <span key={c} className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded" style={{ fontWeight: 500 }}>{c}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-2">
              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="text-foreground mb-4" style={{ fontWeight: 700 }}>Order Summary</h3>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Plan</span>
                    <span className="text-foreground" style={{ fontWeight: 500 }}>{plan.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="text-foreground" style={{ fontWeight: 500 }}>{plan.duration}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Badge</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${plan.badgeColor}`} style={{ fontWeight: 600 }}>{plan.badge}</span>
                  </div>
                  {targetName && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{boostType === 'profile' ? 'Profile' : 'Post'}</span>
                      <span className="text-foreground text-xs truncate max-w-28" style={{ fontWeight: 500 }}>{targetName}</span>
                    </div>
                  )}
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground" style={{ fontWeight: 600 }}>Total</span>
                    <span className="text-maroon" style={{ fontWeight: 700, fontSize: '1.15rem' }}>Rs. {plan.price.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {[
                    { icon: Shield, text: 'Secure payment gateway' },
                    { icon: Zap, text: 'Activated within 24 hours' },
                    { icon: Award, text: 'Money-back if not approved' },
                  ].map(item => (
                    <div key={item.text} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <item.icon className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
