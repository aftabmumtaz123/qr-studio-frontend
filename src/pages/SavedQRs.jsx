import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { qrAPI, analyticsAPI } from '../services/api';
import { Trash2, Search, RefreshCw, Loader2, QrCode, Copy, Link2, Zap, Edit3, Save, X, Eye, ExternalLink, Power, BarChart3, MousePointerClick, CalendarDays, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

const typeColors = { URL:'blue', TEXT:'green', EMAIL:'orange', SMS:'pink', DYNAMIC_URL:'purple', VCARD:'rose', WIFI:'cyan' };

const ModalQRPreview = ({ qr }) => {
  const containerRef = useRef(null);
  useEffect(() => {
    let mounted = true;
    import('qr-code-styling').then((module) => {
      if (!mounted || !containerRef.current) return;
      const QRCodeStyling = module.default || module;
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
      const encodedData = qr.dynamic ? `${serverUrl}/d/${qr.code}` : (qr.destination || qr.payload?.data || 'https://example.com');
      const qrCode = new QRCodeStyling({ width:220,height:220,data:encodedData,image:qr.logo||undefined,dotsOptions:qr.style?.dotsOptions||{color:'#20242d',type:'rounded'},backgroundOptions:qr.style?.backgroundOptions||{color:'#ffffff'},cornersSquareOptions:qr.style?.cornersSquareOptions||{color:'#6256df',type:'extra-rounded'},cornersDotOptions:qr.style?.cornersDotOptions||{color:'#6256df',type:'dot'} });
      containerRef.current.innerHTML=''; qrCode.append(containerRef.current);
    });
    return ()=>{mounted=false;};
  },[qr]);
  return <div className="qr-modal-preview"><div ref={containerRef} className="qr-render-box"/></div>;
};

const QRCard = ({ qr, onDelete, onUpdate, onToggle, onView }) => {
  const [isEditing,setIsEditing]=useState(false); const [editTitle,setEditTitle]=useState(qr.title||''); const [editDestination,setEditDestination]=useState(qr.destination||''); const [updating,setUpdating]=useState(false);
  const serverUrl=import.meta.env.VITE_SERVER_URL||'http://localhost:5000'; const shortUrl=qr.code?`${serverUrl}/d/${qr.code}`:null; const tone=typeColors[qr.type]||'gray';
  const save=async()=>{setUpdating(true);try{await qrAPI.update(qr._id,{title:editTitle,destination:editDestination});onUpdate(qr._id,{title:editTitle,destination:editDestination});setIsEditing(false);toast.success('QR code updated');}catch(e){toast.error(e.message||'Failed to update QR');}finally{setUpdating(false);}};
  return <motion.div layout initial={{opacity:0,y:5}} animate={{opacity:1,y:0}} className="saved-qr-card">
    <div className="saved-qr-main">
      <div className={`saved-qr-icon ${tone}`}>{qr.dynamic?<Zap size={18}/>:<QrCode size={18}/>}</div>
      <div className="saved-qr-info">
        {isEditing?<div className="qr-edit-fields"><input className="light-input" value={editTitle} onChange={e=>setEditTitle(e.target.value)} placeholder="Title"/><input className="light-input" value={editDestination} onChange={e=>setEditDestination(e.target.value)} placeholder="Destination URL"/><div><button className="primary-button" onClick={save} disabled={updating}>{updating?<Loader2 size={14} className="spin"/>:<Save size={14}/>} Save</button><button className="secondary-button" onClick={()=>setIsEditing(false)}><X size={14}/> Cancel</button></div></div>:<>
          <div className="saved-qr-title-row"><h3>{qr.title}</h3><span className={`type-pill ${tone}`}>{qr.type}</span><span className={`status-pill ${qr.active!==false?'active':'inactive'}`}><i/> {qr.active!==false?'Active':'Inactive'}</span></div>
          <div className="saved-qr-url">{shortUrl||qr.destination||qr.payload?.data||'QR code content'}</div>
          <div className="saved-qr-meta"><span><MousePointerClick size={12}/>{qr.clicks||0} scans</span><span><CalendarDays size={12}/>{new Date(qr.createdAt).toLocaleDateString()}</span></div>
        </>}
      </div>
      {!isEditing&&<div className="saved-qr-actions"><button className="action-text-button primary" onClick={()=>onView(qr)}><Eye size={15}/> View</button><button className="icon-button" onClick={()=>setIsEditing(true)} title="Update"><Edit3 size={15}/></button><button className="icon-button" onClick={()=>onToggle(qr._id)} title={qr.active!==false?'Deactivate':'Activate'}><Power size={15}/></button><button className="icon-button danger" onClick={()=>onDelete(qr._id)} title="Delete"><Trash2 size={15}/></button></div>}
    </div>
  </motion.div>;
};

const SavedQRs=()=>{
  const [qrs,setQrs]=useState([]); const [loading,setLoading]=useState(true); const [search,setSearch]=useState(''); const [typeFilter,setTypeFilter]=useState('ALL'); const [statusFilter,setStatusFilter]=useState('ALL'); const [selectedQR,setSelectedQR]=useState(null); const [stats,setStats]=useState(null); const [statsLoading,setStatsLoading]=useState(false);
  const fetchQRs=async()=>{setLoading(true);try{const res=await qrAPI.getAll();setQrs(res.data);}catch{toast.error('Failed to load saved QR codes');}finally{setLoading(false);}};
  useEffect(()=>{fetchQRs();},[]);
  const handleDelete=async(id)=>{if(!window.confirm('Delete this QR code and its analytics?'))return;try{await qrAPI.delete(id);setQrs(p=>p.filter(q=>q._id!==id));if(selectedQR?._id===id)setSelectedQR(null);toast.success('QR deleted');}catch{toast.error('Failed to delete');}};
  const handleToggle=async(id)=>{try{const {data}=await qrAPI.toggle(id);setQrs(p=>p.map(q=>q._id===id?data:q));if(selectedQR?._id===id)setSelectedQR(data);toast.success(data.active?'QR activated':'QR deactivated');}catch(e){toast.error(e.message||'Failed to update status');}};
  const handleUpdate=(id,fields)=>setQrs(p=>p.map(q=>q._id===id?{...q,...fields}:q));
  const openView=async(qr)=>{setSelectedQR(qr);setStats(null);setStatsLoading(true);try{const {data}=await analyticsAPI.getByQR(qr._id);setStats(data);}catch{setStats({totalScans:qr.clicks||0,recentScans:[]});}finally{setStatsLoading(false);}};
  const filtered=qrs.filter(q=>{
    const term=search.trim().toLowerCase();
    const matchesSearch=!term || [q.title,q.type,q.destination,q.payload?.data,q.code].filter(Boolean).some(v=>String(v).toLowerCase().includes(term));
    const matchesType=typeFilter==='ALL' || q.type===typeFilter;
    const matchesStatus=statusFilter==='ALL' || (statusFilter==='ACTIVE' ? q.active!==false : q.active===false);
    return matchesSearch && matchesType && matchesStatus;
  });
  return <motion.div initial={{opacity:0}} animate={{opacity:1}} className="saved-qr-page">
    <div className="saved-qr-heading"><div><p className="eyebrow">QR Library</p><h1>My QR Codes</h1><p>Manage your saved QR codes, status, actions and performance.</p></div><button onClick={fetchQRs} disabled={loading} className="secondary-button"><RefreshCw size={14} className={loading?'spin':''}/> Refresh</button></div>
    <section className="stats-grid management-stats-grid saved-qr-stats">
      <div className="stat-card"><div className="stat-icon purple"><QrCode size={19}/></div><div><span>Total QR Codes</span><strong>{qrs.length}</strong><small>Saved in your workspace</small></div></div>
      <div className="stat-card"><div className="stat-icon green"><Activity size={19}/></div><div><span>Active QR Codes</span><strong>{qrs.filter((qr)=>qr.active!==false).length}</strong><small>Currently available</small></div></div>
      <div className="stat-card"><div className="stat-icon blue"><MousePointerClick size={19}/></div><div><span>Total Scans</span><strong>{qrs.reduce((sum,qr)=>sum+Number(qr.clicks||0),0).toLocaleString()}</strong><small>Across saved QR codes</small></div></div>
      <div className="stat-card"><div className="stat-icon orange"><Zap size={19}/></div><div><span>Dynamic QR Codes</span><strong>{qrs.filter((qr)=>qr.dynamic).length}</strong><small>Editable destinations</small></div></div>
    </section>

    <div className="simple-panel saved-qr-toolbar">
      <div className="saved-qr-total"><strong>{filtered.length}</strong><span>QR codes shown</span></div>
      <div className="saved-qr-filters">
        <div className="saved-qr-search"><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search title, URL or type..."/></div>
        <select className="saved-qr-filter" value={typeFilter} onChange={e=>setTypeFilter(e.target.value)} aria-label="Filter by QR type">
          <option value="ALL">All types</option>{[...new Set(qrs.map(q=>q.type).filter(Boolean))].sort().map(type=><option key={type} value={type}>{type.replaceAll('_',' ')}</option>)}
        </select>
        <select className="saved-qr-filter" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} aria-label="Filter by status">
          <option value="ALL">All status</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option>
        </select>
        {(search || typeFilter!=='ALL' || statusFilter!=='ALL') && <button className="filter-clear" onClick={()=>{setSearch('');setTypeFilter('ALL');setStatusFilter('ALL')}}>Clear</button>}
      </div>
    </div>
    {loading?<div className="qr-loading"><Loader2 size={25} className="spin"/></div>:filtered.length===0?<div className="simple-panel empty-state"><QrCode size={38}/><strong>No saved QR codes found</strong><span>Create a QR code to see it here.</span></div>:<div className="simple-panel saved-qr-table-panel"><div className="saved-qr-table"><div className="saved-qr-table-head"><span>QR CODE</span><span>TYPE</span><span>STATUS</span><span>SCANS</span><span>CREATED</span><span>ACTIONS</span></div>{filtered.map(qr=>{const tone=typeColors[qr.type]||'gray';const destination=qr.dynamic?`${import.meta.env.VITE_SERVER_URL||'http://localhost:5000'}/d/${qr.code}`:(qr.destination||qr.payload?.data||'QR content');return <div className="saved-qr-table-row" key={qr._id}><div className="saved-qr-table-main"><div className={`saved-qr-icon ${tone}`}>{qr.dynamic?<Zap size={17}/>:<QrCode size={17}/>}</div><div><strong>{qr.title||'Untitled QR'}</strong><small>{destination}</small></div></div><span><span className={`type-pill ${tone}`}>{qr.type}</span></span><span><span className={`status-pill ${qr.active!==false?'active':'inactive'}`}><i/> {qr.active!==false?'Active':'Inactive'}</span></span><span className="table-metric"><MousePointerClick size={13}/>{Number(qr.clicks||0).toLocaleString()}</span><span className="table-date">{new Date(qr.createdAt).toLocaleDateString()}</span><div className="saved-qr-table-actions"><button className="action-text-button primary" onClick={()=>openView(qr)}><Eye size={14}/> View</button><button className="icon-button" onClick={()=>window.location.href=`/analytics?qr=${qr._id}`} title="Analytics"><BarChart3 size={14}/></button><button className="icon-button" onClick={()=>{const title=window.prompt('QR title',qr.title||'');if(title!==null){qrAPI.update(qr._id,{title}).then(()=>{handleUpdate(qr._id,{title});toast.success('QR updated')}).catch(e=>toast.error(e.message))}}} title="Update"><Edit3 size={14}/></button><button className={`icon-button ${qr.active===false?'success':''}`} onClick={()=>handleToggle(qr._id)} title={qr.active===false?'Activate':'Deactivate'}><Power size={14}/></button><button className="icon-button danger" onClick={()=>handleDelete(qr._id)} title="Delete"><Trash2 size={14}/></button></div></div>})}</div></div>}
    <AnimatePresence>{selectedQR&&<div className="light-modal-backdrop" onMouseDown={()=>setSelectedQR(null)}><motion.div initial={{opacity:0,scale:.97}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:.97}} className="light-modal qr-detail-modal" onMouseDown={e=>e.stopPropagation()}>
      <button className="modal-close" onClick={()=>setSelectedQR(null)}><X size={17}/></button><div className="modal-header-row"><div className="saved-qr-icon purple"><QrCode size={19}/></div><div><p className="eyebrow">QR Details</p><h2>{selectedQR.title}</h2></div><span className={`status-pill ${selectedQR.active!==false?'active':'inactive'}`}><i/> {selectedQR.active!==false?'Active':'Inactive'}</span></div>
      <div className="qr-detail-grid"><ModalQRPreview qr={selectedQR}/><div className="qr-detail-content"><div className="detail-stat-grid"><div><MousePointerClick/><span>Scans</span><strong>{stats?.totalScans ?? selectedQR.clicks ?? 0}</strong></div><div><Activity/><span>Status</span><strong>{selectedQR.active!==false?'Active':'Inactive'}</strong></div><div><CalendarDays/><span>Created</span><strong>{new Date(selectedQR.createdAt).toLocaleDateString()}</strong></div></div><div className="detail-block"><small>Destination</small><p>{selectedQR.destination||selectedQR.payload?.data||'Content stored in QR payload'}</p></div>{selectedQR.dynamic&&<div className="detail-block"><small>Dynamic URL</small><p className="accent-text">{import.meta.env.VITE_SERVER_URL||'http://localhost:5000'}/d/{selectedQR.code}</p></div>}<div className="analytics-mini"><div><BarChart3 size={16}/><strong>Analytics</strong><span>{statsLoading?'Loading live data...':`${stats?.recentScans?.length||0} recent scan events available`}</span></div></div></div></div>
      <div className="modal-actions"><button className="secondary-button" onClick={()=>{navigator.clipboard.writeText(selectedQR.dynamic?`${import.meta.env.VITE_SERVER_URL||'http://localhost:5000'}/d/${selectedQR.code}`:(selectedQR.destination||''));toast.success('Copied')}}><Copy size={15}/> Copy</button><button className="secondary-button" onClick={()=>{setSelectedQR(null);window.location.href='/analytics'}}><BarChart3 size={15}/> Analytics</button><button className="secondary-button" onClick={()=>handleToggle(selectedQR._id)}><Power size={15}/> {selectedQR.active!==false?'Deactivate':'Activate'}</button><button className="danger-button" onClick={()=>handleDelete(selectedQR._id)}><Trash2 size={15}/> Delete</button></div>
    </motion.div></div>}</AnimatePresence>
  </motion.div>;
};
export default SavedQRs;
