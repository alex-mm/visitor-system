export interface Visitor {
  id: string
  name: string
  phone: string
  id_number?: string
  host_name: string
  host_department?: string
  purpose: string
  status: 'pending' | 'checked_in' | 'checked_out'
  visit_date: string
  check_in_time?: string
  check_out_time?: string
  company?: string
  notes?: string
  created_at: string
}

export type VisitorStatus = 'pending' | 'checked_in' | 'checked_out'
