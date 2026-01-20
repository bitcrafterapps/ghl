import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | ThreeBears',
  description: 'Terms of Service for ThreeBears',
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow pt-16">
        <div className="max-w-4xl mx-auto px-4 py-12 bg-white rounded-xl mt-8 shadow-sm border border-gray-200">
          <h1 className="text-3xl font-bold mb-8 text-gray-900">Terms of Service</h1>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">1. Introduction</h2>
            <p className="mb-4 text-gray-600">
              Welcome to ThreeBears. These Terms of Service govern your use of our website and services.
              By accessing or using our service, you agree to be bound by these Terms. If you disagree with any part of the terms, 
              you may not access the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">2. Accounts</h2>
            <p className="mb-4 text-gray-600">
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. 
              Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
            </p>
            <p className="mb-4 text-gray-600">
              You are responsible for safeguarding the password that you use to access the service and for any activities or 
              actions under your password.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">3. Intellectual Property</h2>
            <p className="mb-4 text-gray-600">
              The Service and its original content, features, and functionality are and will remain the exclusive property of 
              ThreeBears and its licensors. The Service is protected by copyright, trademark, and other laws.
            </p>
            <p className="mb-4 text-gray-600">
              Our trademarks and trade dress may not be used in connection with any product or service without the prior 
              written consent of ThreeBears.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">4. Termination</h2>
            <p className="mb-4 text-gray-600">
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, 
              including without limitation if you breach the Terms.
            </p>
            <p className="mb-4 text-gray-600">
              Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, 
              you may simply discontinue using the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">5. Limitation Of Liability</h2>
            <p className="mb-4 text-gray-600">
              In no event shall ThreeBears, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable 
              for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, 
              data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or 
              use the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">6. Changes</h2>
            <p className="mb-4 text-gray-600">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material 
              we will try to provide at least 30 days' notice prior to any new terms taking effect.
            </p>
            <p className="mb-4 text-gray-600">
              By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. 
              If you do not agree to the new terms, please stop using the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">7. Contact Us</h2>
            <p className="mb-4 text-gray-600">
              If you have any questions about these Terms, please contact us:
            </p>
            <p className="text-gray-600">By email: support@threebears.ai</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}