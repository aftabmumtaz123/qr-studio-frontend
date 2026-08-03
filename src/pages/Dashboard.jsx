import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Zap, Link2, Type, Mail, MessageSquare, Phone, User,
  Wifi, Calendar, FileText, Smartphone, Share2, ArrowRight,
  TrendingUp, Download, Eye, QrCode
} from 'lucide-react';
import URLForm from './forms/URLForm';

const quickTypes = [
  { to: '/qr/url',       icon: Link2,         label: '🌐 URL',       desc: 'Most used',   color: 'from-blue-600 to-indigo-600' },
  { to: '/qr/dynamic',   icon: Zap,           label: '⚡ Dynamic',   desc: 'Editable',    color: 'from-brand-600 to-purple-600' },
  { to: '/qr/email',     icon: Mail,          label: '📧 Email',     desc: 'Pre-filled',  color: 'from-amber-500 to-orange-600' },
  { to: '/qr/vcard',     icon: User,          label: '👤 vCard',     desc: 'Digital Card',color: 'from-rose-500 to-pink-600' },
  { to: '/qr/whatsapp',  icon: MessageSquare, label: '💬 WhatsApp',  desc: 'Direct chat', color: 'from-emerald-500 to-teal-600' },
  { to: '/qr/wifi',      icon: Wifi,          label: '📶 WiFi',      desc: 'Instant join',color: 'from-sky-500 to-blue-600' },
];

const Dashboard = () => {
  return (
    <div className="space-y-8 max-w-4xl pb-8">
      {/* SaaS Metric Cards */}
      {/* <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total QRs Created', val: '152', icon: QrCode, change: '+12% this week', color: 'text-brand-400' },
          { label: 'Dynamic QRs Active', val: '48', icon: Zap, change: '100% editable', color: 'text-amber-400' },
          { label: "Today's Scans", val: '304', icon: Eye, change: '+24% vs yesterday', color: 'text-emerald-400' },
          { label: 'Total Downloads', val: '1,800', icon: Download, change: 'PNG, SVG, PDF', color: 'text-purple-400' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-4 rounded-xl bg-surface-900 border border-surface-800 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">{stat.label}</span>
              <stat.icon size={16} className={stat.color} />
            </div>
            <p className="text-2xl font-bold text-white">{stat.val}</p>
            <p className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
              <TrendingUp size={10} className="text-emerald-400" /> {stat.change}
            </p>
          </motion.div>
        ))}
      </div> */}

      {/* Colorful Gradient Quick Start Cards */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          ⚡ Quick Create
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {quickTypes.map((item, i) => (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Link
                to={item.to}
                className={`group flex flex-col p-3 rounded-xl bg-gradient-to-br ${item.color} text-white hover:scale-[1.02] transition-all shadow-md`}
              >
                <item.icon size={18} className="mb-2 opacity-90" />
                <span className="text-xs font-bold truncate">{item.label}</span>
                <span className="text-[10px] opacity-75">{item.desc}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Primary Generator Form (Inline URL Form - Zero Clicks Required) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            🌐 Instant URL Generator
          </h2>
          {/* <span className="text-xs text-slate-500 font-medium">Ready to export</span> */}
        </div>

        {/* Directly Embedded URL Form */}
        <URLForm />
      </div>
    </div>
  );
};

export default Dashboard;
