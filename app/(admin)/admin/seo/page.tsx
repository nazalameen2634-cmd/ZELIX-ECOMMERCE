'use client';

import React, { useState, useEffect } from 'react';
import { Globe, Settings, FileText, CheckCircle2, Save, Plus, Trash2, Edit2, Search, X, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';

interface GlobalSEOSettings {
  meta_title_template: string;
  default_meta_description: string;
  og_default_image_url: string | null;
  ga_tracking_id: string | null;
  fb_pixel_id: string | null;
  search_console_meta: string | null;
  robots_txt: string;
}

interface PageSEO {
  id: string;
  page_slug: string;
  meta_title: string;
  meta_description: string;
  og_image_url: string | null;
}

const DEFAULT_GLOBAL: GlobalSEOSettings = {
  meta_title_template: '{Page Title} | {Site Name}',
  default_meta_description: 'Sleek technical activewear and streetwear silhouetted for the post-modern aesthetic.',
  og_default_image_url: '',
  ga_tracking_id: 'G-XXXXXXXXXX',
  fb_pixel_id: '1234567890',
  search_console_meta: '',
  robots_txt: 'User-agent: *\nAllow: /\nSitemap: https://zelix.shop/sitemap.xml',
};

const MOCK_PAGES: PageSEO[] = [
  {
    id: 'p1',
    page_slug: '/',
    meta_title: 'ZELIX // Post-Modern Technical Apparel',
    meta_description: 'Heavyweight shells, modular pockets, and activewear engineered for urban resistance.',
    og_image_url: '',
  },
  {
    id: 'p2',
    page_slug: '/products',
    meta_title: 'Catalog Index // Technical Drops',
    meta_description: 'Explore the catalog containing core drops, high-membrane garments, and performance accessories.',
    og_image_url: '',
  },
  {
    id: 'p3',
    page_slug: '/about',
    meta_title: 'About the Label // Design Philosophy',
    meta_description: 'Discover the manufacturing criteria, laboratory tests, and design metrics behind the label.',
    og_image_url: '',
  },
];

export default function AdminSEO() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'global' | 'pages'>('global');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Global Config form states
  const [globalConfig, setGlobalConfig] = useState<GlobalSEOSettings>(DEFAULT_GLOBAL);

  // Page Override lists & forms
  const [pageSEOList, setPageSEOList] = useState<PageSEO[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditingPage, setIsEditingPage] = useState(false);
  const [editPageId, setEditPageId] = useState<string | null>(null);
  
  // Page SEO Form
  const [pageSlug, setPageSlug] = useState('');
  const [pageMetaTitle, setPageMetaTitle] = useState('');
  const [pageMetaDescription, setPageMetaDescription] = useState('');
  const [pageOgImage, setPageOgImage] = useState('');

  useEffect(() => {
    loadSEODetails();
  }, []);

  async function loadSEODetails() {
    setLoading(true);
    try {
      // 1. Fetch Global Settings
      const { data: globalData, error: globalErr } = await supabase
        .from('seo_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (globalErr && globalErr.code !== 'PGRST116') {
        throw globalErr;
      }

      if (globalData) {
        setGlobalConfig({
          meta_title_template: globalData.meta_title_template,
          default_meta_description: globalData.default_meta_description,
          og_default_image_url: globalData.og_default_image_url || '',
          ga_tracking_id: globalData.ga_tracking_id || '',
          fb_pixel_id: globalData.fb_pixel_id || '',
          search_console_meta: globalData.search_console_meta || '',
          robots_txt: globalData.robots_txt,
        });
      } else {
        setGlobalConfig(DEFAULT_GLOBAL);
      }

      // 2. Fetch Page SEOs
      const { data: pagesData, error: pagesErr } = await supabase
        .from('page_seo')
        .select('*');

      if (pagesErr) throw pagesErr;

      if (pagesData && pagesData.length > 0) {
        setPageSEOList(pagesData as PageSEO[]);
      } else {
        setPageSEOList(MOCK_PAGES);
      }
    } catch (err) {
      console.warn('Unable to retrieve Supabase SEO variables. Loading mock configurations.', err);
      setGlobalConfig(DEFAULT_GLOBAL);
      setPageSEOList(MOCK_PAGES);
    } finally {
      setLoading(false);
    }
  }

  const handleGlobalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const payload = {
      id: 1,
      meta_title_template: globalConfig.meta_title_template,
      default_meta_description: globalConfig.default_meta_description,
      og_default_image_url: globalConfig.og_default_image_url || null,
      ga_tracking_id: globalConfig.ga_tracking_id || null,
      fb_pixel_id: globalConfig.fb_pixel_id || null,
      search_console_meta: globalConfig.search_console_meta || null,
      robots_txt: globalConfig.robots_txt,
    };

    try {
      const { error } = await supabase
        .from('seo_settings')
        .upsert(payload, { onConflict: 'id' });

      if (error) throw error;
      toast('Global SEO configurations committed to database', 'success');
    } catch (err) {
      toast('Simulated: Global SEO configurations saved offline', 'success');
    } finally {
      setSaving(false);
    }
  };

  const handlePageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageSlug.trim() || !pageMetaTitle.trim() || !pageMetaDescription.trim()) {
      toast('Slug, Title, and Description are required parameters', 'error');
      return;
    }

    const payload = {
      page_slug: pageSlug.trim().toLowerCase(),
      meta_title: pageMetaTitle.trim(),
      meta_description: pageMetaDescription.trim(),
      og_image_url: pageOgImage.trim() || null,
    };

    try {
      if (editPageId) {
        // Update
        const { error } = await supabase
          .from('page_seo')
          .update(payload)
          .eq('id', editPageId);

        if (error) throw error;

        setPageSEOList(
          pageSEOList.map((p) => (p.id === editPageId ? { ...p, ...payload } : p))
        );
        toast('Page override metadata updated', 'success');
      } else {
        // Insert
        const newId = crypto.randomUUID();
        const { data, error } = await supabase
          .from('page_seo')
          .insert([{ ...payload, id: newId }])
          .select();

        if (error) throw error;

        const inserted = data ? data[0] : { ...payload, id: newId };
        setPageSEOList([...pageSEOList, inserted as PageSEO]);
        toast('New page override metadata generated', 'success');
      }
      handleCancelPage();
    } catch (err: any) {
      // Offline fallback state update
      if (editPageId) {
        setPageSEOList(
          pageSEOList.map((p) => (p.id === editPageId ? { ...p, ...payload } : p))
        );
        toast('Simulated: Page override updated offline', 'success');
      } else {
        const fallbackNew: PageSEO = {
          id: Math.random().toString(),
          page_slug: payload.page_slug,
          meta_title: payload.meta_title,
          meta_description: payload.meta_description,
          og_image_url: payload.og_image_url,
        };
        setPageSEOList([...pageSEOList, fallbackNew]);
        toast('Simulated: Page override added offline', 'success');
      }
      handleCancelPage();
    }
  };

  const handleEditPageClick = (page: PageSEO) => {
    setIsEditingPage(true);
    setEditPageId(page.id);
    setPageSlug(page.page_slug);
    setPageMetaTitle(page.meta_title);
    setPageMetaDescription(page.meta_description);
    setPageOgImage(page.og_image_url || '');
  };

  const handleCancelPage = () => {
    setIsEditingPage(false);
    setEditPageId(null);
    setPageSlug('');
    setPageMetaTitle('');
    setPageMetaDescription('');
    setPageOgImage('');
  };

  const handleDeletePage = async (id: string) => {
    if (!confirm('Are you sure you want to remove this page SEO override?')) return;

    try {
      const { error } = await supabase.from('page_seo').delete().eq('id', id);
      if (error) throw error;

      setPageSEOList(pageSEOList.filter((p) => p.id !== id));
      toast('Page SEO override deleted', 'success');
    } catch (err) {
      setPageSEOList(pageSEOList.filter((p) => p.id !== id));
      toast('Simulated: Page override removed offline', 'success');
    }
  };

  // Previews template formatting
  const previewFormattedTitle = (pageTitle: string) => {
    return globalConfig.meta_title_template
      .replace('{Page Title}', pageTitle)
      .replace('{Site Name}', 'ZELIX');
  };

  const filteredPages = pageSEOList.filter((p) =>
    p.page_slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.meta_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[rgba(245,240,235,0.06)] pb-5">
        <div>
          <h1 className="text-[28px] font-sans font-black tracking-tight text-[#F5F0EB] uppercase mt-2">
            SEO & META CONSOLE
          </h1>
          <p className="text-[12px] text-[#4A4642] font-mono tracking-wider uppercase mt-1">
            OPTIMIZE SEARCH INDEX VISIBILITY, TRACK SCRIPT PIXELS, AND SET ROUTE OVERRIDES
          </p>
        </div>

        {/* Tab triggers */}
        <div className="flex bg-[#121212] p-0.5 rounded-sm border border-[rgba(245,240,235,0.06)]">
          <button
            onClick={() => setActiveTab('global')}
            className={`px-4 py-2 font-mono text-[9px] font-bold tracking-wider uppercase transition-all rounded-sm cursor-pointer ${
              activeTab === 'global' ? 'bg-[#0F0F0F] text-[#F5F0EB] shadow-sm' : 'text-[#4A4642] hover:text-[#F5F0EB]'
            }`}
          >
            GLOBAL PARAMS
          </button>
          <button
            onClick={() => setActiveTab('pages')}
            className={`px-4 py-2 font-mono text-[9px] font-bold tracking-wider uppercase transition-all rounded-sm cursor-pointer ${
              activeTab === 'pages' ? 'bg-[#0F0F0F] text-[#F5F0EB] shadow-sm' : 'text-[#4A4642] hover:text-[#F5F0EB]'
            }`}
          >
            PAGE OVERRIDES
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 bg-[#0F0F0F] border border-[rgba(245,240,235,0.06)] rounded-sm">
          <Loader2 className="animate-spin text-[#F5F0EB] w-8 h-8" />
        </div>
      ) : activeTab === 'global' ? (
        /* Tab 1: Global Configurations */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Form Fields */}
          <form onSubmit={handleGlobalSubmit} className="lg:col-span-8 bg-[#0F0F0F] border border-[rgba(245,240,235,0.06)] rounded-sm p-6 flex flex-col gap-5">
            <h3 className="font-mono text-[10px] font-bold tracking-widest text-[#282420] border-b border-[rgba(245,240,235,0.03)] pb-3 uppercase flex items-center gap-2">
              <Settings size={12} /> CORE GLOBAL SPECIFICATIONS
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-mono font-bold tracking-widest text-[#282420] uppercase mb-1.5">
                  TITLE FORMAT TEMPLATE *
                </label>
                <input
                  type="text"
                  value={globalConfig.meta_title_template}
                  onChange={(e) => setGlobalConfig({ ...globalConfig, meta_title_template: e.target.value })}
                  placeholder="{Page Title} | {Site Name}"
                  className="w-full text-[13px] bg-[#0F0F0F] border border-[rgba(245,240,235,0.06)] rounded-sm px-3.5 py-2.5 outline-none focus:border-[#C9A96E] transition-colors font-mono"
                  required
                />
                <span className="text-[10px] font-mono text-[#282420] mt-1 block">
                  Format tags supported: {"{Page Title}"}, {"{Site Name}"}
                </span>
              </div>

              <div>
                <label className="block text-[9px] font-mono font-bold tracking-widest text-[#282420] uppercase mb-1.5">
                  DEFAULT OG (SOCIAL CARD) IMAGE URL
                </label>
                <input
                  type="text"
                  value={globalConfig.og_default_image_url || ''}
                  onChange={(e) => setGlobalConfig({ ...globalConfig, og_default_image_url: e.target.value })}
                  placeholder="https://zelix.shop/og-default.jpg"
                  className="w-full text-[13px] bg-[#0F0F0F] border border-[rgba(245,240,235,0.06)] rounded-sm px-3.5 py-2.5 outline-none focus:border-[#C9A96E] transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-mono font-bold tracking-widest text-[#282420] uppercase mb-1.5">
                DEFAULT METADATA DESCRIPTION *
              </label>
              <textarea
                value={globalConfig.default_meta_description}
                onChange={(e) => setGlobalConfig({ ...globalConfig, default_meta_description: e.target.value })}
                placeholder="Fallback description tags..."
                rows={3}
                className="w-full text-[13px] bg-[#0F0F0F] border border-[rgba(245,240,235,0.06)] rounded-sm px-3.5 py-2.5 outline-none focus:border-[#C9A96E] transition-colors"
                required
              />
            </div>

            <h3 className="font-mono text-[10px] font-bold tracking-widest text-[#282420] border-b border-[rgba(245,240,235,0.03)] pb-3 mt-4 uppercase flex items-center gap-2">
              <Sparkles size={12} /> ANALYTICS & PIXEL CODES
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-mono font-bold tracking-widest text-[#282420] uppercase mb-1.5">
                  GOOGLE ANALYTICS TRACKING ID (GA4)
                </label>
                <input
                  type="text"
                  value={globalConfig.ga_tracking_id || ''}
                  onChange={(e) => setGlobalConfig({ ...globalConfig, ga_tracking_id: e.target.value })}
                  placeholder="G-XXXXXXXXXX"
                  className="w-full text-[13px] bg-[#0F0F0F] border border-[rgba(245,240,235,0.06)] rounded-sm px-3.5 py-2.5 outline-none focus:border-[#C9A96E] transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono font-bold tracking-widest text-[#282420] uppercase mb-1.5">
                  FACEBOOK META PIXEL ID
                </label>
                <input
                  type="text"
                  value={globalConfig.fb_pixel_id || ''}
                  onChange={(e) => setGlobalConfig({ ...globalConfig, fb_pixel_id: e.target.value })}
                  placeholder="1234567890..."
                  className="w-full text-[13px] bg-[#0F0F0F] border border-[rgba(245,240,235,0.06)] rounded-sm px-3.5 py-2.5 outline-none focus:border-[#C9A96E] transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-mono font-bold tracking-widest text-[#282420] uppercase mb-1.5">
                GOOGLE SEARCH CONSOLE VERIFICATION META STRING
              </label>
              <input
                type="text"
                value={globalConfig.search_console_meta || ''}
                onChange={(e) => setGlobalConfig({ ...globalConfig, search_console_meta: e.target.value })}
                placeholder='<meta name="google-site-verification" content="..." />'
                className="w-full text-[13px] bg-[#0F0F0F] border border-[rgba(245,240,235,0.06)] rounded-sm px-3.5 py-2.5 outline-none focus:border-[#C9A96E] transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-[9px] font-mono font-bold tracking-widest text-[#282420] uppercase mb-1.5">
                CRAWLER SYSTEM RESTRICTIONS (ROBOTS.TXT) *
              </label>
              <textarea
                value={globalConfig.robots_txt}
                onChange={(e) => setGlobalConfig({ ...globalConfig, robots_txt: e.target.value })}
                placeholder="User-agent: *"
                rows={4}
                className="w-full text-[13px] bg-[#0F0F0F] border border-[rgba(245,240,235,0.06)] rounded-sm px-3.5 py-2.5 outline-none focus:border-[#C9A96E] transition-colors font-mono"
                required
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="py-3 px-6 bg-black text-white hover:bg-neutral-900 transition-colors rounded-sm text-[11px] font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-1.5 cursor-pointer ml-auto disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={13} /> COMMITTING...
                </>
              ) : (
                <>
                  <Save size={13} /> COMMIT GLOBALS
                </>
              )}
            </button>
          </form>

          {/* Sidebar Preview */}
          <div className="lg:col-span-4 bg-neutral-950 text-white rounded-sm p-6 flex flex-col gap-6">
            <h3 className="font-mono text-[10px] font-bold tracking-widest text-[#282420] border-b border-white/10 pb-3 uppercase flex items-center gap-2">
              <Globe size={12} /> GOOGLE SEARCH INDEX SIMULATION
            </h3>

            {/* Simulated Google Search Result */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] text-[#282420] font-sans tracking-wide truncate">
                https://zelix.shop
              </span>
              <span className="text-[18px] text-[#8ab4f8] hover:underline font-sans cursor-pointer leading-tight block">
                {previewFormattedTitle('Urban Activewear Drop')}
              </span>
              <p className="text-[12px] text-neutral-300 font-sans leading-normal font-light">
                {globalConfig.default_meta_description}
              </p>
            </div>

            <div className="border-t border-white/10 pt-4 flex flex-col gap-2.5 text-[11px] font-mono">
              <span className="text-[#282420] uppercase tracking-widest text-[9px] block">LIVE SCRIPTS STATUS</span>
              <div className="flex justify-between">
                <span>GA4 TAG:</span>
                <span className={globalConfig.ga_tracking_id ? 'text-green-400' : 'text-[#4A4642]'}>
                  {globalConfig.ga_tracking_id ? 'LOADED' : 'INACTIVE'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>FACEBOOK PIXEL:</span>
                <span className={globalConfig.fb_pixel_id ? 'text-green-400' : 'text-[#4A4642]'}>
                  {globalConfig.fb_pixel_id ? 'LOADED' : 'INACTIVE'}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Tab 2: Page-specific Overrides */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Panel Form: CRUD individual page overrides */}
          <div className="lg:col-span-4 bg-[#0F0F0F] border border-[rgba(245,240,235,0.06)] rounded-sm p-6">
            <h3 className="font-mono text-[10px] font-bold tracking-widest text-[#282420] border-b border-[rgba(245,240,235,0.03)] pb-3 mb-6 uppercase flex items-center gap-2">
              <FileText size={12} /> {isEditingPage ? 'EDIT ROUTE METADATA' : 'ADD ROUTE METADATA'}
            </h3>

            <form onSubmit={handlePageSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-[9px] font-mono font-bold tracking-widest text-[#282420] uppercase mb-1.5">
                  PAGE URL SLUG *
                </label>
                <input
                  type="text"
                  value={pageSlug}
                  onChange={(e) => setPageSlug(e.target.value)}
                  placeholder="e.g. /products/silent-hoodie"
                  className="w-full text-[13px] bg-[#0F0F0F] border border-[rgba(245,240,235,0.06)] rounded-sm px-3.5 py-2.5 outline-none focus:border-[#C9A96E] transition-colors font-mono"
                  required
                />
                <span className="text-[10px] font-mono text-[#282420] mt-1 block">
                  Use "/" for homepage override
                </span>
              </div>

              <div>
                <label className="block text-[9px] font-mono font-bold tracking-widest text-[#282420] uppercase mb-1.5">
                  PAGE META TITLE *
                </label>
                <input
                  type="text"
                  value={pageMetaTitle}
                  onChange={(e) => setPageMetaTitle(e.target.value)}
                  placeholder="Matrix Parka - Technical Shell"
                  className="w-full text-[13px] bg-[#0F0F0F] border border-[rgba(245,240,235,0.06)] rounded-sm px-3.5 py-2.5 outline-none focus:border-[#C9A96E] transition-colors font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono font-bold tracking-widest text-[#282420] uppercase mb-1.5">
                  PAGE META DESCRIPTION *
                </label>
                <textarea
                  value={pageMetaDescription}
                  onChange={(e) => setPageMetaDescription(e.target.value)}
                  placeholder="Custom page-specific search index description..."
                  rows={4}
                  className="w-full text-[13px] bg-[#0F0F0F] border border-[rgba(245,240,235,0.06)] rounded-sm px-3.5 py-2.5 outline-none focus:border-[#C9A96E] transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono font-bold tracking-widest text-[#282420] uppercase mb-1.5">
                  PAGE OG IMAGE URL
                </label>
                <input
                  type="text"
                  value={pageOgImage}
                  onChange={(e) => setPageOgImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full text-[13px] bg-[#0F0F0F] border border-[rgba(245,240,235,0.06)] rounded-sm px-3.5 py-2.5 outline-none focus:border-[#C9A96E] transition-colors font-mono"
                />
              </div>

              <div className="flex gap-3 mt-2">
                {isEditingPage && (
                  <button
                    type="button"
                    onClick={handleCancelPage}
                    className="flex-1 py-3 px-4 border border-[rgba(245,240,235,0.06)] hover:border-black transition-colors rounded-sm text-[11px] font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <X size={14} /> CANCEL
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-black text-white hover:bg-neutral-900 transition-colors rounded-sm text-[11px] font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Save size={14} /> {isEditingPage ? 'SAVE CHANGES' : 'CREATE OVERRIDE'}
                </button>
              </div>
            </form>
          </div>

          {/* Right Panel List: Existing page overrides */}
          <div className="lg:col-span-8 bg-[#0F0F0F] border border-[rgba(245,240,235,0.06)] rounded-sm p-6">
            <div className="flex justify-between items-center border-b border-[rgba(245,240,235,0.03)] pb-4 mb-6 gap-4">
              <h3 className="font-mono text-[10px] font-bold tracking-widest text-[#282420] uppercase shrink-0">
                ACTIVE PAGE METADATAS ({filteredPages.length})
              </h3>
              <div className="relative w-full max-w-[280px]">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search slug..."
                  className="w-full text-[12px] bg-[#050507] border border-[rgba(245,240,235,0.06)] rounded-sm pl-8 pr-3.5 py-1.5 outline-none focus:border-[#C9A96E] transition-colors font-mono"
                />
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#282420]" size={13} />
              </div>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse text-[12px] text-[#F5F0EB]">
                <thead>
                  <tr className="border-b border-[rgba(245,240,235,0.03)] text-[#282420] font-mono text-[10px] uppercase">
                    <th className="pb-3 font-semibold w-[160px]">ROUTE</th>
                    <th className="pb-3 font-semibold">TITLE OVERRIDE</th>
                    <th className="pb-3 font-semibold">DESCRIPTION OVERRIDE</th>
                    <th className="pb-3 font-semibold text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPages.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center font-mono text-[#282420]">
                        NO ROUTE METADATA SPECIFIED.
                      </td>
                    </tr>
                  ) : (
                    filteredPages.map((page) => (
                      <tr
                        key={page.id}
                        className="border-b border-neutral-50 last:border-0 hover:bg-[#050507]/50 transition-colors"
                      >
                        <td className="py-3.5 font-bold font-mono text-[#D4CBBF]">{page.page_slug}</td>
                        <td className="py-3.5 font-bold uppercase">{page.meta_title}</td>
                        <td className="py-3.5 text-[#4A4642] leading-relaxed max-w-[250px] truncate" title={page.meta_description}>
                          {page.meta_description}
                        </td>
                        <td className="py-3.5 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEditPageClick(page)}
                              className="p-1.5 text-[#4A4642] hover:text-[#F5F0EB] transition-colors rounded-md hover:bg-[#121212] cursor-pointer"
                              title="Edit Route"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeletePage(page.id)}
                              className="p-1.5 text-[#4A4642] hover:text-red-600 transition-colors rounded-md hover:bg-red-50 cursor-pointer"
                              title="Delete Override"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
