// Area/Module codes for workers
export type AreaModule = 'admin' | 'campo' | 'empaque' | 'finanzas';

// Worker status
export type WorkerStatus = 'active' | 'inactive';

// Worker row from database
export interface WorkerRow {
  id: string;
  tenant_id: string;
  full_name: string;
  document_id: string;
  email: string;
  phone: string | null;
  area_module: AreaModule;
  membership_id: string | null;
  status: WorkerStatus;
  created_at: string;
  updated_at: string;
}

// Attendance status codes (matching existing DB codes)
export type AttendanceStatusCode =
  | 'PRE'
  | 'AUS'
  | 'TAR'
  | 'LIC'
  | 'VAC';

// Attendance record from database
export interface AttendanceRecordRow {
  id: string;
  tenant_id: string;
  worker_id: string;
  date: string;
  status: AttendanceStatusCode;
  reason: string | null;
  created_at: string;
  updated_at: string;
}

// Attendance status configuration
export interface AttendanceStatusRow {
  code: AttendanceStatusCode;
  name: string;
}
