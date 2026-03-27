export type UserRole = 'landlord' | 'property_manager' | 'tenant' | 'homeowner'
export type PaymentStatus = 'paid' | 'overdue' | 'partial' | 'pending' | 'upcoming'
export type PaymentMethod = 'mtn_momo' | 'airtel_money' | 'bank_transfer' | 'cash'
export type UtilityType = 'electricity' | 'water' | 'internet' | 'garbage' | 'security' | 'other'
export type MaintenanceStatus = 'open' | 'in_progress' | 'resolved'
export type MaintenancePriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Profile {
  id: string
  full_name: string
  phone: string | null
  email: string
  role: UserRole
  avatar_url: string | null
  created_at: string
}

export interface Property {
  id: string
  owner_id: string
  manager_id: string | null
  name: string
  address: string
  city: string
  total_units: number
  created_at: string
  owner?: Profile
  manager?: Profile
}

export interface Unit {
  id: string
  property_id: string
  unit_number: string
  floor: number | null
  bedrooms: number
  rent_amount: number
  is_occupied: boolean
  property?: Property
}

export interface Lease {
  id: string
  unit_id: string
  tenant_id: string
  start_date: string
  end_date: string
  rent_amount: number
  deposit_amount: number
  due_day: number           // day of month rent is due (e.g. 1)
  late_fee_percent: number  // e.g. 5 means 5% after grace period
  grace_period_days: number
  is_active: boolean
  unit?: Unit
  tenant?: Profile
}

export interface Payment {
  id: string
  lease_id: string
  tenant_id: string
  unit_id: string
  property_id: string
  amount: number
  amount_due: number
  period_month: number      // 1-12
  period_year: number
  status: PaymentStatus
  method: PaymentMethod | null
  paid_at: string | null
  due_date: string
  late_fee: number
  reference: string | null
  notes: string | null
  recorded_by: string | null
  created_at: string
  lease?: Lease
  tenant?: Profile
  unit?: Unit
  property?: Property
}

export interface UtilityBill {
  id: string
  property_id: string
  unit_id: string | null    // null = shared/whole building
  type: UtilityType
  provider: string
  amount: number
  period_month: number
  period_year: number
  due_date: string
  paid_at: string | null
  status: PaymentStatus
  split_among_units: boolean
  created_at: string
  property?: Property
  unit?: Unit
}

export interface MaintenanceRequest {
  id: string
  unit_id: string
  tenant_id: string
  title: string
  description: string
  status: MaintenanceStatus
  priority: MaintenancePriority
  assigned_to: string | null
  resolved_at: string | null
  created_at: string
  unit?: Unit
  tenant?: Profile
}

export interface Reminder {
  id: string
  property_id: string
  trigger_days_before: number   // negative = days after due date
  channel: 'sms' | 'whatsapp' | 'email'
  message_template: string
  is_active: boolean
  apply_late_fee: boolean
}

/* ---- Supabase Database type map (used by createClient<Database>) ---- */
export interface Database {
  public: {
    Tables: {
      profiles:             { Row: Profile;            Insert: Partial<Profile>;            Update: Partial<Profile> }
      properties:           { Row: Property;           Insert: Partial<Property>;           Update: Partial<Property> }
      units:                { Row: Unit;               Insert: Partial<Unit>;               Update: Partial<Unit> }
      leases:               { Row: Lease;              Insert: Partial<Lease>;              Update: Partial<Lease> }
      payments:             { Row: Payment;            Insert: Partial<Payment>;            Update: Partial<Payment> }
      utility_bills:        { Row: UtilityBill;        Insert: Partial<UtilityBill>;        Update: Partial<UtilityBill> }
      maintenance_requests: { Row: MaintenanceRequest; Insert: Partial<MaintenanceRequest>; Update: Partial<MaintenanceRequest> }
      reminders:            { Row: Reminder;           Insert: Partial<Reminder>;           Update: Partial<Reminder> }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
