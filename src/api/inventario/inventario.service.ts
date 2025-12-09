import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateItemDto, UpdateItemDto } from './dto/item.dto';
import { CreateCategoryDto } from './dto/category.dto';
import { CreateLocationDto } from './dto/location.dto';
import { CreateMovementDto } from './dto/movement.dto';
import {
  InventoryItemRow,
  InventoryItemWithDetails,
  InventoryCategoryRow,
  InventoryLocationRow,
  InventoryMovementRow,
  InventoryMovementWithDetails,
  InventoryMovementTypeRow,
  InventorySummary,
} from './types/inventario.types';

@Injectable()
export class InventarioService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseServiceKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration is missing');
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  // ==================== ITEMS ====================

  async getItemsByTenant(
    tenantId: string,
    options?: {
      search?: string;
      categoryId?: string;
      locationId?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<InventoryItemWithDetails[]> {
    let query = this.supabase
      .from('inventory_items')
      .select(
        `
        *,
        inventory_categories!inner(name),
        inventory_locations!inner(name)
      `,
      )
      .eq('tenant_id', tenantId)
      .order('name', { ascending: true });

    if (options?.search) {
      query = query.ilike('name', `%${options.search}%`);
    }

    if (options?.categoryId) {
      query = query.eq('category_id', options.categoryId);
    }

    if (options?.locationId) {
      query = query.eq('location_id', options.locationId);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(
        options.offset,
        options.offset + (options.limit || 100) - 1,
      );
    }

    const { data, error } = await query;

    if (error) {
      throw new BadRequestException(`Error fetching items: ${error.message}`);
    }

    // Transform the joined data
    return (data || []).map((item) => ({
      id: item.id,
      tenant_id: item.tenant_id,
      name: item.name,
      category_id: item.category_id,
      location_id: item.location_id,
      unit: item.unit,
      min_stock: item.min_stock,
      current_stock: item.current_stock,
      created_at: item.created_at,
      category_name: item.inventory_categories?.name,
      location_name: item.inventory_locations?.name,
    }));
  }

  async getItemById(id: string): Promise<InventoryItemWithDetails | null> {
    const { data, error } = await this.supabase
      .from('inventory_items')
      .select(
        `
        *,
        inventory_categories!inner(name),
        inventory_locations!inner(name)
      `,
      )
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new BadRequestException(`Error fetching item: ${error.message}`);
    }

    return {
      id: data.id,
      tenant_id: data.tenant_id,
      name: data.name,
      category_id: data.category_id,
      location_id: data.location_id,
      unit: data.unit,
      min_stock: data.min_stock,
      current_stock: data.current_stock,
      created_at: data.created_at,
      category_name: data.inventory_categories?.name,
      location_name: data.inventory_locations?.name,
    };
  }

  async createItem(
    tenantId: string,
    dto: CreateItemDto,
  ): Promise<InventoryItemRow> {
    const { data, error } = await this.supabase
      .from('inventory_items')
      .insert({
        tenant_id: tenantId,
        name: dto.name,
        category_id: dto.categoryId,
        location_id: dto.locationId,
        unit: dto.unit,
        min_stock: dto.minStock,
        current_stock: dto.currentStock ?? 0,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Error creating item: ${error.message}`);
    }

    return data;
  }

  async updateItem(id: string, dto: UpdateItemDto): Promise<InventoryItemRow> {
    const updateData: Record<string, unknown> = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.categoryId !== undefined) updateData.category_id = dto.categoryId;
    if (dto.locationId !== undefined) updateData.location_id = dto.locationId;
    if (dto.unit !== undefined) updateData.unit = dto.unit;
    if (dto.minStock !== undefined) updateData.min_stock = dto.minStock;

    const { data, error } = await this.supabase
      .from('inventory_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Error updating item: ${error.message}`);
    }

    return data;
  }

  async deleteItem(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);

    if (error) {
      throw new BadRequestException(`Error deleting item: ${error.message}`);
    }
  }

  // ==================== CATEGORIES ====================

  async getCategoriesByTenant(
    tenantId: string,
  ): Promise<InventoryCategoryRow[]> {
    const { data, error } = await this.supabase
      .from('inventory_categories')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('name', { ascending: true });

    if (error) {
      throw new BadRequestException(
        `Error fetching categories: ${error.message}`,
      );
    }

    return data || [];
  }

  async createCategory(
    tenantId: string,
    dto: CreateCategoryDto,
  ): Promise<InventoryCategoryRow> {
    const { data, error } = await this.supabase
      .from('inventory_categories')
      .insert({
        tenant_id: tenantId,
        name: dto.name,
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

  async deleteCategory(id: string): Promise<void> {
    // Check if category has items
    const { data: items } = await this.supabase
      .from('inventory_items')
      .select('id')
      .eq('category_id', id)
      .limit(1);

    if (items && items.length > 0) {
      throw new BadRequestException(
        'No se puede eliminar la categoría porque tiene items asociados',
      );
    }

    const { error } = await this.supabase
      .from('inventory_categories')
      .delete()
      .eq('id', id);

    if (error) {
      throw new BadRequestException(
        `Error deleting category: ${error.message}`,
      );
    }
  }

  // ==================== LOCATIONS ====================

  async getLocationsByTenant(
    tenantId: string,
  ): Promise<InventoryLocationRow[]> {
    const { data, error } = await this.supabase
      .from('inventory_locations')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('name', { ascending: true });

    if (error) {
      throw new BadRequestException(
        `Error fetching locations: ${error.message}`,
      );
    }

    return data || [];
  }

  async createLocation(
    tenantId: string,
    dto: CreateLocationDto,
  ): Promise<InventoryLocationRow> {
    const { data, error } = await this.supabase
      .from('inventory_locations')
      .insert({
        tenant_id: tenantId,
        name: dto.name,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(
        `Error creating location: ${error.message}`,
      );
    }

    return data;
  }

  async deleteLocation(id: string): Promise<void> {
    // Check if location has items
    const { data: items } = await this.supabase
      .from('inventory_items')
      .select('id')
      .eq('location_id', id)
      .limit(1);

    if (items && items.length > 0) {
      throw new BadRequestException(
        'No se puede eliminar la ubicación porque tiene items asociados',
      );
    }

    const { error } = await this.supabase
      .from('inventory_locations')
      .delete()
      .eq('id', id);

    if (error) {
      throw new BadRequestException(
        `Error deleting location: ${error.message}`,
      );
    }
  }

  // ==================== MOVEMENTS ====================

  async getMovementTypes(): Promise<InventoryMovementTypeRow[]> {
    const { data, error } = await this.supabase
      .from('inventory_movement_types')
      .select('*');

    if (error) {
      throw new BadRequestException(
        `Error fetching movement types: ${error.message}`,
      );
    }

    return data || [];
  }

  async getMovementsByTenant(
    tenantId: string,
    options?: {
      itemId?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<InventoryMovementWithDetails[]> {
    let query = this.supabase
      .from('inventory_movements')
      .select(
        `
        *,
        inventory_items!inner(name)
      `,
      )
      .eq('tenant_id', tenantId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (options?.itemId) {
      query = query.eq('item_id', options.itemId);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(
        options.offset,
        options.offset + (options.limit || 100) - 1,
      );
    }

    const { data, error } = await query;

    if (error) {
      throw new BadRequestException(
        `Error fetching movements: ${error.message}`,
      );
    }

    return (data || []).map((movement) => ({
      id: movement.id,
      tenant_id: movement.tenant_id,
      item_id: movement.item_id,
      date: movement.date,
      type: movement.type,
      quantity: movement.quantity,
      unit_cost: movement.unit_cost,
      reason: movement.reason,
      ref_module: movement.ref_module,
      ref_id: movement.ref_id,
      created_by: movement.created_by,
      created_at: movement.created_at,
      item_name: movement.inventory_items?.name,
    }));
  }

  async createMovement(
    tenantId: string,
    dto: CreateMovementDto,
  ): Promise<InventoryMovementRow> {
    // Get current item stock
    const { data: item, error: itemError } = await this.supabase
      .from('inventory_items')
      .select('current_stock')
      .eq('id', dto.itemId)
      .single();

    if (itemError || !item) {
      throw new BadRequestException('Item no encontrado');
    }

    const currentStock = item.current_stock;
    let newStock: number;

    if (dto.type === 'IN') {
      newStock = currentStock + dto.quantity;
    } else {
      // OUT
      if (currentStock < dto.quantity) {
        throw new BadRequestException(
          `Stock insuficiente. Stock actual: ${currentStock}, Cantidad solicitada: ${dto.quantity}`,
        );
      }
      newStock = currentStock - dto.quantity;
    }

    // Insert the movement
    const { data: movement, error: movementError } = await this.supabase
      .from('inventory_movements')
      .insert({
        tenant_id: tenantId,
        item_id: dto.itemId,
        date: dto.date,
        type: dto.type,
        quantity: dto.quantity,
        unit_cost: dto.unitCost ?? null,
        reason: dto.reason,
        ref_module: dto.refModule ?? null,
        ref_id: dto.refId ?? null,
        created_by: dto.createdBy ?? null,
      })
      .select()
      .single();

    if (movementError) {
      throw new BadRequestException(
        `Error creating movement: ${movementError.message}`,
      );
    }

    // Update the item stock
    const { error: updateError } = await this.supabase
      .from('inventory_items')
      .update({ current_stock: newStock })
      .eq('id', dto.itemId);

    if (updateError) {
      // Rollback: delete the movement
      await this.supabase
        .from('inventory_movements')
        .delete()
        .eq('id', movement.id);
      throw new BadRequestException(
        `Error updating stock: ${updateError.message}`,
      );
    }

    return movement;
  }

  async deleteMovement(movementId: string): Promise<void> {
    // Get the movement with item's current stock
    const { data: movement, error: fetchError } = await this.supabase
      .from('inventory_movements')
      .select(
        `
        *,
        inventory_items!inner(current_stock)
      `,
      )
      .eq('id', movementId)
      .single();

    if (fetchError || !movement) {
      throw new BadRequestException('Movimiento no encontrado');
    }

    const currentStock = movement.inventory_items.current_stock;
    let newStock: number;

    // Reverse the movement
    if (movement.type === 'IN') {
      // Was an entry, so subtract
      newStock = currentStock - movement.quantity;
      if (newStock < 0) {
        throw new BadRequestException(
          'No se puede eliminar este movimiento porque dejaría el stock en negativo',
        );
      }
    } else {
      // Was an exit, so add back
      newStock = currentStock + movement.quantity;
    }

    // Update the stock
    const { error: updateError } = await this.supabase
      .from('inventory_items')
      .update({ current_stock: newStock })
      .eq('id', movement.item_id);

    if (updateError) {
      throw new BadRequestException(
        `Error updating stock: ${updateError.message}`,
      );
    }

    // Delete the movement
    const { error: deleteError } = await this.supabase
      .from('inventory_movements')
      .delete()
      .eq('id', movementId);

    if (deleteError) {
      // Rollback: restore stock
      await this.supabase
        .from('inventory_items')
        .update({ current_stock: currentStock })
        .eq('id', movement.item_id);
      throw new BadRequestException(
        `Error deleting movement: ${deleteError.message}`,
      );
    }
  }

  // ==================== SUMMARY ====================

  async getInventorySummary(tenantId: string): Promise<InventorySummary> {
    // Get total items
    const { count: totalItems } = await this.supabase
      .from('inventory_items')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId);

    // Get low stock items (where current_stock <= min_stock)
    const { data: lowStockData } = await this.supabase
      .from('inventory_items')
      .select('id, current_stock, min_stock')
      .eq('tenant_id', tenantId);

    const lowStockItems = (lowStockData || []).filter(
      (item) => item.current_stock <= item.min_stock,
    ).length;

    // Get last movement date
    const { data: lastMovement } = await this.supabase
      .from('inventory_movements')
      .select('date')
      .eq('tenant_id', tenantId)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    return {
      totalItems: totalItems ?? 0,
      lowStockItems,
      lastMovementDate: lastMovement?.date,
    };
  }
}
