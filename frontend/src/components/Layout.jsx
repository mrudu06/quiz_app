import Sidebar from './Sidebar';
import { motion } from 'framer-motion';

const Layout = ({ children }) => {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="page-container"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default Layout;