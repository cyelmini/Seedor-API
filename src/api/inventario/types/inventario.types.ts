// Inventory Item
export interface InventoryItemRow {
  id: string;
  tenant_id: string;
  name: string;
  category_id: string;
  location_id: string;
  unit: string;
  min_stock: number;
  current_stock: number;
  created_at?: string;
}

// Inventory Category
export interface InventoryCategoryRow {
  id: string;
  tenant_id: string;
  name: string;
}

// Inventory Location
export interface InventoryLocationRow {
  id: string;
  tenant_id: string;
  name: string;
}

// Movement Type
export type MovementTypeCode = 'IN' | 'OUT';

export interface InventoryMovementTypeRow {
  code: MovementTypeCode;
  name: string;
}

// Inventory Movement
export interface InventoryMovementRow {
  id: string;
  tenant_id: string;
  item_id: string;
  date: string;
  type: MovementTypeCode;
  quantity: number;
  unit_cost: number | null;
  reason: string;
  ref_module: string | null;
  ref_id: string | null;
  created_by: string | null;
  created_at: string;
}

// Inventory Item with joins
export interface InventoryItemWithDetails extends InventoryItemRow {
  category_name?: string;
  location_name?: string;
}

// Inventory Movement with joins
export interface InventoryMovementWithDetails extends InventoryMovementRow {
  item_name?: string;
}

// Inventory Summary
export interface InventorySummary {
  totalItems: number;
  lowStockItems: number;
  lastMovementDate?: string;
}
