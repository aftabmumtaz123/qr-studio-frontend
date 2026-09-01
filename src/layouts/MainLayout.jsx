import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import QRPreviewPanel from '../components/QRPreviewPanel';

const MainLayout = () => {
  const location = useLocation();
  const showPreview = location.pathname.startsWith('/qr/');

  return (
    <div className="app-shell">
      <Navbar />
      <div className={showPreview ? 'content-shell content-with-preview' : 'content-shell'}>
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="page-container"
        >
          <Outlet />
        </motion.main>
        {showPreview && <QRPreviewPanel />}
      </div>
    </div>
  );
};

export default MainLayout;
