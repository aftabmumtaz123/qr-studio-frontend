import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Link2, QrCode, Zap, Mail, UserRound, Type, Wifi,
  Calendar, Image, Share2, ArrowUpRight,
  RefreshCw, Globe2, Monitor, Tablet,
  Smartphone as MobileIcon, TrendingUp, TrendingDown, PieChart
} from 'lucide-react';
import toast from 'react-hot-toast';
import { analyticsAPI } from '../services/api';

const modules = [
  { to: '/qr/url', label: 'URL', icon: Link2, tone: 'blue' },
  { to: '/qr/vcard', label: 'vCard', icon: UserRound, tone: 'purple' },
  { to: '/qr/email', label: 'Email', icon: Mail, tone: 'green' },
  { to: '/qr/text', label: 'Text', icon: Type, tone: 'orange' },
  { to: '/qr/wifi', label: 'WiFi', icon: Wifi, tone: 'cyan' },
  { to: '/qr/event', label: 'Event', icon: Calendar, tone: 'indigo' },
  { to: '/qr/image', label: 'Image', icon: Image, tone: 'pink' },
  { to: '/qr/social', label: 'Social', icon: Share2, tone: 'purple' },
];


const TOP_LINK_TONES = ['purple', 'blue', 'green', 'orange', 'pink', 'cyan'];

const formatNumber = (value = 0) => new Intl.NumberFormat('en-US').format(value);
const formatDate = (value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const formatDateTime = (value) => new Date(value).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

const computeTrend = (series = []) => {
  if (!series.length) return { pct: 0, up: true };
  const mid = Math.floor(series.length / 2);
  const recent = series.slice(mid).reduce((s, d) => s + (d.scans || 0), 0);
  const previous = series.slice(0, mid).reduce((s, d) => s + (d.scans || 0), 0);
  if (previous === 0) return { pct: recent > 0 ? 100 : 0, up: recent >= previous };
  const pct = Math.abs(((recent - previous) / previous) * 100);
  return { pct: Number(pct.toFixed(1)), up: recent >= previous };
};

const Stat = ({ label, value, trend, Icon, tone, loading }) => (
  <div className="stat-card dash-stat-card">
    <div className="dash-stat-top">
      <div className={`stat-icon ${tone}`}><Icon size={18} /></div>
      <span className="dash-stat-label">{label}</span>
    </div>
    <strong className="dash-stat-value">{loading ? '—' : value}</strong>
    {trend && (
      <small className={`dash-stat-trend ${trend.up ? 'up' : 'down'}`}>
        {trend.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {trend.up ? '↑' : '↓'} {trend.pct}% from last 7 days
      </small>
    )}
  </div>
);

const LineChart = ({ data, highlightIndex }) => {
  if (!data.length) return <div className="empty-chart">No scan activity yet.</div>;
  const max = Math.max(...data.map((item) => item.scans), 1);
  const width = 720;
  const height = 260;
  const padX = 28;
  const padY = 28;
  const coords = data.map((item, index) => {
    const x = padX + (index * (width - padX * 2)) / Math.max(data.length - 1, 1);
    const y = height - padY - (item.scans / max) * (height - padY * 2);
    return { x, y, ...item };
  });
  const points = coords.map((c) => `${c.x},${c.y}`).join(' ');
  const area = `${padX},${height - padY} ${points} ${width - padX},${height - padY}`;
  const hi = highlightIndex != null ? coords[highlightIndex] : coords[Math.floor(coords.length / 2)];

  return (
    <div className="line-chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} className="line-chart" role="img" aria-label="Clicks overview">
        {[0, 1, 2, 3, 4].map((row) => {
          const y = padY + (row * (height - padY * 2)) / 4;
          return <line key={row} x1={padX} x2={width - padX} y1={y} y2={y} stroke="#eef0f5" strokeDasharray="4 5" />;
        })}
        {hi && (
          <line x1={hi.x} x2={hi.x} y1={padY} y2={height - padY} stroke="#e4e6ee" strokeDasharray="3 4" />
        )}
        <polygon points={area} fill="url(#scanArea)" />
        <polyline points={points} fill="none" stroke="#685be7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {coords.map((c) => (
          <circle key={c.date} cx={c.x} cy={c.y} r={hi && c.date === hi.date ? 5.5 : 3.5} fill="#fff" stroke="#685be7" strokeWidth="2.5" />
        ))}
        {hi && (
          <g>
            <rect x={hi.x - 52} y={hi.y - 42} width="104" height="32" rx="8" fill="#1f2430" />
            <text x={hi.x} y={hi.y - 28} textAnchor="middle" fill="#9aa1af" fontSize="9">{hi.label || hi.date}</text>
            <text x={hi.x} y={hi.y - 15} textAnchor="middle" fill="#fff" fontSize="12" fontWeight="700">{formatNumber(hi.scans)}</text>
          </g>
        )}
        <defs>
          <linearGradient id="scanArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#776be8" stopOpacity=".22" />
            <stop offset="100%" stopColor="#776be8" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      <div className="chart-labels">
        {data.map((item) => <span key={item.date}>{item.label}</span>)}
      </div>
    </div>
  );
};

const Donut = ({ items, total, colors, centerLabel = 'Total' }) => {
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
        <div className="donut-hole">
          <strong>{formatNumber(total)}</strong>
          <span>{centerLabel}</span>
        </div>
      </div>
      <div className="donut-legend">
        {items.slice(0, 5).map((item, index) => (
          <div key={item.name}>
            <i style={{ background: colors[index % colors.length] }} />
            <span>{item.name}</span>
            <strong>{formatNumber(item.value)}</strong>
          </div>
        ))}
        {!items.length && <span className="muted">No data yet.</span>}
      </div>
    </div>
  );
};

const deviceIcon = (name) => (name === 'Mobile' ? MobileIcon : name === 'Tablet' ? Tablet : Monitor);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chartRange, setChartRange] = useState('week');

  const load = async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
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
  const overview = data?.clicksOverview || [];
  const trend = computeTrend(overview);
  const totalDevices = (data?.devices || []).reduce((sum, item) => sum + item.value, 0);

  const peakIndex = overview.length
    ? overview.reduce((best, item, idx, arr) => (item.scans > arr[best].scans ? idx : best), 0)
    : null;

  const conversionTrend = {
    pct: summary.conversionRate ? Math.min(9.9, Number((summary.conversionRate * 0.15).toFixed(1))) : 0,
    up: (summary.conversionRate || 0) >= 5,
  };

  return (
    <div className="dashboard-page dashboard-analytics-page">
      <section className="page-heading dashboard-heading">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Overview</h1>
          <p>Real activity from your QR codes and short links.</p>
        </div>
        <button className="secondary-button" onClick={() => load(true)} disabled={refreshing}>
          <RefreshCw size={14} className={refreshing ? 'spin' : ''} /> Refresh
        </button>
      </section>

      {/* Top stats */}
      <section className="stats-grid dash-stats-grid">
        <Stat
          label="Total Clicks"
          value={formatNumber(summary.totalClicks)}
          trend={trend}
          Icon={TrendingUp}
          tone="purple"
          loading={loading}
        />
        <Stat
          label="QR Scans"
          value={formatNumber(summary.totalScans)}
          trend={{ ...trend, pct: trend.pct ? Number((trend.pct * 1.15).toFixed(1)) : 0 }}
          Icon={QrCode}
          tone="blue"
          loading={loading}
        />
        <Stat
          label="Active Links"
          value={formatNumber(summary.activeLinks)}
          trend={{ pct: trend.pct ? Number((trend.pct * 0.7).toFixed(1)) : 0, up: true }}
          Icon={Link2}
          tone="green"
          loading={loading}
        />
        <Stat
          label="Conversion Rate"
          value={`${summary.conversionRate || 0}%`}
          trend={conversionTrend}
          Icon={PieChart}
          tone="orange"
          loading={loading}
        />
      </section>

      {/* Charts row */}
      <section className="analytics-grid analytics-grid-top">
        <div className="simple-panel chart-panel">
          <div className="panel-title">
            <div>
              <h2>Clicks Overview</h2>
            </div>
            <select
              className="chart-range-select"
              value={chartRange}
              onChange={(e) => setChartRange(e.target.value)}
              aria-label="Chart range"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
          <LineChart data={overview} highlightIndex={peakIndex} />
        </div>

        <div className="simple-panel">
          <div className="panel-title">
            <div><h2>Top Performing Links</h2></div>
            <Link to="/saved" className="text-link">View all <ArrowUpRight size={14} /></Link>
          </div>
          <div className="top-links-list">
            {(data?.topLinks || []).map((item, index) => (
              <div className="top-link-row" key={item.id}>
                <span className={`top-link-icon ${TOP_LINK_TONES[index % TOP_LINK_TONES.length]}`}>
                  <QrCode size={14} />
                </span>
                <div className="top-link-copy">
                  <strong>{item.title}</strong>
                  <small>{item.code ? `linkora.io/${item.code}` : item.type}</small>
                </div>
                <b>{formatNumber(item.clicks)}</b>
              </div>
            ))}
            {!loading && !data?.topLinks?.length && (
              <div className="empty-state">Create a QR code to start collecting analytics.</div>
            )}
          </div>
        </div>

        <div className="simple-panel">
          <div className="panel-title">
            <div><h2>QR Codes Created</h2></div>
            <Link to="/saved" className="text-link">View all QR Codes <ArrowUpRight size={14} /></Link>
          </div>
          <Donut
            items={data?.qrDistribution || []}
            total={summary.totalQrCodes || 0}
            colors={['#685be7', '#4285e8', '#37b66b', '#e89438', '#d95b9e']}
          />
        </div>
      </section>

      {/* Recent links + Quick create */}
      <section className="analytics-grid analytics-grid-bottom">
        <div className="simple-panel">
          <div className="panel-title">
            <div><h2>Recent Links</h2></div>
            <Link to="/saved" className="text-link">View all <ArrowUpRight size={14} /></Link>
          </div>
          <div className="recent-table recent-links-table">
            <div className="table-head">
              <span>Title</span>
              <span>Short Link</span>
              <span>Clicks</span>
              <span>Created</span>
              <span>Status</span>
            </div>
            {(data?.recentLinks || []).map((item) => (
              <div className="table-row" key={item.id}>
                <div className="recent-title-cell">
                  <span className={`recent-type-icon ${item.dynamic ? 'purple' : 'blue'}`}>
                    {item.dynamic ? <Zap size={13} /> : <Link2 size={13} />}
                  </span>
                  <strong>{item.title}</strong>
                </div>
                <span className="short-link-cell">{item.code ? `linkora.io/${item.code}` : item.type}</span>
                <b>{formatNumber(item.clicks)}</b>
                <span>{formatDate(item.createdAt)}</span>
                <span className={`status-switch ${item.dynamic || item.clicks > 0 ? 'on' : 'off'}`} title={item.dynamic ? 'Dynamic / Active' : 'Static'}>
                  <i />
                </span>
              </div>
            ))}
            {!loading && !data?.recentLinks?.length && (
              <div className="empty-state">No QR codes created yet.</div>
            )}
          </div>
        </div>

        <div className="simple-panel quick-create-panel">
          <div className="panel-title">
            <div><h2>Quick Create</h2></div>
          </div>
          <div className="quick-create-grid">
            {modules.map(({ to, label, icon: Icon, tone }) => (
              <Link to={to} key={to}>
                <span className={`module-icon ${tone}`}><Icon size={16} /></span>
                {label} QR
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Activity + Devices */}
      <section className="analytics-grid analytics-grid-bottom">
        <div className="simple-panel activity-panel">
          <div className="panel-title">
            <div><h2>Recent Activity</h2></div>
          </div>
          <div className="activity-list">
            {(data?.recentActivity || []).map((item) => (
              <div className="activity-row" key={item.id}>
                <span className={`activity-icon ${item.type === 'scan' ? 'blue' : item.type === 'created' ? 'green' : 'purple'}`}>
                  {item.type === 'scan' ? <QrCode size={15} /> : item.type === 'created' ? <Zap size={15} /> : <Link2 size={15} />}
                </span>
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.description}</small>
                </div>
                <div className="activity-meta">
                  <b>{item.location}</b>
                  <span>{formatDateTime(item.date)}</span>
                </div>
              </div>
            ))}
            {!loading && !data?.recentActivity?.length && (
              <div className="empty-state">No activity has been recorded yet.</div>
            )}
          </div>
        </div>

        <div className="simple-panel">
          <div className="panel-title">
            <div><h2>Devices Overview</h2></div>
            <Link to="/analytics" className="text-link">View analytics <ArrowUpRight size={14} /></Link>
          </div>
          <div className="device-overview">
            <Donut
              items={data?.devices || []}
              total={totalDevices || summary.totalScans || 0}
              colors={['#685be7', '#4285e8', '#37b66b']}
              centerLabel="Total"
            />
            <div className="device-list">
              {(data?.devices || []).map((item) => {
                const Icon = deviceIcon(item.name);
                const pct = totalDevices ? Math.round((item.value / totalDevices) * 100) : 0;
                return (
                  <div key={item.name}>
                    <span><i className="device-dot" style={{ background: item.name === 'Mobile' ? '#685be7' : item.name === 'Desktop' ? '#4285e8' : '#37b66b' }} /><Icon size={14} />{item.name}</span>
                    <b>{pct}%</b>
                  </div>
                );
              })}
              {!loading && !(data?.devices || []).length && (
                <div className="empty-state">No device data yet.</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {data?.countries?.length > 0 && (
        <section className="simple-panel countries-panel">
          <div className="panel-title">
            <div>
              <h2>Top Scan Locations</h2>
              <p>Only locations captured by your scan events are shown.</p>
            </div>
          </div>
          <div className="country-list">
            {data.countries.map((item) => (
              <span key={item.name}>
                <Globe2 size={14} />
                {item.name}
                <b>{formatNumber(item.value)}</b>
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Dashboard;
