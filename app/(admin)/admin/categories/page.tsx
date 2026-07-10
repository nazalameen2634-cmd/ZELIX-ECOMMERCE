'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Search, ArrowRight, FolderOpen, Save, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { slugify } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  sort_order: number;
  created_at: string;
}

const MOCK_CATEGORIES: Category[] = [
  {
    id: '1',
    name: 'OUTERWEAR',
    slug: 'outerwear',
    description: 'Technical shells, insulated parkas, and transitional jackets.',
    image_url: null,
    parent_id: null,
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'TOPS',
    slug: 'tops',
    description: 'Heavyweight loopback hoodies, midweight tees, and performance layers.',
    image_url: null,
    parent_id: null,
    sort_order: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'BOTTOMS',
    slug: 'bottoms',
    description: 'Cargo trousers, structural joggers, and training shorts.',
    image_url: null,
    parent_id: null,
    sort_order: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'ACCESSORIES',
    slug: 'accessories',
    description: 'Bags, headwear, socks, and eyewear.',
    image_url: null,
    parent_id: null,
    sort_order: 4,
    created_at: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'SHELL JACKETS',
    slug: 'shell-jackets',
    description: 'Waterproof 3L technical shells.',
    image_url: null,
    parent_id: '1',
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
];

export default function AdminCategories() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setCategories(data as Category[]);
      } else {
        setCategories(MOCK_CATEGORIES);
      }
    } catch (err) {
      console.warn('Unable to query Supabase categories. Mock categories loaded.', err);
      setCategories(MOCK_CATEGORIES);
    } finally {
      setLoading(false);
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!editId) {
      setSlug(slugify(val));
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditId(null);
    setName('');
    setSlug('');
    setDescription('');
    setParentId('');
    setSortOrder('0');
    setImageUrl('');
  };

  const handleEditClick = (cat: Category) => {
    setIsEditing(true);
    setEditId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setParentId(cat.parent_id || '');
    setSortOrder(cat.sort_order.toString());
    setImageUrl(cat.image_url || '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      toast('Name and Slug are required fields', 'error');
      return;
    }

    const payload = {
      name: name.toUpperCase(),
      slug: slug.toLowerCase(),
      description: description || null,
      parent_id: parentId || null,
      sort_order: parseInt(sortOrder) || 0,
      image_url: imageUrl || null,
    };

    try {
      if (editId) {
        // Edit existing
        const response = await fetch('/api/admin/categories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, id: editId }),
        });

        if (!response.ok) throw new Error('API update failed');
        const resData = await response.json();

        setCategories(
          categories.map((c) =>
            c.id === editId
              ? { ...c, ...resData.data }
              : c
          )
        );
        toast('Category updated successfully', 'success');
      } else {
        // Add new
        const newId = crypto.randomUUID();
        const response = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, id: newId }),
        });

        if (!response.ok) throw new Error('API creation failed');
        const resData = await response.json();

        setCategories([...categories, resData.data]);
        toast('Category created successfully', 'success');
      }
      handleCancel();
    } catch (err: any) {
      console.error('Category save error:', err);
      toast(`Failed to save category: ${err.message || 'Unknown error'}`, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const response = await fetch(`/api/admin/categories?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('API deletion failed');

      setCategories(categories.filter((c) => c.id !== id));
      toast('Category deleted successfully', 'success');
    } catch (err) {
      console.error(err);
      toast('Failed to delete category', 'error');
    }
  };

  const getParentName = (parentIdVal: string | null) => {
    if (!parentIdVal) return '-';
    const parent = categories.find((c) => c.id === parentIdVal);
    return parent ? parent.name : 'Unknown';
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-[28px] font-sans font-black tracking-tight text-[#111111] uppercase mt-2">
            CATEGORIES CONSOLE
          </h1>
          <p className="text-[12px] text-[#4A4642] font-mono tracking-wider uppercase mt-1">
            MANAGE CLASSIFICATIONS, CATALOG LAYERS, AND TAXONOMY
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Add / Edit Category */}
        <div className="lg:col-span-4 bg-[#FFFFFF] border border-[rgba(0,0,0,0.06)] rounded-sm p-6">
          <h3 className="font-mono text-[10px] font-bold tracking-widest text-[#282420] border-b border-[rgba(0,0,0,0.03)] pb-3 mb-6 uppercase flex items-center gap-2">
            <FolderOpen size={12} /> {isEditing ? 'EDIT CATEGORY' : 'ADD NEW CATEGORY'}
          </h3>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-[9px] font-mono font-bold tracking-widest text-[#282420] uppercase mb-1.5">
                CATEGORY NAME *
              </label>
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="e.g. OUTERWEAR"
                className="w-full text-[13px] bg-[#FFFFFF] border border-[rgba(0,0,0,0.06)] rounded-sm px-3.5 py-2.5 outline-none focus:border-[#C9A96E] transition-colors font-mono uppercase"
                required
              />
            </div>

            <div>
              <label className="block text-[9px] font-mono font-bold tracking-widest text-[#282420] uppercase mb-1.5">
                SLUG (URL IDENTIFIER) *
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                placeholder="e.g. outerwear"
                className="w-full text-[13px] bg-[#FFFFFF] border border-[rgba(0,0,0,0.06)] rounded-sm px-3.5 py-2.5 outline-none focus:border-[#C9A96E] transition-colors font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-[9px] font-mono font-bold tracking-widest text-[#282420] uppercase mb-1.5">
                PARENT CATEGORY
              </label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full text-[13px] bg-[#FFFFFF] border border-[rgba(0,0,0,0.06)] rounded-sm px-3.5 py-2.5 outline-none focus:border-[#C9A96E] transition-colors font-mono"
              >
                <option value="">-- NONE (ROOT CATEGORY) --</option>
                {categories
                  .filter((c) => c.id !== editId && !c.parent_id) // Avoid recursion, only level 1 hierarchy
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-[9px] font-mono font-bold tracking-widest text-[#282420] uppercase mb-1.5">
                SORT ORDER
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full text-[13px] bg-[#FFFFFF] border border-[rgba(0,0,0,0.06)] rounded-sm px-3.5 py-2.5 outline-none focus:border-[#C9A96E] transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-[9px] font-mono font-bold tracking-widest text-[#282420] uppercase mb-1.5">
                DESCRIPTION
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of collection items..."
                rows={3}
                className="w-full text-[13px] bg-[#FFFFFF] border border-[rgba(0,0,0,0.06)] rounded-sm px-3.5 py-2.5 outline-none focus:border-[#C9A96E] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[9px] font-mono font-bold tracking-widest text-[#282420] uppercase mb-1.5">
                BANNER IMAGE URL
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full text-[13px] bg-[#FFFFFF] border border-[rgba(0,0,0,0.06)] rounded-sm px-3.5 py-2.5 outline-none focus:border-[#C9A96E] transition-colors font-mono"
              />
            </div>

            <div className="flex gap-3 mt-2">
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 py-3 px-4 border border-[rgba(0,0,0,0.06)] hover:border-black transition-colors rounded-sm text-[11px] font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-1 cursor-pointer"
                >
                  <X size={14} /> CANCEL
                </button>
              )}
              <button
                type="submit"
                className="flex-1 py-3 px-4 bg-black text-[#FFFFFF] hover:bg-neutral-900 transition-colors rounded-sm text-[11px] font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save size={14} /> {isEditing ? 'SAVE CHANGES' : 'CREATE CATEGORY'}
              </button>
            </div>
          </form>
        </div>

        {/* Right List: Categories Table */}
        <div className="lg:col-span-8 bg-[#FFFFFF] border border-[rgba(0,0,0,0.06)] rounded-sm p-6">
          {/* Search bar */}
          <div className="flex justify-between items-center border-b border-[rgba(0,0,0,0.03)] pb-4 mb-6 gap-4">
            <h3 className="font-mono text-[10px] font-bold tracking-widest text-[#282420] uppercase shrink-0">
              EXISTING CATEGORIES ({filteredCategories.length})
            </h3>
            <div className="relative w-full max-w-[280px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full text-[12px] bg-[#FAFAFA] border border-[rgba(0,0,0,0.06)] rounded-sm pl-8 pr-3.5 py-1.5 outline-none focus:border-[#C9A96E] transition-colors font-mono"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#282420]" size={13} />
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-[12px] text-[#111111]">
              <thead>
                <tr className="border-b border-[rgba(0,0,0,0.03)] text-[#282420] font-mono text-[10px] uppercase">
                  <th className="pb-3 font-semibold w-[60px]">ORDER</th>
                  <th className="pb-3 font-semibold">NAME</th>
                  <th className="pb-3 font-semibold">SLUG</th>
                  <th className="pb-3 font-semibold">PARENT</th>
                  <th className="pb-3 font-semibold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center font-mono text-[#282420]">
                      LOADING SYSTEM ARCHIVE...
                    </td>
                  </tr>
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center font-mono text-[#282420]">
                      NO MATCHING CATEGORIES LOCATED.
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat) => (
                    <tr
                      key={cat.id}
                      className="border-b border-neutral-50 last:border-0 hover:bg-[#FAFAFA]/50 transition-colors"
                    >
                      <td className="py-3.5 font-mono text-[#4A4642] font-bold">{cat.sort_order}</td>
                      <td className="py-3.5 font-bold uppercase flex items-center gap-1.5">
                        {cat.parent_id && <ArrowRight size={10} className="text-[#282420] ml-1.5" />}
                        {cat.name}
                      </td>
                      <td className="py-3.5 font-mono text-[#6B6560] font-medium">{cat.slug}</td>
                      <td className="py-3.5 font-mono text-[#4A4642] uppercase">{getParentName(cat.parent_id)}</td>
                      <td className="py-3.5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(cat)}
                            className="p-1.5 text-[#4A4642] hover:text-[#111111] transition-colors rounded-md hover:bg-[#121212] cursor-pointer"
                            title="Edit Category"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="p-1.5 text-[#4A4642] hover:text-red-600 transition-colors rounded-md hover:bg-red-50 cursor-pointer"
                            title="Delete Category"
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
    </div>
  );
}
