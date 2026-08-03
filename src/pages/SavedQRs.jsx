import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { qrAPI } from '../services/api';
import { Trash2, Search, RefreshCw, Loader2, QrCode, Copy, Link2, Zap, Edit3, Save, X, Eye, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const typeColors = {
  URL: 'bg-blue-500/20 text-blue-300',
  TEXT: 'bg-green-500/20 text-green-300',
  EMAIL: 'bg-yellow-500/20 text-yellow-300',
  SMS: 'bg-pink-500/20 text-pink-300',
  DYNAMIC_URL: 'bg-brand-500/20 text-brand-300',
  VCARD: 'bg-rose-500/20 text-rose-300',
  WIFI: 'bg-sky-500/20 text-sky-300',
};

const ModalQRPreview = ({ qr }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    import('qr-code-styling').then((module) => {
      if (!mounted || !containerRef.current) return;
      const QRCodeStyling = module.default || module;
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
      const encodedData = qr.dynamic ? `${serverUrl}/d/${qr.code}` : (qr.destination || qr.payload?.data || 'https://example.com');

      const qrCode = new QRCodeStyling({
        width: 220,
        height: 220,
        data: encodedData,
        image: qr.logo || undefined,
        dotsOptions: qr.style?.dotsOptions || { color: '#ffffff', type: 'rounded' },
        backgroundOptions: qr.style?.backgroundOptions || { color: '#1e293b' },
        cornersSquareOptions: qr.style?.cornersSquareOptions || { color: '#6272f5', type: 'extra-rounded' },
        cornersDotOptions: qr.style?.cornersDotOptions || { color: '#6272f5', type: 'dot' },
      });

      containerRef.current.innerHTML = '';
      qrCode.append(containerRef.current);
    });

    return () => { mounted = false; };
  }, [qr]);

  return (
    <div className="flex justify-center p-3 bg-surface-850 rounded-xl border border-surface-800">
      <div ref={containerRef} className="rounded-lg overflow-hidden flex items-center justify-center min-w-[220px] min-h-[220px]" />
    </div>
  );
};

const QRCard = ({ qr, onDelete, onUpdate, onView }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(qr.title || '');
  const [editDestination, setEditDestination] = useState(qr.destination || '');
  const [updating, setUpdating] = useState(false);

  const createdAt = new Date(qr.createdAt).toLocaleDateString();
  const color = typeColors[qr.type] || 'bg-surface-700 text-slate-400';
  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
  const shortUrl = `${serverUrl}/d/${qr.code}`;

  const handleSaveEdit = async () => {
    setUpdating(true);
    try {
      await qrAPI.update(qr._id, {
        title: editTitle,
        destination: editDestination,
      });
      onUpdate(qr._id, { title: editTitle, destination: editDestination });
      setIsEditing(false);
      toast.success('Dynamic QR destination updated instantly!');
    } catch (err) {
      toast.error(err.message || 'Failed to update QR');
    } finally {
      setUpdating(false);
    }
  };

  const copyShortUrl = () => {
    navigator.clipboard.writeText(shortUrl);
    toast.success('Short redirect URL copied!');
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      className="card hover:border-surface-600 transition-all duration-200 group relative overflow-hidden"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-surface-800 flex items-center justify-center flex-shrink-0">
          {qr.dynamic ? <Zap size={16} className="text-brand-400" /> : <QrCode size={16} className="text-slate-400" />}
        </div>

        <div className="flex-1 min-w-0">
          {!isEditing ? (
            <>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold text-white truncate">{qr.title}</h3>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${color}`}>{qr.type}</span>
              </div>

              {qr.destination && (
                <p className="text-xs text-slate-400 truncate mb-1 flex items-center gap-1 font-mono">
                  <Link2 size={10} className="flex-shrink-0 text-slate-500" /> Destination: {qr.destination}
                </p>
              )}

              {qr.dynamic && qr.code && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-brand-300 font-mono bg-surface-850 px-2 py-0.5 rounded border border-surface-800">
                    {shortUrl}
                  </span>
                  <button onClick={copyShortUrl} className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1">
                    <Copy size={10} /> Copy
                  </button>
                  <span className="text-[10px] text-slate-500 font-medium ml-auto">
                    {qr.clicks || 0} scans
                  </span>
                </div>
              )}

              <p className="text-[10px] text-slate-600 mt-1">Created: {createdAt}</p>
            </>
          ) : (
            <div className="space-y-2 py-1 pr-2">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="input text-xs py-1"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Destination URL (Instant Edit)</label>
                <input
                  type="text"
                  value={editDestination}
                  onChange={(e) => setEditDestination(e.target.value)}
                  className="input text-xs py-1 font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleSaveEdit}
                  disabled={updating}
                  className="btn-primary text-xs py-1 px-3 flex items-center gap-1"
                >
                  {updating ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary text-xs py-1 px-2 flex items-center gap-1"
                >
                  <X size={12} /> Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {!isEditing && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onView(qr)}
              className="p-1.5 rounded-lg hover:bg-surface-800 text-slate-400 hover:text-brand-300 transition-colors"
              title="View Details & QR Code"
            >
              <Eye size={14} />
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 rounded-lg hover:bg-surface-800 text-slate-400 hover:text-white transition-colors"
              title="Edit Destination URL"
            >
              <Edit3 size={14} />
            </button>
            <button
              onClick={() => onDelete(qr._id)}
              className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"
              title="Delete QR"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const SavedQRs = () => {
  const [qrs, setQrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedQR, setSelectedQR] = useState(null);

  const fetchQRs = async () => {
    setLoading(true);
    try {
      const res = await qrAPI.getAll();
      setQrs(res.data);
    } catch {
      toast.error('Failed to load saved QR codes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQRs(); }, []);

  const handleDelete = async (id) => {
    try {
      await qrAPI.delete(id);
      setQrs((prev) => prev.filter((q) => q._id !== id));
      toast.success('QR deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleUpdate = (id, updatedFields) => {
    setQrs((prev) =>
      prev.map((q) => (q._id === id ? { ...q, ...updatedFields } : q))
    );
  };

  const filtered = qrs.filter((q) =>
    q.title?.toLowerCase().includes(search.toLowerCase()) ||
    q.type?.toLowerCase().includes(search.toLowerCase()) ||
    q.destination?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🗂️</span> Saved QR Codes & Campaigns
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {qrs.length} QR code{qrs.length !== 1 ? 's' : ''} saved · View & Edit campaigns anytime
          </p>
        </div>
        <button onClick={fetchQRs} disabled={loading} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-8"
          placeholder="Search by title, destination URL, or type..."
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="animate-spin text-brand-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <QrCode size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">No saved QR codes found</p>
          <p className="text-xs mt-1">Create one from the sidebar or dashboard</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((qr) => (
            <QRCard
              key={qr._id}
              qr={qr}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
              onView={(q) => setSelectedQR(q)}
            />
          ))}
        </div>
      )}

      {/* View QR Details Modal with Rendered QR Code */}
      <AnimatePresence>
        {selectedQR && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-900 border border-surface-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedQR(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-surface-800 text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-white">{selectedQR.title}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 uppercase">
                  {selectedQR.type}
                </span>
              </div>

              {/* Real-time Rendered QR Code Image */}
              <ModalQRPreview qr={selectedQR} />

              <div className="p-4 rounded-xl bg-surface-850 border border-surface-800 space-y-2 text-xs">
                <div>
                  <span className="text-slate-500 font-bold block text-[10px] uppercase">Destination Target</span>
                  <p className="text-slate-200 font-mono break-all">{selectedQR.destination || 'N/A'}</p>
                </div>
                {selectedQR.dynamic && (
                  <div>
                    <span className="text-slate-500 font-bold block text-[10px] uppercase">Dynamic Short URL</span>
                    <p className="text-brand-300 font-mono">
                      {import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'}/d/{selectedQR.code}
                    </p>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-surface-800 text-[11px] text-slate-400">
                  <span>Total Scans: <strong className="text-white">{selectedQR.clicks || 0}</strong></span>
                  <span>Created: {new Date(selectedQR.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedQR(null)}
                  className="btn-primary text-xs py-2 px-4"
                >
                  Close Modal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SavedQRs;
