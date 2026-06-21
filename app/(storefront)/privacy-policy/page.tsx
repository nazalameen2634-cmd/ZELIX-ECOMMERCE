import React from 'react';

export const metadata = {
  title: 'Privacy Policy — ZELIX',
  description: 'How ZELIX collects, uses, and protects your personal information.',
};

const sections = [
  {
    title: '1. INFORMATION WE COLLECT',
    content: `When you visit our website or place an order, we may collect:

• Personal identification information (name, email address, phone number)
• Billing and shipping addresses
• Payment information (processed securely via Razorpay — we do not store card details)
• Order history and preferences
• Device and browsing data (IP address, browser type, pages visited)
• Communications you send us (support emails, chat messages)`,
  },
  {
    title: '2. HOW WE USE YOUR INFORMATION',
    content: `We use the information we collect to:

• Process and fulfill your orders
• Send order confirmations, shipping updates, and invoices
• Respond to your customer service requests
• Improve our website and product offerings
• Prevent fraud and ensure account security
• Send promotional communications (only with your consent)`,
  },
  {
    title: '3. HOW WE SHARE YOUR INFORMATION',
    content: `We do not sell, trade, or rent your personal data. We may share information with:

• Shipping partners (for order delivery purposes only)
• Payment processors (Razorpay — for transaction processing)
• Analytics providers (in anonymized, aggregated form)
• Legal authorities (when required by law or to protect our rights)`,
  },
  {
    title: '4. DATA SECURITY',
    content: `We implement industry-standard security measures to protect your personal information:

• SSL/TLS encryption on all data transmission
• Secure, encrypted storage of sensitive data
• Regular security audits and access controls
• Razorpay handles all payment data under PCI DSS Level 1 compliance

No method of transmission over the internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.`,
  },
  {
    title: '5. COOKIES',
    content: `We use cookies and similar tracking technologies to enhance your experience:

• Essential cookies: Required for the website to function (cart, session)
• Analytics cookies: Help us understand how visitors use our site
• Marketing cookies: Used to show relevant ads (only with your consent)

You can control cookie preferences through your browser settings.`,
  },
  {
    title: '6. YOUR RIGHTS',
    content: `You have the following rights regarding your personal data:

• Access: Request a copy of the personal data we hold about you
• Correction: Request correction of inaccurate or incomplete data
• Deletion: Request deletion of your personal data (subject to legal obligations)
• Opt-out: Unsubscribe from marketing communications at any time
• Portability: Request your data in a machine-readable format

To exercise these rights, contact us at privacy@zelix.store`,
  },
  {
    title: '7. DATA RETENTION',
    content: `We retain your personal data for as long as necessary to:

• Fulfill the purposes outlined in this policy
• Comply with legal, accounting, and reporting obligations
• Resolve disputes and enforce our agreements

Order data is typically retained for 7 years for tax and legal compliance purposes.`,
  },
  {
    title: '8. CHILDREN\'S PRIVACY',
    content: `Our services are not directed at individuals under the age of 18. We do not knowingly collect personal information from minors. If you believe we have inadvertently collected such information, please contact us immediately.`,
  },
  {
    title: '9. CHANGES TO THIS POLICY',
    content: `We may update this Privacy Policy from time to time to reflect changes in our practices or for legal compliance. We will notify you of significant changes via email or a prominent notice on our website. Your continued use of our services after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: '10. CONTACT US',
    content: `If you have any questions about this Privacy Policy or our data practices, please contact us:

Email: privacy@zelix.store
Address: ZELIX, India

We will respond to your inquiry within 30 days.`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-black text-white min-h-screen">
      <section className="border-b border-white/5 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <span className="font-mono text-[9px] tracking-[0.3em] text-neutral-500 uppercase block mb-4">ZELIX / LEGAL</span>
          <h1 className="font-black text-[40px] md:text-[60px] uppercase tracking-wide leading-none mb-6">PRIVACY<br />POLICY</h1>
          <p className="font-mono text-[11px] text-neutral-500 tracking-wide">LAST UPDATED: JUNE 2025 · EFFECTIVE DATE: JUNE 2025</p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10 p-6 border border-white/5 rounded-sm bg-neutral-950">
            <p className="font-mono text-[11px] text-neutral-400 leading-relaxed tracking-wide">
              ZELIX ("WE", "US", OR "OUR") IS COMMITTED TO PROTECTING YOUR PRIVACY. THIS POLICY EXPLAINS HOW WE COLLECT, USE, DISCLOSE, AND SAFEGUARD YOUR INFORMATION WHEN YOU USE OUR WEBSITE AND SERVICES.
            </p>
          </div>

          <div className="flex flex-col gap-10">
            {sections.map((section, i) => (
              <div key={i} className="border-b border-white/[0.03] pb-10 last:border-0">
                <h2 className="font-black text-[13px] uppercase tracking-widest mb-5 text-white">{section.title}</h2>
                <div className="font-mono text-[11px] text-neutral-400 leading-relaxed tracking-wide whitespace-pre-line">{section.content}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
