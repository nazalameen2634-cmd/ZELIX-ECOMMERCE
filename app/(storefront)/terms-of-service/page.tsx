import React from 'react';

export const metadata = {
  title: 'Terms of Service — ZELIX',
  description: 'The terms and conditions governing your use of ZELIX.',
};

const sections = [
  {
    title: '1. ACCEPTANCE OF TERMS',
    content: `By accessing or using the ZELIX website (zelix.store) or any of our services, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our services.

We reserve the right to update these terms at any time. Continued use of our services after changes constitutes acceptance of the updated terms.`,
  },
  {
    title: '2. USE OF THE WEBSITE',
    content: `You agree to use our website only for lawful purposes and in a manner that does not infringe the rights of others. You must not:

• Attempt to gain unauthorized access to any part of our systems
• Use automated tools to scrape or extract data from our website
• Transmit any harmful, offensive, or illegal content
• Impersonate any person or entity
• Engage in any activity that disrupts or interferes with our services`,
  },
  {
    title: '3. ACCOUNT REGISTRATION',
    content: `If you create an account, you are responsible for:

• Maintaining the confidentiality of your login credentials
• All activities that occur under your account
• Providing accurate and up-to-date information

You must notify us immediately at support@zelix.store if you suspect any unauthorized use of your account.`,
  },
  {
    title: '4. PRODUCTS AND PRICING',
    content: `• All product prices are in Indian Rupees (INR) and inclusive of applicable taxes
• We reserve the right to modify prices at any time without notice
• Product availability is subject to stock and may change without notice
• We reserve the right to limit quantities or refuse orders at our discretion
• In the event of a pricing error, we will notify you and give you the option to proceed at the correct price or cancel your order`,
  },
  {
    title: '5. ORDERS AND PAYMENTS',
    content: `• Placing an order constitutes an offer to purchase, not a binding contract until confirmed by us
• We reserve the right to reject or cancel any order for any reason, including suspected fraud
• Payment is processed securely via Razorpay
• By providing payment details, you authorize us to charge the total amount including taxes and applicable fees
• Orders are confirmed via email upon successful payment`,
  },
  {
    title: '6. SHIPPING AND DELIVERY',
    content: `• Shipping is free on all orders within India
• Delivery timelines are estimates and not guaranteed
• Risk of loss and title for products pass to you upon delivery
• We are not responsible for delays caused by shipping carriers or customs
• If a delivery attempt fails, you are responsible for arranging re-delivery or collection`,
  },
  {
    title: '7. RETURNS AND REFUNDS',
    content: `Returns are accepted within 7 days of delivery, subject to the following conditions:

• Items must be unworn, unwashed, and in original condition with tags attached
• Sale and promotional items may not be eligible for return
• Refunds are processed to the original payment method within 5–7 business days of receiving the returned item
• Return shipping may be arranged by us for defective products; otherwise, the customer is responsible

Please refer to our Return Policy for full details.`,
  },
  {
    title: '8. INTELLECTUAL PROPERTY',
    content: `All content on the ZELIX website — including images, text, logos, graphics, and design — is the exclusive property of ZELIX and is protected by intellectual property laws.

You may not reproduce, distribute, modify, or use our content for commercial purposes without prior written consent from ZELIX.`,
  },
  {
    title: '9. LIMITATION OF LIABILITY',
    content: `To the maximum extent permitted by law:

• ZELIX shall not be liable for any indirect, incidental, special, or consequential damages
• Our total liability to you shall not exceed the amount you paid for the order in question
• We make no warranties, express or implied, regarding the accuracy or completeness of website content
• We are not responsible for third-party content, products, or services linked from our website`,
  },
  {
    title: '10. GOVERNING LAW',
    content: `These Terms of Service are governed by and construed in accordance with the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in India.`,
  },
  {
    title: '11. CONTACT INFORMATION',
    content: `For questions about these Terms of Service, contact us at:

Email: legal@zelix.store
Website: zelix.store/contact-support`,
  },
];

export default function TermsOfServicePage() {
  return (
    <div className="bg-white text-black min-h-screen">
      <section className="border-b border-black/10 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <span className="font-mono text-[9px] tracking-[0.3em] text-neutral-500 uppercase block mb-4">ZELIX / LEGAL</span>
          <h1 className="font-black text-[40px] md:text-[60px] uppercase tracking-wide leading-none mb-6">TERMS OF<br />SERVICE</h1>
          <p className="font-mono text-[11px] text-neutral-500 tracking-wide">LAST UPDATED: JUNE 2025 · EFFECTIVE DATE: JUNE 2025</p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10 p-6 border border-black/10 rounded-sm bg-neutral-50">
            <p className="font-mono text-[11px] text-neutral-600 leading-relaxed tracking-wide">
              PLEASE READ THESE TERMS OF SERVICE CAREFULLY BEFORE USING THE ZELIX WEBSITE OR PLACING AN ORDER. THESE TERMS CONSTITUTE A LEGAL AGREEMENT BETWEEN YOU AND ZELIX.
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
