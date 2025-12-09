// Farm row from database
export interface FarmRow {
  id: string;
  tenant_id: string;
  name: string;
  location: string | null;
  area_ha: number | null;
  default_crop: string | null;
  notes: string | null;
  created_at: string;
  created_by: string;
}

// Lot status codes
export type LotStatusCode = 'activo' | 'inactivo' | 'preparacion';

// Lot row from database
export interface LotRow {
  id: string;
  tenant_id: string;
  farm_id: string;
  code: string;
  crop: string;
  variety: string | null;
  area_ha: number | null;
  plant_date: string | null;
  status: LotStatusCode;
  created_at: string;
}

// Lot status configuration
export interface LotStatusRow {
  code: LotStatusCode;
  name: string;
}

// Task status codes
export type TaskStatusCode = 'pendiente' | 'en_curso' | 'completada';

// Task type codes
export type TaskTypeCode =
  | 'riego'
  | 'fertilizacion'
  | 'poda'
  | 'control_plagas'
  | 'cosecha'
  | 'otro';

// Task row from database
export interface TaskRow {
  id: string;
  tenant_id: string;
  farm_id: string | null;
  lot_id: string;
  title: string;
  description: string | null;
  type_code: TaskTypeCode;
  status_code: TaskStatusCode;
  scheduled_date: string | null;
  responsible_membership_id: string | null;
  worker_id: string | null;
  created_by: string;
  created_at: string;
}

// Task status configuration
export interface TaskStatusRow {
  code: TaskStatusCode;
  name: string;
}

// Task type configuration
export interface TaskTypeRow {
  code: TaskTypeCode;
  name: string;
}
