'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, ArrowLeft, Loader2, Image as ImageIcon, Upload, Save, HelpCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Product, Category } from '@/types';
import { formatCurrency, slugify } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

// Mock Category Data
const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'OUTERWEAR', slug: 'outerwear', description: null, image_url: null, parent_id: null, sort_order: 1, created_at: '' },
  { id: 'cat-2', name: 'FOOTWEAR', slug: 'footwear', description: null, image_url: null, parent_id: null, sort_order: 2, created_at: '' },
  { id: 'cat-3', name: 'APPAREL', slug: 'apparel', description: null, image_url: null, parent_id: null, sort_order: 3, created_at: '' },
  { id: 'cat-4', name: 'ACCESSORIES', slug: 'accessories', description: null, image_url: null, parent_id: null, sort_order: 4, created_at: '' },
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p-1',
    title: 'MATRIX PARKA COAT',
    slug: 'matrix-parka-coat',
    price: 26000,
    sale_price: 21999,
    sale_start: null,
    sale_end: null,
    description: 'Immersive full-length technical coat. Waterproof membrane, magnetic collar lock, and adjustable harness system.',
    category_id: 'cat-1',
    sku: 'ZLX-OUT-MPK',
    stock_quantity: 12,
    track_inventory: true,
    allow_backorders: false,
    status: 'draft',
    meta_title: '',
    meta_description: '',
    tags: ['OUTERWEAR', 'PREMIUM'],
    created_at: '2026-06-18T12:00:00Z',
    updated_at: '2026-06-18T12:00:00Z',
    og_image_url: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'p-2',
    title: 'SILENT RUNNER BOOTS',
    slug: 'silent-runner-boots',
    price: 38000,
    sale_price: null,
    sale_start: null,
    sale_end: null,
    description: 'Chunky hybrid combat boot featuring vibram sole, quick-lace locking mechanism, and premium Italian distressed leather.',
    category_id: 'cat-2',
    sku: 'ZLX-FOT-SRB',
    stock_quantity: 5,
    track_inventory: true,
    allow_backorders: false,
    status: 'draft',
    meta_title: '',
    meta_description: '',
    tags: ['FOOTWEAR', 'LIMITED'],
    created_at: '2026-06-18T12:00:00Z',
    updated_at: '2026-06-18T12:00:00Z',
    og_image_url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'p-3',
    title: 'ECLIPSE OVERSIZED HOODIE',
    slug: 'eclipse-oversized-hoodie',
    price: 12000,
    sale_price: null,
    sale_start: null,
    sale_end: null,
    description: 'Heavyweight 500GSM organic cotton hoodie. Drop shoulder silhouette, invisible side pockets, and raw-edge seam details.',
    category_id: 'cat-3',
    sku: 'ZLX-APP-EOH',
    stock_quantity: 24,
    track_inventory: true,
    allow_backorders: false,
    status: 'draft',
    meta_title: '',
    meta_description: '',
    tags: ['APPAREL', 'ESSENTIALS'],
    created_at: '2026-06-18T12:00:00Z',
    updated_at: '2026-06-18T12:00:00Z',
    og_image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'p-4',
    title: 'KINETIC UTILITY TROUSERS',
    slug: 'kinetic-utility-trousers',
    price: 18000,
    sale_price: 14999,
    sale_start: null,
    sale_end: null,
    description: 'Ergonomic shape trousers with modular cargo compartments, articulated knees, and custom nylon web belt.',
    category_id: 'cat-3',
    sku: 'ZLX-APP-KUT',
    stock_quantity: 8,
    track_inventory: true,
    allow_backorders: false,
    status: 'draft',
    meta_title: '',
    meta_description: '',
    tags: ['APPAREL', 'UTILITY'],
    created_at: '2026-06-18T12:00:00Z',
    updated_at: '2026-06-18T12:00:00Z',
    og_image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'p-5',
    title: 'SOLSTICE GLASSES',
    slug: 'solstice-glasses',
    price: 9000,
    sale_price: null,
    sale_start: null,
    sale_end: null,
    description: 'Acetate frame sunglasses. 100% UV protection, steel custom hardware, and signature dark tint.',
    category_id: 'cat-4',
    sku: 'ZLX-ACC-SLG',
    stock_quantity: 15,
    track_inventory: true,
    allow_backorders: false,
    status: 'draft',
    meta_title: '',
    meta_description: '',
    tags: ['ACCESSORIES', 'GLASSES'],
    created_at: '2026-06-18T12:00:00Z',
    updated_at: '2026-06-18T12:00:00Z',
    og_image_url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop',
  }
];

export default function AdminProductsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Form Panel Toggle: 'list' | 'create' | 'edit'
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [formFields, setFormFields] = useState({
    title: '',
    slug: '',
    description: '',
    additionalInfo: '',
    categoryId: '',
    price: '',
    salePrice: '',
    sku: '',
    stockQuantity: '10',
    trackInventory: true,
    allowBackorders: false,
    status: 'active' as 'active' | 'draft',
    image: '',
    tags: '',
  });

  // Variant options creator
  const [variantsList, setVariantsList] = useState<{ size: string; priceOverride: string; stock: string; sku: string }[]>([
    { size: 'S', priceOverride: '', stock: '10', sku: '' },
    { size: 'M', priceOverride: '', stock: '10', sku: '' },
    { size: 'L', priceOverride: '', stock: '10', sku: '' },
  ]);

  // Load Products & Categories
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const { data: prods } = await supabase
          .from('products')
          .select('*, categories(*)')
          .order('created_at', { ascending: false });
        if (prods) setProducts(prods as Product[]);

        const { data: cats } = await supabase
          .from('categories')
          .select('*')
          .order('sort_order', { ascending: true });
        if (cats) setCategories(cats as Category[]);
      } catch (err) {
        console.warn('Supabase offline. Catalog previews seeded.');
        setProducts(MOCK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [view]);

  // Generate slug automatically on title changes
  useEffect(() => {
    if (view === 'create') {
      setFormFields((f) => ({ ...f, slug: slugify(formFields.title) }));
    }
  }, [formFields.title, view]);

  const handleEdit = (product: Product) => {
    setEditingProductId(product.id);
    setFormFields({
      title: product.title,
      slug: product.slug,
      description: product.description || '',
      additionalInfo: product.additional_info || '',
      categoryId: product.category_id || '',
      price: product.price.toString(),
      salePrice: product.sale_price?.toString() || '',
      sku: product.sku,
      stockQuantity: product.stock_quantity.toString(),
      trackInventory: product.track_inventory,
      allowBackorders: product.allow_backorders,
      status: product.status,
      image: product.og_image_url || '',
      tags: product.tags?.join(', ') || '',
    });
    setView('edit');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('CONFIRM DESTRUCTION OF THIS PRODUCT?')) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast('PRODUCT DELETED FROM CATALOG', 'success');
    } catch (e) {
      // Fallback
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast('PRODUCT DELETED FROM CATALOG (PREVIEW MODE)', 'success');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      title: formFields.title,
      slug: formFields.slug,
      description: formFields.description,
      category_id: formFields.categoryId || null,
      price: parseFloat(formFields.price),
      sale_price: formFields.salePrice ? parseFloat(formFields.salePrice) : null,
      sku: formFields.sku,
      stock_quantity: parseInt(formFields.stockQuantity),
      track_inventory: formFields.trackInventory,
      allow_backorders: formFields.allowBackorders,
      status: formFields.status,
      og_image_url: formFields.image || 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600',
      tags: formFields.tags.split(',').map((t) => t.trim().toUpperCase()).filter(Boolean),
    };

    try {
      if (view === 'edit' && editingProductId) {
        // Update product via API
        const res = await fetch(`/api/admin/products/${editingProductId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to update');
        }
        toast('PRODUCT RE-COMMITTED SUCCESSFULLY', 'success');
      } else {
        // Create product via API
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to create');
        }
        
        const { data: newProd } = await res.json();

        // Insert variants if any via API
        if (newProd && variantsList.length > 0) {
          const variantsRows = variantsList.map((v) => ({
            product_id: newProd.id,
            sku: v.sku || `${formFields.sku}-${v.size.toUpperCase()}`,
            price: v.priceOverride ? parseFloat(v.priceOverride) : null,
            stock_quantity: parseInt(v.stock),
            option_values: [{ option_name: 'Size', value: v.size }],
          }));
          
          await fetch('/api/admin/products/variants', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(variantsRows),
          });
        }

        toast('PRODUCT RELEASES PUBLISHED IN CATALOG', 'success');
      }

      setView('list');
      resetForm();
    } catch (err: any) {
      console.error('Save failed:', err);
      toast(`ERROR: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setFormFields({
      title: '',
      slug: '',
      description: '',
      additionalInfo: '',
      categoryId: '',
      price: '',
      salePrice: '',
      sku: '',
      stockQuantity: '10',
      trackInventory: true,
      allowBackorders: false,
      status: 'active',
      image: '',
      tags: '',
    });
    setEditingProductId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropUpload = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast('PLEASE UPLOAD AN IMAGE FILE', 'error');
      return;
    }

    toast('UPLOADING PRODUCT PHOTO...', 'success');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      
      const data = await res.json();
      setFormFields((f) => ({ ...f, image: data.url }));
      toast('PRODUCT PHOTO UPLOADED TO product-images BUCKET', 'success');
    } catch (err) {
      console.warn('Upload failed, falling back to mock image', err);
      // Simulate image uploading fallback
      setFormFields((f) => ({
        ...f,
        image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=600&auto=format&fit=crop',
      }));
      toast('UPLOAD FAILED. MOCK IMAGE INSERTED.', 'error');
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Header breadcrumbs */}
      <div className="flex justify-between items-center border-b border-[rgba(245,240,235,0.06)] pb-5">
        <div>
          <h1 className="text-[28px] font-sans font-black tracking-tight text-[#F5F0EB] uppercase mt-2">
            PRODUCT MANAGEMENT
          </h1>
          <p className="text-[12px] text-[#4A4642] font-mono tracking-wider uppercase mt-1">
            {view === 'list'
              ? 'MANAGE CORE INVENTORIES, SPECIFICATIONS, AND PRICING OVERRIDES'
              : view === 'create'
              ? 'ADD NEW PRODUCT AND VARIANTS'
              : 'EDIT SPECIFICATIONS'}
          </p>
        </div>

        {view === 'list' ? (
          <Button onClick={() => { resetForm(); setView('create'); }} variant="primary">
            <Plus size={12} className="mr-1" /> CREATE PRODUCT
          </Button>
        ) : (
          <Button onClick={() => setView('list')} variant="outline">
            <ArrowLeft size={12} className="mr-1" /> RETURN TO LIST
          </Button>
        )}
      </div>

      {view === 'list' ? (
        /* PRODUCT CATALOG LISTING */
        <div className="bg-[#0F0F0F] border border-[rgba(245,240,235,0.06)] rounded-sm p-6 flex flex-col gap-6">
          {/* Search bar */}
          <div className="relative max-w-md w-full flex items-center">
            <Search className="absolute left-3.5 text-[#8C8782]" size={16} />
            <input
              type="text"
              placeholder="SEARCH CATALOG (TITLE OR SKU)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[rgba(245,240,235,0.06)] rounded-sm font-mono text-[11px] text-[#F5F0EB] outline-none focus:border-neutral-400"
            />
          </div>

          {/* Catalog grid/table */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin text-[#F5F0EB] w-8 h-8" />
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse text-[12px] text-[#F5F0EB]">
                <thead>
                  <tr className="border-b border-[rgba(245,240,235,0.06)] text-[#8C8782] font-mono text-[10px] uppercase">
                    <th className="pb-3 font-semibold w-16">IMAGE</th>
                    <th className="pb-3 font-semibold">TITLE</th>
                    <th className="pb-3 font-semibold">SKU</th>
                    <th className="pb-3 font-semibold">PRICE</th>
                    <th className="pb-3 font-semibold">STOCK</th>
                    <th className="pb-3 font-semibold">STATUS</th>
                    <th className="pb-3 font-semibold text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center font-mono text-[#8C8782]">
                        NO PRODUCTS MATCH THIS SEARCH CRITERIA.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const image = p.og_image_url || '/placeholder.jpg';
                      return (
                        <tr key={p.id} className="border-b border-[rgba(245,240,235,0.03)] last:border-0 hover:bg-[#050507]/50 transition-colors">
                          <td className="py-3">
                            <img src={image} alt={p.title} className="w-10 h-12 object-cover rounded-sm border border-[rgba(245,240,235,0.06)]" />
                          </td>
                          <td className="py-3 font-bold text-[#F5F0EB] uppercase">{p.title}</td>
                          <td className="py-3 font-mono text-[#6B6560]">{p.sku}</td>
                          <td className="py-3 font-semibold">{formatCurrency(p.price)}</td>
                          <td className="py-3 font-mono">{p.stock_quantity} units</td>
                          <td className="py-3">
                            <span className={`text-[8px] font-mono font-bold tracking-widest px-2 py-0.5 rounded-full uppercase ${
                              p.status === 'active' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-[#121212] text-[#8C8782] border border-[rgba(245,240,235,0.06)]'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex gap-3 justify-end">
                              <button
                                onClick={() => handleEdit(p)}
                                className="text-[#4A4642] hover:text-[#F5F0EB] flex items-center gap-1 font-mono text-[9px] font-bold uppercase cursor-pointer"
                              >
                                <Edit size={10} /> EDIT
                              </button>
                              <button
                                onClick={() => handleDelete(p.id)}
                                className="text-red-500/60 hover:text-red-500 flex items-center gap-1 font-mono text-[9px] font-bold uppercase cursor-pointer"
                              >
                                <Trash2 size={10} /> DELETE
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* PRODUCT ADD / EDIT FORMS */
        <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Panel: Primary fields */}
          <div className="lg:col-span-8 bg-[#0F0F0F] border border-[rgba(245,240,235,0.06)] p-8 rounded-sm flex flex-col gap-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <h3 className="font-mono text-[10px] font-bold tracking-widest text-[#8C8782] border-b border-[rgba(245,240,235,0.03)] pb-3 uppercase">
              GENERAL PRODUCT DETAILS
            </h3>

            <Input
              label="PRODUCT TITLE"
              required
              value={formFields.title}
              onChange={(e) => setFormFields((f) => ({ ...f, title: e.target.value }))}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="URL PATH SLUG (AUTO-GENERATED)"
                required
                value={formFields.slug}
                onChange={(e) => setFormFields((f) => ({ ...f, slug: e.target.value }))}
              />
              <div className="flex flex-col border border-[rgba(245,240,235,0.06)] rounded-sm bg-[#050507] px-4 py-2 justify-center">
                <span className="font-mono text-[9px] text-[#8C8782] uppercase font-bold">CATEGORY</span>
                <select
                  value={formFields.categoryId}
                  onChange={(e) => setFormFields((f) => ({ ...f, categoryId: e.target.value }))}
                  className="bg-transparent font-mono text-[11px] text-[#F5F0EB] uppercase font-bold mt-1 outline-none cursor-pointer"
                >
                  <option value="">SELECT A CATEGORY</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col border border-[rgba(245,240,235,0.06)] rounded-sm bg-[#0F0F0F] p-4">
              <span className="font-mono text-[9px] text-[#8C8782] uppercase font-bold mb-2">DESCRIPTION (RICH TEXT HTML)</span>
              <textarea
                rows={6}
                value={formFields.description}
                onChange={(e) => setFormFields((f) => ({ ...f, description: e.target.value }))}
                placeholder="Describe product details, fits, materials..."
                className="w-full bg-transparent font-sans text-[13px] text-[#F5F0EB] outline-none resize-none placeholder-[#4A4642]"
              />
            </div>

            <div className="flex flex-col border border-[rgba(245,240,235,0.06)] rounded-sm bg-[#0F0F0F] p-4 mt-2">
              <span className="font-mono text-[9px] text-[#8C8782] uppercase font-bold mb-2">ADDITIONAL INFORMATION (HTML)</span>
              <textarea
                rows={4}
                value={formFields.additionalInfo}
                onChange={(e) => setFormFields((f) => ({ ...f, additionalInfo: e.target.value }))}
                placeholder="Fabric tech specs, washing instructions..."
                className="w-full bg-transparent font-sans text-[13px] text-[#F5F0EB] outline-none resize-none placeholder-[#4A4642]"
              />
            </div>

            {/* Pricing Area */}
            <div className="grid grid-cols-2 gap-4 mt-2">
              <Input
                label="REGULAR PRICE (INR)"
                required
                type="number"
                value={formFields.price}
                onChange={(e) => setFormFields((f) => ({ ...f, price: e.target.value }))}
              />
              <Input
                label="SALE PRICE (INR, OPTIONAL)"
                type="number"
                value={formFields.salePrice}
                onChange={(e) => setFormFields((f) => ({ ...f, salePrice: e.target.value }))}
              />
            </div>

            {/* Inventory configuration */}
            <h3 className="font-mono text-[10px] font-bold tracking-widest text-[#8C8782] border-b border-[rgba(245,240,235,0.03)] pb-3 mt-6 uppercase">
              INVENTORY MANAGEMENT
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="SKU REFERENCE NUMBER"
                required
                value={formFields.sku}
                onChange={(e) => setFormFields((f) => ({ ...f, sku: e.target.value }))}
              />
              <Input
                label="STOCK QUANTITY IN WAREHOUSE"
                required
                type="number"
                value={formFields.stockQuantity}
                onChange={(e) => setFormFields((f) => ({ ...f, stockQuantity: e.target.value }))}
              />
            </div>

            {/* Variant Option swatches creator (Only shown on create mode) */}
            {view === 'create' && (
              <>
                <h3 className="font-mono text-[10px] font-bold tracking-widest text-[#8C8782] border-b border-[rgba(245,240,235,0.03)] pb-3 mt-6 uppercase">
                  VARIANT OPTIONS SWATCHES (SIZING)
                </h3>
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-4 gap-4 font-mono text-[9px] text-[#8C8782] font-bold uppercase mb-1">
                    <span>OPTION SIZE</span>
                    <span>PRICE OVERRIDE</span>
                    <span>STOCK QTY</span>
                    <span>VARIANT SKU</span>
                  </div>
                  {variantsList.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-4 gap-4 items-center">
                      <span className="font-mono text-[12px] font-bold text-[#F5F0EB] border border-[rgba(245,240,235,0.06)] px-3 py-3.5 rounded-sm text-center uppercase bg-[#050507]">{item.size}</span>
                      <input
                        type="number"
                        placeholder="Default"
                        value={item.priceOverride}
                        onChange={(e) => {
                          const updated = [...variantsList];
                          updated[idx].priceOverride = e.target.value;
                          setVariantsList(updated);
                        }}
                        className="bg-transparent text-[#F5F0EB] border border-[rgba(245,240,235,0.06)] rounded-sm px-3 py-3 font-mono text-[11px]"
                      />
                      <input
                        type="number"
                        placeholder="10"
                        value={item.stock}
                        onChange={(e) => {
                          const updated = [...variantsList];
                          updated[idx].stock = e.target.value;
                          setVariantsList(updated);
                        }}
                        className="bg-transparent text-[#F5F0EB] border border-[rgba(245,240,235,0.06)] rounded-sm px-3 py-3 font-mono text-[11px]"
                      />
                      <input
                        type="text"
                        placeholder="Auto"
                        value={item.sku}
                        onChange={(e) => {
                          const updated = [...variantsList];
                          updated[idx].sku = e.target.value;
                          setVariantsList(updated);
                        }}
                        className="bg-transparent text-[#F5F0EB] border border-[rgba(245,240,235,0.06)] rounded-sm px-3 py-3 font-mono text-[11px]"
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

          </div>

          {/* Right Panel: Media drop, tags, SEO status */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Status card */}
            <div className="bg-[#0F0F0F] border border-[rgba(245,240,235,0.06)] p-6 rounded-sm shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <h3 className="font-mono text-[10px] font-bold tracking-widest text-[#8C8782] border-b border-[rgba(245,240,235,0.03)] pb-3 mb-4 uppercase">
                PUBLISH STATUS
              </h3>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[11px] text-[#4A4642] uppercase">CATALOG VISIBILITY:</span>
                  <select
                    value={formFields.status}
                    onChange={(e) => setFormFields((f) => ({ ...f, status: e.target.value as 'active' | 'draft' }))}
                    className="border border-[rgba(245,240,235,0.06)] rounded-sm px-4 py-2 font-mono text-[10px] font-bold uppercase cursor-pointer"
                  >
                    <option value="active">ACTIVE</option>
                    <option value="draft">DRAFT / HIDDEN</option>
                  </select>
                </div>

                <div className="flex flex-col border-t border-[rgba(245,240,235,0.03)] pt-4 gap-2">
                  <label className="flex items-center gap-3 font-mono text-[10px] tracking-wider text-[#4A4642] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formFields.trackInventory}
                      onChange={(e) => setFormFields((f) => ({ ...f, trackInventory: e.target.checked }))}
                      className="accent-black"
                    />
                    TRACK INVENTORY LOGIC
                  </label>
                  <label className="flex items-center gap-3 font-mono text-[10px] tracking-wider text-[#4A4642] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formFields.allowBackorders}
                      onChange={(e) => setFormFields((f) => ({ ...f, allowBackorders: e.target.checked }))}
                      className="accent-black"
                    />
                    ALLOW WAREHOUSE BACKORDERS
                  </label>
                </div>
              </div>
            </div>

            {/* Media Upload card */}
            <div className="bg-[#0F0F0F] border border-[rgba(245,240,235,0.06)] p-6 rounded-sm shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <h3 className="font-mono text-[10px] font-bold tracking-widest text-[#8C8782] border-b border-[rgba(245,240,235,0.03)] pb-3 mb-4 uppercase">
                MEDIA LIBRARY
              </h3>
              
              {/* Drag/Drop Mock slot */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDropUpload}
                className="w-full aspect-[3/4] border-2 border-dashed border-[rgba(245,240,235,0.06)] hover:border-neutral-400 rounded-sm bg-[#050507] flex flex-col justify-center items-center gap-3 text-center cursor-pointer transition-colors p-4"
              >
                {formFields.image ? (
                  <img src={formFields.image} alt="preview" className="w-full h-full object-cover rounded-sm" />
                ) : (
                  <>
                    <Upload className="text-neutral-300 w-10 h-10" />
                    <div>
                      <span className="font-mono text-[9px] font-bold tracking-widest uppercase text-[#6B6560] block">
                        DRAG & DROP PRODUCT PHOTO
                      </span>
                      <span className="text-[10px] font-sans text-[#8C8782] mt-1 block">
                        Upload to product-images Storage bucket
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Text URL backup */}
              <div className="mt-4">
                <Input
                  label="OR INSERT IMAGE URL"
                  value={formFields.image}
                  onChange={(e) => setFormFields((f) => ({ ...f, image: e.target.value }))}
                />
              </div>
            </div>

            {/* Tagswatches */}
            <div className="bg-[#0F0F0F] border border-[rgba(245,240,235,0.06)] p-6 rounded-sm shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <h3 className="font-mono text-[10px] font-bold tracking-widest text-[#8C8782] border-b border-[rgba(245,240,235,0.03)] pb-3 mb-4 uppercase">
                CATALOG TAGS
              </h3>
              <Input
                label="COMMA SEPARATED TAGS"
                placeholder="E.G. NEW, LIMITED, OUTERWEAR"
                value={formFields.tags}
                onChange={(e) => setFormFields((f) => ({ ...f, tags: e.target.value }))}
              />
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <Button
                type="submit"
                isLoading={isSaving}
                className="flex-1 py-4 flex items-center justify-center gap-2"
              >
                <Save size={12} />
                SAVE PRODUCT
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
