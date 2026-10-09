export type ProjectType = 'landing' | 'sistema' | 'ecommerce' | 'saas' | 'otro';

export type ProjectStatus = 'activo' | 'pausado' | 'en_desarrollo' | 'entregado' | 'cancelado';

export type BillingType = 'pago_unico' | 'mensual' | 'anual' | 'mixto';

export type RecurringPeriod = 'mensual' | 'anual' | 'ninguno';

export interface Project {
  id: string;
  name: string;
  client_name?: string | null;
  type: ProjectType;
  status: ProjectStatus;
  url?: string | null;
  google_account?: string | null;
  hosting_provider?: string | null;
  db_provider?: string | null;
  domain_name?: string | null;
  domain_registrar?: string | null;
  domain_renews: boolean;
  domain_renewal_date?: string | null;
  domain_cost: number;
  billing_type: BillingType;
  one_time_price: number;
  recurring_amount: number;
  recurring_period: RecurringPeriod;
  next_billing_date?: string | null;
  currency: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  project_id: string;
  concept: string;
  amount: number;
  payment_date: string;
  payment_type: 'pago_unico' | 'mantenimiento' | 'dominio' | 'extra';
  status: 'completado' | 'pendiente';
  notes?: string | null;
  created_at: string;
}

export interface ProjectWithPayments extends Project {
  payments?: Payment[];
  total_paid?: number;
}
