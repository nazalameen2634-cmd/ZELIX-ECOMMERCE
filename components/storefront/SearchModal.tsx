'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Search, CornerDownLeft, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Disable background scrolling and focus input on open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 150);
      
      // Load recent searches
      const saved = localStorage.getItem('zelix_recent_searches');
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Debounced search logic querying Supabase
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, categories(*)')
          .eq('status', 'active')
          .or(`title.ilike.%${query}%,description.ilike.%${query}%`);

        if (error) {
          console.error(error);
        } else {
          setResults((data as Product[]) || []);
        }
      } catch (err) {
        console.warn('Supabase offline. Search results fallback.');
        setResults([]);
      } finally {
        setIsLoading(false);
        setActiveIndex(-1);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Save successful searches to recent list
  const handleSelectResult = (slug: string, title: string) => {
    saveRecentSearch(title);
    onClose();
    router.push(`/products/${slug}`);
  };

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const cleanTerm = term.trim().toUpperCase();
    const updated = [cleanTerm, ...recentSearches.filter((s) => s !== cleanTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('zelix_recent_searches', JSON.stringify(updated));
  };

  const handleRecentClick = (term: string) => {
    setQuery(term);
    inputRef.current?.focus();
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('zelix_recent_searches');
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && results[activeIndex]) {
        handleSelectResult(results[activeIndex].slug, results[activeIndex].title);
      } else if (query.trim()) {
        saveRecentSearch(query);
        onClose();
        router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex flex-col bg-background">
          {/* Header Row */}
          <div className="flex justify-between items-center h-[80px] px-6 md:px-12 border-b border-white/5">
            <span className="text-[11px] font-mono font-bold tracking-widest text-neutral-500 uppercase">
              SEARCH STOREFRONT
            </span>
            <button
              onClick={onClose}
              className="text-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Search Input Area */}
          <div className="px-6 md:px-12 py-10 border-b border-border bg-card">
            <div className="max-w-4xl mx-auto relative flex items-center">
              <Search className="absolute left-0 text-muted" size={24} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="ENTER SEARCH QUERY..."
                className="w-full pl-10 pr-20 py-4 bg-transparent text-[22px] font-bold text-foreground tracking-widest uppercase outline-none border-none placeholder-muted"
              />
              <span className="absolute right-0 text-[10px] font-mono text-neutral-600 tracking-wider flex items-center gap-1.5 hidden md:flex select-none">
                ESC TO CLOSE
              </span>
            </div>
          </div>

          {/* Results Area */}
          <div className="flex-1 overflow-y-auto px-6 md:px-12 py-8 bg-background hide-scrollbar">
            <div className="max-w-4xl mx-auto">
              
              {isLoading && (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin h-6 w-6 border-2 border-foreground border-t-transparent rounded-full" />
                </div>
              )}

              {!isLoading && !query.trim() && (
                /* Recent Searches */
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
                      RECENT SEARCHES
                    </span>
                    {recentSearches.length > 0 && (
                      <button
                        onClick={clearRecent}
                        className="text-[9px] font-mono text-muted hover:text-foreground tracking-wide cursor-pointer uppercase"
                      >
                        CLEAR HISTORY
                      </button>
                    )}
                  </div>
                  {recentSearches.length === 0 ? (
                    <p className="text-[12px] font-mono text-neutral-700 tracking-wide">
                      NO SEARCH HISTORY
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {recentSearches.map((term) => (
                        <button
                          key={term}
                          onClick={() => handleRecentClick(term)}
                          className="flex items-center gap-3 py-2 text-left text-[13px] font-mono font-bold tracking-wider text-muted hover:text-foreground cursor-pointer uppercase"
                        >
                          <Clock size={12} className="text-muted" />
                          {term}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!isLoading && query.trim() && results.length === 0 && (
                /* Empty Results */
                <div className="text-center py-16">
                  <p className="text-[13px] font-mono text-neutral-400 tracking-wider uppercase">
                    NO PRODUCTS MATCHED "{query.toUpperCase()}"
                  </p>
                </div>
              )}

              {!isLoading && results.length > 0 && (
                /* Results List */
                <div className="flex flex-col gap-4">
                  <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase border-b border-white/5 pb-2">
                    MATCHED PIECES ({results.length})
                  </span>
                  <div className="flex flex-col gap-2">
                    {results.map((product, idx) => {
                      const image =
                        product.images?.[0]?.image_url ||
                        product.og_image_url ||
                        '/placeholder.jpg';
                      const isActive = activeIndex === idx;

                      return (
                        <div
                          key={product.id}
                          onClick={() => handleSelectResult(product.slug, product.title)}
                          onMouseEnter={() => setActiveIndex(idx)}
                          className={`flex items-center gap-4 p-4 rounded-sm border cursor-pointer transition-colors duration-150 ${
                            isActive
                              ? 'bg-card border-border'
                              : 'bg-background border-border/50 hover:bg-card hover:border-border'
                          }`}
                        >
                          {/* Thumbnail */}
                          <div className="w-12 aspect-[3/4] overflow-hidden rounded-sm bg-card border border-border/50">
                            <img
                              src={image}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1">
                            <h4 className="text-[13px] font-bold text-foreground tracking-wide uppercase">
                              {product.title}
                            </h4>
                            <p className="text-[10px] font-mono text-neutral-500 tracking-wider mt-0.5 uppercase">
                              SKU: {product.sku}
                            </p>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <span className="text-[13px] font-semibold text-foreground">
                              {formatCurrency(product.price)}
                            </span>
                            {isActive && (
                              <div className="flex items-center gap-1 text-[9px] font-mono text-neutral-500 mt-0.5 uppercase">
                                SELECT <CornerDownLeft size={8} />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
