'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ShoppingBag, ClipboardList, FolderTree,
  Tag, Settings, Globe, Image, BarChart3, Users,
  LogOut, ChevronLeft, ChevronRight, Menu, X, Star,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

const MENU_ITEMS = [
  { label: 'DASHBOARD',    href: '/admin',            icon: LayoutDashboard, group: 'core' },
  { label: 'PRODUCTS',     href: '/admin/products',   icon: ShoppingBag,     group: 'core' },
  { label: 'ORDERS',       href: '/admin/orders',     icon: ClipboardList,   group: 'core' },
  { label: 'CUSTOMERS',    href: '/admin/customers',  icon: Users,           group: 'core' },
  { label: 'CATEGORIES',   href: '/admin/categories', icon: FolderTree,      group: 'catalog' },
  { label: 'REVIEWS',      href: '/admin/reviews',    icon: Star,            group: 'catalog' },
  { label: 'COUPONS',      href: '/admin/coupons',    icon: Tag,             group: 'catalog' },
  { label: 'MEDIA',        href: '/admin/media',      icon: Image,           group: 'catalog' },
  { label: 'ANALYTICS',    href: '/admin/analytics',  icon: BarChart3,       group: 'system' },
  { label: 'SEO & META',   href: '/admin/seo',        icon: Globe,           group: 'system' },
  { label: 'SETTINGS',     href: '/admin/settings',   icon: Settings,        group: 'system' },
];

const GROUP_LABELS: Record<string, string> = {
  core:    'CORE',
  catalog: 'CATALOG',
  system:  'SYSTEM',
};

function SidebarContent({ collapsed, onClose }: { collapsed: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();

  const grouped = MENU_ITEMS.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, typeof MENU_ITEMS>);

  return (
    <div className="flex flex-col h-full" style={{ background: '#FAFAFA' }}>
      {/* ─── Logo ─── */}
      <div
        className="flex items-center justify-between px-5 shrink-0"
        style={{ height: '72px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}
      >
        {!collapsed && (
          <div>
            <div
              className="font-serif text-[#111111] text-[18px] font-light tracking-[0.3em]"
            >
              ZELIX
            </div>
            <div className="font-mono text-[7px] tracking-[0.25em]" style={{ color: '#4A4642' }}>
              ADMIN CONSOLE
            </div>
          </div>
        )}
        {collapsed && (
          <div
            className="font-serif text-[#C9A96E] text-[16px] font-light tracking-[0.3em]"
          >
            Z
          </div>
        )}
        {onClose && (
          <button onClick={onClose} className="text-[#6B6560] hover:text-[#111111] transition-colors cursor-pointer">
            <X size={16} />
          </button>
        )}
      </div>

      {/* ─── Navigation ─── */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 hide-scrollbar flex flex-col gap-6">
        {Object.entries(grouped).map(([group, items]) => (
          <div key={group}>
            {!collapsed && (
              <div className="font-mono text-[8px] font-bold tracking-[0.28em] px-3 mb-3" style={{ color: '#282420' }}>
                {GROUP_LABELS[group]}
              </div>
            )}
            <div className="flex flex-col gap-1">
              {items.map((item) => {
                const Icon      = item.icon;
                const isActive  = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    title={collapsed ? item.label : ''}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-[3px] font-mono text-[9px] font-bold tracking-[0.16em] transition-all duration-200 group/link ${
                      collapsed ? 'justify-center' : ''
                    }`}
                    style={
                      isActive
                        ? {
                            background: 'rgba(201,169,110,0.08)',
                            color: '#C9A96E',
                            borderLeft: '2px solid #C9A96E',
                            paddingLeft: collapsed ? '12px' : '10px',
                          }
                        : {
                            color: '#4A4642',
                            borderLeft: '2px solid transparent',
                          }
                    }
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.color = '#111111';
                        (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.03)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.color = '#4A4642';
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                      }
                    }}
                  >
                    <Icon size={14} className="shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ─── User Footer ─── */}
      <div className="px-3 pb-5 shrink-0 border-t" style={{ borderColor: 'rgba(0,0,0,0.06)', paddingTop: '16px' }}>
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-3 mb-4">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-mono text-[11px] font-bold"
              style={{ background: 'rgba(201,169,110,0.12)', color: '#C9A96E', border: '1px solid rgba(201,169,110,0.25)' }}
            >
              {(profile?.full_name || user.email || 'A')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="font-mono text-[9px] font-bold tracking-wider truncate" style={{ color: '#9A9490' }}>
                {profile?.full_name || 'ADMIN USER'}
              </div>
              <div className="font-mono text-[8px] truncate" style={{ color: '#4A4642' }}>
                {user.email}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => { signOut(); window.location.href = '/'; }}
          className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-[3px] font-mono text-[9px] font-bold tracking-[0.16em] cursor-pointer transition-all duration-200 ${collapsed ? 'justify-center' : ''}`}
          style={{ color: '#6B6560' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#F97066'; (e.currentTarget as HTMLElement).style.background = 'rgba(249,112,102,0.06)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#6B6560'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          <LogOut size={14} />
          {!collapsed && 'SIGN OUT'}
        </button>
      </div>
    </div>
  );
}

export default function AdminSidebar() {
  const [isCollapsed, setIsCollapsed]   = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* ─── Mobile trigger ─── */}
      <div className="lg:hidden fixed top-5 left-5 z-50">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="flex items-center justify-center w-10 h-10 rounded-[3px] cursor-pointer transition-all duration-200"
          style={{ background: '#EAEAEA', border: '1px solid rgba(0,0,0,0.08)', color: '#333333' }}
        >
          <Menu size={16} />
        </button>
      </div>

      {/* ─── Desktop Sidebar ─── */}
      <aside
        className="hidden lg:flex flex-col h-screen sticky top-0 shrink-0 transition-all duration-300 z-40"
        style={{
          width: isCollapsed ? '64px' : '240px',
          borderRight: '1px solid rgba(0,0,0,0.06)',
          background: '#FAFAFA',
        }}
      >
        <SidebarContent collapsed={isCollapsed} />

        {/* Collapse toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3.5 top-[84px] flex items-center justify-center w-7 h-7 rounded-full cursor-pointer z-10 transition-all duration-200"
          style={{ background: '#EAEAEA', border: '1px solid rgba(0,0,0,0.1)', color: '#6B6560' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#C9A96E'; (e.currentTarget as HTMLElement).style.color = '#C9A96E'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,0.1)'; (e.currentTarget as HTMLElement).style.color = '#6B6560'; }}
        >
          {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* ─── Mobile Drawer ─── */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden fixed inset-0 z-40"
              style={{ background: '#000' }}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-[240px] shadow-2xl"
              style={{ background: '#FAFAFA' }}
            >
              <SidebarContent collapsed={false} onClose={() => setIsMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
