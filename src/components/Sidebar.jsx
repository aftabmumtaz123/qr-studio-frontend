import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Link, Zap, User, Mail, MessageSquare,
  Phone, Wifi, Type, Calendar, FileText, Smartphone,
  Share2, Settings, Bookmark, ChevronLeft, ChevronRight,
  Camera, Music, CreditCard, BarChart2, Star, Trash2
} from 'lucide-react';
import { useState } from 'react';

const navGroups = [
  {
    label: null,
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    label: 'Static QR',
    items: [
      { to: '/qr/url', icon: Link, label: 'URL' },
      { to: '/qr/email', icon: Mail, label: 'Email' },
      { to: '/qr/text', icon: Type, label: 'Text' },
      { to: '/qr/phone', icon: Phone, label: 'Phone' },
      { to: '/qr/wifi', icon: Wifi, label: 'WiFi' },
      { to: '/qr/vcard', icon: User, label: 'vCard' },
    ],
  },
  {
    label: 'Dynamic',
    items: [
      { to: '/qr/dynamic', icon: Zap, label: 'Dynamic URL' },
      { to: '/saved?filter=dynamic', icon: Bookmark, label: 'Saved Dynamic' },
    ],
  },
  {
    label: 'Customize',
    items: [
      { to: '/settings', icon: Settings, label: 'QR Settings' },
    ],
  },
  // {
  //   label: 'History',
  //   items: [
  //     { to: '/saved', icon: Bookmark, label: 'Saved QRs' },
  //     { to: '/saved?tab=favorites', icon: Star, label: 'Favorites' },
  //     { to: '/saved?tab=trash', icon: Trash2, label: 'Trash' },
  //   ],
  // },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 230 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="relative flex flex-col h-screen bg-surface-900 border-r border-surface-800 pt-4 pb-4 flex-shrink-0 overflow-hidden z-20"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 mb-5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-glow">
          <Zap size={16} className="text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col"
            >
              <span className="font-bold text-sm text-white leading-tight text-gradient">
                QR Studio
              </span>
              <span className="text-[9px] text-slate-400 font-medium tracking-wider uppercase">
                Figma Studio
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollable space-y-3 px-2.5">
        {navGroups.map((group, gi) => (
          <div key={gi} className="space-y-0.5">
            {!collapsed && group.label && (
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider px-2 py-0.5 mb-0.5 border-b border-surface-800/40">
                {group.label}
              </p>
            )}
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  isActive ? 'nav-item-active mb-0.5 block text-xs py-1.5' : 'nav-item mb-0.5 block text-xs py-1.5'
                }
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={15} className="flex-shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.1 }}
                      className="truncate text-[11px]"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute bottom-4 right-2 w-5 h-5 rounded-full bg-surface-800 border border-surface-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-brand-600 transition-all duration-200 z-30"
      >
        {collapsed ? <ChevronRight size={11} /> : <ChevronLeft size={11} />}
      </button>
    </motion.aside>
  );
};

export default Sidebar;
