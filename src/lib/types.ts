export type Role = "patient" | "pharmacist" | "doctor" | "driver" | "admin" | "super_admin";

export interface User {
  id: string;
  role: Role;
  identity_id: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface ApiResponse<T = unknown> {
  status: "ok" | "processing" | "error";
  message: string;
  data: T | null;
  ref: string;
}

export interface PrescriptionItem {
  dpm_code: string;
  dose_mg: number;
  quantity: number;
}

export interface Prescription {
  id: string;
  patient_reference_token: string;
  items: PrescriptionItem[];
  created_at?: string;
}

export interface PrescriptionItemDetail {
  dpm_code: string;
  medicament: string;
  dose_mg: number;
  unit: string;
  quantity: number;
}

export interface PrescriptionVerification {
  id: string;
  prescription_id: string;
  status: PrescriptionStatus;
  medicament?: string;
  dosage?: string;
  items?: PrescriptionItemDetail[];
  doctor_name?: string;
  doctor_phone?: string;
  doctor_email?: string;
  patient_reference_token?: string;
  pharmacist_id?: string;
  pharmacist_license_hash?: string;
  verified_at?: string;
  dispensed_at?: string;
  doctor_confirmation_status?: string;
  doctor_confirmation_expires_at?: string;
  created_at?: string;
}

export type PrescriptionStatus =
  | "PENDING"
  | "HIGH_RISK_PENDING"
  | "VERIFIED"
  | "DISPENSED";

export interface DoctorConfirmationRequest {
  id: string;
  prescription_id: string;
  medicament?: string;
  dosage?: string;
  doctor_name?: string;
  doctor_license_hash: string;
  status: "AWAITING" | "SIGNED" | "EXPIRED";
  expires_at: string;
  patient_reference_token?: string;
}

export interface DeliveryTicket {
  id: string;
  prescription_id: string;
  pickup_coords: string;
  is_fulfilled: boolean;
  expires_at: string;
  status: "assigned" | "in_transit" | "delivered";
}

export interface VettedDriver {
  driver_token_hash: string;
  issuing_pharmacy_id: string;
  license_issued_at: string;
  license_expires_at: string;
  is_active: boolean;
}

export interface DashboardStats {
  total_deliveries_today: number;
  flagged_prescriptions: number;
  active_drivers: number;
}

export interface AuthPayload {
  sub: string;
  role: Role;
  identity_id: string;
}

export interface RevenueData {
  mrr_tnd: number;
  commissions_tnd: number;
  active_subscriptions: number;
  deliveries_this_month: number;
  top_plan: string;
  total_pharmacy_earnings: number;
  total_driver_payouts: number;
  net_profit: number;
  revenue_history?: RevenueMonth[];
}

export interface RevenueMonth {
  month: string;
  mrr: number;
  commissions: number;
  driver_payouts: number;
  net: number;
}

export interface Subscription {
  id: string;
  pharmacy_name: string;
  pharmacy_id: string;
  plan: string;
  price_tnd: number;
  started_at: string;
  expires_at: string;
  is_active: boolean;
  delivery_count_this_month: number;
  delivery_limit: number | null;
  city?: string;
  total_delivery_earnings?: number;
}

export interface PaymentTransaction {
  id: string;
  provider: string;
  amount_tnd: number;
  status: string;
  payment_url: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface PharmacyAdminRow {
  id: string;
  pharmacy_id: string;
  pharmacy_name: string;
  city: string | null;
  plan: string;
  price_tnd: number;
  is_active: boolean;
  delivery_count_this_month: number;
  delivery_limit: number | null;
  total_delivery_earnings: number;
  started_at: string;
  expires_at: string;
}
