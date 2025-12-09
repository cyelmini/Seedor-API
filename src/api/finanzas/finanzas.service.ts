import { Injectable, BadRequestException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import {
  CashMovementRow,
  FinanceCategoryRow,
  FinanceKindRow,
  FinanceSummary,
  CategorySummaryItem,
  PeriodBalance,
} from './types/finanzas.types';
import { CreateMovementDto, UpdateMovementDto } from './dto/movement.dto';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class FinanzasService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL')!,
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')!,
    );
  }

  // ==================== MOVEMENTS ====================

  async getMovements(
    tenantId: string,
    options?: {
      kind?: 'ingreso' | 'egreso';
      categoryId?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<CashMovementRow[]> {
    let query = this.supabase
      .from('cash_movements')
      .select(
        `
        *,
        finance_categories (
          name
        )
      `,
      )
      .eq('tenant_id', tenantId)
      .order('date', { ascending: false });

    if (options?.kind) {
      query = query.eq('kind', options.kind);
    }

    if (options?.categoryId) {
      query = query.eq('category_id', options.categoryId);
    }

    if (options?.startDate) {
      query = query.gte('date', options.startDate);
    }

    if (options?.endDate) {
      query = query.lte('date', options.endDate);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(
        options.offset,
        options.offset + (options.limit || 50) - 1,
      );
    }

    const { data, error } = await query;

    if (error) {
      throw new BadRequestException(
        `Error fetching movements: ${error.message}`,
      );
    }

    return (data || []).map((row) => ({
      ...row,
      category_name: row.finance_categories?.name || null,
    }));
  }

  async getMovementById(id: string): Promise<CashMovementRow | null> {
    const { data, error } = await this.supabase
      .from('cash_movements')
      .select(
        `
        *,
        finance_categories (
          name
        )
      `,
      )
      .eq('id', id)
      .single();

    if (error) {
      return null;
    }

    return {
      ...data,
      category_name: data.finance_categories?.name || null,
    };
  }

  async createMovement(
    tenantId: string,
    dto: CreateMovementDto,
  ): Promise<CashMovementRow> {
    let categoryId = dto.categoryId;

    // Si se proporciona categoryName pero no categoryId, buscar o crear la categoría
    if (!categoryId && dto.categoryName) {
      const existingCategory = await this.findCategoryByName(
        tenantId,
        dto.categoryName,
        dto.kind,
      );

      if (existingCategory) {
        categoryId = existingCategory.id;
      } else {
        const newCategory = await this.createCategory(tenantId, {
          name: dto.categoryName,
          kind: dto.kind,
        });
        categoryId = newCategory.id;
      }
    }

    const { data, error } = await this.supabase
      .from('cash_movements')
      .insert({
        tenant_id: tenantId,
        date: dto.date,
        kind: dto.kind,
        amount: dto.amount,
        notes: dto.notes,
        category_id: categoryId,
        receipt: dto.receipt,
        created_by: dto.createdBy,
      })
      .select(
        `
        *,
        finance_categories (
          name
        )
      `,
      )
      .single();

    if (error) {
      throw new BadRequestException(
        `Error creating movement: ${error.message}`,
      );
    }

    return {
      ...data,
      category_name: data.finance_categories?.name || null,
    };
  }

  async updateMovement(
    id: string,
    dto: UpdateMovementDto,
  ): Promise<CashMovementRow> {
    const updateData: Record<string, unknown> = {};

    if (dto.date !== undefined) updateData.date = dto.date;
    if (dto.kind !== undefined) updateData.kind = dto.kind;
    if (dto.amount !== undefined) updateData.amount = dto.amount;
    if (dto.notes !== undefined) updateData.notes = dto.notes;
    if (dto.categoryId !== undefined) updateData.category_id = dto.categoryId;
    if (dto.receipt !== undefined) updateData.receipt = dto.receipt;

    const { data, error } = await this.supabase
      .from('cash_movements')
      .update(updateData)
      .eq('id', id)
      .select(
        `
        *,
        finance_categories (
          name
        )
      `,
      )
      .single();

    if (error) {
      throw new BadRequestException(
        `Error updating movement: ${error.message}`,
      );
    }

    return {
      ...data,
      category_name: data.finance_categories?.name || null,
    };
  }

  async deleteMovement(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('cash_movements')
      .delete()
      .eq('id', id);

    if (error) {
      throw new BadRequestException(
        `Error deleting movement: ${error.message}`,
      );
    }
  }

  // ==================== CATEGORIES ====================

  async getCategories(
    tenantId: string,
    kind?: 'ingreso' | 'egreso',
  ): Promise<FinanceCategoryRow[]> {
    let query = this.supabase
      .from('finance_categories')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('name', { ascending: true });

    if (kind) {
      query = query.eq('kind', kind);
    }

    const { data, error } = await query;

    if (error) {
      throw new BadRequestException(
        `Error fetching categories: ${error.message}`,
      );
    }

    return data || [];
  }

  async findCategoryByName(
    tenantId: string,
    name: string,
    kind: 'ingreso' | 'egreso',
  ): Promise<FinanceCategoryRow | null> {
    const { data, error } = await this.supabase
      .from('finance_categories')
      .select('*')
      .eq('tenant_id', tenantId)
      .ilike('name', name)
      .eq('kind', kind)
      .single();

    if (error) {
      return null;
    }

    return data;
  }

  async createCategory(
    tenantId: string,
    dto: CreateCategoryDto,
  ): Promise<FinanceCategoryRow> {
    // Verificar si ya existe una categoría con el mismo nombre y kind
    const existing = await this.findCategoryByName(
      tenantId,
      dto.name,
      dto.kind,
    );
    if (existing) {
      throw new BadRequestException(
        `Ya existe una categoría "${dto.name}" de tipo ${dto.kind}`,
      );
    }

    const { data, error } = await this.supabase
      .from('finance_categories')
      .insert({
        tenant_id: tenantId,
        name: dto.name,
        kind: dto.kind,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(
        `Error creating category: ${error.message}`,
      );
    }

    return data;
  }

  async updateCategory(
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<FinanceCategoryRow> {
    const { data, error } = await this.supabase
      .from('finance_categories')
      .update({ name: dto.name })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(
        `Error updating category: ${error.message}`,
      );
    }

    return data;
  }

  async deleteCategory(id: string): Promise<void> {
    // Verificar si hay movimientos asociados
    const { count } = await this.supabase
      .from('cash_movements')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id);

    if (count && count > 0) {
      throw new BadRequestException(
        `No se puede eliminar la categoría porque tiene ${count} movimientos asociados`,
      );
    }

    const { error } = await this.supabase
      .from('finance_categories')
      .delete()
      .eq('id', id);

    if (error) {
      throw new BadRequestException(
        `Error deleting category: ${error.message}`,
      );
    }
  }

  // ==================== FINANCE KINDS ====================

  async getFinanceKinds(): Promise<FinanceKindRow[]> {
    const { data, error } = await this.supabase
      .from('finance_kinds')
      .select('*')
      .order('code', { ascending: true });

    if (error) {
      // Si la tabla no existe, retornar los tipos por defecto
      return [
        { code: 'ingreso', name: 'Ingreso' },
        { code: 'egreso', name: 'Egreso' },
      ];
    }

    return (
      data || [
        { code: 'ingreso', name: 'Ingreso' },
        { code: 'egreso', name: 'Egreso' },
      ]
    );
  }

  // ==================== SUMMARY & REPORTS ====================

  async getSummary(
    tenantId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<FinanceSummary> {
    // Obtener todos los movimientos del período
    const movements = await this.getMovements(tenantId, {
      startDate,
      endDate,
    });

    // Calcular totales
    let totalIngresos = 0;
    let totalEgresos = 0;
    let ingresoCount = 0;
    let egresoCount = 0;

    const categorySums: Record<
      string,
      { name: string; kind: 'ingreso' | 'egreso'; total: number; count: number }
    > = {};

    for (const mov of movements) {
      if (mov.kind === 'ingreso') {
        totalIngresos += mov.amount;
        ingresoCount++;
      } else {
        totalEgresos += mov.amount;
        egresoCount++;
      }

      // Sumar por categoría
      if (mov.category_id) {
        if (!categorySums[mov.category_id]) {
          categorySums[mov.category_id] = {
            name: mov.category_name || 'Sin categoría',
            kind: mov.kind,
            total: 0,
            count: 0,
          };
        }
        categorySums[mov.category_id].total += mov.amount;
        categorySums[mov.category_id].count++;
      }
    }

    const categorySummary: CategorySummaryItem[] = Object.entries(
      categorySums,
    ).map(([categoryId, data]) => ({
      categoryId,
      categoryName: data.name,
      kind: data.kind,
      total: data.total,
      count: data.count,
    }));

    return {
      totalIngresos,
      totalEgresos,
      balance: totalIngresos - totalEgresos,
      movementsCount: movements.length,
      ingresoCount,
      egresoCount,
      categorySummary,
    };
  }

  async getPeriodBalance(
    tenantId: string,
    startDate: string,
    endDate: string,
    openingBalance: number = 0,
  ): Promise<PeriodBalance> {
    const movements = await this.getMovements(tenantId, {
      startDate,
      endDate,
    });

    let totalIngresos = 0;
    let totalEgresos = 0;

    for (const mov of movements) {
      if (mov.kind === 'ingreso') {
        totalIngresos += mov.amount;
      } else {
        totalEgresos += mov.amount;
      }
    }

    return {
      startDate,
      endDate,
      openingBalance,
      totalIngresos,
      totalEgresos,
      closingBalance: openingBalance + totalIngresos - totalEgresos,
      movements,
    };
  }
}
