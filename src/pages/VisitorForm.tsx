import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { CheckCircle, Send } from 'lucide-react'

interface FormData {
  name: string
  phone: string
  id_number: string
  company: string
  host_name: string
  host_department: string
  purpose: string
  notes: string
}

const initialForm: FormData = {
  name: '', phone: '', id_number: '', company: '',
  host_name: '', host_department: '', purpose: '', notes: ''
}

export default function VisitorForm() {
  const [form, setForm] = useState<FormData>(initialForm)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return setError('请填写访客姓名')
    if (!form.phone.trim()) return setError('请填写联系电话')
    if (!form.host_name.trim()) return setError('请填写被访人姓名')
    if (!form.purpose.trim()) return setError('请填写来访目的')

    setLoading(true)
    setError('')

    const { error: err } = await supabase.from('visitors').insert({
      name: form.name.trim(),
      phone: form.phone.trim(),
      id_card: form.id_number.trim() || null,
      company: form.company.trim() || null,
      host_name: form.host_name.trim(),
      host_department: form.host_department.trim() || null,
      purpose: form.purpose.trim(),
      notes: form.notes.trim() || null,
      status: 'pending',
      visit_date: new Date().toISOString().split('T')[0],
    })

    setLoading(false)
    if (err) {
      setError('登记失败，请重试：' + err.message)
    } else {
      setSuccess(true)
      setForm(initialForm)
      setTimeout(() => setSuccess(false), 5000)
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">访客登记</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: 14, marginTop: 4 }}>请填写完整信息，工作人员将及时为您安排</p>
        </div>
      </div>

      {success && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: 8,
          padding: '14px 18px', marginBottom: 20, color: '#065f46'
        }}>
          <CheckCircle size={20} />
          <span>登记成功！请在前台等候，工作人员将为您引导。</span>
        </div>
      )}

      {error && (
        <div style={{
          background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8,
          padding: '12px 16px', marginBottom: 16, color: '#991b1b', fontSize: 14
        }}>
          {error}
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* 访客信息 */}
          <div style={{ borderBottom: '1px solid var(--gray-100)', paddingBottom: 4, marginBottom: 2 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-700)' }}>访客信息</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">姓名 <span>*</span></label>
              <input className="form-input" name="name" value={form.name} onChange={handleChange} placeholder="请输入真实姓名" />
            </div>
            <div className="form-group">
              <label className="form-label">联系电话 <span>*</span></label>
              <input className="form-input" name="phone" value={form.phone} onChange={handleChange} placeholder="手机号码" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">证件号码</label>
              <input className="form-input" name="id_number" value={form.id_number} onChange={handleChange} placeholder="身份证/护照（选填）" />
            </div>
            <div className="form-group">
              <label className="form-label">所在公司</label>
              <input className="form-input" name="company" value={form.company} onChange={handleChange} placeholder="单位/公司名称（选填）" />
            </div>
          </div>

          {/* 被访信息 */}
          <div style={{ borderBottom: '1px solid var(--gray-100)', paddingBottom: 4, marginBottom: 2, marginTop: 4 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-700)' }}>被访信息</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">被访人 <span>*</span></label>
              <input className="form-input" name="host_name" value={form.host_name} onChange={handleChange} placeholder="被访人姓名" />
            </div>
            <div className="form-group">
              <label className="form-label">所在部门</label>
              <input className="form-input" name="host_department" value={form.host_department} onChange={handleChange} placeholder="部门名称（选填）" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">来访目的 <span>*</span></label>
            <select className="form-input" name="purpose" value={form.purpose} onChange={handleChange}>
              <option value="">请选择来访目的</option>
              <option value="商务洽谈">商务洽谈</option>
              <option value="技术支持">技术支持</option>
              <option value="政府检查">政府检查</option>
              <option value="面试">面试</option>
              <option value="参观考察">参观考察</option>
              <option value="快递/送货">快递/送货</option>
              <option value="其他">其他</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">备注说明</label>
            <textarea
              className="form-input"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="其他需要说明的事项（选填）"
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ marginTop: 4 }}>
            <Send size={18} />
            {loading ? '提交中...' : '提交登记'}
          </button>
        </form>
      </div>
    </div>
  )
}
