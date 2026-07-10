const fs = require('fs');
const path = require('path');

// 1. Update Header.tsx
const headerPath = path.join(__dirname, 'components', 'storefront', 'Header.tsx');
let headerContent = fs.readFileSync(headerPath, 'utf8');

// Replace NAV_LINKS
const newNavLinks = `const NAV_LINKS = [
  { label: 'NEW IN', href: '/products?category=new-arrivals', sub: [] },
  { label: 'RINGS', href: '/products?category=rings', sub: [] },
  { label: 'NECKLACES', href: '/products?category=necklaces', sub: [] },
  { label: 'EARRINGS', href: '/products?category=earrings', sub: [] },
  { label: 'BRACELETS', href: '/products?category=bracelets', sub: [] },
  { label: 'COLLECTIONS', href: '/products?category=collections', sub: [] },
  { label: 'ABOUT', href: '/about', sub: [] },
];`;

headerContent = headerContent.replace(/const NAV_LINKS = \[[\s\S]*?\];/g, newNavLinks);

// Change Header layout (Logo Left, Nav Center, Icons Right)
headerContent = headerContent.replace(
  /{[\s]*\/\* Left — Desktop Nav \*\/[\s\S]*?<nav className="hidden lg:flex items-center gap-10 flex-1">/,
  `{/* Left — Brand wordmark */}
        <div className="flex-1 flex justify-start">
          <Link href="/" className="select-none group/logo">
            <span className="block font-serif text-[24px] md:text-[28px] font-bold tracking-[0.2em] text-foreground group-hover/logo:text-accent transition-colors duration-500 uppercase">
              ZELIX
            </span>
          </Link>
        </div>

        {/* Center — Desktop Nav */}
        <nav className="hidden lg:flex items-center justify-center gap-8 flex-[2]">`
);

// Remove the old Center — Brand wordmark section
headerContent = headerContent.replace(
  /{[\s]*\/\* Center — Brand wordmark \*\/[\s\S]*?<\/Link>/g,
  ``
);

fs.writeFileSync(headerPath, headerContent);


// 2. Update page.tsx
const pagePath = path.join(__dirname, 'app', '(storefront)', 'page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

// Add Lucide imports if not present
if (!pageContent.includes('Diamond')) {
    pageContent = pageContent.replace(/import { ArrowRight } from 'lucide-react';/, "import { ArrowRight, Diamond, ShieldCheck, Gift, Undo2 } from 'lucide-react';");
}

// Replace Hero Section
const heroSectionRegex = /{\/\* ═══════════════════════════════════\s*2\. HERO SECTION\s*═══════════════════════════════════ \*\/}[\s\S]*?<\/section>/g;
const newHero = `{/* ═══════════════════════════════════
          2. HERO SECTION
      ═══════════════════════════════════ */}
      <section ref={heroRef} className="relative w-full h-[90vh] min-h-[600px] flex items-center bg-[#FDFBF7]">
        {/* Background Image placed to the right */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#FDFBF7] via-[#FDFBF7]/90 to-transparent z-10 w-[70%]" />
          <img 
            src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1800&auto=format&fit=crop" 
            alt="Hero Background"
            className="w-full h-full object-cover object-right-bottom scale-[1.02]"
          />
        </div>

        {/* Content */}
        <div className="max-w-[1440px] mx-auto px-6 lg:px-16 relative z-20 w-full flex justify-between items-center mt-12">
          <div className="max-w-2xl flex flex-col items-start text-left">
            <span className="text-[#D99A9A] font-sans font-bold tracking-[0.15em] text-[10px] sm:text-xs uppercase mb-6">
              TIMELESS BEAUTY. MADE TO SHINE.
            </span>
            <h1 className="text-5xl sm:text-7xl lg:text-[85px] font-serif text-[#212121] leading-[1.05] tracking-tight mb-8">
              Fine Jewellery,<br />Forever Yours.
            </h1>
            <div className="w-12 h-[1px] bg-[#D99A9A] mb-8" />
            <p className="text-base sm:text-[15px] text-[#666666] max-w-md mb-10 leading-relaxed font-sans font-medium">
              Exquisite designs crafted with precision,<br />made for every moment that matters.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-8 py-4 bg-[#D99A9A] text-white font-sans font-semibold text-xs tracking-wider hover:bg-[#C98A8A] transition-colors shadow-sm"
              >
                EXPLORE COLLECTION
              </Link>
              <Link
                href="/products?category=new-arrivals"
                className="inline-flex items-center text-[#212121] font-sans font-semibold text-xs tracking-wider hover:text-[#D99A9A] transition-colors gap-3 border-b border-[#212121] hover:border-[#D99A9A] pb-1 uppercase"
              >
                VIEW NEW ARRIVALS <ArrowRight size={14} />
              </Link>
            </div>
          </div>
          
          {/* Right side carousel indicator */}
          <div className="hidden lg:flex flex-col items-center gap-4 text-[10px] font-sans font-semibold tracking-widest text-[#212121]/50 mr-8">
            <span className="text-[#212121]">01</span>
            <div className="h-16 w-[1px] bg-[#212121]/20 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#D99A9A]" />
            </div>
            <span>02</span>
            <span>03</span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          2.5 TRUST PILLARS
      ═══════════════════════════════════ */}
      <section className="py-10 bg-[#FDFBF7] border-b border-[#E8E3DC]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'PREMIUM QUALITY', body: 'Crafted with the finest materials', icon: <Diamond size={26} className="text-[#212121]" strokeWidth={1.2} /> },
              { title: 'LIFETIME WARRANTY', body: 'We stand by our promise', icon: <ShieldCheck size={26} className="text-[#212121]" strokeWidth={1.2} /> },
              { title: 'ELEGANT PACKAGING', body: 'Perfect for every occasion', icon: <Gift size={26} className="text-[#212121]" strokeWidth={1.2} /> },
              { title: 'EASY RETURNS', body: 'Hassle-free 7 day returns', icon: <Undo2 size={26} className="text-[#212121]" strokeWidth={1.2} /> },
            ].map((pillar, i) => (
              <div key={i} className="flex items-center gap-5 lg:justify-center border-b sm:border-b-0 lg:border-r border-[#E8E3DC] pb-6 sm:pb-0 last:border-0 pr-4">
                <div className="shrink-0">{pillar.icon}</div>
                <div className="flex flex-col">
                  <h4 className="font-sans font-bold text-[10px] tracking-widest text-[#212121] uppercase mb-1">{pillar.title}</h4>
                  <p className="font-sans text-[11px] font-medium text-[#666666]">{pillar.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>`;

pageContent = pageContent.replace(heroSectionRegex, newHero);

// Remove the old Trust Pillars section
const oldTrustRegex = /{\/\* ═══════════════════════════════════\s*5\. TRUST PILLARS\s*═══════════════════════════════════ \*\/}[\s\S]*?<\/section>/g;
pageContent = pageContent.replace(oldTrustRegex, '');

fs.writeFileSync(pagePath, pageContent);

console.log("Layout successfully updated to match the reference design.");
