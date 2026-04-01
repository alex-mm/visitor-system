import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom'
import { useState } from 'react'
import { Users, ClipboardList, Settings, Menu, X, Building2 } from 'lucide-react'
import VisitorForm from './pages/VisitorForm'
import VisitorList from './pages/VisitorList'
import AdminDashboard from './pages/AdminDashboard'

function Layout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const navItems = [
    { to: '/register', icon: <ClipboardList size={18} />, label: '访客登记' },
    { to: '/records', icon: <Users size={18} />, label: '访问记录' },
    { to: '/admin', icon: <Settings size={18} />, label: '管理后台' },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        color: '#fff',
        boxShadow: '0 2px 8px rgba(79,70,229,.4)'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', height: 60 }}>
          <Building2 size={24} style={{ marginRight: 10, flexShrink: 0 }} />
          <span style={{ fontSize: 18, fontWeight: 700, flex: 1 }}>智慧访客管理系统</span>
          {/* Desktop Nav */}
          <nav style={{ display: 'flex', gap: 4 }} className="hide-mobile">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 6, fontSize: 14, fontWeight: 500,
                  color: isActive ? '#fff' : 'rgba(255,255,255,.75)',
                  background: isActive ? 'rgba(255,255,255,.2)' : 'transparent',
                  transition: 'all .15s'
                })}
              >
                {item.icon}{item.label}
              </NavLink>
            ))}
          </nav>
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: 'none', border: 'none', color: '#fff', padding: 4, display: 'none' }}
            className="show-mobile"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {/* Mobile Nav */}
        {menuOpen && (
          <div style={{ padding: '8px 20px 12px', borderTop: '1px solid rgba(255,255,255,.15)' }}>
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 12px', borderRadius: 6, fontSize: 14, fontWeight: 500,
                  color: isActive ? '#fff' : 'rgba(255,255,255,.8)',
                  background: isActive ? 'rgba(255,255,255,.15)' : 'transparent',
                  marginBottom: 2
                })}
              >
                {item.icon}{item.label}
              </NavLink>
            ))}
          </div>
        )}
      </header>

      {/* Main */}
      <main style={{ flex: 1, maxWidth: 1200, margin: '0 auto', padding: '28px 20px', width: '100%' }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '16px 20px', color: 'var(--gray-400)', fontSize: 13, borderTop: '1px solid var(--gray-100)' }}>
        © 2025 智慧访客管理系统 · Powered by Cloudflare + Supabase
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/register" replace />} />
        <Route path="/register" element={<Layout><VisitorForm /></Layout>} />
        <Route path="/records" element={<Layout><VisitorList /></Layout>} />
        <Route path="/admin" element={<Layout><AdminDashboard /></Layout>} />
        <Route path="*" element={<Navigate to="/register" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
