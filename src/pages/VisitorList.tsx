import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Visitor } from '../types'
import { Search, RefreshCw, Clock, CheckCircle2, LogOut } from 'lucide-react'

const STATUS_LABELS: Record<string, string> = {
  pending: '待签到',
  checked_in: '已签到',
  checked_out: '已离开'
}

function StatusBadge({ status }: { status: string }) {
  const icons: Record<string, React.ReactNode> = {
    pending: <Clock size={12} />,
    checked_in: <CheckCircle2 size={12} />,
    checked_out: <LogOut size={12} />
  }
  return (
    <span className={`badge badge-${status}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      {icons[status]}
      {STATUS_LABELS[status] || status}
    </span>
  )
}

export default function VisitorList() {
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0])

  async function fetchVisitors() {
    setLoading(true)
    let query = supabase
      .from('visitors')
      .select('*')
      .order('created_at', { ascending: false })

    if (dateFilter) {
      query = query.eq('visit_date', dateFilter)
    }
    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }

    const { data, error } = await query
    if (!error && data) setVisitors(data as Visitor[])
    setLoading(false)
  }

  useEffect(() => { fetchVisitors() }, [statusFilter, dateFilter])

  const filtered = visitors.filter(v =>
    !search ||
    v.name.includes(search) ||
    v.phone.includes(search) ||
    v.host_name.includes(search) ||
    (v.company || '').includes(search)
  )

  const today = new Date().toISOString().split('T')[0]
  const todayVisitors = visitors.filter(v => v.visit_date === today)
  const stats = {
    total: todayVisitors.length,
    pending: todayVisitors.filter(v => v.status === 'pending').length,
    checked_in: todayVisitors.filter(v => v.status === 'checked_in').length,
    checked_out: todayVisitors.filter(v => v.status === 'checked_out').length,
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">访问记录</h1>
        <button className="btn btn-secondary" onClick={fetchVisitors}>
          <RefreshCw size={16} />刷新
        </button>
      </div>

      {/* 今日统计 */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[
          { label: '今日总计', value: stats.total, color: 'var(--primary)' },
          { label: '待签到', value: stats.pending, color: '#d97706' },
          { label: '已签到', value: stats.checked_in, color: 'var(--success)' },
          { label: '已离开', value: stats.checked_out, color: 'var(--gray-500)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* 过滤栏 */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="filter-bar">
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
            <input
              className="search-input"
              style={{ paddingLeft: 34 }}
              placeholder="搜索姓名、电话、公司..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <input
            type="date"
            className="form-input"
            style={{ width: 160 }}
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
          />
          <select
            className="form-input"
            style={{ width: 130 }}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">全部状态</option>
            <option value="pending">待签到</option>
            <option value="checked_in">已签到</option>
            <option value="checked_out">已离开</option>
          </select>
        </div>
      </div>

      {/* 记录表格 */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading">加载中...</div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <Search size={40} />
            <span>暂无访客记录</span>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>访客姓名</th>
                  <th>联系电话</th>
                  <th className="hide-mobile">所在公司</th>
                  <th>被访人</th>
                  <th className="hide-mobile">来访目的</th>
                  <th>状态</th>
                  <th className="hide-mobile">登记时间</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(v => (
                  <tr key={v.id}>
                    <td><strong>{v.name}</strong></td>
                    <td>{v.phone}</td>
                    <td className="hide-mobile">{v.company || '-'}</td>
                    <td>
                      {v.host_name}
                      {v.host_department && <span style={{ color: 'var(--gray-400)', fontSize: 12 }}> · {v.host_department}</span>}
                    </td>
                    <td className="hide-mobile">{v.purpose}</td>
                    <td><StatusBadge status={v.status} /></td>
                    <td className="hide-mobile" style={{ color: 'var(--gray-500)', fontSize: 13 }}>
                      {new Date(v.created_at).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
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
