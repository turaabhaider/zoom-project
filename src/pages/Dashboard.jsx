import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Video, Users, Play, BarChart3, ShieldCheck, 
  Settings, Bell, Search, Zap, HardDrive 
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex' }}>
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3rem' }}>
          <div style={{ background: 'var(--accent)', padding: '8px', borderRadius: '10px' }}>
            <Zap size={20} color="black" />
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-1px' }}>VORA.AI</span>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="nav-link active"><BarChart3 size={20} /> Overview</div>
          <div className="nav-link"><Play size={20} /> My Content</div>
          <div className="nav-link"><Users size={20} /> Audience</div>
          <div className="nav-link"><ShieldCheck size={20} /> Security</div>
          <div style={{ margin: '2rem 0', height: '1px', background: 'var(--border-light)' }}></div>
          <div className="nav-link"><Settings size={20} /> Settings</div>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content" style={{ flex: 1, padding: '2.5rem 4rem', height: '100vh', overflowY: 'auto' }}>
        
        {/* TOP BAR */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} size={18} />
            <input 
              placeholder="Search analytics..." 
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', padding: '10px 15px 10px 40px', borderRadius: '12px', color: 'white', width: '300px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Bell size={20} color="var(--text-muted)" />
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(45deg, #38bdf8, #818cf8)' }}></div>
          </div>
        </header>

        {/* WELCOME SECTION */}
        <section style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.8rem', fontWeight: '800', margin: '0', letterSpacing: '-2px' }}>Welcome, Commander</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Your streaming infrastructure is optimized and ready.</p>
        </section>

        {/* ANALYTICS ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '3rem' }}>
          <div className="glass-card">
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Peak Viewers</span>
                <Zap size={16} color="var(--accent)" />
             </div>
             <div style={{ fontSize: '2rem', fontWeight: '700' }}>24,892</div>
             <div style={{ color: '#10b981', fontSize: '0.8rem', marginTop: '5px' }}>↑ 12% from yesterday</div>
          </div>
          <div className="glass-card">
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Cloud Storage</span>
                <HardDrive size={16} color="#a855f7" />
             </div>
             <div style={{ fontSize: '2rem', fontWeight: '700' }}>1.2 TB</div>
             <div style={{ background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '10px', marginTop: '15px' }}>
                <div style={{ width: '70%', height: '100%', background: '#a855f7', borderRadius: '10px' }}></div>
             </div>
          </div>
          <div className="glass-card">
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Avg. Latency</span>
                <BarChart3 size={16} color="#fbbf24" />
             </div>
             <div style={{ fontSize: '2rem', fontWeight: '700' }}>24ms</div>
             <div style={{ color: '#10b981', fontSize: '0.8rem', marginTop: '5px' }}>Excellent Stability</div>
          </div>
        </div>

        {/* MAIN ACTION BUTTONS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
          <div 
            className="glass-card" 
            onClick={() => navigate('/stream/live')}
            style={{ background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(15, 23, 42, 0.6))', cursor: 'pointer' }}
          >
            <Video size={48} color="var(--accent)" style={{ marginBottom: '1.5rem' }} />
            <h2 style={{ fontSize: '1.8rem', margin: '0 0 10px 0' }}>Launch Main Stage</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>Start a global broadcast. Your stream will be automatically recorded in 4K and synced to your AWS S3 bucket.</p>
            <button style={{ marginTop: '1.5rem', padding: '12px 30px', borderRadius: '12px', background: 'var(--accent)', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Go Live Now</button>
          </div>

          <div 
            className="glass-card" 
            onClick={() => navigate('/meeting/zoom')}
            style={{ cursor: 'pointer' }}
          >
            <Users size={48} color="#10b981" style={{ marginBottom: '1.5rem' }} />
            <h2 style={{ fontSize: '1.8rem', margin: '0 0 10px 0' }}>Private Briefing</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>Encrypted peer-to-peer session using Zoom SDK.</p>
            <button style={{ marginTop: '1.5rem', padding: '12px 30px', borderRadius: '12px', background: 'transparent', border: '1px solid var(--border-light)', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Join Room</button>
          </div>
        </div>

      </main>
    </div>
  );
}