export type RoleCode = 'owner' | 'admin' | 'campo' | 'empaque' | 'finanzas';
export type MembershipStatus = 'active' | 'pending' | 'inactive';

// Table row types
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

export interface ProfileRow {
  user_id: string;
  full_name: string;
  phone: string | null;
  default_tenant_id: string | null;
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

export interface InvitationRow {
  id: string;
  tenant_id: string;
  email: string;
  role_code: RoleCode;
  token_hash: string;
  invited_by: string;
  expires_at: string;
  accepted_at: string | null;
  revoked_at: string | null;
  created_at: string;
  tenants?: { name: string };
  roles?: { name: string };
}

export interface AuditLogRow {
  id: string;
  tenant_id: string;
  actor_user_id: string;
  action: string;
  entity: string;
  entity_id: string;
  details: Record<string, unknown>;
  created_at: string;
}

// Insert types (omit auto-generated fields)
export type TenantInsert = Omit<TenantRow, 'id' | 'created_at' | 'updated_at'>;
export type ProfileInsert = Omit<ProfileRow, 'created_at' | 'updated_at'>;
export type TenantMembershipInsert = Omit<TenantMembershipRow, 'id' | 'created_at' | 'updated_at' | 'tenants'>;
export type InvitationInsert = Omit<InvitationRow, 'id' | 'created_at' | 'tenants' | 'roles'>;
export type AuditLogInsert = Omit<AuditLogRow, 'id' | 'created_at'>;

// Update types
export type TenantUpdate = Partial<TenantInsert>;
export type ProfileUpdate = Partial<ProfileInsert>;
export type TenantMembershipUpdate = Partial<TenantMembershipInsert>;
export type InvitationUpdate = Partial<InvitationInsert>;

// Convenience aliases
export type Tenant = TenantRow;
export type Profile = ProfileRow;
export type TenantMembership = TenantMembershipRow;
export type Invitation = InvitationRow;

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  tenantId: string | null;
  rol: RoleCode | null;
  tenant: Tenant | null;
  profile: Profile | null;
  memberships: TenantMembership[];
}

export interface TenantLimits {
  users: { max: number; current: number; available: number };
  fields: { max: number; current: number; available: number };
  plan: string;
}
