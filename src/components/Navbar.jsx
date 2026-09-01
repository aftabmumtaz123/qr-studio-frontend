import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  QrCode, Link2, BarChart3, Settings, ChevronDown, Menu, X, Zap,
  Globe, UserRound, Mail, Type, Phone, Wifi, Calendar, FileText,
  Image, Smartphone, Share2, Music2, CreditCard, MessageCircle, MessageSquare
} from 'lucide-react';
import { FaInstagram, FaLinkedin, FaXTwitter } from 'react-icons/fa6';

const qrModules = [
  { to: '/qr/url', label: 'URL', icon: Link2 },
  { to: '/qr/email', label: 'Email', icon: Mail },
  { to: '/qr/text', label: 'Text', icon: Type },
  { to: '/qr/phone', label: 'Phone', icon: Phone },
  { to: '/qr/wifi', label: 'WiFi', icon: Wifi },
  { to: '/qr/vcard', label: 'vCard', icon: UserRound },
  { to: '/qr/sms', label: 'SMS', icon: MessageSquare },
  { to: '/qr/whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { to: '/qr/event', label: 'Event', icon: Calendar },
  { to: '/qr/pdf', label: 'PDF', icon: FileText },
  { to: '/qr/image', label: 'Image', icon: Image },
  { to: '/qr/app', label: 'App', icon: Smartphone },
  { to: '/qr/social', label: 'Social', icon: Share2 },
  { to: '/qr/instagram', label: 'Instagram', icon: FaInstagram },
  { to: '/qr/linkedin', label: 'LinkedIn', icon: FaLinkedin },
  { to: '/qr/twitter', label: 'Twitter', icon: FaXTwitter },
  { to: '/qr/spotify', label: 'Spotify', icon: Music2 },
  { to: '/qr/paypal', label: 'PayPal', icon: CreditCard },
];

const linkClass = ({ isActive }) =>
  `nav-link ${isActive ? 'nav-link-active' : ''}`;

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const go = (path) => {
    navigate(path);
    setOpen(false);
    setMobileOpen(false);
  };

  return (
    <header className="navbar-shell">
      <div className="navbar-inner">
        <NavLink to="/" className="brand" onClick={() => setMobileOpen(false)}>
          <span className="brand-mark"><QrCode size={19} /></span>
          <span>
            <strong>LumaLink</strong>
            <small>QR & Link Studio</small>
          </span>
        </NavLink>

        <nav className="desktop-nav">
          <NavLink to="/" className={linkClass}>Dashboard</NavLink>
          <NavLink to="/shortener" className={linkClass}>URL Shortener</NavLink>
          <NavLink to="/shortened" className={linkClass}>My Short URLs</NavLink>
          <div className="nav-dropdown">
            <button
              type="button"
              className="nav-link nav-dropdown-trigger"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
            >
              <QrCode size={16} /> QR Code <ChevronDown size={14} className={open ? 'rotate-180' : ''} />
            </button>
            {open && (
              <div className="qr-menu">
                <div className="qr-menu-heading">Create QR Code</div>
                <div className="qr-menu-grid">
                  {qrModules.map(({ to, label, icon: Icon }) => (
                    <button key={to} type="button" onClick={() => go(to)} className="qr-menu-item">
                      <span><Icon size={15} /></span>{label}
                    </button>
                  ))}
                </div>
                <button type="button" className="qr-menu-more" onClick={() => go('/qr/dynamic')}>
                  <Zap size={15} /> Dynamic QR
                </button>
              </div>
            )}
          </div>
          <NavLink to="/qr/dynamic" className={linkClass}><Zap size={15} /> Dynamic QR</NavLink>
          <NavLink to="/saved" className={linkClass}>My QR Codes</NavLink>
          <NavLink to="/analytics" className={linkClass}><BarChart3 size={15} /> Analytics</NavLink>
          <NavLink to="/settings" className={linkClass}><Settings size={15} /> Settings</NavLink>
        </nav>

        <div className="navbar-actions">
          <button type="button" className="nav-create" onClick={() => go('/qr/dynamic')}>
            <Zap size={15} /> Create QR
          </button>
          <button type="button" className="mobile-menu-btn" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle navigation">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="mobile-nav">
          <NavLink to="/" className={linkClass} onClick={() => setMobileOpen(false)}>Dashboard</NavLink>
          <NavLink to="/shortener" className={linkClass} onClick={() => setMobileOpen(false)}>URL Shortener</NavLink>
          <NavLink to="/shortened" className={linkClass} onClick={() => setMobileOpen(false)}>My Short URLs</NavLink>
          <NavLink to="/qr/dynamic" className={linkClass} onClick={() => setMobileOpen(false)}>Dynamic QR</NavLink>
          <NavLink to="/saved" className={linkClass} onClick={() => setMobileOpen(false)}>My QR Codes</NavLink>
          <NavLink to="/analytics" className={linkClass} onClick={() => setMobileOpen(false)}>Analytics</NavLink>
          <div className="mobile-qr-grid">
            {qrModules.map(({ to, label, icon: Icon }) => (
              <button key={to} type="button" onClick={() => go(to)}><Icon size={15} />{label}</button>
            ))}
          </div>
          <NavLink to="/settings" className={linkClass} onClick={() => setMobileOpen(false)}>Settings</NavLink>
        </div>
      )}
    </header>
  );
};

export default Navbar;
