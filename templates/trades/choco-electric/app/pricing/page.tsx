'use client';

import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Check, ArrowRight, Zap, Building2, Rocket } from 'lucide-react';

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-zinc-950">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/30 to-zinc-950"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f10_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f10_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
              Simple,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                Transparent
              </span>{' '}
              Pricing
            </h1>
            <p className="text-base sm:text-lg text-zinc-400 max-w-xl mx-auto">
              Start free, upgrade when you're ready.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-16 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">

            {/* Starter */}
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-yellow-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">[Tier 1 Name]</h3>
              </div>

              <div className="mb-4">
                <span className="text-3xl font-bold text-white">[Price]</span>
              </div>

              <p className="text-sm text-zinc-400 mb-6">[Tier 1 description]</p>

              <ul className="space-y-2.5 mb-6">
                {[
                  '[Feature 1]',
                  '[Feature 2]',
                  '[Feature 3]',
                  '[Feature 4]',
                  '[Feature 5]',
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    <span className="text-zinc-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className="block w-full py-3 rounded-lg font-medium text-center bg-zinc-800 text-white hover:bg-zinc-700 transition-all text-sm"
              >
                [CTA Button Text]
              </Link>
            </div>

            {/* Pro - Popular */}
            <div className="relative p-6 rounded-2xl bg-zinc-900 border-2 border-blue-500/50 hover:border-blue-500 transition-all">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-medium">
                Most Popular
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">[Tier 2 Name]</h3>
              </div>

              <div className="mb-4">
                <span className="text-3xl font-bold text-white">[Price]</span>
                <span className="text-zinc-400 text-sm ml-1">/month</span>
              </div>

              <p className="text-sm text-zinc-400 mb-6">[Tier 2 description]</p>

              <ul className="space-y-2.5 mb-6">
                {[
                  '[Feature 1]',
                  '[Feature 2]',
                  '[Feature 3]',
                  '[Feature 4]',
                  '[Feature 5]',
                  '[Feature 6]',
                  '[Feature 7]',
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    <span className="text-zinc-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className="block w-full py-3 rounded-lg font-medium text-center bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-400 hover:to-blue-500 transition-all shadow-lg shadow-blue-500/25 text-sm"
              >
                [CTA Button Text]
              </Link>
            </div>

            {/* Enterprise */}
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">[Tier 3 Name]</h3>
              </div>

              <div className="mb-4">
                <span className="text-3xl font-bold text-white">[Price]</span>
              </div>

              <p className="text-sm text-zinc-400 mb-6">[Tier 3 description]</p>

              <ul className="space-y-2.5 mb-6">
                {[
                  '[Feature 1]',
                  '[Feature 2]',
                  '[Feature 3]',
                  '[Feature 4]',
                  '[Feature 5]',
                  '[Feature 6]',
                  '[Feature 7]',
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    <span className="text-zinc-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/contact"
                className="block w-full py-3 rounded-lg font-medium text-center bg-zinc-800 text-white hover:bg-zinc-700 transition-all text-sm"
              >
                [CTA Button Text]
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-zinc-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-10 text-center">
            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Questions</span>
          </h2>

          <div className="max-w-3xl mx-auto grid gap-4">
            {[
              {
                q: '[FAQ Question 1]',
                a: '[FAQ Answer 1]'
              },
              {
                q: '[FAQ Question 2]',
                a: '[FAQ Answer 2]'
              },
              {
                q: '[FAQ Question 3]',
                a: '[FAQ Answer 3]'
              },
              {
                q: '[FAQ Question 4]',
                a: '[FAQ Answer 4]'
              },
              {
                q: '[FAQ Question 5]',
                a: '[FAQ Answer 5]'
              },
            ].map((faq, i) => (
              <div key={i} className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800">
                <h3 className="text-base font-semibold text-white mb-2">{faq.q}</h3>
                <p className="text-sm text-zinc-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-zinc-950 border-t border-zinc-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">[CTA Headline]</h2>
          <p className="text-zinc-400 mb-8 max-w-md mx-auto">
            [CTA description text]
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold hover:from-sky-400 hover:to-blue-500 transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 group"
          >
            [CTA Button Text]
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
