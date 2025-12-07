export type RoleCode = 'owner' | 'admin' | 'campo' | 'empaque' | 'finanzas';
export type MembershipStatus = 'active' | 'pending' | 'inactive';

export interface TenantRow {
  id: string;
  name: string;
  slug: string;
  plan: string;
  contact_name: string;
  contact_email: string;
  created_by: string;
  max_users: number;
  max_fields: number;
  current_users: number;
  current_fields: number;
  created_at: string;
  updated_at: string;
}

export interface TenantMembershipRow {
  id: string;
  tenant_id: string;
  user_id: string;
  role_code: RoleCode;
  status: MembershipStatus;
  invited_by: string | null;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
  tenants?: TenantRow;
}

export interface TenantModuleRow {
  id: string;
  tenant_id: string;
  module_code: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfileRow {
  user_id: string;
  full_name: string;
  phone: string | null;
  default_tenant_id: string | null;
  created_at: string;
  updated_at: string;
}

// Convenience aliases
export type Tenant = TenantRow;
export type TenantMembership = TenantMembershipRow;
export type TenantModule = TenantModuleRow;
export type Profile = ProfileRow;

export interface TenantLimits {
  users: { max: number; current: number; available: number };
  fields: { max: number; current: number; available: number };
  plan: string;
}

export interface TenantWithMembership extends TenantRow {
  membership?: TenantMembershipRow;
}
