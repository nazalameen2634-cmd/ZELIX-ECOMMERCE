'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ArrowUpRight, ShoppingBag } from 'lucide-react';
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
    <div className="flex flex-col w-full min-h-screen" style={{ background: '#080808' }}>

      {/* ═══════════════════════════════════
          1. ANNOUNCEMENT BAR
      ═══════════════════════════════════ */}
      {announcement.active && (
        <div className="border-b overflow-hidden select-none flex items-center" style={{ background: '#C9A96E', borderColor: 'rgba(245,240,235,0.1)', height: '36px' }}>
          <div className="flex animate-marquee-fast">
            {Array(10).fill(announcement.text || 'ZELIX JEWELLERY — HANDCRAFTED LUXURY // FREE SHIPPING ABOVE ₹5,000 // CERTIFIED DIAMONDS & HALLMARKED GOLD').map((t, i) => (
              <span key={i} className="shrink-0 mx-12 font-mono font-bold tracking-[0.18em] text-[9px] uppercase" style={{ color: '#080808' }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════
          2. HERO SECTION
      ═══════════════════════════════════ */}
      <section ref={heroRef} className="relative h-[85vh] flex items-center justify-center overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-background z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)]" />
        <div className="absolute inset-0 opacity-30">
          <img
            alt="Hero Background — jewellery"
            className="object-cover object-center w-full h-full scale-105 blur-sm"
            src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1800&auto=format&fit=crop"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-20 flex flex-col items-center">
          <span className="inline-block border border-accent/40 text-accent text-[10px] font-mono font-bold uppercase tracking-[0.25em] px-3.5 py-1.5 rounded-full mb-6 bg-accent/5 animate-pulse-glow">
            Luxury Jewellery // Handcrafted Collection
          </span>
          <h1 className="text-5xl sm:text-7xl lg:text-9xl font-black tracking-tighter text-white uppercase select-none mb-6">
            ZELIX<span className="text-zinc-600 font-light font-mono">//</span>GEMS
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground uppercase tracking-widest max-w-xl mb-10 leading-relaxed font-light">
            Certified diamonds, hallmarked gold &amp; ethically sourced gemstones. Crafted for those who define elegance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors rounded"
            >
              Shop Collections
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            </Link>
            <Link
              href="/products?category=bridal"
              className="inline-flex items-center justify-center px-8 py-4 glass text-white font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all rounded"
            >
              Bridal Collection
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          3. THE COLLECTION — 5 PER ROW
      ═══════════════════════════════════ */}
      <section className="py-20 sm:py-32 border-b" style={{ background: '#0d0d11', borderColor: 'rgba(245,240,235,0.05)' }}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
            className="flex flex-col items-center text-center mb-16"
          >
            <motion.div variants={fadeUpItem} className="text-xs font-mono font-bold uppercase tracking-[0.25em] mb-3" style={{ color: '#C9A96E' }}>
              CURATED FINE JEWELLERY
            </motion.div>
            <motion.h2
              variants={fadeUpItem}
              className="text-[36px] md:text-[56px] font-sans font-extrabold uppercase tracking-tight leading-[0.9] text-[#F5F0EB]"
            >
              The Collection
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 xl:gap-6"
          >
            {displayProducts.slice(0, 10).map((product) => {
              const mainImage = product.images?.[0]?.image_url || product.og_image_url || '/placeholder.jpg';
              const hasSale = product.sale_price !== null && product.sale_price !== undefined;
              return (
                <motion.div key={product.id} variants={fadeUpItem}>
                  <div
                    className="group relative aspect-[3/4] overflow-hidden flex flex-col justify-end p-6 border transition-all duration-300 cursor-pointer rounded-[2px]"
                    style={{ borderColor: 'rgba(245,240,235,0.05)' }}
                  >
                    <Link
                      href={`/products/${product.slug}`}
                      className="absolute inset-0 z-0 block"
                    >
                      {/* Dark Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent z-10" />

                      {/* Background Image with Zoom & Color Effect */}
                      <div className="absolute inset-0 bg-zinc-950 scale-100 group-hover:scale-105 transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]">
                        <img
                          alt={product.title}
                          className="object-cover w-full h-full opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                          src={mainImage}
                        />
                      </div>
                    </Link>

                    {/* Content overlay */}
                    <div className="relative z-10 text-left pointer-events-none pr-8">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5F0EB] mb-1.5 group-hover:text-[#C9A96E] transition-colors font-sans leading-tight">
                        {product.title}
                      </h3>
                      <div className="flex items-baseline gap-2 font-mono">
                        {hasSale ? (
                          <>
                            <span className="text-[11px] font-bold text-[#EF4444]">
                              ₹{product.sale_price?.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[9px] line-through text-[#6B6560]">
                              ₹{product.price.toLocaleString('en-IN')}
                            </span>
                          </>
                        ) : (
                          <span className="text-[11px] font-bold text-[#C9A96E]">
                            ₹{product.price.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Add Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const defaultSize = product.options?.find((o: any) => o.name.toLowerCase() === 'size')?.values?.[0]?.value || 'OS';
                        addItem(product, 1, defaultSize);
                      }}
                      className="absolute bottom-5 right-5 z-20 p-2.5 bg-[#C9A96E] hover:bg-[#E8CFA0] text-[#080808] rounded-full transition-all duration-300 shadow-md cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95"
                      title="Add to Cart"
                    >
                      <ShoppingBag size={12} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          <div className="flex justify-center mt-16">
            <Link
              href="/products"
              className="group inline-flex items-center gap-3 font-mono text-[10px] font-bold tracking-[0.22em] uppercase px-8 py-4 border transition-all duration-300"
              style={{ borderColor: 'rgba(245,240,235,0.1)', color: '#F5F0EB' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#C9A96E';
                e.currentTarget.style.color = '#C9A96E';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(245,240,235,0.1)';
                e.currentTarget.style.color = '#F5F0EB';
              }}
            >
              EXPLORE ALL PIECES
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          4. EDITORIAL FEATURE BANNER
      ═══════════════════════════════════ */}
      <section className="relative border-b overflow-hidden" style={{ height: '70vh', minHeight: '460px', borderColor: 'rgba(245,240,235,0.04)' }}>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=1800&auto=format&fit=crop)',
            filter: 'brightness(0.28) saturate(0.6)',
          }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(8,8,8,0.95) 0%, rgba(8,8,8,0.5) 60%, rgba(8,8,8,0.3) 100%)' }} />
        <div className="relative z-10 h-full flex items-center container-custom">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUpItem} className="section-label mb-8">
              BRIDAL COLLECTION · EXCLUSIVE ACCESS
            </motion.div>
            <motion.h2
              variants={fadeUpItem}
              className="font-sans font-extrabold uppercase tracking-tight leading-[0.9] mb-10 max-w-2xl text-[#F5F0EB]"
              style={{ fontSize: 'clamp(36px, 6vw, 80px)' }}
            >
              Jewellery that tells your story.
            </motion.h2>
            <motion.div variants={fadeUpItem}>
              <Link
                href="/products"
                className="group inline-flex items-center gap-3 font-mono text-[10px] font-bold tracking-[0.22em] uppercase px-8 py-4 border transition-all duration-500"
                style={{ borderColor: '#C9A96E', color: '#C9A96E' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#C9A96E'; (e.currentTarget as HTMLElement).style.color = '#080808'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#C9A96E'; }}
              >
                EXPLORE THE FULL COLLECTION
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          5. TRUST PILLARS
      ═══════════════════════════════════ */}
      <section className="py-20 border-b" style={{ background: '#060606', borderColor: 'rgba(245,240,235,0.04)' }}>
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x" style={{ borderColor: 'rgba(245,240,235,0.06)' }}>
            {[
              { icon: '◇', title: 'CERTIFIED DIAMONDS',  body: 'Every diamond comes with a GIA or IGI certification, guaranteeing authenticity and quality.' },
              { icon: '⟴', title: 'HALLMARKED GOLD',     body: 'All gold jewellery is BIS hallmarked 916 (22K) or 750 (18K) with government assurance.' },
              { icon: '↺', title: 'LIFETIME WARRANTY',   body: 'Free polishing, re-sizing and cleaning for life. Your investment, protected forever.' },
            ].map((pillar, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="flex flex-col items-center text-center px-12 py-10 gap-5"
              >
                <span className="text-[28px]" style={{ color: '#C9A96E' }}>{pillar.icon}</span>
                <h4 className="font-mono text-[10px] font-bold tracking-[0.22em]" style={{ color: '#F5F0EB' }}>{pillar.title}</h4>
                <p className="text-[12px] leading-relaxed" style={{ color: '#6B6560', fontFamily: 'Geist, Inter, sans-serif' }}>{pillar.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          6. TESTIMONIALS
      ═══════════════════════════════════ */}
      <section className="py-32 border-b" style={{ background: '#080808', borderColor: 'rgba(245,240,235,0.04)' }}>
        <div className="container-narrow">
          <div className="section-label mb-12">VERIFIED COMMUNITY</div>
          <div className="relative min-h-[260px] flex flex-col justify-between">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="font-sans leading-none mb-4 text-[120px] text-[rgba(201,169,110,0.15)] font-black" style={{ lineHeight: 0.7 }}>
                  &quot;
                </div>
                <p className="font-sans font-medium leading-relaxed mb-10 max-w-3xl text-[#D4CBBF]" style={{ fontSize: 'clamp(18px, 2.5vw, 28px)' }}>
                  {TESTIMONIALS[activeTestimonial].quote.replace(/^"|"$/g, '')}
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-[1px]" style={{ background: '#C9A96E' }} />
                  <span className="font-mono text-[10px] font-bold tracking-[0.2em]" style={{ color: '#C9A96E' }}>
                    {TESTIMONIALS[activeTestimonial].name}
                  </span>
                  <span className="font-mono text-[9px] tracking-widest" style={{ color: '#4A4642' }}>
                    {"// "}{TESTIMONIALS[activeTestimonial].location}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="flex gap-3 mt-12">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className="cursor-pointer transition-all duration-300 rounded-full"
                  style={{
                    width: i === activeTestimonial ? '24px' : '6px',
                    height: '6px',
                    background: i === activeTestimonial ? '#C9A96E' : 'rgba(245,240,235,0.12)',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          7. ORDER TRACKING
      ═══════════════════════════════════ */}
      <OrderTrackingSection />

      {/* ═══════════════════════════════════
          8. NEWSLETTER STRIP
      ═══════════════════════════════════ */}
      <section className="py-24" style={{ background: '#060606' }}>
        <div className="container-narrow flex flex-col lg:flex-row items-center justify-between gap-10">
          <div>
            <div className="section-label mb-5">PRIVATE CIRCLE</div>
            <h2
              className="text-[32px] md:text-[44px] font-sans font-extrabold uppercase tracking-tight leading-[0.9] text-[#F5F0EB]"
            >
              First access.<br />Always.
            </h2>
          </div>
          <div className="w-full lg:w-auto lg:min-w-[400px]">
            <p className="font-mono text-[10px] tracking-[0.15em] mb-6" style={{ color: '#6B6560' }}>
              JOIN THE ZELIX INNER CIRCLE FOR EARLY DROPS, PRIVATE SALES AND RARE RELEASES.
            </p>
            <form className="flex items-end gap-0 border-b" style={{ borderColor: 'rgba(245,240,235,0.2)' }}>
              <input
                type="email"
                placeholder="YOUR EMAIL ADDRESS"
                className="flex-1 py-3 bg-transparent font-mono text-[10px] tracking-[0.15em] outline-none"
                style={{ color: '#F5F0EB' }}
              />
              <button
                type="submit"
                className="flex items-center gap-2 font-mono text-[9px] font-bold tracking-[0.2em] pb-3 transition-colors duration-300"
                style={{ color: '#C9A96E' }}
              >
                SUBSCRIBE <ArrowRight size={10} />
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
