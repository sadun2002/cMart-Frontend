'use client';

import React from 'react';
import { VerdantHeader } from '../layouts/VerdantHeader';
import { VerdantFooter } from '../layouts/VerdantFooter';
import { ShieldCheck, Truck, FileText } from 'lucide-react';

export function VerdantPolicyLayout({ 
  storeName, 
  domain, 
  title, 
  icon: Icon,
  lastUpdated,
  children 
}: { 
  storeName: string; 
  domain: string; 
  title: string; 
  icon: React.ElementType;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-verdant-background">
      <VerdantHeader storeName={storeName} domain={domain} />
      
      <div className="bg-verdant-surface-container-low py-12 md:py-20 border-b border-verdant-surface-container">
        <div className="container mx-auto px-4 md:px-8 max-w-[800px] text-center">
          <div className="inline-flex items-center justify-center p-4 bg-verdant-surface-bright rounded-2xl shadow-sm border border-verdant-surface-container mb-6">
            <Icon size={32} className="text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-verdant-heading font-bold text-verdant-on-surface mb-4">
            {title}
          </h1>
          <p className="text-verdant-on-surface-variant font-verdant-body">
            Last Updated: {lastUpdated}
          </p>
        </div>
      </div>

      <main className="flex-grow py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-8 max-w-[800px]">
          <div className="bg-verdant-surface-bright p-8 md:p-12 rounded-[24px] shadow-sm border border-verdant-surface-container prose prose-verdant max-w-none">
            {children}
          </div>
        </div>
      </main>

      <VerdantFooter storeName={storeName} domain={domain} />
    </div>
  );
}

export function VerdantShipping({ storeName, domain }: { storeName: string; domain: string }) {
  return (
    <VerdantPolicyLayout 
      storeName={storeName} 
      domain={domain} 
      title="Shipping Policy" 
      icon={Truck}
      lastUpdated="August 12, 2026"
    >
      <h3>1. Delivery Areas</h3>
      <p>We currently deliver to all major metropolitan areas within a 50-mile radius of our distribution centers. We are constantly expanding our reach to bring fresh organic produce to more communities.</p>
      
      <h3>2. Delivery Times & Fees</h3>
      <ul>
        <li><strong>Standard Delivery (Next Day):</strong> LKR 400 for orders under LKR 5,000.</li>
        <li><strong>Free Delivery:</strong> On all orders over LKR 5,000.</li>
        <li><strong>Same Day Delivery:</strong> Available for select zip codes for a premium fee of LKR 800 (orders must be placed before 10 AM).</li>
      </ul>

      <h3>3. Packaging</h3>
      <p>We are committed to sustainability. All our deliveries are packaged in 100% recyclable or biodegradable materials. We encourage our customers to return delivery boxes for reuse.</p>
      
      <h3>4. Freshness Guarantee</h3>
      <p>Our produce is transported in temperature-controlled vehicles to ensure it arrives at your doorstep as fresh as when it was harvested. If any item does not meet your expectations, please refer to our Returns Policy.</p>
    </VerdantPolicyLayout>
  );
}

export function VerdantTerms({ storeName, domain }: { storeName: string; domain: string }) {
  return (
    <VerdantPolicyLayout 
      storeName={storeName} 
      domain={domain} 
      title="Terms of Service" 
      icon={FileText}
      lastUpdated="August 12, 2026"
    >
      <h3>1. Acceptance of Terms</h3>
      <p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.</p>
      
      <h3>2. Product Information</h3>
      <p>We make every effort to display as accurately as possible the colors, features, specifications, and details of the products available on the Site. However, we do not guarantee that the colors, features, specifications, and details of the products will be accurate, complete, reliable, current, or free of other errors.</p>
      
      <h3>3. Pricing and Availability</h3>
      <p>All prices are subject to change without notice. We reserve the right to modify or discontinue any product without notice at any time. We shall not be liable to you or to any third-party for any modification, price change, suspension, or discontinuance of the product.</p>

      <h3>4. User Accounts</h3>
      <p>When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
    </VerdantPolicyLayout>
  );
}

export function VerdantPrivacy({ storeName, domain }: { storeName: string; domain: string }) {
  return (
    <VerdantPolicyLayout 
      storeName={storeName} 
      domain={domain} 
      title="Privacy Policy" 
      icon={ShieldCheck}
      lastUpdated="August 12, 2026"
    >
      <h3>1. Information We Collect</h3>
      <p>We collect information that you provide directly to us, including your name, email address, postal address, phone number, and payment information when you make a purchase or create an account.</p>
      
      <h3>2. How We Use Your Information</h3>
      <p>We use the information we collect primarily to provide, maintain, and improve our services, including processing transactions and sending related information such as confirmations and invoices.</p>
      
      <h3>3. Information Sharing</h3>
      <p>We do not share your personal information with third parties except as necessary to provide our services (such as shipping partners and payment processors) or as required by law.</p>

      <h3>4. Data Security</h3>
      <p>We implement appropriate technical and organizational security measures to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.</p>
    </VerdantPolicyLayout>
  );
}
