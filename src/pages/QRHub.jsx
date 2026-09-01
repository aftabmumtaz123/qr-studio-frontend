import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Link2, Mail, Type, UserRound, Image, Wifi, CalendarDays, Smartphone, Share2, FileText, MessageCircle, Phone, Zap, ArrowUpRight, QrCode } from 'lucide-react';

const modules=[
 {to:'/qr/url',label:'URL',desc:'Website, landing page or product link',icon:Link2,grad:'from-cyan-400 to-blue-600'},
 {to:'/qr/dynamic',label:'Dynamic URL',desc:'Edit destination after publishing',icon:Zap,grad:'from-violet-400 to-fuchsia-600',featured:true},
 {to:'/qr/email',label:'Email',desc:'Pre-filled email address and subject',icon:Mail,grad:'from-amber-400 to-orange-600'},
 {to:'/qr/text',label:'Plain Text',desc:'Share notes, instructions or messages',icon:Type,grad:'from-indigo-400 to-violet-600'},
 {to:'/qr/vcard',label:'vCard',desc:'Share a digital contact card',icon:UserRound,grad:'from-pink-400 to-rose-600'},
 {to:'/qr/image',label:'Image',desc:'Open an image instantly',icon:Image,grad:'from-fuchsia-400 to-purple-600'},
 {to:'/qr/wifi',label:'WiFi',desc:'Let guests join your network',icon:Wifi,grad:'from-sky-400 to-cyan-600'},
 {to:'/qr/event',label:'Event',desc:'Share event details and calendar data',icon:CalendarDays,grad:'from-emerald-400 to-teal-600'},
 {to:'/qr/app',label:'App',desc:'Point users to your mobile app',icon:Smartphone,grad:'from-blue-400 to-indigo-600'},
 {to:'/qr/social',label:'Social',desc:'Create a social profile QR',icon:Share2,grad:'from-orange-400 to-pink-600'},
 {to:'/qr/pdf',label:'PDF',desc:'Share a document with one scan',icon:FileText,grad:'from-red-400 to-rose-600'},
 {to:'/qr/whatsapp',label:'WhatsApp',desc:'Start a direct WhatsApp chat',icon:MessageCircle,grad:'from-green-400 to-emerald-600'},
 {to:'/qr/phone',label:'Phone',desc:'Open a phone dial action',icon:Phone,grad:'from-slate-300 to-slate-500'},
];
const QRHub=()=> <div className="max-w-6xl mx-auto space-y-7 pb-10">
 <div><div className="flex items-center gap-3 mb-2"><div className="p-2.5 rounded-xl bg-violet-500/15 border border-violet-400/20"><QrCode size={22} className="text-violet-300"/></div><div><h1 className="text-2xl md:text-3xl font-bold text-white">QR Code Studio</h1><p className="text-sm text-slate-400">Choose a module and create a QR code in seconds.</p></div></div></div>
 <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">{modules.map((m,i)=>{const Icon=m.icon;return <motion.div key={m.to} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*.025}}><Link to={m.to} className={`group block glass glass-hover rounded-2xl p-5 h-full ${m.featured?'ring-1 ring-violet-400/30':''}`}><div className="flex items-start justify-between"><div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${m.grad} flex items-center justify-center shadow-lg`}><Icon size={20} className="text-white"/></div><ArrowUpRight size={17} className="text-slate-600 group-hover:text-white transition"/></div><h3 className="mt-5 text-sm font-bold text-white">{m.label}{m.featured&&<span className="ml-2 text-[9px] uppercase tracking-wider px-2 py-1 rounded-full bg-violet-500/15 text-violet-300">Recommended</span>}</h3><p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{m.desc}</p></Link></motion.div>})}</div>
 </div>;
export default QRHub;
