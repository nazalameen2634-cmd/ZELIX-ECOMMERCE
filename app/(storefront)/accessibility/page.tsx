import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Accessibility — ZELIX',
  description: 'Our commitment to an inclusive and accessible digital experience.',
};

export default function AccessibilityPage() {
  return (
    <div className="bg-white text-black min-h-screen">
      <section className="border-b border-black/10 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <span className="font-mono text-[9px] tracking-[0.3em] text-neutral-500 uppercase block mb-4">ZELIX / LEGAL</span>
          <h1 className="font-black text-[40px] md:text-[60px] uppercase tracking-wide leading-none mb-6">ACCESSIBILITY<br />STATEMENT</h1>
          <p className="font-mono text-[11px] text-neutral-500 tracking-wide">LAST UPDATED: JUNE 2025</p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-10">

          <div className="p-6 border border-black/10 rounded-sm bg-neutral-50">
            <p className="font-mono text-[11px] text-neutral-600 leading-relaxed tracking-wide">
              ZELIX IS COMMITTED TO ENSURING DIGITAL ACCESSIBILITY FOR PEOPLE WITH DISABILITIES. WE CONTINUALLY IMPROVE THE USER EXPERIENCE FOR EVERYONE AND APPLY RELEVANT ACCESSIBILITY STANDARDS.
            </p>
          </div>

          {[
            {
              title: 'OUR COMMITMENT',
              content: `We believe that everyone should be able to access fashion and shop with ease, regardless of ability. Our goal is to meet or exceed the requirements of the Web Content Accessibility Guidelines (WCAG) 2.1 at the AA conformance level.

We are actively working to increase accessibility and usability across our website.`,
            },
            {
              title: 'MEASURES WE HAVE TAKEN',
              content: `To ensure accessibility, ZELIX has taken the following measures:

• Semantic HTML structure for screen reader compatibility
• Sufficient color contrast ratios throughout the design
• Keyboard navigability across all interactive elements
• Clear focus indicators on buttons, links, and form fields
• Descriptive alt text on all product and content images
• Responsive design that works across all device sizes
• Font sizes that can be scaled using browser settings`,
            },
            {
              title: 'KNOWN LIMITATIONS',
              content: `While we strive for full accessibility, some content may not yet fully conform to WCAG 2.1 AA standards. We are working to resolve these limitations:

• Some third-party payment widgets (Razorpay) may have their own accessibility controls
• Older product images may not have optimal alt text descriptions
• Some video content may not yet have captions

We are committed to addressing these issues in future updates.`,
            },
            {
              title: 'TECHNICAL SPECIFICATIONS',
              content: `Our website relies on the following technologies for conformance:

• HTML5
• CSS3
• JavaScript (React/Next.js)
• WAI-ARIA for dynamic content

Our website has been tested with the following assistive technologies:

• NVDA + Chrome (Windows)
• VoiceOver + Safari (macOS/iOS)
• TalkBack + Chrome (Android)`,
            },
            {
              title: 'FEEDBACK AND CONTACT',
              content: `We welcome your feedback on the accessibility of the ZELIX website. If you encounter any accessibility barriers or have suggestions for improvement, please contact us:

Email: accessibility@zelix.store
Response time: Within 5 business days

We take all accessibility feedback seriously and will investigate reported issues promptly.`,
            },
          ].map((section, i) => (
            <div key={i} className="border-b border-black/5 pb-10 last:border-0">
              <h2 className="font-black text-[13px] uppercase tracking-widest mb-5 text-black">{section.title}</h2>
              <div className="font-mono text-[11px] text-neutral-600 leading-relaxed tracking-wide whitespace-pre-line">{section.content}</div>
            </div>
          ))}

          <div className="p-6 border border-black/10 rounded-sm">
            <p className="font-mono text-[10px] text-neutral-500 leading-relaxed tracking-wide">
              THIS STATEMENT WAS PREPARED ON JUNE 2025. IT WILL BE REVIEWED AND UPDATED ANNUALLY.{' '}
              <Link href="/contact-support" className="text-black underline underline-offset-4 hover:text-neutral-600 transition-colors">
                CONTACT SUPPORT →
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
