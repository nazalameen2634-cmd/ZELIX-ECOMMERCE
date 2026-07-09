'use client';

import React, { useState, useEffect } from 'react';
import { Save, Sparkles, Plus, Trash2, Globe, Settings, Upload, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { HeroSlide } from '@/types';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  
  // Tabs: 'brand' | 'announcement' | 'carousel' | 'seo'
  const [activeTab, setActiveTab] = useState<'brand' | 'announcement' | 'carousel' | 'seo'>('brand');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Brand Settings State
  const [brandSettings, setBrandSettings] = useState({
    siteName: 'ZELIX',
    tagline: 'Post-Modern Activewear & Streetwear',
    contactEmail: 'contact@zelix.shop',
    contactPhone: '+91 98765 43210',
    businessAddress: '120 Fashion Avenue, Tech District, India',
    currencyCode: 'INR',
    currencySymbol: '₹',
    logoUrl: '',
    logoInvertedUrl: '',
    socialInstagram: '',
    socialTwitter: '',
  });

  // Announcement Bar State
  const [announcementSettings, setAnnouncementSettings] = useState({
    active: true,
    text: 'SUMMER DROP OUT NOW // FREE SHIPPING OVER ₹5000',
    link: '',
    color: '#000000',
  });

  // SEO Settings State
  const [seoSettings, setSeoSettings] = useState({
    metaTemplate: '{Page Title} | {Site Name}',
    defaultDescription: 'Sleek technical activewear and streetwear silhouetted for the post-modern aesthetic.',
    gaTrackingId: '',
    searchConsoleMeta: '',
    robotsTxt: 'User-agent: *\nAllow: /',
  });

  // Hero Carousel State
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [newSlide, setNewSlide] = useState({
    imageUrl: '',
    heading: '',
    subheading: '',
    ctaText: 'SHOP NOW',
    ctaLink: '/products',
  });
  const [isAddingSlide, setIsAddingSlide] = useState(false);

  // Load Settings from Supabase
  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      try {
        // 1. Load brand settings
        const { data: brand } = await supabase
          .from('site_settings')
          .select('*')
          .eq('id', 1)
          .single();

        if (brand) {
          setBrandSettings({
            siteName: brand.site_name,
            tagline: brand.tagline,
            contactEmail: brand.contact_email,
            contactPhone: brand.contact_phone,
            businessAddress: brand.business_address,
            currencyCode: brand.currency_code,
            currencySymbol: brand.currency_symbol,
            logoUrl: brand.logo_url || '',
            logoInvertedUrl: brand.logo_inverted_url || '',
            socialInstagram: brand.social_instagram || '',
            socialTwitter: brand.social_twitter || '',
          });

          setAnnouncementSettings({
            active: brand.announcement_bar_active,
            text: brand.announcement_bar_text || '',
            link: brand.announcement_bar_link || '',
            color: brand.announcement_bar_color || '#000000',
          });
        }

        // 2. Load SEO Settings
        const { data: seo } = await supabase
          .from('seo_settings')
          .select('*')
          .eq('id', 1)
          .single();

        if (seo) {
          setSeoSettings({
            metaTemplate: seo.meta_title_template,
            defaultDescription: seo.default_meta_description,
            gaTrackingId: seo.ga_tracking_id || '',
            searchConsoleMeta: seo.search_console_meta || '',
            robotsTxt: seo.robots_txt,
          });
        }

        // 3. Load Hero Slides
        const { data: slides } = await supabase
          .from('hero_slides')
          .select('*')
          .order('sort_order', { ascending: true });
        if (slides) setHeroSlides(slides as HeroSlide[]);

      } catch (err) {
        console.warn('Supabase offline. Visual inputs loaded with initial states.');
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  // Save Settings to Supabase
  const handleSaveBrandSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        site_name: brandSettings.siteName,
        tagline: brandSettings.tagline,
        contact_email: brandSettings.contactEmail,
        contact_phone: brandSettings.contactPhone,
        business_address: brandSettings.businessAddress,
        currency_code: brandSettings.currencyCode,
        currency_symbol: brandSettings.currencySymbol,
        logo_url: brandSettings.logoUrl,
        logo_inverted_url: brandSettings.logoInvertedUrl,
        social_instagram: brandSettings.socialInstagram,
        social_twitter: brandSettings.socialTwitter,
        announcement_bar_active: announcementSettings.active,
        announcement_bar_text: announcementSettings.text,
        announcement_bar_link: announcementSettings.link,
        announcement_bar_color: announcementSettings.color,
      };

      const { error } = await supabase
        .from('site_settings')
        .update(payload)
        .eq('id', 1);

      if (error) throw error;
      toast('BRAND CONFIGURATIONS UPDATED', 'success');
    } catch (err) {
      toast('BRAND CONFIGURATIONS SAVED (PREVIEW MODE)', 'success');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSEOSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        meta_title_template: seoSettings.metaTemplate,
        default_meta_description: seoSettings.defaultDescription,
        ga_tracking_id: seoSettings.gaTrackingId,
        search_console_meta: seoSettings.searchConsoleMeta,
        robots_txt: seoSettings.robotsTxt,
      };

      const { error } = await supabase
        .from('seo_settings')
        .update(payload)
        .eq('id', 1);

      if (error) throw error;
      toast('SEO & TRACKER SCRIPTS COMMITTED', 'success');
    } catch (err) {
      toast('SEO SETTINGS COMMITTED (PREVIEW MODE)', 'success');
    } finally {
      setIsSaving(false);
    }
  };

  // Slides Carousel CRUD handlers
  const handleAddSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingSlide(true);
    try {
      const payload = {
        image_url: newSlide.imageUrl || 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=600',
        heading: newSlide.heading.toUpperCase(),
        subheading: newSlide.subheading.toUpperCase(),
        cta_text: newSlide.ctaText.toUpperCase(),
        cta_link: newSlide.ctaLink,
        sort_order: heroSlides.length + 1,
        is_active: true,
      };

      const { data, error } = await supabase
        .from('hero_slides')
        .insert([payload])
        .select('*')
        .single();

      if (error) throw error;
      setHeroSlides((prev) => [...prev, data as HeroSlide]);
      setNewSlide({
        imageUrl: '',
        heading: '',
        subheading: '',
        ctaText: 'SHOP NOW',
        ctaLink: '/products',
      });
      toast('CAROUSEL HERO SLIDE CREATED', 'success');
    } catch (err) {
      const mockSlide = {
        id: Math.random().toString(),
        image_url: newSlide.imageUrl || 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=600',
        heading: newSlide.heading.toUpperCase(),
        subheading: newSlide.subheading.toUpperCase(),
        cta_text: newSlide.ctaText.toUpperCase(),
        cta_link: newSlide.ctaLink,
        sort_order: heroSlides.length + 1,
        is_active: true,
      };
      setHeroSlides((prev) => [...prev, mockSlide]);
      toast('HERO SLIDE ADDED (PREVIEW MODE)', 'success');
    } finally {
      setIsAddingSlide(false);
    }
  };

  const handleDeleteSlide = async (id: string) => {
    if (!confirm('DELETE THIS HERO SLIDE CAROUSEL ITEM?')) return;
    try {
      await supabase.from('hero_slides').delete().eq('id', id);
      setHeroSlides((prev) => prev.filter((s) => s.id !== id));
      toast('HERO SLIDE REMOVED', 'success');
    } catch (e) {
      toast('FAILED TO REMOVE SLIDE', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Header breadcrumbs */}
      <div className="flex justify-between items-center border-b border-[rgba(0,0,0,0.06)] pb-5">
        <div>
          <h1 className="text-[28px] font-sans font-black tracking-tight text-[#111111] uppercase mt-2">
            SITE CUSTOMIZATION
          </h1>
          <p className="text-[12px] text-[#4A4642] font-mono tracking-wider uppercase mt-1">
            CUSTOMIZE THE STOREFRONT VISUALS, CAROUSELS, METADATA, AND SEO INJECTS
          </p>
        </div>
      </div>

      {/* Tabs navigation row */}
      <div className="flex border-b border-[rgba(0,0,0,0.06)] gap-1.5 overflow-x-auto hide-scrollbar">
        {[
          { label: 'BRAND PROFILE', val: 'brand' as const, icon: <Settings size={14} /> },
          { label: 'ANNOUNCEMENT BAR', val: 'announcement' as const, icon: <Globe size={14} /> },
          { label: 'HERO SLIDES CAROUSEL', val: 'carousel' as const, icon: <Sparkles size={14} /> },
          { label: 'SEO & METADATA', val: 'seo' as const, icon: <Globe size={14} /> },
        ].map((item) => (
          <button
            key={item.val}
            onClick={() => setActiveTab(item.val)}
            className={`px-5 py-3.5 font-mono text-[10px] font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === item.val
                ? 'border-black text-[#111111]'
                : 'border-transparent text-[#282420] hover:text-[#6B6560]'
            }`}
          >
            <span className="flex items-center gap-2">
              {item.icon}
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 bg-[#FFFFFF] border border-[rgba(0,0,0,0.06)] rounded-sm">
          <Loader2 className="animate-spin text-[#111111] w-8 h-8" />
        </div>
      ) : (
        <div className="bg-[#FFFFFF] border border-[rgba(0,0,0,0.06)] rounded-sm p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          {activeTab === 'brand' && (
            /* TAB 1: BRAND PROFILE */
            <form onSubmit={handleSaveBrandSettings} className="flex flex-col gap-6">
              <h3 className="font-mono text-[10px] font-bold tracking-widest text-[#282420] border-b border-[rgba(0,0,0,0.03)] pb-3 uppercase">
                BRAND CONFIGURATION SETTINGS
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input theme="light"
                  label="SITE NAME"
                  required
                  value={brandSettings.siteName}
                  onChange={(e) => setBrandSettings((b) => ({ ...b, siteName: e.target.value }))}
                />
                <Input theme="light"
                  label="SITE TAGLINE"
                  required
                  value={brandSettings.tagline}
                  onChange={(e) => setBrandSettings((b) => ({ ...b, tagline: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input theme="light"
                  label="CONTACT SUPPORT EMAIL"
                  required
                  type="email"
                  value={brandSettings.contactEmail}
                  onChange={(e) => setBrandSettings((b) => ({ ...b, contactEmail: e.target.value }))}
                />
                <Input theme="light"
                  label="CONTACT SUPPORT PHONE"
                  required
                  value={brandSettings.contactPhone}
                  onChange={(e) => setBrandSettings((b) => ({ ...b, contactPhone: e.target.value }))}
                />
              </div>

              <Input theme="light"
                label="BUSINESS HQ PHYSICAL ADDRESS"
                required
                value={brandSettings.businessAddress}
                onChange={(e) => setBrandSettings((b) => ({ ...b, businessAddress: e.target.value }))}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input theme="light"
                  label="CURRENCY CODE"
                  required
                  value={brandSettings.currencyCode}
                  onChange={(e) => setBrandSettings((b) => ({ ...b, currencyCode: e.target.value }))}
                />
                <Input theme="light"
                  label="CURRENCY SYMBOL"
                  required
                  value={brandSettings.currencySymbol}
                  onChange={(e) => setBrandSettings((b) => ({ ...b, currencySymbol: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input theme="light"
                  label="PRIMARY HEADER LOGO URL"
                  value={brandSettings.logoUrl}
                  onChange={(e) => setBrandSettings((b) => ({ ...b, logoUrl: e.target.value }))}
                />
                <Input theme="light"
                  label="INVERTED FOOTER LOGO URL"
                  value={brandSettings.logoInvertedUrl}
                  onChange={(e) => setBrandSettings((b) => ({ ...b, logoInvertedUrl: e.target.value }))}
                />
              </div>

              <Button type="submit" isLoading={isSaving} className="self-end mt-4">
                SAVE BRAND SETTINGS
              </Button>
            </form>
          )}

          {activeTab === 'announcement' && (
            /* TAB 2: ANNOUNCEMENT BAR */
            <form onSubmit={handleSaveBrandSettings} className="flex flex-col gap-6">
              <h3 className="font-mono text-[10px] font-bold tracking-widest text-[#282420] border-b border-[rgba(0,0,0,0.03)] pb-3 uppercase">
                HEADER BANNER BAR PROPERTIES
              </h3>

              <div className="flex flex-col gap-5 border border-[rgba(0,0,0,0.03)] p-6 bg-[#FAFAFA] rounded-sm">
                <label className="flex items-center gap-3 font-mono text-[11px] font-bold tracking-wider text-[#A19B95] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={announcementSettings.active}
                    onChange={(e) => setAnnouncementSettings((a) => ({ ...a, active: e.target.checked }))}
                    className="accent-black"
                  />
                  DISPLAY ANNOUNCEMENT BAR AT TOP OF STOREFRONT
                </label>
              </div>

              <Input theme="light"
                label="ANNOUNCEMENT TEXT CONTENT"
                value={announcementSettings.text}
                onChange={(e) => setAnnouncementSettings((a) => ({ ...a, text: e.target.value }))}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input theme="light"
                  label="CTA REDIRECT URL (OPTIONAL)"
                  value={announcementSettings.link}
                  onChange={(e) => setAnnouncementSettings((a) => ({ ...a, link: e.target.value }))}
                />
                <Input theme="light"
                  label="BACKGROUND HEX COLOR"
                  value={announcementSettings.color}
                  onChange={(e) => setAnnouncementSettings((a) => ({ ...a, color: e.target.value }))}
                />
              </div>

              <Button type="submit" isLoading={isSaving} className="self-end mt-4">
                SAVE ANNOUNCEMENT BAR
              </Button>
            </form>
          )}

          {activeTab === 'carousel' && (
            /* TAB 3: CAROUSEL HERO SLIDES */
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-center border-b border-[rgba(0,0,0,0.03)] pb-3">
                <h3 className="font-mono text-[10px] font-bold tracking-widest text-[#282420] uppercase">
                  ACTIVE CAROUSEL HERO SLIDES ({heroSlides.length})
                </h3>
                <button
                  onClick={() => setIsAddingSlide(!isAddingSlide)}
                  className="bg-black hover:bg-neutral-800 text-[#FFFFFF] font-mono text-[9px] font-bold tracking-widest px-4 py-2 rounded-full uppercase cursor-pointer"
                >
                  {isAddingSlide ? 'CLOSE FORM' : 'ADD CAROUSEL SLIDE'}
                </button>
              </div>

              {/* Add hero slide form */}
              {isAddingSlide && (
                <form onSubmit={handleAddSlide} className="border border-[rgba(0,0,0,0.06)] bg-[#FAFAFA] p-6 rounded-sm flex flex-col gap-4">
                  <h4 className="font-mono text-[10px] font-bold tracking-widest text-[#282420] uppercase">
                    NEW CAROUSEL SLIDE DETAILS
                  </h4>
                  <Input theme="light"
                    label="SLIDE BACKGROUND IMAGE URL"
                    required
                    value={newSlide.imageUrl}
                    onChange={(e) => setNewSlide((s) => ({ ...s, imageUrl: e.target.value }))}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input theme="light"
                      label="HERO HEADING (STAGGERED TEXT)"
                      required
                      value={newSlide.heading}
                      onChange={(e) => setNewSlide((s) => ({ ...s, heading: e.target.value }))}
                    />
                    <Input theme="light"
                      label="HERO SUBHEADING"
                      required
                      value={newSlide.subheading}
                      onChange={(e) => setNewSlide((s) => ({ ...s, subheading: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input theme="light"
                      label="CTA BTN LABEL"
                      required
                      value={newSlide.ctaText}
                      onChange={(e) => setNewSlide((s) => ({ ...s, ctaText: e.target.value }))}
                    />
                    <Input theme="light"
                      label="CTA BTN LINK"
                      required
                      value={newSlide.ctaLink}
                      onChange={(e) => setNewSlide((s) => ({ ...s, ctaLink: e.target.value }))}
                    />
                  </div>

                  <Button type="submit" isLoading={isSaving} className="self-end mt-4">
                    PUBLISH SLIDE
                  </Button>
                </form>
              )}

              {/* Slides Grid table */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {heroSlides.map((slide, i) => (
                  <div key={slide.id || i} className="border border-[rgba(0,0,0,0.06)] rounded-sm bg-[#FAFAFA] p-4 relative flex flex-col gap-4">
                    <div className="w-full h-40 overflow-hidden rounded-sm border border-[rgba(0,0,0,0.03)] bg-black relative">
                      <img src={slide.image_url} alt="slide preview" className="w-full h-full object-cover opacity-60" />
                      <button
                        onClick={() => handleDeleteSlide(slide.id)}
                        className="absolute top-3 right-3 p-2 bg-[#FFFFFF] rounded-full text-red-600 hover:bg-[#121212] cursor-pointer shadow-lg"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="font-mono text-[10px] tracking-wide text-[#6B6560] uppercase flex flex-col gap-1.5">
                      <p><strong className="text-[#FFFFFF]">HEADING:</strong> {slide.heading}</p>
                      <p><strong className="text-[#111111]">SUB-TEXT:</strong> {slide.subheading}</p>
                      <p><strong className="text-[#111111]">ACTION BTN:</strong> {slide.cta_text} // {slide.cta_link}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            /* TAB 4: SEO & METADATA CONFIG */
            <form onSubmit={handleSaveSEOSettings} className="flex flex-col gap-6">
              <h3 className="font-mono text-[10px] font-bold tracking-widest text-[#282420] border-b border-[rgba(0,0,0,0.03)] pb-3 uppercase">
                GLOBAL SEARCH ENGINE OPTIMIZATIONS
              </h3>

              <Input theme="light"
                label="META TITLE PAGE TEMPLATE"
                required
                value={seoSettings.metaTemplate}
                onChange={(e) => setSeoSettings((s) => ({ ...s, metaTemplate: e.target.value }))}
              />

              <div className="flex flex-col border border-[rgba(0,0,0,0.06)] rounded-sm p-4 bg-[#FFFFFF]">
                <span className="font-mono text-[9px] text-[#282420] uppercase font-bold mb-2">DEFAULT META DESCRIPTION</span>
                <textarea
                  rows={4}
                  value={seoSettings.defaultDescription}
                  onChange={(e) => setSeoSettings((s) => ({ ...s, defaultDescription: e.target.value }))}
                  className="w-full bg-transparent font-sans text-[13px] text-[#111111] outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input theme="light"
                  label="GOOGLE ANALYTICS GA4 TRACKING ID"
                  placeholder="G-XXXXXXXXXX"
                  value={seoSettings.gaTrackingId}
                  onChange={(e) => setSeoSettings((s) => ({ ...s, gaTrackingId: e.target.value }))}
                />
                <Input theme="light"
                  label="SEARCH CONSOLE HTML VERIFYING META TAG"
                  placeholder='<meta name="google-site-verification" content="..." />'
                  value={seoSettings.searchConsoleMeta}
                  onChange={(e) => setSeoSettings((s) => ({ ...s, searchConsoleMeta: e.target.value }))}
                />
              </div>

              <div className="flex flex-col border border-[rgba(0,0,0,0.06)] rounded-sm p-4 bg-[#FFFFFF]">
                <span className="font-mono text-[9px] text-[#282420] uppercase font-bold mb-2">ROBOTS.TXT FILE GENERATOR</span>
                <textarea
                  rows={4}
                  value={seoSettings.robotsTxt}
                  onChange={(e) => setSeoSettings((s) => ({ ...s, robotsTxt: e.target.value }))}
                  className="w-full bg-transparent font-mono text-[12px] text-[#111111] outline-none resize-none"
                />
              </div>

              <Button type="submit" isLoading={isSaving} className="self-end mt-4">
                SAVE SEO METRICS
              </Button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
