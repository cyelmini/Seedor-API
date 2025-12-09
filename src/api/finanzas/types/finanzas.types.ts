// Types for Finanzas module

export interface CashMovementRow {
  id: string;
  tenant_id: string;
  date: string;
  kind: 'ingreso' | 'egreso';
  amount: number;
  notes?: string;
  category_id?: string;
  receipt?: string;
  created_by?: string;
  created_at?: string;
  // Joined fields
  category_name?: string;
}

export interface FinanceCategoryRow {
  id: string;
  tenant_id: string;
  name: string;
  kind: 'ingreso' | 'egreso';
  created_at?: string;
}

export interface FinanceKindRow {
  code: 'ingreso' | 'egreso';
  name: string;
}

export interface FinanceSummary {
  totalIngresos: number;
  totalEgresos: number;
  balance: number;
  movementsCount: number;
  ingresoCount: number;
  egresoCount: number;
  categorySummary: CategorySummaryItem[];
}

export interface CategorySummaryItem {
  categoryId: string;
  categoryName: string;
  kind: 'ingreso' | 'egreso';
  total: number;
  count: number;
}

export interface PeriodBalance {
  startDate: string;
  endDate: string;
  openingBalance: number;
  totalIngresos: number;
  totalEgresos: number;
  closingBalance: number;
  movements: CashMovementRow[];
}
