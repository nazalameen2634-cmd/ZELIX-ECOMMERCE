'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ArrowUpRight, ShoppingBag, Diamond, ShieldCheck, Gift, Undo2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Product, HeroSlide } from '@/types';
import ProductCard from '@/components/storefront/ProductCard';
import OrderTrackingSection from '@/components/storefront/OrderTrackingSection';
import { useCart } from '@/context/CartContext';

// ─── Default Data ──────────────────────────────────────────
const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=1800&auto=format&fit=crop',
    heading: 'FORM FOLLOWS UTILITY',
    subheading: 'SUMMER DROP VOL. 01 — TECHNICAL STREETWEAR BUILT FOR POST-MODERN ENVIRONMENTS.',
    cta_text: 'EXPLORE THE COLLECTION',
    cta_link: '/products',
    sort_order: 1,
    is_active: true,
  },
  {
    id: 'slide-2',
    image_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1800&auto=format&fit=crop',
    heading: 'TACTICAL LAYERS',
    subheading: 'WATERPROOF MEMBRANES, FIDLOCK LOCKS & HARD SHELLS DESIGNED FOR RESILIENCE.',
    cta_text: 'SHOP OUTERWEAR',
    cta_link: '/products?category=outerwear',
    sort_order: 2,
    is_active: true,
  },
  {
    id: 'slide-3',
    image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1800&auto=format&fit=crop',
    heading: 'CORE SYSTEM',
    subheading: 'HEAVYWEIGHT ESSENTIALS IN 500GSM COTTON TERRY AND PREMIUM MERINO WOOL.',
    cta_text: 'SHOP ESSENTIALS',
    cta_link: '/products?category=apparel',
    sort_order: 3,
    is_active: true,
  },
];

// ─── 30 Jewellery Sample Products ─────────────────────────
const JEWELLERY_PRODUCTS = [
  {
    id: 'j-001',
    title: 'AURORA DIAMOND RING',
    slug: 'aurora-diamond-ring',
    description: 'Brilliant-cut solitaire diamond set in 18K white gold. Classic elegance redefined.',
    price: 48500,
    sale_price: null,
    sku: 'ZJW-001',
    stock_quantity: 12,
    track_inventory: true,
    allow_backorders: false,
    status: 'active',
    tags: ['ring', 'diamond', 'gold', 'bridal'],
    og_image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop',
    images: [
      { id: 'ji-001', product_id: 'j-001', image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop', sort_order: 0, alt_text: 'Aurora Diamond Ring' },
      { id: 'ji-001b', product_id: 'j-001', image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop', sort_order: 1, alt_text: 'Aurora Diamond Ring Side' },
    ],
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'j-002',
    title: 'CELESTIAL PEARL NECKLACE',
    slug: 'celestial-pearl-necklace',
    description: 'South Sea freshwater pearls strung on a 22K gold chain. Timeless sophistication.',
    price: 32000,
    sale_price: 27500,
    sku: 'ZJW-002',
    stock_quantity: 8,
    track_inventory: true,
    allow_backorders: false,
    status: 'active',
    tags: ['necklace', 'pearl', 'gold', 'luxury'],
    og_image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
    images: [
      { id: 'ji-002', product_id: 'j-002', image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop', sort_order: 0, alt_text: 'Pearl Necklace' },
      { id: 'ji-002b', product_id: 'j-002', image_url: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?q=80&w=800&auto=format&fit=crop', sort_order: 1, alt_text: 'Pearl Necklace Detail' },
    ],
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'j-003',
    title: 'INFINITY GOLD BRACELET',
    slug: 'infinity-gold-bracelet',
    description: 'Handcrafted 18K gold infinity-link bracelet. Adjustable clasp for perfect fit.',
    price: 21000,
    sale_price: null,
    sku: 'ZJW-003',
    stock_quantity: 15,
    track_inventory: true,
    allow_backorders: false,
    status: 'active',
    tags: ['bracelet', 'gold', 'infinity'],
    og_image_url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop',
    images: [
      { id: 'ji-003', product_id: 'j-003', image_url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop', sort_order: 0, alt_text: 'Gold Bracelet' },
      { id: 'ji-003b', product_id: 'j-003', image_url: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?q=80&w=800&auto=format&fit=crop', sort_order: 1, alt_text: 'Gold Bracelet Close' },
    ],
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'j-004',
    title: 'SAPPHIRE DROP EARRINGS',
    slug: 'sapphire-drop-earrings',
    description: 'Ceylon blue sapphires set in white gold drops with pavé diamond accents.',
    price: 38500,
    sale_price: null,
    sku: 'ZJW-004',
    stock_quantity: 6,
    track_inventory: true,
    allow_backorders: false,
    status: 'active',
    tags: ['earrings', 'sapphire', 'diamond', 'drop'],
    og_image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop',
    images: [
      { id: 'ji-004', product_id: 'j-004', image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop', sort_order: 0, alt_text: 'Sapphire Earrings' },
      { id: 'ji-004b', product_id: 'j-004', image_url: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=800&auto=format&fit=crop', sort_order: 1, alt_text: 'Sapphire Earrings Side' },
    ],
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'j-005',
    title: 'ROSE GOLD BANGLE SET',
    slug: 'rose-gold-bangle-set',
    description: 'Set of 3 brushed rose gold bangles, stacking perfection for any occasion.',
    price: 17500,
    sale_price: 14999,
    sku: 'ZJW-005',
    stock_quantity: 20,
    track_inventory: true,
    allow_backorders: false,
    status: 'active',
    tags: ['bangle', 'rose gold', 'set'],
    og_image_url: 'https://images.unsplash.com/photo-1573408301185-9519f94815b4?q=80&w=800&auto=format&fit=crop',
    images: [
      { id: 'ji-005', product_id: 'j-005', image_url: 'https://images.unsplash.com/photo-1573408301185-9519f94815b4?q=80&w=800&auto=format&fit=crop', sort_order: 0, alt_text: 'Rose Gold Bangles' },
      { id: 'ji-005b', product_id: 'j-005', image_url: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?q=80&w=800&auto=format&fit=crop', sort_order: 1, alt_text: 'Bangles Stack' },
    ],
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'j-006',
    title: 'EMERALD HALO PENDANT',
    slug: 'emerald-halo-pendant',
    description: 'Colombian emerald surrounded by a pavé diamond halo on 18K yellow gold chain.',
    price: 55000,
    sale_price: null,
    sku: 'ZJW-006',
    stock_quantity: 4,
    track_inventory: true,
    allow_backorders: false,
    status: 'active',
    tags: ['pendant', 'emerald', 'halo', 'necklace'],
    og_image_url: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?q=80&w=800&auto=format&fit=crop',
    images: [
      { id: 'ji-006', product_id: 'j-006', image_url: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?q=80&w=800&auto=format&fit=crop', sort_order: 0, alt_text: 'Emerald Pendant' },
      { id: 'ji-006b', product_id: 'j-006', image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop', sort_order: 1, alt_text: 'Emerald Pendant Detail' },
    ],
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'j-007',
    title: 'KUNDAN CHOKER NECKLACE',
    slug: 'kundan-choker-necklace',
    description: 'Traditional Kundan choker with polki diamonds and meenakari enamel work.',
    price: 62000,
    sale_price: null,
    sku: 'ZJW-007',
    stock_quantity: 3,
    track_inventory: true,
    allow_backorders: false,
    status: 'active',
    tags: ['choker', 'kundan', 'ethnic', 'polki'],
    og_image_url: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=800&auto=format&fit=crop',
    images: [
      { id: 'ji-007', product_id: 'j-007', image_url: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=800&auto=format&fit=crop', sort_order: 0, alt_text: 'Kundan Choker' },
      { id: 'ji-007b', product_id: 'j-007', image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop', sort_order: 1, alt_text: 'Kundan Detail' },
    ],
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'j-008',
    title: 'RUBY STUD EARRINGS',
    slug: 'ruby-stud-earrings',
    description: 'Natural Burmese ruby studs in a 4-prong platinum setting. Vivid red brilliance.',
    price: 29500,
    sale_price: null,
    sku: 'ZJW-008',
    stock_quantity: 10,
    track_inventory: true,
    allow_backorders: false,
    status: 'active',
    tags: ['earrings', 'ruby', 'platinum', 'studs'],
    og_image_url: 'https://images.unsplash.com/photo-1603974372039-adc49044b6bd?q=80&w=800&auto=format&fit=crop',
    images: [
      { id: 'ji-008', product_id: 'j-008', image_url: 'https://images.unsplash.com/photo-1603974372039-adc49044b6bd?q=80&w=800&auto=format&fit=crop', sort_order: 0, alt_text: 'Ruby Studs' },
      { id: 'ji-008b', product_id: 'j-008', image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop', sort_order: 1, alt_text: 'Ruby Studs Side' },
    ],
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'j-009',
    title: 'LAYERED CHAIN ANKLET',
    slug: 'layered-chain-anklet',
    description: 'Delicate 14K gold multi-strand anklet with tiny star charms. Beach to brunch.',
    price: 9800,
    sale_price: 7999,
    sku: 'ZJW-009',
    stock_quantity: 25,
    track_inventory: true,
    allow_backorders: false,
    status: 'active',
    tags: ['anklet', 'gold', 'layered', 'charm'],
    og_image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop',
    images: [
      { id: 'ji-009', product_id: 'j-009', image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop', sort_order: 0, alt_text: 'Gold Anklet' },
      { id: 'ji-009b', product_id: 'j-009', image_url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop', sort_order: 1, alt_text: 'Anklet Detail' },
    ],
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'j-010',
    title: 'TOURMALINE COCKTAIL RING',
    slug: 'tourmaline-cocktail-ring',
    description: 'Bi-colour pink-green tourmaline in an 18K gold East-West setting. Statement piece.',
    price: 42000,
    sale_price: null,
    sku: 'ZJW-010',
    stock_quantity: 5,
    track_inventory: true,
    allow_backorders: false,
    status: 'active',
    tags: ['ring', 'tourmaline', 'cocktail', 'statement'],
    og_image_url: 'https://images.unsplash.com/photo-1589128777073-263566ae5e4d?q=80&w=800&auto=format&fit=crop',
    images: [
      { id: 'ji-010', product_id: 'j-010', image_url: 'https://images.unsplash.com/photo-1589128777073-263566ae5e4d?q=80&w=800&auto=format&fit=crop', sort_order: 0, alt_text: 'Tourmaline Ring' },
      { id: 'ji-010b', product_id: 'j-010', image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop', sort_order: 1, alt_text: 'Tourmaline Ring Top' },
    ],
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'j-011',
    title: 'OXIDISED SILVER JHUMKAS',
    slug: 'oxidised-silver-jhumkas',
    description: 'Handcrafted 925 sterling silver jhumka earrings with intricate floral motifs.',
    price: 5500,
    sale_price: null,
    sku: 'ZJW-011',
    stock_quantity: 30,
    track_inventory: true,
    allow_backorders: false,
    status: 'active',
    tags: ['earrings', 'silver', 'jhumka', 'ethnic'],
    og_image_url: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=800&auto=format&fit=crop',
    images: [
      { id: 'ji-011', product_id: 'j-011', image_url: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=800&auto=format&fit=crop', sort_order: 0, alt_text: 'Silver Jhumkas' },
    ],
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'j-012',
    title: 'DIAMOND TENNIS BRACELET',
    slug: 'diamond-tennis-bracelet',
    description: '3ct total weight round brilliant diamonds in a 4-prong 14K white gold setting.',
    price: 115000,
    sale_price: 99000,
    sku: 'ZJW-012',
    stock_quantity: 2,
    track_inventory: true,
    allow_backorders: false,
    status: 'active',
    tags: ['bracelet', 'diamond', 'tennis', 'luxury'],
    og_image_url: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?q=80&w=800&auto=format&fit=crop',
    images: [
      { id: 'ji-012', product_id: 'j-012', image_url: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?q=80&w=800&auto=format&fit=crop', sort_order: 0, alt_text: 'Diamond Tennis Bracelet' },
      { id: 'ji-012b', product_id: 'j-012', image_url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop', sort_order: 1, alt_text: 'Tennis Bracelet Clasp' },
    ],
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'j-013',
    title: 'MOONSTONE SILVER PENDANT',
    slug: 'moonstone-silver-pendant',
    description: 'Iridescent rainbow moonstone in a handcrafted 925 silver teardrop bezel.',
    price: 6800,
    sale_price: null,
    sku: 'ZJW-013',
    stock_quantity: 18,
    track_inventory: true,
    allow_backorders: false,
    status: 'active',
    tags: ['pendant', 'moonstone', 'silver', 'boho'],
    og_image_url: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?q=80&w=800&auto=format&fit=crop',
    images: [
      { id: 'ji-013', product_id: 'j-013', image_url: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?q=80&w=800&auto=format&fit=crop', sort_order: 0, alt_text: 'Moonstone Pendant' },
    ],
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'j-014',
    title: 'GOLD MANGALSUTRA',
    slug: 'gold-mangalsutra',
    description: '22K gold mangalsutra with black bead chain and detachable diamond pendant.',
    price: 78000,
    sale_price: null,
    sku: 'ZJW-014',
    stock_quantity: 7,
    track_inventory: true,
    allow_backorders: false,
    status: 'active',
    tags: ['mangalsutra', 'gold', 'diamond', 'bridal'],
    og_image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
    images: [
      { id: 'ji-014', product_id: 'j-014', image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop', sort_order: 0, alt_text: 'Mangalsutra' },
      { id: 'ji-014b', product_id: 'j-014', image_url: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=800&auto=format&fit=crop', sort_order: 1, alt_text: 'Mangalsutra Pendant' },
    ],
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'j-015',
    title: 'AMETHYST ETERNITY BAND',
    slug: 'amethyst-eternity-band',
    description: 'Natural amethyst full eternity band in 14K yellow gold. Deep violet splendour.',
    price: 18500,
    sale_price: null,
    sku: 'ZJW-015',
    stock_quantity: 9,
    track_inventory: true,
    allow_backorders: false,
    status: 'active',
    tags: ['ring', 'amethyst', 'eternity', 'band'],
    og_image_url: 'https://images.unsplash.com/photo-1589128777073-263566ae5e4d?q=80&w=800&auto=format&fit=crop',
    images: [
      { id: 'ji-015', product_id: 'j-015', image_url: 'https://images.unsplash.com/photo-1589128777073-263566ae5e4d?q=80&w=800&auto=format&fit=crop', sort_order: 0, alt_text: 'Amethyst Ring' },
    ],
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'j-016',
    title: 'POLKI MAANG TIKKA',
    slug: 'polki-maang-tikka',
    description: 'Uncut polki diamond maang tikka with ruby and emerald accents in gold foil.',
    price: 45000,
    sale_price: null,
    sku: 'ZJW-016',
    stock_quantity: 4,
    track_inventory: true,
    allow_backorders: false,
    status: 'active',
    tags: ['maang tikka', 'polki', 'ethnic', 'bridal'],
    og_image_url: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=800&auto=format&fit=crop',
    images: [
      { id: 'ji-016', product_id: 'j-016', image_url: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=800&auto=format&fit=crop', sort_order: 0, alt_text: 'Maang Tikka' },
    ],
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'j-017',
    title: 'CITRINE GOLD HUGGIES',
    slug: 'citrine-gold-huggies',
    description: 'Yellow citrine huggie hoop earrings in 14K gold. Warm tones, everyday luxe.',
    price: 12000,
    sale_price: 9999,
    sku: 'ZJW-017',
    stock_quantity: 14,
    track_inventory: true,
    allow_backorders: false,
    status: 'active',
    tags: ['earrings', 'citrine', 'huggies', 'hoops'],
    og_image_url: 'https://images.unsplash.com/photo-1603974372039-adc49044b6bd?q=80&w=800&auto=format&fit=crop',
    images: [
      { id: 'ji-017', product_id: 'j-017', image_url: 'https://images.unsplash.com/photo-1603974372039-adc49044b6bd?q=80&w=800&auto=format&fit=crop', sort_order: 0, alt_text: 'Citrine Huggies' },
    ],
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'j-018',
    title: 'SILVER CUFF BRACELET',
    slug: 'silver-cuff-bracelet',
    description: 'Hammered 925 silver open cuff bracelet with tribal geometric engravings.',
    price: 4200,
    sale_price: null,
    sku: 'ZJW-018',
    stock_quantity: 22,
    track_inventory: true,
    allow_backorders: false,
    status: 'active',
    tags: ['bracelet', 'silver', 'cuff', 'tribal'],
    og_image_url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop',
    images: [
      { id: 'ji-018', product_id: 'j-018', image_url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop', sort_order: 0, alt_text: 'Silver Cuff' },
    ],
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'j-019',
    title: 'TANZANITE SOLITAIRE RING',
    slug: 'tanzanite-solitaire-ring',
    description: 'Rare blue-violet tanzanite in an elegant 18K white gold cathedral setting.',
    price: 68000,
    sale_price: null,
    sku: 'ZJW-019',
    stock_quantity: 3,
    track_inventory: true,
    allow_backorders: false,
    status: 'active',
    tags: ['ring', 'tanzanite', 'solitaire', 'luxury'],
    og_image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop',
    images: [
      { id: 'ji-019', product_id: 'j-019', image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop', sort_order: 0, alt_text: 'Tanzanite Ring' },
    ],
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'j-020',
    title: 'TEMPLE HAAR NECKLACE',
    slug: 'temple-haar-necklace',
    description: 'South Indian temple jewellery long haar with lakshmi coin and ruby beads.',
    price: 89000,
    sale_price: 74999,
    sku: 'ZJW-020',
    stock_quantity: 2,
    track_inventory: true,
    allow_backorders: false,
    status: 'active',
    tags: ['necklace', 'haar', 'temple', 'south indian'],
    og_image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
    images: [
      { id: 'ji-020', product_id: 'j-020', image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop', sort_order: 0, alt_text: 'Temple Haar' },
    ],
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'j-021',
    title: 'OPAL STARBURST EARRINGS',
    slug: 'opal-starburst-earrings',
    description: 'Ethiopian opal in a 14K gold starburst halo. Every angle reveals new colour.',
    price: 22500,
    sale_price: null,
    sku: 'ZJW-021',
    stock_quantity: 8,
    track_inventory: true,
    allow_backorders: false,
    status: 'active',
    tags: ['earrings', 'opal', 'starburst', 'statement'],
    og_image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop',
    images: [
      { id: 'ji-021', product_id: 'j-021', image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop', sort_order: 0, alt_text: 'Opal Earrings' },
    ],
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'j-022',
    title: 'PAVÉ DIAMOND BAND',
    slug: 'pave-diamond-band',
    description: 'Half-eternity pavé diamond band in 18K yellow gold. Stackable perfection.',
    price: 35000,
    sale_price: null,
    sku: 'ZJW-022',
    stock_quantity: 11,
    track_inventory: true,
    allow_backorders: false,
    status: 'active',
    tags: ['ring', 'diamond', 'pave', 'band'],
    og_image_url: 'https://images.unsplash.com/photo-1589128777073-263566ae5e4d?q=80&w=800&auto=format&fit=crop',
    images: [
      { id: 'ji-022', product_id: 'j-022', image_url: 'https://images.unsplash.com/photo-1589128777073-263566ae5e4d?q=80&w=800&auto=format&fit=crop', sort_order: 0, alt_text: 'Pave Band' },
    ],
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'j-023',
    title: 'BAROQUE PEARL DROPS',
    slug: 'baroque-pearl-drops',
    description: 'Irregular baroque South Sea pearls on gold wire drops. Nature\'s asymmetry.',
    price: 16500,
    sale_price: null,
    sku: 'ZJW-023',
    stock_quantity: 13,
    track_inventory: true,
    allow_backorders: false,
    status: 'active',
    tags: ['earrings', 'pearl', 'baroque', 'drops'],
    og_image_url: 'https://images.unsplash.com/photo-1603974372039-adc49044b6bd?q=80&w=800&auto=format&fit=crop',
    images: [
      { id: 'ji-023', product_id: 'j-023', image_url: 'https://images.unsplash.com/photo-1603974372039-adc49044b6bd?q=80&w=800&auto=format&fit=crop', sort_order: 0, alt_text: 'Baroque Pearl Drops' },
    ],
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'j-024',
    title: 'GOLD NOSE RING SET',
    slug: 'gold-nose-ring-set',
    description: 'Set of 3 delicate 14K gold nose rings — plain, CZ-studded, and beaded.',
    price: 7200,
    sale_price: 5999,
    sku: 'ZJW-024',
    stock_quantity: 35,
    track_inventory: true,
    allow_backorders: false,
    status: 'active',
    tags: ['nose ring', 'gold', 'set', 'piercing'],
    og_image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop',
    images: [
      { id: 'ji-024', product_id: 'j-024', image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop', sort_order: 0, alt_text: 'Nose Ring Set' },
    ],
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'j-025',
    title: 'GARNET CLUSTER RING',
    slug: 'garnet-cluster-ring',
    description: 'Deep red garnet cluster ring in antique-finish 18K rose gold. Bohemian luxury.',
    price: 24000,
    sale_price: null,
    sku: 'ZJW-025',
    stock_quantity: 7,
    track_inventory: true,
    allow_backorders: false,
    status: 'active',
    tags: ['ring', 'garnet', 'cluster', 'rose gold'],
    og_image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop',
    images: [
      { id: 'ji-025', product_id: 'j-025', image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop', sort_order: 0, alt_text: 'Garnet Ring' },
    ],
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'j-026',
    title: 'LABRADORITE STATEMENT NECKLACE',
    slug: 'labradorite-statement-necklace',
    description: 'Large labradorite cabochon in an oxidised silver bezel — bold and mystical.',
    price: 11000,
    sale_price: null,
    sku: 'ZJW-026',
    stock_quantity: 10,
    track_inventory: true,
    allow_backorders: false,
    status: 'active',
    tags: ['necklace', 'labradorite', 'silver', 'statement'],
    og_image_url: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?q=80&w=800&auto=format&fit=crop',
    images: [
      { id: 'ji-026', product_id: 'j-026', image_url: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?q=80&w=800&auto=format&fit=crop', sort_order: 0, alt_text: 'Labradorite Necklace' },
    ],
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'j-027',
    title: 'ANTIQUE GOLD KAMARBANDH',
    slug: 'antique-gold-kamarbandh',
    description: 'Bridal waist chain in 22K antique gold with ruby and emerald inlays.',
    price: 135000,
    sale_price: null,
    sku: 'ZJW-027',
    stock_quantity: 1,
    track_inventory: true,
    allow_backorders: false,
    status: 'active',
    tags: ['waist chain', 'kamarbandh', 'bridal', 'antique'],
    og_image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
    images: [
      { id: 'ji-027', product_id: 'j-027', image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop', sort_order: 0, alt_text: 'Kamarbandh' },
    ],
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'j-028',
    title: 'AQUAMARINE DROP PENDANT',
    slug: 'aquamarine-drop-pendant',
    description: 'Sky-blue aquamarine briolette on a fine 14K white gold snake chain.',
    price: 19800,
    sale_price: null,
    sku: 'ZJW-028',
    stock_quantity: 12,
    track_inventory: true,
    allow_backorders: false,
    status: 'active',
    tags: ['pendant', 'aquamarine', 'drop', 'necklace'],
    og_image_url: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=800&auto=format&fit=crop',
    images: [
      { id: 'ji-028', product_id: 'j-028', image_url: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=800&auto=format&fit=crop', sort_order: 0, alt_text: 'Aquamarine Pendant' },
    ],
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'j-029',
    title: 'MALACHITE GOLD COCKTAIL RING',
    slug: 'malachite-gold-cocktail-ring',
    description: 'Oval malachite cabochon in a sculptural 18K gold bezel. Earthy opulence.',
    price: 27500,
    sale_price: null,
    sku: 'ZJW-029',
    stock_quantity: 6,
    track_inventory: true,
    allow_backorders: false,
    status: 'active',
    tags: ['ring', 'malachite', 'cocktail', 'statement'],
    og_image_url: 'https://images.unsplash.com/photo-1589128777073-263566ae5e4d?q=80&w=800&auto=format&fit=crop',
    images: [
      { id: 'ji-029', product_id: 'j-029', image_url: 'https://images.unsplash.com/photo-1589128777073-263566ae5e4d?q=80&w=800&auto=format&fit=crop', sort_order: 0, alt_text: 'Malachite Ring' },
    ],
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: 'j-030',
    title: 'DIAMOND NOSE PIN',
    slug: 'diamond-nose-pin',
    description: 'Single 0.08ct VVS diamond nose pin in 18K white gold screw back setting.',
    price: 8500,
    sale_price: null,
    sku: 'ZJW-030',
    stock_quantity: 40,
    track_inventory: true,
    allow_backorders: false,
    status: 'active',
    tags: ['nose pin', 'diamond', 'gold', 'minimalist'],
    og_image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop',
    images: [
      { id: 'ji-030', product_id: 'j-030', image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop', sort_order: 0, alt_text: 'Diamond Nose Pin' },
    ],
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
] as Product[];

// ─── Testimonials ───────────────────────────────────────────
const TESTIMONIALS = [
  { quote: '"The Aurora Diamond Ring is the most beautiful piece I have ever worn. The craftsmanship is extraordinary and the diamonds catch light perfectly. Worth every rupee."', name: 'PRIYA K.', location: 'MUMBAI' },
  { quote: '"My Celestial Pearl Necklace arrived in stunning packaging. The quality is impeccable and I received countless compliments at my wedding. ZELIX is now my go-to jeweller."', name: 'NEHA S.', location: 'BENGALURU' },
  { quote: '"I ordered the Kundan Choker for my sister\'s wedding. People stopped to admire it all evening. Nothing else captures traditional craftsmanship like ZELIX."', name: 'ARJUN M.', location: 'DELHI' },
];

// ─── Stagger container ─────────────────────────────────────
const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const fadeUpItem = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } },
};

export default function HomePage() {
  const { addItem } = useCart();
  const [heroSlides, setHeroSlides]     = useState<HeroSlide[]>(DEFAULT_SLIDES);
  const [activeSlide, setActiveSlide]   = useState(0);
  const [dbProducts, setDbProducts]     = useState<Product[]>([]);
  const [announcement, setAnnouncement] = useState({ active: true, text: '' });
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const intervalRef   = useRef<NodeJS.Timeout | null>(null);

  // ─── Data fetch ────────────────────────────────────────
  useEffect(() => {
    async function loadData() {
      try {
        const { data: slides } = await supabase.from('hero_slides').select('*').eq('is_active', true).order('sort_order');
        if (slides?.length) setHeroSlides(slides);

        const { data: prods } = await supabase.from('products').select('*, images:product_images(*)').eq('status', 'active').order('created_at', { ascending: false }).limit(30);
        if (prods?.length) setDbProducts(prods as Product[]);

        const { data: settings } = await supabase.from('site_settings').select('announcement_bar_active, announcement_bar_text').single();
        if (settings) setAnnouncement({ active: settings.announcement_bar_active, text: settings.announcement_bar_text });
      } catch {
        console.warn('Supabase offline. Premium jewellery preview catalog active.');
      }
    }
    loadData();
  }, []);

  // ─── Carousel auto-advance ─────────────────────────────
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActiveSlide((p) => (p + 1) % heroSlides.length);
    }, 7000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [heroSlides]);

  // ─── Testimonial auto-advance ──────────────────────────
  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial((p) => (p + 1) % TESTIMONIALS.length), 5500);
    return () => clearInterval(t);
  }, []);

  // Use DB products if available, otherwise show 30 jewellery samples
  const displayProducts = dbProducts.length > 0 ? dbProducts : JEWELLERY_PRODUCTS;

  return (
    <div className="flex flex-col w-full min-h-screen bg-background text-foreground">

      {/* ═══════════════════════════════════
          1. ANNOUNCEMENT BAR
      ═══════════════════════════════════ */}
      {announcement.active && (
        <div className="border-b border-border bg-accent text-white flex items-center overflow-hidden select-none h-10">
          <div className="flex animate-marquee-fast">
            {Array(10).fill(announcement.text || 'ZELIX LUXURY — HANDCRAFTED ELEGANCE // FREE SHIPPING ABOVE ₹5,000 // COMPLIMENTARY GIFT WRAPPING').map((t, i) => (
              <span key={i} className="shrink-0 mx-12 font-sans font-medium tracking-widest text-xs uppercase">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════
          2. HERO SECTION
      ═══════════════════════════════════ */}
      <section ref={heroRef} className="relative w-full h-[90vh] min-h-[600px] flex items-center bg-[#FDFBF7]">
        {/* Background Image placed to the right */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#FDFBF7] via-[#FDFBF7]/90 to-transparent z-10 w-[70%]" />
          <img 
            src="/hero-jewelry.png" 
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
      </section>

      {/* ═══════════════════════════════════
          3. THE COLLECTION
      ═══════════════════════════════════ */}
      <section className="py-24 sm:py-32 bg-background">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col items-center text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-foreground mb-4">
              Curated Selection
            </h2>
            <div className="w-16 h-px bg-accent"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 xl:gap-12">
            {displayProducts.slice(0, 8).map((product) => {
              const mainImage = product.images?.[0]?.image_url || product.og_image_url || '/placeholder.jpg';
              const hasSale = product.sale_price !== null && product.sale_price !== undefined;
              return (
                <div key={product.id} className="group relative flex flex-col cursor-pointer">
                  <Link href={`/products/${product.slug}`} className="block relative aspect-[3/4] overflow-hidden rounded-2xl bg-card border border-border mb-4">
                    <img
                      alt={product.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
                      src={mainImage}
                    />
                  </Link>

                  <div className="flex flex-col">
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="text-lg font-serif text-foreground group-hover:text-accent transition-colors leading-tight mb-1">
                        {product.title}
                      </h3>
                    </Link>
                    <div className="flex items-baseline gap-3 font-sans">
                      {hasSale ? (
                        <>
                          <span className="text-sm font-medium text-error">
                            ₹{product.sale_price?.toLocaleString('en-IN')}
                          </span>
                          <span className="text-sm line-through text-muted">
                            ₹{product.price.toLocaleString('en-IN')}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-medium text-foreground">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center mt-20">
            <Link
              href="/products"
              className="inline-flex items-center gap-3 font-sans text-sm font-medium border-b border-foreground pb-1 hover:text-accent hover:border-accent transition-colors"
            >
              Explore All Pieces
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          4. EDITORIAL FEATURE
      ═══════════════════════════════════ */}
      <section className="relative h-[70vh] min-h-[500px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=1800&auto=format&fit=crop)',
          }}
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 h-full flex flex-col justify-center max-w-[1440px] mx-auto px-6 lg:px-12 text-white">
          <div className="max-w-xl">
            <div className="text-sm font-sans font-medium tracking-widest uppercase mb-6 opacity-90">
              The Essentials Collection
            </div>
            <h2 className="text-5xl md:text-7xl font-serif mb-10 leading-tight">
              Elevate your everyday.
            </h2>
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-10 py-4 bg-white text-foreground font-sans font-medium text-sm rounded-full hover:bg-gray-50 transition-colors shadow-sm"
            >
              Discover the Collection
            </Link>
          </div>
        </div>
      </section>

      

      {/* ═══════════════════════════════════
          6. NEWSLETTER STRIP
      ═══════════════════════════════════ */}
      <section className="py-24 bg-background">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-6">
            Join the inner circle
          </h2>
          <p className="font-sans text-muted mb-10">
            Subscribe to receive updates on new arrivals, exclusive access, and personalized offers.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 justify-center">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 max-w-sm px-6 py-4 bg-white border border-border rounded-full font-sans text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-accent text-white font-sans font-medium text-sm rounded-full hover:bg-accent-hover transition-colors shadow-sm whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
