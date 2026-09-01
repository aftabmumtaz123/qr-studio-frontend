import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Link2, QrCode, Zap, BarChart3, Mail, UserRound, Type, Phone, Wifi,
  Calendar, FileText, Image, Smartphone, Share2, MessageCircle, ArrowUpRight,
  Music2, CreditCard, RefreshCw, Activity, Globe2, Monitor, Tablet, Smartphone as MobileIcon
} from 'lucide-react';
import { FaInstagram, FaLinkedin, FaXTwitter } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import { analyticsAPI } from '../services/api';

const modules = [
  { to: '/qr/url', label: 'URL', description: 'Website link', icon: Link2, tone: 'blue' },
  { to: '/qr/email', label: 'Email', description: 'Email address', icon: Mail, tone: 'green' },
  { to: '/qr/text', label: 'Text', description: 'Plain text', icon: Type, tone: 'purple' },
  { to: '/qr/phone', label: 'Phone', description: 'Phone number', icon: Phone, tone: 'orange' },
  { to: '/qr/wifi', label: 'WiFi', description: 'Network access', icon: Wifi, tone: 'cyan' },
  { to: '/qr/vcard', label: 'vCard', description: 'Contact details', icon: UserRound, tone: 'pink' },
  { to: '/qr/sms', label: 'SMS', description: 'Pre-filled message', icon: MessageCircle, tone: 'teal' },
  { to: '/qr/whatsapp', label: 'WhatsApp', description: 'Start a chat', icon: MessageCircle, tone: 'green' },
  { to: '/qr/event', label: 'Event', description: 'Event details', icon: Calendar, tone: 'indigo' },
  { to: '/qr/pdf', label: 'PDF', description: 'Share document', icon: FileText, tone: 'red' },
  { to: '/qr/image', label: 'Image', description: 'Share image', icon: Image, tone: 'pink' },
  { to: '/qr/app', label: 'App', description: 'App store links', icon: Smartphone, tone: 'blue' },
  { to: '/qr/social', label: 'Social', description: 'Social profile', icon: Share2, tone: 'purple' },
  { to: '/qr/instagram', label: 'Instagram', description: 'Instagram profile', icon: FaInstagram, tone: 'pink' },
  { to: '/qr/linkedin', label: 'LinkedIn', description: 'LinkedIn profile', icon: FaLinkedin, tone: 'blue' },
  { to: '/qr/twitter', label: 'Twitter', description: 'Twitter profile', icon: FaXTwitter, tone: 'cyan' },
  { to: '/qr/spotify', label: 'Spotify', description: 'Spotify link', icon: Music2, tone: 'green' },
  { to: '/qr/paypal', label: 'PayPal', description: 'Payment link', icon: CreditCard, tone: 'indigo' },
];

const formatNumber = (value = 0) => new Intl.NumberFormat('en-US').format(value);
const formatDate = (value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const formatDateTime = (value) => new Date(value).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

const Stat = ({ label, value, note, Icon, tone, loading }) => (
  <div className="stat-card">
    <div className={`stat-icon ${tone}`}><Icon size={19} /></div>
    <div>
      <span>{label}</span>
      <strong>{loading ? '—' : value}</strong>
      <small>{note}</small>
    </div>
  </div>
);

const LineChart = ({ data }) => {
  if (!data.length) return <div className="empty-chart">No scan activity yet.</div>;
  const max = Math.max(...data.map((item) => item.scans), 1);
  const width = 720;
  const height = 260;
  const padX = 26;
  const padY = 26;
  const points = data.map((item, index) => {
    const x = padX + (index * (width - padX * 2)) / Math.max(data.length - 1, 1);
    const y = height - padY - (item.scans / max) * (height - padY * 2);
    return `${x},${y}`;
  }).join(' ');
  const area = `${padX},${height - padY} ${points} ${width - padX},${height - padY}`;

  return (
    <div className="line-chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} className="line-chart" role="img" aria-label="QR scans over the last seven days">
        {[0, 1, 2, 3, 4].map((row) => {
          const y = padY + (row * (height - padY * 2)) / 4;
          return <line key={row} x1={padX} x2={width - padX} y1={y} y2={y} stroke="#eef0f5" strokeDasharray="4 5" />;
        })}
        <polygon points={area} fill="url(#scanArea)" />
        <polyline points={points} fill="none" stroke="#685be7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((item, index) => {
          const [x, y] = points.split(' ')[index].split(',');
          return <circle key={item.date} cx={x} cy={y} r="4" fill="#fff" stroke="#685be7" strokeWidth="2" />;
        })}
        <defs>
          <linearGradient id="scanArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#776be8" stopOpacity=".22" />
            <stop offset="100%" stopColor="#776be8" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      <div className="chart-labels">{data.map((item) => <span key={item.date}>{item.label}</span>)}</div>
    </div>
  );
};

const Donut = ({ items, total, colors }) => {
  const gradient = useMemo(() => {
    if (!total) return '#eef0f4 0 100%';
    let cursor = 0;
    return items.map((item, index) => {
      const start = cursor;
      cursor += (item.value / total) * 100;
      return `${colors[index % colors.length]} ${start}% ${cursor}%`;
    }).join(', ');
  }, [items, total, colors]);

  return (
    <div className="donut-wrap">
      <div className="donut" style={{ background: `conic-gradient(${gradient})` }}>
        <div className="donut-hole"><strong>{formatNumber(total)}</strong><span>Total</span></div>
      </div>
      <div className="donut-legend">
        {items.slice(0, 5).map((item, index) => (
          <div key={item.name}><i style={{ background: colors[index % colors.length] }} /> <span>{item.name}</span><strong>{formatNumber(item.value)}</strong></div>
        ))}
        {!items.length && <span className="muted">No QR codes created yet.</span>}
      </div>
    </div>
  );
};

const deviceIcon = (name) => name === 'Mobile' ? MobileIcon : name === 'Tablet' ? Tablet : Monitor;

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (silent = false) => {
    if (silent) setRefreshing(true); else setLoading(true);
    try {
      const response = await analyticsAPI.getOverview();
      setData(response.data);
    } catch (error) {
      toast.error(error.message || 'Could not load analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const summary = data?.summary || {};
  const maxTop = Math.max(...(data?.topLinks || []).map((item) => item.clicks), 1);
  const totalDevices = (data?.devices || []).reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="dashboard-page dashboard-analytics-page">
      <section className="page-heading dashboard-heading">
        <div><p className="eyebrow">Dashboard</p><h1>Overview</h1><p>Real activity from your QR codes and links.</p></div>
        <button className="secondary-button" onClick={() => load(true)} disabled={refreshing}><RefreshCw size={14} className={refreshing ? 'spin' : ''} /> Refresh</button>
      </section>

      <section className="stats-grid">
        <Stat label="Total Clicks" value={formatNumber(summary.totalClicks)} note="All recorded QR activity" Icon={Link2} tone="purple" loading={loading} />
        <Stat label="QR Scans" value={formatNumber(summary.totalScans)} note="Recorded scan events" Icon={QrCode} tone="blue" loading={loading} />
        <Stat label="Active Links" value={formatNumber(summary.activeLinks)} note="Dynamic QR codes" Icon={Zap} tone="green" loading={loading} />
        <Stat label="Conversion Rate" value={`${summary.conversionRate || 0}%`} note="QRs with at least one scan" Icon={Activity} tone="orange" loading={loading} />
      </section>

      <section className="analytics-grid analytics-grid-top">
        <div className="simple-panel chart-panel">
          <div className="panel-title"><div><h2>Clicks Overview</h2><p>Scan events recorded during the last seven days.</p></div><span className="data-badge">Live data</span></div>
          <LineChart data={data?.clicksOverview || []} />
        </div>

        <div className="simple-panel">
          <div className="panel-title"><div><h2>Top Performing Links</h2><p>Highest recorded click counts.</p></div><Link to="/saved" className="text-link">View all <ArrowUpRight size={14} /></Link></div>
          <div className="top-links-list">
            {(data?.topLinks || []).map((item, index) => (
              <div className="top-link-row" key={item.id}>
                <span className={`rank-badge ${['purple','blue','green','orange','pink','cyan'][index % 6]}`}>{index + 1}</span>
                <div className="top-link-copy"><strong>{item.title}</strong><small>{item.code ? `/d/${item.code}` : item.type}</small><div className="mini-progress"><i style={{ width: `${(item.clicks / maxTop) * 100}%` }} /></div></div>
                <b>{formatNumber(item.clicks)}</b>
              </div>
            ))}
            {!loading && !data?.topLinks?.length && <div className="empty-state">Create a QR code to start collecting analytics.</div>}
          </div>
        </div>

        <div className="simple-panel">
          <div className="panel-title"><div><h2>QR Codes Created</h2><p>Distribution by QR type.</p></div><Link to="/saved" className="text-link">View all <ArrowUpRight size={14} /></Link></div>
          <Donut items={data?.qrDistribution || []} total={summary.totalQrCodes || 0} colors={['#685be7','#4285e8','#37b66b','#e89438','#d95b9e']} />
        </div>
      </section>

      <section className="analytics-grid analytics-grid-bottom">
        <div className="simple-panel">
          <div className="panel-title"><div><h2>Recent Links</h2><p>Your newest QR records from the database.</p></div><Link to="/saved" className="text-link">View all <ArrowUpRight size={14} /></Link></div>
          <div className="recent-table">
            <div className="table-head"><span>Title</span><span>Type</span><span>Clicks</span><span>Created</span></div>
            {(data?.recentLinks || []).map((item) => <div className="table-row" key={item.id}><strong>{item.title}</strong><span>{item.type}</span><b>{formatNumber(item.clicks)}</b><span>{formatDate(item.createdAt)}</span></div>)}
            {!loading && !data?.recentLinks?.length && <div className="empty-state">No QR codes created yet.</div>}
          </div>
        </div>

        <div className="simple-panel quick-create-panel">
          <div className="panel-title"><div><h2>Quick Create</h2><p>Choose a QR module.</p></div></div>
          <div className="quick-create-grid">
            {modules.slice(0, 8).map(({ to, label, icon: Icon, tone }) => <Link to={to} key={to}><span className={`module-icon ${tone}`}><Icon size={16} /></span>{label} QR</Link>)}
          </div>
        </div>
      </section>

      <section className="analytics-grid analytics-grid-bottom">
        <div className="simple-panel activity-panel">
          <div className="panel-title"><div><h2>Recent Activity</h2><p>Scans and QR creation events.</p></div></div>
          <div className="activity-list">
            {(data?.recentActivity || []).map((item) => <div className="activity-row" key={item.id}><span className={`activity-icon ${item.type === 'scan' ? 'blue' : 'green'}`}>{item.type === 'scan' ? <QrCode size={15} /> : <Zap size={15} />}</span><div><strong>{item.title}</strong><small>{item.description}</small></div><div className="activity-meta"><b>{item.location}</b><span>{formatDateTime(item.date)}</span></div></div>)}
            {!loading && !data?.recentActivity?.length && <div className="empty-state">No activity has been recorded yet.</div>}
          </div>
        </div>

        <div className="simple-panel">
          <div className="panel-title"><div><h2>Devices Overview</h2><p>Device data from recorded scans.</p></div><Link to="/analytics" className="text-link">Analytics <ArrowUpRight size={14} /></Link></div>
          <div className="device-overview">
            <Donut items={data?.devices || []} total={totalDevices} colors={['#685be7','#4285e8','#37b66b']} />
            <div className="device-list">{(data?.devices || []).map((item) => { const Icon = deviceIcon(item.name); return <div key={item.name}><span><Icon size={15} />{item.name}</span><b>{totalDevices ? `${Math.round((item.value / totalDevices) * 100)}%` : '0%'}</b></div>; })}</div>
          </div>
        </div>
      </section>

      {data?.countries?.length > 0 && <section className="simple-panel countries-panel"><div className="panel-title"><div><h2>Top Scan Locations</h2><p>Only locations actually captured by your scan events are shown.</p></div></div><div className="country-list">{data.countries.map((item) => <span key={item.name}><Globe2 size={14} />{item.name}<b>{formatNumber(item.value)}</b></span>)}</div></section>}
    </div>
  );
};

export default Dashboard;
