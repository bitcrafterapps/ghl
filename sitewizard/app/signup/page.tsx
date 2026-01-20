'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { getApiUrl, get, post } from '@/lib/api';
import { Mail, Lock, User, ArrowRight, Loader2, Zap, Rocket, Building2, Check, X, CreditCard, Phone, AlertCircle, Shield } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

type PlanType = 'starter' | 'pro' | 'enterprise';

interface PaymentConfig {
  enabled: boolean;
  provider: string | null;
  testMode: boolean;
  publishableKey: string | null;
  currency: string;
}

const plans = [
  {
    id: 'starter' as PlanType,
    name: 'Starter',
    price: 'Free',
    priceAmount: 0,
    description: '[Starter Plan Description]',
    icon: Zap,
    iconColor: 'text-yellow-400',
    features: ['[Starter Feature 1]', '[Starter Feature 2]', '[Starter Feature 3]'],
  },
  {
    id: 'pro' as PlanType,
    name: 'Pro',
    price: '$499/mo',
    priceAmount: 49900,
    description: '[Pro Plan Description]',
    icon: Rocket,
    iconColor: 'text-blue-400',
    popular: true,
    features: ['[Pro Feature 1]', '[Pro Feature 2]', '[Pro Feature 3]'],
  },
  {
    id: 'enterprise' as PlanType,
    name: 'Enterprise',
    price: 'Custom',
    priceAmount: 0,
    description: '[Enterprise Plan Description]',
    icon: Building2,
    iconColor: 'text-blue-400',
    features: ['[Enterprise Feature 1]', '[Enterprise Feature 2]', '[Enterprise Feature 3]'],
  },
];

// Enterprise Plan Contact Modal
function EnterprisePlanModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-zinc-900 rounded-2xl border border-zinc-800 p-6 w-full max-w-md mx-4 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Enterprise Plan</h3>
            <p className="text-sm text-zinc-400">Custom pricing for your organization</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <Phone className="w-5 h-5 text-blue-400" />
              <span className="text-lg font-semibold text-white">Contact Sales</span>
            </div>
            <p className="text-zinc-300 mb-4">
              Our enterprise team will work with you to create a custom solution that fits your organization's needs.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-zinc-300">
                <span className="text-blue-400">📞</span>
                <span className="font-medium">+1 (888) 555-0123</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-300">
                <span className="text-blue-400">📧</span>
                <span className="font-medium">enterprise@[my-app].com</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-300">
                <span className="text-blue-400">🗓️</span>
                <span className="font-medium">Schedule a demo call</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm text-zinc-400">
            <p className="font-medium text-zinc-300">Enterprise includes:</p>
            <ul className="space-y-1">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                [Enterprise Key Feature 1]
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                [Enterprise Key Feature 2]
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                [Enterprise Key Feature 3]
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                [Enterprise Key Feature 4]
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                [Enterprise Key Feature 5]
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold hover:from-blue-500 hover:to-cyan-500 transition-all shadow-lg shadow-blue-500/25"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Stripe Card Element styling
const cardElementOptions = {
  style: {
    base: {
      color: '#fff',
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#71717a',
      },
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444',
    },
  },
};

// Payment Form Component with Stripe
function PaymentForm({
  formData,
  selectedPlan,
  onBack,
  paymentConfig,
  onSuccess,
}: {
  formData: { name: string; email: string; password: string; confirmPassword: string; companyName: string };
  selectedPlan: PlanType;
  onBack: () => void;
  paymentConfig: PaymentConfig;
  onSuccess: (token: string, user: any) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [cardComplete, setCardComplete] = useState(false);

  const plan = plans.find(p => p.id === selectedPlan);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError('');

    try {
      const apiUrl = getApiUrl();

      // Step 1: Create PaymentIntent
      const intentRes = await fetch(`${apiUrl}/api/v1/payments/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan,
          email: formData.email,
          billingName: formData.name,
        }),
      });

      const intentData = await intentRes.json();
      if (!intentRes.ok) {
        throw new Error(intentData.message || intentData.error || 'Failed to create payment');
      }

      // Step 2: Confirm payment with Stripe
      const { clientSecret } = intentData.data;
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: formData.name,
            email: formData.email,
          },
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message || 'Payment failed');
      }

      if (paymentIntent?.status !== 'succeeded') {
        throw new Error('Payment was not successful');
      }

      // Step 3: Confirm payment and register user
      const registerRes = await fetch(`${apiUrl}/api/v1/payments/confirm-and-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId: paymentIntent.id,
          email: formData.email,
          password: formData.password,
          firstName: formData.name.split(' ')[0],
          lastName: formData.name.split(' ').slice(1).join(' '),
          selectedPlan,
          companyName: formData.companyName || undefined,
        }),
      });

      const registerData = await registerRes.json();
      if (!registerRes.ok) {
        throw new Error(registerData.message || registerData.error || 'Registration failed');
      }

      // Success!
      onSuccess(registerData.data.token, registerData.data.user);
    } catch (err: any) {
      setError(err.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-zinc-900/80 border border-blue-500/30">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Payment Details</h3>
            <p className="text-sm text-zinc-400">{plan?.price} - Cancel anytime</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          ← Back to account info
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Account Info Summary */}
        <div className="bg-zinc-800/50 rounded-lg p-3 text-sm">
          <div className="flex justify-between text-zinc-400">
            <span>Name:</span>
            <span className="text-white">{formData.name}</span>
          </div>
          <div className="flex justify-between text-zinc-400 mt-1">
            <span>Email:</span>
            <span className="text-white">{formData.email}</span>
          </div>
        </div>

        {/* Card Element */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Card Information
          </label>
          <div className="px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl">
            <CardElement
              options={cardElementOptions}
              onChange={(e) => setCardComplete(e.complete)}
            />
          </div>
        </div>

        {/* Test Mode Notice */}
        {paymentConfig.testMode && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-sm text-amber-300">
            <p className="font-medium mb-1">Test Mode Active</p>
            <p className="text-amber-400/80">Use card number 4242 4242 4242 4242, any future expiry, and any CVC.</p>
          </div>
        )}

        {/* Security Badge */}
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Shield className="w-4 h-4" />
          <span>Secured by Stripe. Your card details are encrypted.</span>
        </div>

        <button
          type="submit"
          disabled={isProcessing || !stripe || !cardComplete}
          className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 text-white font-semibold hover:from-sky-500 hover:to-blue-500 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              Subscribe to {plan?.name}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

// Coming Soon Payment Panel (when payment not configured)
function ComingSoonPayment({ onBack }: { onBack: () => void }) {
  return (
    <div className="p-6 rounded-2xl bg-zinc-900/80 border border-blue-500/30">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Payment Details</h3>
            <p className="text-sm text-zinc-400">$499/month - Cancel anytime</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          ← Back to account info
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Card Number
          </label>
          <input
            type="text"
            placeholder="4242 4242 4242 4242"
            disabled
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-500 placeholder-zinc-500 cursor-not-allowed"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Expiry Date
            </label>
            <input
              type="text"
              placeholder="MM/YY"
              disabled
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-500 placeholder-zinc-500 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              CVC
            </label>
            <input
              type="text"
              placeholder="123"
              disabled
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-500 placeholder-zinc-500 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-sm text-blue-300">
          <p className="font-medium mb-1">Payment Integration Coming Soon</p>
          <p className="text-blue-400/80">Pro subscriptions will be available shortly. Please check back soon or contact us for early access.</p>
        </div>

        <button
          type="button"
          disabled
          className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-sky-600/50 to-blue-600/50 text-white/50 font-semibold cursor-not-allowed"
        >
          Subscribe to Pro
        </button>
      </div>
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('starter');
  const [showProPayment, setShowProPayment] = useState(false);
  const [showEnterpriseModal, setShowEnterpriseModal] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null);

  // Form data state to pass to payment form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
  });

  // Fetch payment configuration on mount
  useEffect(() => {
    async function fetchPaymentConfig() {
      try {
        const apiUrl = getApiUrl();
        const res = await fetch(`${apiUrl}/api/v1/payments/config`);
        const data = await res.json();
        if (data.data) {
          setPaymentConfig(data.data);
          if (data.data.enabled && data.data.publishableKey) {
            setStripePromise(loadStripe(data.data.publishableKey));
          }
        }
      } catch (err) {
        console.error('Failed to fetch payment config:', err);
      }
    }
    fetchPaymentConfig();
  }, []);

  const handlePlanSelect = (planId: PlanType) => {
    setSelectedPlan(planId);
    setShowProPayment(false);
    if (planId === 'enterprise') {
      setShowEnterpriseModal(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formDataFromEvent = new FormData(e.currentTarget);
    const name = formDataFromEvent.get('name') as string;
    const email = formDataFromEvent.get('email') as string;
    const password = formDataFromEvent.get('password') as string;
    const confirmPassword = formDataFromEvent.get('confirmPassword') as string;
    const companyName = formDataFromEvent.get('companyName') as string;

    // Store form data for payment form
    setFormData({ name, email, password, confirmPassword, companyName });

    // Block signup for Pro and Enterprise plans
    if (selectedPlan === 'pro') {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
      setShowProPayment(true);
      return;
    }
    if (selectedPlan === 'enterprise') {
      setShowEnterpriseModal(true);
      return;
    }

    // Starter plan - direct signup
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setIsLoading(false);
      return;
    }

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/v1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          firstName: name.split(' ')[0],
          lastName: name.split(' ').slice(1).join(' '),
          selectedPlan,
          companyName: companyName || undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Signup failed');
      }

      const token = data.token || data.data?.token;
      if (!token) {
        throw new Error('No token received from server');
      }

      localStorage.setItem('token', token);

      const user = data.user || data.data?.user;
      if (user) {
        localStorage.setItem('userProfile', JSON.stringify(user));
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = (token: string, user: any) => {
    localStorage.setItem('token', token);
    if (user) {
      localStorage.setItem('userProfile', JSON.stringify(user));
    }
    router.push('/dashboard');
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950">
      <Header />

      {/* Modals */}
      <EnterprisePlanModal isOpen={showEnterpriseModal} onClose={() => setShowEnterpriseModal(false)} />

      <main className="flex-grow flex">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-sky-600/20 via-blue-600/10 to-transparent" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col justify-center px-16">
            <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
              [Hero Headline]
            </h1>

            <p className="text-xl text-zinc-400 mb-8">
              [Hero Description]
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-zinc-300">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <span className="text-blue-400 text-sm">✓</span>
                </div>
                [Benefit 1]
              </div>
              <div className="flex items-center gap-3 text-zinc-300">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <span className="text-blue-400 text-sm">✓</span>
                </div>
                [Benefit 2]
              </div>
              <div className="flex items-center gap-3 text-zinc-300">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <span className="text-blue-400 text-sm">✓</span>
                </div>
                [Benefit 3]
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Signup Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <Link href="/" className="inline-flex items-center gap-2">
                <span className="text-2xl">🌐</span>
                <span className="text-2xl font-bold text-white">[MY_APP]</span>
              </Link>
            </div>

            <div className="text-center mb-6 mt-8">
              <h2 className="text-3xl font-bold text-white">Create your account</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                  <span className="text-red-400">⚠</span>
                  {error}
                </div>
              )}

              {/* Pricing Plan Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-300 mb-3">
                  Select Your Plan
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {plans.map((plan) => {
                    const Icon = plan.icon;
                    const isSelected = selectedPlan === plan.id;
                    return (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => handlePlanSelect(plan.id)}
                        className={`relative p-3 rounded-xl border-2 transition-all text-left ${
                          isSelected
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                        }`}
                      >
                        {plan.popular && (
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white text-[10px] font-medium">
                            Popular
                          </div>
                        )}
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className={`w-4 h-4 ${plan.iconColor}`} />
                          <span className="text-sm font-medium text-white">{plan.name}</span>
                        </div>
                        <div className="text-xs text-zinc-400">{plan.price}</div>
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <Check className="w-4 h-4 text-blue-400" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                {selectedPlan !== 'starter' && (
                  <p className="mt-2 text-xs text-amber-400">
                    {selectedPlan === 'pro'
                      ? '💳 Pro plan requires payment information'
                      : '📞 Enterprise plan requires contacting sales'}
                  </p>
                )}
              </div>

              {/* Account Info Fields - Hidden when Pro payment panel is shown */}
              {!showProPayment && (
                <div className="p-6 rounded-2xl bg-zinc-900/80 border border-blue-500/30 space-y-4">
                  {/* Company Name */}
                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-zinc-300 mb-2">
                      Company Name <span className="text-zinc-500">(optional)</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                      <input
                        type="text"
                        id="companyName"
                        name="companyName"
                        className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Acme Corp"
                      />
                    </div>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  {/* Two column layout for Passwords */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                        <input
                          type="password"
                          id="password"
                          name="password"
                          required
                          minLength={8}
                          className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                      <p className="mt-1 text-xs text-zinc-500">Min. 8 characters</p>
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-300 mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          required
                          minLength={8}
                          className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="terms"
                      required
                      className="mt-1 w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                    />
                    <label htmlFor="terms" className="text-sm text-zinc-400">
                      I agree to the{' '}
                      <Link href="/terms" className="text-blue-400 hover:text-blue-300">Terms of Service</Link>
                      {' '}and{' '}
                      <Link href="/privacy" className="text-blue-400 hover:text-blue-300">Privacy Policy</Link>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 text-white font-semibold hover:from-sky-500 hover:to-blue-500 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        {selectedPlan === 'starter' ? 'Create Account' : selectedPlan === 'pro' ? 'Continue to Payment' : 'Contact Sales'}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                </button>
                </div>
              )}

              {/* Pro Plan Payment Panel */}
              {showProPayment && selectedPlan === 'pro' && (
                paymentConfig?.enabled && stripePromise ? (
                  <Elements stripe={stripePromise}>
                    <PaymentForm
                      formData={formData}
                      selectedPlan={selectedPlan}
                      onBack={() => setShowProPayment(false)}
                      paymentConfig={paymentConfig}
                      onSuccess={handlePaymentSuccess}
                    />
                  </Elements>
                ) : (
                  <ComingSoonPayment onBack={() => setShowProPayment(false)} />
                )
              )}

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-800" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-zinc-950 text-zinc-500">or sign up with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className="py-3 px-4 rounded-xl border border-zinc-800 bg-zinc-900 text-white font-medium hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  className="py-3 px-4 rounded-xl border border-zinc-800 bg-zinc-900 text-white font-medium hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </button>
              </div>

              <p className="text-center text-zinc-400 text-sm mt-4">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
