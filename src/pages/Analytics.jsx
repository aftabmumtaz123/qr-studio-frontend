import { useEffect, useState } from 'react';
import { BarChart3, Link2, QrCode, TrendingUp, RefreshCw, Monitor, Tablet, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { analyticsAPI } from '../services/api';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const response = await analyticsAPI.getOverview();
      setData(response.data);
    } catch (error) {
      toast.error(error.message || 'Could not load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const summary = data?.summary || {};
  const max = Math.max(...(data?.clicksOverview || []).map((item) => item.scans), 1);
  const totalDevices = (data?.devices || []).reduce((sum, item) => sum + item.value, 0);
  const deviceIcon = { Mobile: Smartphone, Desktop: Monitor, Tablet };

  return (
    <div className="dashboard-page analytics-full-page">
      <section className="page-heading dashboard-heading">
        <div><p className="eyebrow">Analytics</p><h1>Performance</h1><p>Every number below is calculated from your QR records and scan events.</p></div>
        <button className="secondary-button" onClick={load} disabled={loading}><RefreshCw size={14} /> Refresh</button>
      </section>
      <section className="stats-grid">
        {[
          ['Total Scans', summary.totalScans, QrCode, 'purple', 'Recorded scan events'],
          ['Total Clicks', summary.totalClicks, Link2, 'blue', 'QR click counters'],
          ['Active Links', summary.activeLinks, BarChart3, 'green', 'Dynamic QR codes'],
          ['Conversion', `${summary.conversionRate || 0}%`, TrendingUp, 'orange', 'QRs with at least one scan'],
        ].map(([label, value, Icon, tone, note]) => <div className="stat-card" key={label}><div className={`stat-icon ${tone}`}><Icon size={19} /></div><div><span>{label}</span><strong>{loading ? '—' : typeof value === 'number' ? new Intl.NumberFormat('en-US').format(value) : value}</strong><small>{note}</small></div></div>)}
      </section>
      <section className="simple-panel analytics-panel">
        <div className="panel-title"><div><h2>Scan activity</h2><p>Last seven days, based on recorded scan timestamps.</p></div></div>
        <div className="real-bar-chart">{(data?.clicksOverview || []).map((item) => <div className="real-bar-column" key={item.date}><span>{item.scans}</span><div style={{ height: `${Math.max((item.scans / max) * 82, item.scans ? 8 : 2)}%` }} /><small>{item.label}</small></div>)}</div>
      </section>
      <section className="analytics-grid analytics-grid-bottom">
        <div className="simple-panel"><div className="panel-title"><div><h2>QR type distribution</h2><p>Created QR codes by type.</p></div></div><div className="simple-data-list">{(data?.qrDistribution || []).map((item) => <div key={item.name}><span>{item.name}</span><b>{item.value}</b></div>)}</div></div>
        <div className="simple-panel"><div className="panel-title"><div><h2>Devices</h2><p>Captured from scan user agents.</p></div></div><div className="simple-data-list">{(data?.devices || []).map((item) => { const Icon = deviceIcon[item.name] || Monitor; return <div key={item.name}><span><Icon size={14}/>{item.name}</span><b>{totalDevices ? `${Math.round(item.value / totalDevices * 100)}%` : '0%'}</b></div>; })}</div></div>
      </section>
    </div>
  );
};
export default Analytics;
