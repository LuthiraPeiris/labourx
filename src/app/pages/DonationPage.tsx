import { useState } from 'react';
import {
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';

import { auth, db } from '../../firebase/config';
import { useNavigate, Link } from 'react-router-dom';
import {
  Coffee, Heart, CreditCard, CheckCircle, ArrowLeft, Star,
  Smile, Zap, Shield, Lock, HardHat, Sparkles
} from 'lucide-react';

const donationAmounts = [
  { label: '☕ One Coffee', amount: 150, description: 'A small thank-you' },
  { label: '☕☕ Two Coffees', amount: 300, description: 'We\'re touched!' },
  { label: '🍰 Coffee + Cake', amount: 600, description: 'You\'re amazing!' },
  { label: '🎉 Big Thanks', amount: 1500, description: 'You\'re a legend!' },
];

const testimonials = [
  { name: 'Nimasha J.', text: 'LabourX saved me so much time finding the right mason. Happy to give back!', amount: 300 },
  { name: 'Rukshan P.', text: 'Got my first 10 projects through this platform. Coffee is the least I could do.', amount: 600 },
];

type Step = 'amount' | 'payment' | 'success';

export function DonationPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('amount');
  const [selectedAmount, setSelectedAmount] = useState(300);
  const [customAmount, setCustomAmount] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
  });

  const finalAmount = useCustom ? (parseInt(customAmount) || 0) : selectedAmount;

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
    if (finalAmount < 50) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    await addDoc(collection(db, 'donations'), {
      userId: auth.currentUser?.uid || null,
      amount: finalAmount,
      message,
      paymentStatus: 'paid',
      paymentMethod: 'Card',
      donatedAt: serverTimestamp(),
    });
    setLoading(false);
    setStep('success');
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 flex items-center justify-center py-12 px-4">
        <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
          <div className="relative w-20 h-20 mx-auto mb-5">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
              <Coffee className="w-9 h-9 text-amber-600" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <h2 className="text-foreground mb-2" style={{ fontSize: '1.6rem', fontWeight: 800 }}>Thank You! ☕</h2>
          <p className="text-muted-foreground mb-2">
            You just bought us a coffee worth <span className="text-foreground" style={{ fontWeight: 700 }}>Rs. {finalAmount.toLocaleString()}</span>!
          </p>
          <p className="text-muted-foreground text-sm mb-5">
            Your generosity helps us keep LabourX running and improving for all Sri Lankan construction professionals.
          </p>
          {message && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-5 text-left">
              <p className="text-xs text-muted-foreground mb-1" style={{ fontWeight: 500 }}>Your message:</p>
              <p className="text-foreground text-sm italic">"{message}"</p>
            </div>
          )}
          <div className="bg-muted/50 rounded-xl p-3 mb-6 text-left">
            <p className="text-xs text-muted-foreground mb-1">Donation Reference</p>
            <p className="text-foreground text-sm" style={{ fontWeight: 600 }}>DON-{Date.now().toString().slice(-8)}</p>
          </div>
          <div className="flex gap-3 justify-center">
            <Link
              to="/"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm transition-colors flex items-center gap-2"
              style={{ fontWeight: 600 }}
            >
              <Heart className="w-4 h-4" />
              Back to LabourX
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-background to-orange-50 dark:from-amber-900/10 dark:via-background dark:to-orange-900/10 py-12 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
<div className="flex items-center justify-between mb-8">
  <button
    onClick={() => step === 'payment' ? setStep('amount') : navigate(-1)}
    className="inline-flex items-center gap-2 text-amber-700 dark:text-amber-400 hover:opacity-70 text-sm"
    style={{ fontWeight: 600 }}
  >
    <ArrowLeft className="w-4 h-4" />
    {step === 'payment' ? 'Back' : 'Back'}
  </button>

  <Link to="/" className="inline-flex items-center gap-2">
    <div className="w-9 h-9 bg-maroon rounded-xl flex items-center justify-center shadow-sm">
      <HardHat className="w-4 h-4 text-white" />
    </div>
    <span className="text-maroon text-lg" style={{ fontWeight: 800 }}>
      Labour<span style={{ color: '#C9A84C' }}>X</span>
    </span>
  </Link>
</div>

        {step === 'amount' && (
          <>
            {/* Hero */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Coffee className="w-8 h-8 text-amber-600" />
              </div>
              <h1 className="text-foreground mb-2" style={{ fontSize: '2rem', fontWeight: 800 }}>Buy Us a Coffee ☕</h1>
              <p className="text-muted-foreground">
                LabourX is built with love for Sri Lanka's construction community.
                If we've helped you, consider buying us a coffee as a token of appreciation!
              </p>
            </div>

            {/* Amount options */}
            <div className="bg-card border border-border rounded-2xl p-5 mb-4">
              <h3 className="text-foreground mb-3" style={{ fontWeight: 600 }}>Choose an amount</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {donationAmounts.map(d => (
                  <button
                    key={d.amount}
                    onClick={() => { setSelectedAmount(d.amount); setUseCustom(false); }}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      !useCustom && selectedAmount === d.amount
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                        : 'border-border hover:border-amber-300'
                    }`}
                  >
                    <p className="text-foreground text-sm" style={{ fontWeight: 600 }}>{d.label}</p>
                    <p className="text-amber-600 dark:text-amber-400" style={{ fontWeight: 700 }}>Rs. {d.amount}</p>
                    <p className="text-muted-foreground text-xs">{d.description}</p>
                  </button>
                ))}
              </div>

              {/* Custom amount */}
              <button
                onClick={() => setUseCustom(true)}
                className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                  useCustom ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-border hover:border-amber-300'
                }`}
              >
                <p className="text-foreground text-sm mb-1" style={{ fontWeight: 600 }}>Custom Amount</p>
                {useCustom ? (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">Rs.</span>
                    <input
                      type="number"
                      value={customAmount}
                      onChange={e => setCustomAmount(e.target.value)}
                      placeholder="Enter amount (min Rs. 50)"
                      onClick={e => e.stopPropagation()}
                      className="flex-1 bg-transparent outline-none text-foreground text-sm"
                      autoFocus
                    />
                  </div>
                ) : (
                  <p className="text-muted-foreground text-xs">Enter any amount you'd like</p>
                )}
              </button>
            </div>

            {/* Message */}
            <div className="bg-card border border-border rounded-2xl p-5 mb-4">
              <label className="block text-foreground mb-2 text-sm" style={{ fontWeight: 600 }}>
                <span className="flex items-center gap-1.5"><Smile className="w-4 h-4 text-amber-500" /> Leave a message (optional)</span>
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Say something nice... e.g. 'LabourX helped me find the perfect architect!'"
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 text-sm resize-none"
              />
            </div>

            {/* Social proof */}
            <div className="bg-card border border-border rounded-2xl p-5 mb-5">
              <h3 className="text-foreground mb-3 text-sm flex items-center gap-2" style={{ fontWeight: 600 }}>
                <Heart className="w-4 h-4 text-red-500" /> Recent Supporters
              </h3>
              <div className="space-y-3">
                {testimonials.map((t, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0" style={{ fontWeight: 700, fontSize: '0.75rem' }}>
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="text-foreground text-xs" style={{ fontWeight: 600 }}>{t.name} <span className="text-amber-600">· Rs. {t.amount}</span></p>
                      <p className="text-muted-foreground text-xs mt-0.5 italic">"{t.text}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => finalAmount >= 50 && setStep('payment')}
              disabled={finalAmount < 50}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              style={{ fontWeight: 700 }}
            >
              <Coffee className="w-5 h-5" />
              {finalAmount >= 50 ? `Buy Coffee — Rs. ${finalAmount.toLocaleString()}` : 'Enter a valid amount (min Rs. 50)'}
            </button>
          </>
        )}

        {step === 'payment' && (
          <div>
            <div className="bg-card border border-border rounded-2xl p-6 mb-4">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Coffee className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-foreground" style={{ fontWeight: 700 }}>Complete Your Donation</h2>
                  <p className="text-muted-foreground text-xs">Rs. {finalAmount.toLocaleString()} donation</p>
                </div>
              </div>

              <form onSubmit={handlePay} className="space-y-4">
                <div>
                  <label className="block text-sm text-foreground mb-1.5" style={{ fontWeight: 500 }}>Card Number</label>
                  <input
                    value={form.cardNumber}
                    onChange={e => setForm(f => ({ ...f, cardNumber: formatCardNumber(e.target.value) }))}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1.5" style={{ fontWeight: 500 }}>Cardholder Name</label>
                  <input
                    value={form.cardName}
                    onChange={e => setForm(f => ({ ...f, cardName: e.target.value }))}
                    placeholder="Name on card"
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 text-sm"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-foreground mb-1.5" style={{ fontWeight: 500 }}>Expiry</label>
                    <input
                      value={form.expiry}
                      onChange={e => setForm(f => ({ ...f, expiry: formatExpiry(e.target.value) }))}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 text-sm"
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
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2.5">
                  <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                  Secure 256-bit SSL encrypted payment
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                  style={{ fontWeight: 700 }}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing your kindness...
                    </>
                  ) : (
                    <>
                      <Coffee className="w-5 h-5" />
                      Donate Rs. {finalAmount.toLocaleString()}
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

            <div className="flex gap-3 text-xs text-muted-foreground justify-center">
              <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-green-500" /> Secure payment</span>
              <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-amber-500" /> Instant confirmation</span>
              <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-purple-500" /> Makes us smile!</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
