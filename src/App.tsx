import { useState } from 'react';
import Sidebar from './components/Sidebar';
import RechnerView from './components/views/RechnerView';
import FuhrparkView from './components/views/FuhrparkView';
import HistorieView from './components/views/HistorieView';

export default function App() {
  const [view, setView] = useState('rechner');
  const [collapsed, setCollapsed] = useState(false);

  const sidebarWidth = collapsed ? 64 : 220;

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA' }}>
      <Sidebar
        view={view}
        setView={setView}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <main style={{
        marginLeft: sidebarWidth,
        padding: '40px 48px',
        minHeight: '100vh',
        transition: 'margin-left 0.22s cubic-bezier(0.4,0,0.2,1)',
      }}>
        {view === 'rechner'  && <RechnerView />}
        {view === 'fuhrpark' && <FuhrparkView />}
        {view === 'historie' && <HistorieView />}
      </main>
    </div>
  );
}
