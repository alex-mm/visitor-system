import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Visitor } from '../types'
import {
  RefreshCw, CheckCircle2, LogOut, Trash2, Search,
  TrendingUp, Users, Clock, BarChart3
} from 'lucide-react'

const STATUS_LABELS: Record<string, string> = {
  pending: '待签到', checked_in: '已签到', checked_out: '已离开'
}

export default function AdminDashboard() {
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0])

  async function fetchAll() {
    setLoading(true)
    let query = supabase.from('visitors').select('*').order('created_at', { ascending: false })
    if (dateFilter) query = query.eq('visit_date', dateFilter)
    if (statusFilter !== 'all') query = query.eq('status', statusFilter)
    const { data } = await query
    if (data) setVisitors(data as Visitor[])
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [statusFilter, dateFilter])

  async function updateStatus(id: string, status: string) {
    setActionLoading(id + status)
    const updates: Record<string, string | null> = { status }
    if (status === 'checked_in') updates.check_in_time = new Date().toISOString()
    if (status === 'checked_out') updates.check_out_time = new Date().toISOString()
    await supabase.from('visitors').update(updates).eq('id', id)
    setActionLoading(null)
    fetchAll()
  }

  async function deleteVisitor(id: string) {
    if (!confirm('确认删除此访客记录？')) return
    setActionLoading(id + 'delete')
    await supabase.from('visitors').delete().eq('id', id)
    setActionLoading(null)
    fetchAll()
  }

  const filtered = visitors.filter(v =>
    !search ||
    v.name.includes(search) ||
    v.phone.includes(search) ||
    v.host_name.includes(search) ||
    (v.company || '').includes(search)
  )

  // 统计
  const today = new Date().toISOString().split('T')[0]
  const todayAll = visitors.filter(v => v.visit_date === today)
  const stats = {
    total: todayAll.length,
    pending: todayAll.filter(v => v.status === 'pending').length,
    checkedIn: todayAll.filter(v => v.status === 'checked_in').length,
    checkedOut: todayAll.filter(v => v.status === 'checked_out').length,
  }

  // 目的分布
  const purposeMap: Record<string, number> = {}
  visitors.forEach(v => { purposeMap[v.purpose] = (purposeMap[v.purpose] || 0) + 1 })
  const topPurposes = Object.entries(purposeMap).sort((a, b) => b[1] - a[1]).slice(0, 4)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">管理后台</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: 14, marginTop: 4 }}>访客审批与状态管理</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchAll}>
          <RefreshCw size={16} />刷新
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[
          { icon: <Users size={20} />, label: '今日登记', value: stats.total, color: '#4f46e5', bg: '#ede9fe' },
          { icon: <Clock size={20} />, label: '待签到', value: stats.pending, color: '#d97706', bg: '#fef3c7' },
          { icon: <TrendingUp size={20} />, label: '已签到', value: stats.checkedIn, color: '#059669', bg: '#d1fae5' },
          { icon: <BarChart3 size={20} />, label: '已离开', value: stats.checkedOut, color: '#6b7280', bg: '#f3f4f6' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <div className="stat-value" style={{ color: s.color, fontSize: 26 }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 来访目的分布 */}
      {topPurposes.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 14 }}>来访目的分布</h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {topPurposes.map(([purpose, count]) => (
              <div key={purpose} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--gray-50)', borderRadius: 6, padding: '8px 14px' }}>
                <span style={{ fontSize: 14, color: 'var(--gray-700)' }}>{purpose}</span>
                <span style={{ background: 'var(--primary)', color: '#fff', borderRadius: 9999, padding: '1px 8px', fontSize: 12, fontWeight: 600 }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 过滤栏 */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="filter-bar">
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
            <input className="search-input" style={{ paddingLeft: 34 }} placeholder="搜索姓名、电话、公司..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <input type="date" className="form-input" style={{ width: 160 }} value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
          <select className="form-input" style={{ width: 130 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">全部状态</option>
            <option value="pending">待签到</option>
            <option value="checked_in">已签到</option>
            <option value="checked_out">已离开</option>
          </select>
        </div>
      </div>

      {/* 管理表格 */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading">加载中...</div>
        ) : filtered.length === 0 ? (
          <div className="empty"><Search size={40} /><span>暂无访客记录</span></div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>访客</th>
                  <th>联系方式</th>
                  <th className="hide-mobile">被访人</th>
                  <th className="hide-mobile">来访目的</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(v => (
                  <tr key={v.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{v.name}</div>
                      {v.company && <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{v.company}</div>}
                    </td>
                    <td>
                      <div>{v.phone}</div>
                      {v.id_number && <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{v.id_number}</div>}
                    </td>
                    <td className="hide-mobile">
                      <div>{v.host_name}</div>
                      {v.host_department && <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{v.host_department}</div>}
                    </td>
                    <td className="hide-mobile">{v.purpose}</td>
                    <td>
                      <span className={`badge badge-${v.status}`}>
                        {STATUS_LABELS[v.status]}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {v.status === 'pending' && (
                          <button
                            className="btn btn-success btn-sm"
                            disabled={actionLoading === v.id + 'checked_in'}
                            onClick={() => updateStatus(v.id, 'checked_in')}
                          >
                            <CheckCircle2 size={14} />签到
                          </button>
                        )}
                        {v.status === 'checked_in' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            disabled={actionLoading === v.id + 'checked_out'}
                            onClick={() => updateStatus(v.id, 'checked_out')}
                          >
                            <LogOut size={14} />离开
                          </button>
                        )}
                        <button
                          className="btn btn-danger btn-sm"
                          disabled={actionLoading === v.id + 'delete'}
                          onClick={() => deleteVisitor(v.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
