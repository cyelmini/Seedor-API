// ==================== INGRESO FRUTA ====================
export interface IngresoFrutaRow {
  id: string;
  tenant_id: string;
  fecha: string;
  estado_liquidacion: boolean;
  num_ticket: number | null;
  num_remito: number | null;
  productor: string;
  finca: string | null;
  producto: string;
  lote: number | null;
  contratista: string | null;
  tipo_cosecha: string | null;
  cant_bin: number;
  tipo_bin: string;
  peso_neto: number;
  transporte: string | null;
  chofer: string | null;
  chasis: string | null;
  acoplado: string | null;
  operario: string | null;
  created_at: string;
}

// ==================== PREPROCESO (PRESELECCION) ====================
export interface PreprocesoRow {
  id: string;
  tenant_id: string;
  semana: number;
  fecha: string;
  duracion: number;
  bin_volcados: number;
  ritmo_maquina: number;
  duracion_proceso: number;
  bin_pleno: number;
  bin_intermedio_I: number;
  bin_intermedio_II: number;
  bin_incipiente: number;
  cant_personal: number;
  created_at: string;
}

// ==================== PALLETS ====================
export type PalletEstado =
  | 'armado'
  | 'en_camara'
  | 'listo_despacho'
  | 'despachado';

export interface PalletRow {
  id: string;
  tenant_id: string;
  semana: number | null;
  fecha: string | null;
  num_pallet: string | null;
  producto: string | null;
  productor: string | null;
  categoria: string | null;
  cod_envase: string | null;
  destino: string | null;
  kilos: number | null;
  cant_cajas: number | null;
  peso: number | null;
  estado: PalletEstado | null;
  ubicacion: string | null;
  temperatura: number | null;
  vencimiento: string | null;
  lote_origen: string | null;
  created_at: string;
}

// ==================== DESPACHO ====================
export interface DespachoRow {
  id: string;
  tenant_id: string;
  fecha: string;
  num_remito: string | null;
  cliente: string | null;
  DTV: string | null;
  codigo_cierre: string | null;
  termografo: string | null;
  DTC: string | null;
  destino: string | null;
  transporte: string | null;
  total_pallets: number | null;
  total_cajas: number | null;
  cuit: string | null;
  chasis: string | null;
  acoplado: string | null;
  chofer: string | null;
  dni: string | null;
  celular: string | null;
  operario: string | null;
  created_at: string;
}

// ==================== EGRESO FRUTA ====================
export interface EgresoFrutaRow {
  id: string;
  tenant_id: string;
  fecha: string;
  num_remito: string | null;
  cliente: string | null;
  finca: string | null;
  producto: string | null;
  DTV: string | null;
  tara: number | null;
  peso_neto: number | null;
  transporte: string | null;
  chasis: string | null;
  acoplado: string | null;
  chofer: string | null;
  created_at: string;
}
