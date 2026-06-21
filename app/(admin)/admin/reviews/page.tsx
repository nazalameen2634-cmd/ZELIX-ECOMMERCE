'use client';

import React, { useState, useEffect } from 'react';
import { Star, Trash2, CheckCircle, XCircle, Search, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Review, Product } from '@/types';
import { useToast } from '@/context/ToastContext';

// Extended type to include joined product info
interface AdminReview extends Review {
  product?: Partial<Product>;
}

const MOCK_REVIEWS: AdminReview[] = [
  {
    id: 'r-1',
    product_id: 'p-1',
    user_id: 'u-1',
    rating: 5,
    title: 'EXCELLENT COAT',
    body: 'The quality of the material is exceptional. Perfect fit and very warm.',
    is_verified: true,
    created_at: new Date().toISOString(),
    product: { title: 'MATRIX PARKA COAT' },
    profile: {
      id: 'u-1', email: 'user@example.com', full_name: 'JOHN DOE', role: 'customer',
      created_at: '', updated_at: '', avatar_url: null, phone: null
    }
  },
  {
    id: 'r-2',
    product_id: 'p-3',
    user_id: 'u-2',
    rating: 3,
    title: 'GOOD BUT EXPENSIVE',
    body: 'Great hoodie but feels a bit overpriced for a basic essential.',
    is_verified: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    product: { title: 'ECLIPSE OVERSIZED HOODIE' },
    profile: {
      id: 'u-2', email: 'jane@example.com', full_name: 'JANE SMITH', role: 'customer',
      created_at: '', updated_at: '', avatar_url: null, phone: null
    }
  }
];

export default function AdminReviewsPage() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadReviews();
  }, []);

  async function loadReviews() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, product:products(title), profile:profiles(full_name, email)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setReviews(data as unknown as AdminReview[]);
      } else {
        setReviews(MOCK_REVIEWS);
      }
    } catch (err) {
      console.warn('Unable to query Supabase reviews. Mock reviews loaded.', err);
      setReviews(MOCK_REVIEWS);
    } finally {
      setLoading(false);
    }
  }

  const handleToggleVerified = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_verified: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setReviews(reviews.map((r) => 
        r.id === id ? { ...r, is_verified: !currentStatus } : r
      ));
      toast('REVIEW STATUS UPDATED', 'success');
    } catch (err) {
      setReviews(reviews.map((r) => 
        r.id === id ? { ...r, is_verified: !currentStatus } : r
      ));
      toast('REVIEW STATUS UPDATED (PREVIEW MODE)', 'success');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('PERMANENTLY DELETE THIS REVIEW?')) return;
    
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw error;

      setReviews(reviews.filter((r) => r.id !== id));
      toast('REVIEW DELETED SUCCESSFULLY', 'success');
    } catch (err) {
      setReviews(reviews.filter((r) => r.id !== id));
      toast('REVIEW DELETED (PREVIEW MODE)', 'success');
    }
  };

  const filteredReviews = reviews.filter((r) =>
    r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.body?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.product?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-[28px] font-sans font-black tracking-tight text-[#F5F0EB] uppercase mt-2">
            REVIEW MANAGEMENT
          </h1>
          <p className="text-[12px] text-[#4A4642] font-mono tracking-wider uppercase mt-1">
            MODERATE CUSTOMER FEEDBACK AND VERIFIED PURCHASES
          </p>
        </div>
      </div>

      <div className="bg-[#0F0F0F] border border-[rgba(245,240,235,0.06)] rounded-sm p-6 flex flex-col gap-6">
        {/* Search bar */}
        <div className="relative max-w-md w-full flex items-center">
          <Search className="absolute left-3.5 text-[#282420]" size={16} />
          <input
            type="text"
            placeholder="SEARCH REVIEWS (PRODUCT, TITLE, USER)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-[rgba(245,240,235,0.06)] rounded-sm font-mono text-[11px] text-[#F5F0EB] bg-[#050507] outline-none focus:border-[#C9A96E] transition-colors"
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-[#F5F0EB] w-8 h-8" />
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-[12px] text-[#F5F0EB]">
              <thead>
                <tr className="border-b border-[rgba(245,240,235,0.06)] text-[#282420] font-mono text-[10px] uppercase">
                  <th className="pb-3 font-semibold w-[150px]">DATE</th>
                  <th className="pb-3 font-semibold">CUSTOMER</th>
                  <th className="pb-3 font-semibold">PRODUCT</th>
                  <th className="pb-3 font-semibold">RATING & FEEDBACK</th>
                  <th className="pb-3 font-semibold text-center w-[100px]">VERIFIED</th>
                  <th className="pb-3 font-semibold text-right w-[100px]">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center font-mono text-[#282420]">
                      NO REVIEWS FOUND.
                    </td>
                  </tr>
                ) : (
                  filteredReviews.map((review) => (
                    <tr key={review.id} className="border-b border-[rgba(245,240,235,0.03)] last:border-0 hover:bg-[#050507]/50 transition-colors">
                      <td className="py-4 font-mono text-[#6B6560]">
                        {new Date(review.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 font-mono text-[#F5F0EB] font-bold">
                        {review.profile?.full_name?.toUpperCase() || review.profile?.email || 'ANONYMOUS'}
                      </td>
                      <td className="py-4 font-mono text-[#C9A96E]">
                        {review.product?.title || 'UNKNOWN PRODUCT'}
                      </td>
                      <td className="py-4 max-w-md">
                        <div className="flex text-[#C9A96E] mb-1">
                          {Array(5).fill(0).map((_, i) => (
                            <Star key={i} size={10} className={i < review.rating ? 'fill-[#C9A96E]' : 'text-neutral-800 fill-transparent'} />
                          ))}
                        </div>
                        <p className="font-bold uppercase text-[11px] mb-1 text-[#F5F0EB]">{review.title}</p>
                        <p className="font-sans text-[12px] text-[#9A9490] line-clamp-2">{review.body}</p>
                      </td>
                      <td className="py-4 text-center">
                        <button
                          onClick={() => handleToggleVerified(review.id, review.is_verified)}
                          className="mx-auto block"
                          title="Toggle Verification Status"
                        >
                          {review.is_verified ? (
                            <CheckCircle size={16} className="text-green-500" />
                          ) : (
                            <XCircle size={16} className="text-neutral-600 hover:text-white" />
                          )}
                        </button>
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="text-red-500/60 hover:text-red-500 flex items-center gap-1 font-mono text-[9px] font-bold uppercase cursor-pointer ml-auto"
                        >
                          <Trash2 size={12} /> DELETE
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
