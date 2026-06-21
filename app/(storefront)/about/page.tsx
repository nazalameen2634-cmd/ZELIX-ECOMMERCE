import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'About ZELIX — The Design Lab',
  description: 'The story, vision, and philosophy behind ZELIX.',
};

const values = [
  { num: '01', title: 'DESIGN FIRST', desc: 'EVERY PIECE BEGINS WITH AN IDEA — A SHAPE, A TEXTURE, A FEELING. WE DESIGN FOR THOSE WHO SEE CLOTHING AS AN EXTENSION OF THEMSELVES.' },
  { num: '02', title: 'RADICAL QUALITY', desc: 'WE REFUSE TO COMPROMISE. EVERY FABRIC, EVERY STITCH, EVERY FINISH IS HELD TO AN UNCOMPROMISING STANDARD OF QUALITY AND DURABILITY.' },
  { num: '03', title: 'LIMITED DROPS', desc: 'WE PRODUCE IN CONTROLLED QUANTITIES. NOT FOR EXCLUSIVITY — BUT TO ENSURE EVERY PIECE RECEIVES THE ATTENTION IT DESERVES.' },
  { num: '04', title: 'ZERO WASTE MINDSET', desc: 'WE ARE WORKING TOWARD SUSTAINABLE PRODUCTION PRACTICES. MINIMAL OVERPRODUCTION. THOUGHTFUL MATERIALS. A CONSCIOUS FUTURE.' },
];

export default function AboutPage() {
  return (
    <div className="bg-black text-white min-h-screen">
      {/* Hero Statement */}
      <section className="py-24 px-6 border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <span className="font-mono text-[9px] tracking-[0.3em] text-neutral-500 uppercase block mb-8">EST. 2024 / INDIA</span>
          <h1 className="font-black text-[48px] md:text-[80px] uppercase tracking-tight leading-none mb-0">
            WE BUILD<br />FOR THE<br />CULTURE.
          </h1>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 px-6 border-b border-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <div>
            <span className="font-mono text-[9px] tracking-widest text-neutral-600 uppercase block mb-6">THE STORY</span>
            <h2 className="font-black text-[28px] uppercase leading-tight mb-8">
              BORN FROM<br />A DESIGN LAB
            </h2>
          </div>
          <div className="flex flex-col gap-5">
            <p className="font-mono text-[11px] text-neutral-400 leading-relaxed tracking-wide">
              ZELIX WAS FOUNDED WITH A SINGLE CONVICTION: THAT FASHION SHOULD FEEL INTENTIONAL. NOT REACTIVE. NOT TREND-CHASING. INTENTIONAL.
            </p>
            <p className="font-mono text-[11px] text-neutral-400 leading-relaxed tracking-wide">
              EVERY DROP IS ENGINEERED IN OUR DESIGN LAB — A SPACE WHERE SILHOUETTE, FABRIC WEIGHT, AND FINISH ARE OBSESSED OVER IN EQUAL MEASURE. WE BELIEVE THE CLOTHES YOU WEAR ARE A SIGNAL OF HOW YOU MOVE THROUGH THE WORLD.
            </p>
            <p className="font-mono text-[11px] text-neutral-400 leading-relaxed tracking-wide">
              WE ARE NOT FOR EVERYONE. WE ARE FOR THOSE WHO UNDERSTAND THAT WHAT YOU WEAR IS NOT DECORATION — IT IS AN ARCHITECTURAL CHOICE.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6 border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <span className="font-mono text-[9px] tracking-widest text-neutral-600 uppercase block mb-12">OUR PRINCIPLES</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5">
            {values.map((v, i) => (
              <div key={i} className="p-10 bg-black hover:bg-neutral-950 transition-colors">
                <span className="font-mono text-[9px] text-neutral-700 tracking-widest block mb-4">{v.num}</span>
                <h3 className="font-black text-[16px] uppercase tracking-wide mb-4">{v.title}</h3>
                <p className="font-mono text-[10px] text-neutral-500 leading-relaxed tracking-wide">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6 border-b border-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { num: '2024', label: 'YEAR FOUNDED' },
            { num: '100%', label: 'DESIGN-LED' },
            { num: 'INDIA', label: 'ORIGIN' },
            { num: '∞', label: 'ITERATIONS PER DROP' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="font-black text-[36px] md:text-[48px] tracking-tight mb-2">{stat.num}</div>
              <div className="font-mono text-[9px] text-neutral-600 tracking-widest uppercase">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="font-black text-[32px] md:text-[48px] uppercase tracking-wide mb-8">EXPLORE THE<br />COLLECTION</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="bg-white hover:bg-neutral-200 text-black font-mono text-[10px] font-bold tracking-widest px-10 py-4 rounded-full uppercase transition-all"
            >
              SHOP ALL PRODUCTS
            </Link>
            <Link
              href="/contact"
              className="border border-white/20 hover:border-white text-white font-mono text-[10px] font-bold tracking-widest px-10 py-4 rounded-full uppercase transition-all"
            >
              GET IN TOUCH
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
