import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | ThreeBears',
  description: 'Privacy Policy for ThreeBears',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow pt-16">
        <div className="max-w-4xl mx-auto px-4 py-12 bg-white rounded-xl mt-8 shadow-sm border border-gray-200">
          <h1 className="text-3xl font-bold mb-8 text-gray-900">Privacy Policy</h1>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Introduction</h2>
            <p className="mb-4 text-gray-600">
              This Privacy Policy describes how ThreeBears ("we", "our", or "us") collects, uses, and discloses your 
              personal information when you use our service.
            </p>
            <p className="mb-4 text-gray-600">
              We use your personal data to provide and improve the Service. By using the Service, you agree to the 
              collection and use of information in accordance with this Privacy Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Information We Collect</h2>
            <p className="mb-4 text-gray-600">
              We collect several different types of information for various purposes to provide and improve our Service to you.
            </p>
            <h3 className="text-xl font-medium mb-2 text-gray-900">Personal Data</h3>
            <p className="mb-4 text-gray-600">
              While using our Service, we may ask you to provide us with certain personally identifiable information 
              that can be used to contact or identify you. This may include, but is not limited to:
            </p>
            <ul className="list-disc ml-8 mb-4 text-gray-600">
              <li>Email address</li>
              <li>First name and last name</li>
              <li>Usage data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">How We Use Your Information</h2>
            <p className="mb-4 text-gray-600">
              We use the collected data for various purposes:
            </p>
            <ul className="list-disc ml-8 mb-4 text-gray-600">
              <li>To provide and maintain our Service</li>
              <li>To notify you about changes to our Service</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information so that we can improve our Service</li>
              <li>To monitor the usage of our Service</li>
              <li>To detect, prevent and address technical issues</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Contact Us</h2>
            <p className="mb-4 text-gray-600">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <p className="text-gray-600">By email: support@threebears.ai</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}