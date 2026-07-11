import React from 'react';

export const metadata = {
  title: 'Privacy Policy — ZELIX',
  description: 'How ZELIX collects, uses, and protects your personal information.',
};

const sections = [
  {
    title: '1. INFORMATION WE COLLECT',
    content: `We may collect the following types of information:

PERSONAL INFORMATION
When you interact with our website, we may collect:
• Full Name
• Email Address
• Mobile Number
• Shipping Address
• Billing Address
• Payment Information (processed securely through our payment partners; we do not store your card details)
• Order History
• Customer Support Messages

AUTOMATICALLY COLLECTED INFORMATION
When you visit our website, we may automatically collect:
• IP Address
• Browser Type
• Device Information
• Operating System
• Time Zone
• Pages Visited
• Time Spent on Website
• Referral URLs
• Cookies and Similar Technologies`,
  },
  {
    title: '2. HOW WE USE YOUR INFORMATION',
    content: `We use your information to:

• Process and deliver your orders.
• Verify payments and prevent fraud.
• Communicate regarding orders and deliveries.
• Provide customer support.
• Improve website performance and user experience.
• Personalize your shopping experience.
• Send promotional offers and newsletters (only if you have opted in).
• Comply with legal obligations.`,
  },
  {
    title: '3. PAYMENT SECURITY',
    content: `All payments are processed through trusted and secure payment gateways.

ZELIX does not store your debit card, credit card, UPI PIN, CVV, or banking credentials on our servers.`,
  },
  {
    title: '4. COOKIES',
    content: `Our website uses cookies and similar technologies to:

• Remember your preferences.
• Keep you logged in where applicable.
• Improve website performance.
• Analyze visitor behavior.
• Personalize content and advertisements.

You can disable cookies through your browser settings. However, some website features may not function properly.`,
  },
  {
    title: '5. SHARING YOUR INFORMATION',
    content: `We do not sell, rent, or trade your personal information.

Your information may be shared only with trusted third parties when necessary, including:
• Payment Gateway Providers
• Shipping and Logistics Partners
• SMS and Email Service Providers
• Customer Support Platforms
• Government or Legal Authorities when required by law

These service providers are authorized to use your information only for the services they perform on our behalf.`,
  },
  {
    title: '6. DATA SECURITY',
    content: `We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, misuse, loss, alteration, or disclosure.

While we strive to protect your information, no method of internet transmission or electronic storage is completely secure. Therefore, we cannot guarantee absolute security.`,
  },
  {
    title: '7. YOUR RIGHTS',
    content: `Depending on applicable laws, you may have the right to:

• Access your personal information.
• Correct inaccurate information.
• Update your details.
• Request deletion of your personal data.
• Withdraw consent for marketing communications.
• Request a copy of your personal information.

To exercise these rights, please contact us using the details provided below.`,
  },
  {
    title: '8. MARKETING COMMUNICATIONS',
    content: `If you subscribe to our newsletter or promotional messages, we may send updates regarding:

• New product launches
• Exclusive offers
• Discounts
• Sales events
• Brand announcements

You can unsubscribe at any time using the unsubscribe link in our emails or by contacting us.`,
  },
  {
    title: '9. THIRD-PARTY SERVICES',
    content: `Our website may contain links to third-party websites or services.

We are not responsible for the privacy practices, content, or policies of those third-party websites. We encourage you to review their privacy policies before sharing any personal information.`,
  },
  {
    title: '10. CHILDREN\'S PRIVACY',
    content: `Our website is not intended for children under the age of 18.

We do not knowingly collect personal information from minors. If we become aware that such information has been collected, we will take appropriate steps to remove it.`,
  },
  {
    title: '11. DATA RETENTION',
    content: `We retain your personal information only for as long as necessary to:

• Fulfill your orders.
• Maintain business records.
• Resolve disputes.
• Comply with legal and tax obligations.
• Enforce our agreements.

When your information is no longer required, it will be securely deleted or anonymized.`,
  },
  {
    title: '12. CHANGES TO THIS PRIVACY POLICY',
    content: `We may update this Privacy Policy from time to time to reflect changes in our business practices, legal requirements, or services.

The latest version will always be available on this page, along with the updated Effective Date.`,
  },
  {
    title: '13. CONTACT US',
    content: `If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us.

ZELIX
Email: zelixupdates@gmail.com
Phone: +91 8606213948
Website: www.zelix.shop

We aim to respond to all privacy-related requests within a reasonable timeframe.`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white text-black min-h-screen">
      <section className="border-b border-black/10 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <span className="font-mono text-[9px] tracking-[0.3em] text-neutral-500 uppercase block mb-4">ZELIX / LEGAL</span>
          <h1 className="font-black text-[40px] md:text-[60px] uppercase tracking-wide leading-none mb-6">PRIVACY<br />POLICY</h1>
          <p className="font-mono text-[11px] text-neutral-500 tracking-wide">EFFECTIVE DATE: JULY 11, 2026</p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10 p-6 border border-black/10 rounded-sm bg-neutral-50">
            <p className="font-mono text-[11px] text-neutral-600 leading-relaxed tracking-wide">
              WELCOME TO ZELIX ("WE," "OUR," OR "US"). YOUR PRIVACY IS IMPORTANT TO US. THIS PRIVACY POLICY EXPLAINS HOW WE COLLECT, USE, STORE, AND PROTECT YOUR PERSONAL INFORMATION WHEN YOU VISIT OUR WEBSITE, PLACE AN ORDER, OR INTERACT WITH OUR SERVICES.
              <br /><br />
              BY ACCESSING OR USING OUR WEBSITE, YOU AGREE TO THE PRACTICES DESCRIBED IN THIS PRIVACY POLICY.
            </p>
          </div>

          <div className="flex flex-col gap-10">
            {sections.map((section, i) => (
              <div key={i} className="border-b border-black/5 pb-10 last:border-0">
                <h2 className="font-black text-[13px] uppercase tracking-widest mb-5 text-black">{section.title}</h2>
                <div className="font-mono text-[11px] text-neutral-600 leading-relaxed tracking-wide whitespace-pre-line">{section.content}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
