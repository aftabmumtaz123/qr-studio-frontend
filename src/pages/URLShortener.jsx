import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Link2, Copy, Trash2, ExternalLink, Eye, Edit3, Power, X, MousePointerClick, CalendarDays, Activity, Save, Ban } from 'lucide-react';
import toast from 'react-hot-toast';
import { shortURLAPI } from '../services/api';

const URLShortener = () => {
  const location = useLocation();
  const isCreatePage = location.pathname === '/shortener';
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [savedUrls, setSavedUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', url: '', alias: '' });

  const loadSaved = async () => {
    try {
      const { data } = await shortURLAPI.getAll();
      setSavedUrls(data);
    } catch (error) { toast.error(error.message); }
  };

  useEffect(() => { loadSaved(); }, []);

  const shorten = async (event) => {
    event.preventDefault();
    if (!title.trim()) return toast.error('Add a title for this short URL');
    if (!url.trim()) return toast.error('Enter a URL first');
    try { new URL(url); } catch { return toast.error('Enter a valid URL'); }
    setLoading(true);
    try {
      const { data } = await shortURLAPI.create({ title, url, alias });
      setShortUrl(data.shortUrl);
      setSavedUrls((items) => [data, ...items]);
      setTitle(''); setUrl(''); setAlias('');
      toast.success('Short URL created and saved');
    } catch (error) { toast.error(error.message); }
    finally { setLoading(false); }
  };

  const toggle = async (id) => {
    try {
      const { data } = await shortURLAPI.toggle(id);
      setSavedUrls((items) => items.map((item) => item._id === id ? data : item));
      if (selected?._id === id) setSelected(data);
      toast.success(data.active ? 'Short URL activated' : 'Short URL deactivated');
    } catch (error) { toast.error(error.message); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this saved short URL?')) return;
    try {
      await shortURLAPI.delete(id);
      setSavedUrls((items) => items.filter((item) => item._id !== id));
      if (selected?._id === id) setSelected(null);
      toast.success('Short URL deleted');
    } catch (error) { toast.error(error.message); }
  };

  const startEdit = (item) => {
    setEditing(item._id);
    setEditForm({ title: item.title || '', url: item.originalUrl || '', alias: item.code || '' });
  };

  const saveEdit = async (id) => {
    try {
      const { data } = await shortURLAPI.update(id, editForm);
      setSavedUrls((items) => items.map((item) => item._id === id ? data : item));
      if (selected?._id === id) setSelected(data);
      setEditing(null);
      toast.success('Short URL updated');
    } catch (error) { toast.error(error.message); }
  };

  const copy = async (value) => {
    await navigator.clipboard.writeText(value);
    toast.success('Copied');
  };

  const totalLinks = savedUrls.length;
  const activeLinks = savedUrls.filter((item) => item.active !== false).length;
  const inactiveLinks = totalLinks - activeLinks;
  const totalClicks = savedUrls.reduce((sum, item) => sum + Number(item.clicks || 0), 0);

  return (
    <div className="dashboard-page url-shortener-page">
      <section className="page-heading">
        <div><p className="eyebrow">{isCreatePage ? 'URL Shortener' : 'Saved Links'}</p><h1>{isCreatePage ? 'Shorten your links' : 'My Short URLs'}</h1><p>{isCreatePage ? 'Create, manage and track your saved short URLs.' : 'Manage and track all of your saved short URLs.'}</p></div>
      </section>

      <section className="stats-grid management-stats-grid shortener-stats">

        <div className="stat-card">
          <div className="stat-icon purple"><Link2 size={19} /></div>
          <div>
            <span>Total Short URLs</span>
            <strong>{totalLinks}</strong>
            <small>Saved in your workspace</small>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Activity size={19} /></div>
          <div>
            <span>Active Links</span>
            <strong>{activeLinks}</strong>
            <small>Currently available</small>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><MousePointerClick size={19} /></div>
          <div>
            <span>Total Clicks</span>
            <strong>{totalClicks.toLocaleString()}</strong>
            <small>Across all short URLs</small>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><Ban size={19} /></div>
          <div>
            <span>Inactive Links</span>
            <strong>{inactiveLinks}</strong>
            <small>Temporarily disabled</small>
          </div>
        </div>
      </section>

      {isCreatePage && <section className="simple-panel shortener-panel shortener-form-panel">
        <div className="panel-heading"><div><p className="eyebrow">Create</p><h2>New short URL</h2></div></div>
        <form onSubmit={shorten}>
          <div className="form-grid shortener-form-grid">
            <label>Title<input className="light-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Marketing Campaign" /></label>
            <label>Long URL<input className="light-input" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/your-long-url" /></label>
            <label>Alias <span className="muted-label">(optional)</span><input className="light-input" value={alias} onChange={(e) => setAlias(e.target.value)} placeholder="my-campaign" /></label>
          </div>
          <div className="shortener-actions"><span className="helper-text">Leave the alias empty to generate one automatically.</span><button className="primary-button" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Shorten & Save'}</button></div>
        </form>
        {shortUrl && <div className="result-row"><div><small>New Short URL</small><strong>{shortUrl}</strong></div><div className="result-actions"><button className="secondary-button" onClick={() => copy(shortUrl)}><Copy size={15}/> Copy</button><a className="secondary-button" href={shortUrl} target="_blank" rel="noreferrer"><ExternalLink size={15}/> Open</a></div></div>}
      </section>}

      <section className="simple-panel saved-shortener-panel">
        <div className="panel-heading"><div><p className="eyebrow">Saved Links</p><h2>My Short URLs</h2></div><span className="count-pill">{savedUrls.length}</span></div>

        {savedUrls.length === 0 ? <div className="empty-state">Your saved short URLs will appear here.</div> : (
          <div className="saved-links-table">
            <div className="saved-link-head">
              <span>Link</span>
              <span>Status</span>
              <span>Clicks</span>
              <span>Created</span>
              <span>Actions</span>
            </div>

            {savedUrls.map((item) => (
              <div className="saved-link-row" key={item._id}>
                {editing === item._id ? (
                  <div className="saved-link-edit"><input className="light-input" value={editForm.title} onChange={(e) => setEditForm({...editForm, title:e.target.value})} placeholder="Title"/><input className="light-input" value={editForm.url} onChange={(e) => setEditForm({...editForm, url:e.target.value})} placeholder="https://..."/><input className="light-input" value={editForm.alias} onChange={(e) => setEditForm({...editForm, alias:e.target.value})} placeholder="alias"/><div className="edit-actions"><button className="icon-button success" onClick={() => saveEdit(item._id)} title="Save"><Save size={15}/></button><button className="icon-button" onClick={() => setEditing(null)} title="Cancel"><X size={15}/></button></div></div>
                ) : <>
                  <div className="saved-link-main">
                    <div className="saved-link-icon"><Link2 size={16} /></div>
                    <div>
                      <strong title={item.title}>{item.title || 'Untitled'}</strong>
                      <a href={item.shortUrl} target="_blank" rel="noreferrer" title={item.shortUrl}>{item.shortUrl}</a>
                      {item.originalUrl && <small title={item.originalUrl}>{item.originalUrl}</small>}
                    </div>
                  </div>
                  <span className={`status-pill ${item.active !== false ? 'active' : 'inactive'}`}>
                    <i /> {item.active !== false ? 'Active' : 'Inactive'}
                  </span>
                  <span className="metric-cell"><MousePointerClick size={13} />{item.clicks || 0}</span>
                  <span className="date-cell">
                    {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <div className="row-actions">
                    <button className="icon-button" onClick={() => setSelected(item)} title="View"><Eye size={15} /></button>
                    <button className="icon-button" onClick={() => startEdit(item)} title="Update"><Edit3 size={15} /></button>
                    <button
                      className={`icon-button ${item.active === false ? 'success' : ''}`}
                      onClick={() => toggle(item._id)}
                      title={item.active === false ? 'Activate' : 'Deactivate'}
                    >
                      <Power size={15} />
                    </button>
                    <button className="icon-button danger" onClick={() => remove(item._id)} title="Delete"><Trash2 size={15} /></button>
                    <button className="icon-button" onClick={() => copy(item.shortUrl)} title="Copy short URL"><Copy size={15} /></button>
                  </div>

                </>}
              </div>
            ))}
          </div>
        )}
      </section>

      {selected && <div className="light-modal-backdrop" onMouseDown={() => setSelected(null)}><div className="light-modal link-detail-modal" onMouseDown={(e)=>e.stopPropagation()}>
        <button className="modal-close" onClick={()=>setSelected(null)}><X size={17}/></button>
        <div className="modal-icon purple"><Link2 size={20}/></div><p className="eyebrow">Short URL Details</p><h2>{selected.title}</h2>
        <div className="detail-url">{selected.shortUrl}</div>
        <div className="detail-stat-grid">
          <div><MousePointerClick /><span>Clicks</span><strong>{selected.clicks || 0}</strong></div>
          <div><Activity /><span>Status</span><strong>{selected.active !== false ? 'Active' : 'Inactive'}</strong></div>
          <div><CalendarDays /><span>Created</span><strong>{new Date(selected.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong></div>
        </div>

        <div className="detail-block"><small>Destination URL</small><p>{selected.originalUrl}</p></div>
        <div className="modal-actions"><button className="secondary-button" onClick={()=>copy(selected.shortUrl)}><Copy size={15}/> Copy</button><button className="secondary-button" onClick={()=>{startEdit(selected);setSelected(null)}}><Edit3 size={15}/> Update</button><button className="primary-button" onClick={()=>toggle(selected._id)}><Power size={15}/> {selected.active !== false ? 'Deactivate' : 'Activate'}</button></div>
      </div></div>}
    </div>
  );
};
export default URLShortener;
