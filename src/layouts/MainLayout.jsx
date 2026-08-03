import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import QRPreviewPanel from '../components/QRPreviewPanel';

const MainLayout = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface-950">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Top Header */}
        <Header />

        {/* Body Container with Sticky Live Preview */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Scrollable Main Form / Page Area */}
          <motion.main
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="flex-1 overflow-y-auto scrollable p-6 min-w-0"
          >
            <Outlet />
          </motion.main>

          {/* Sticky Right-Side Live Preview Panel */}
          <QRPreviewPanel />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
