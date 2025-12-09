import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  FarmRow,
  LotRow,
  LotStatusRow,
  TaskRow,
  TaskStatusRow,
  TaskTypeRow,
} from './types';
import {
  CreateFarmDto,
  UpdateFarmDto,
  CreateLotDto,
  UpdateLotDto,
  CreateTaskDto,
  UpdateTaskDto,
} from './dto';

@Injectable()
export class CampoService {
  private supabaseAdmin: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseServiceKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  }

  // ==================== FARMS CRUD ====================

  async getFarmsByTenant(tenantId: string): Promise<FarmRow[]> {
    const { data, error } = await this.supabaseAdmin
      .from('farms')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new BadRequestException(
        `Error al obtener campos: ${error.message}`,
      );
    }

    return data || [];
  }

  async getFarmById(farmId: string): Promise<FarmRow | null> {
    const { data, error } = await this.supabaseAdmin
      .from('farms')
      .select('*')
      .eq('id', farmId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new BadRequestException(`Error al obtener campo: ${error.message}`);
    }

    return data;
  }

  async createFarm(
    tenantId: string,
    userId: string,
    dto: CreateFarmDto,
  ): Promise<FarmRow> {
    const { data, error } = await this.supabaseAdmin
      .from('farms')
      .insert({
        tenant_id: tenantId,
        created_by: userId,
        name: dto.name,
        location: dto.location || null,
        area_ha: dto.areaHa ?? null,
        default_crop: dto.defaultCrop || null,
        notes: dto.notes || null,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Error al crear campo: ${error.message}`);
    }

    return data;
  }

  async updateFarm(farmId: string, dto: UpdateFarmDto): Promise<FarmRow> {
    const updateData: Record<string, unknown> = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.location !== undefined) updateData.location = dto.location;
    if (dto.areaHa !== undefined) updateData.area_ha = dto.areaHa;
    if (dto.defaultCrop !== undefined)
      updateData.default_crop = dto.defaultCrop;
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    const { data, error } = await this.supabaseAdmin
      .from('farms')
      .update(updateData)
      .eq('id', farmId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(
        `Error al actualizar campo: ${error.message}`,
      );
    }

    return data;
  }

  async deleteFarm(farmId: string): Promise<void> {
    // First delete all tasks in lots of this farm
    const { data: lots } = await this.supabaseAdmin
      .from('lots')
      .select('id')
      .eq('farm_id', farmId);

    if (lots && lots.length > 0) {
      const lotIds = lots.map((l) => l.id);

      const { error: tasksError } = await this.supabaseAdmin
        .from('tasks')
        .delete()
        .in('lot_id', lotIds);

      if (tasksError) {
        throw new BadRequestException(
          `Error al eliminar tareas: ${tasksError.message}`,
        );
      }
    }

    // Then delete all lots
    const { error: lotsError } = await this.supabaseAdmin
      .from('lots')
      .delete()
      .eq('farm_id', farmId);

    if (lotsError) {
      throw new BadRequestException(
        `Error al eliminar lotes: ${lotsError.message}`,
      );
    }

    // Finally delete the farm
    const { error } = await this.supabaseAdmin
      .from('farms')
      .delete()
      .eq('id', farmId);

    if (error) {
      throw new BadRequestException(
        `Error al eliminar campo: ${error.message}`,
      );
    }
  }

  // ==================== LOTS CRUD ====================

  async getLotsByFarm(farmId: string): Promise<LotRow[]> {
    const { data, error } = await this.supabaseAdmin
      .from('lots')
      .select('*')
      .eq('farm_id', farmId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new BadRequestException(`Error al obtener lotes: ${error.message}`);
    }

    return data || [];
  }

  async getLotById(lotId: string): Promise<LotRow | null> {
    const { data, error } = await this.supabaseAdmin
      .from('lots')
      .select('*')
      .eq('id', lotId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new BadRequestException(`Error al obtener lote: ${error.message}`);
    }

    return data;
  }

  async createLot(tenantId: string, dto: CreateLotDto): Promise<LotRow> {
    const { data, error } = await this.supabaseAdmin
      .from('lots')
      .insert({
        tenant_id: tenantId,
        farm_id: dto.farmId,
        code: dto.code,
        crop: dto.crop,
        variety: dto.variety || null,
        area_ha: dto.areaHa || null,
        plant_date: dto.plantDate || null,
        status: dto.status,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Error al crear lote: ${error.message}`);
    }

    return data;
  }

  async updateLot(lotId: string, dto: UpdateLotDto): Promise<LotRow> {
    const updateData: Record<string, unknown> = {};

    if (dto.code !== undefined) updateData.code = dto.code;
    if (dto.crop !== undefined) updateData.crop = dto.crop;
    if (dto.variety !== undefined) updateData.variety = dto.variety;
    if (dto.areaHa !== undefined) updateData.area_ha = dto.areaHa;
    if (dto.plantDate !== undefined) updateData.plant_date = dto.plantDate;
    if (dto.status !== undefined) updateData.status = dto.status;

    const { data, error } = await this.supabaseAdmin
      .from('lots')
      .update(updateData)
      .eq('id', lotId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(
        `Error al actualizar lote: ${error.message}`,
      );
    }

    return data;
  }

  async deleteLot(lotId: string): Promise<void> {
    // First delete all tasks in this lot
    const { error: tasksError } = await this.supabaseAdmin
      .from('tasks')
      .delete()
      .eq('lot_id', lotId);

    if (tasksError) {
      throw new BadRequestException(
        `Error al eliminar tareas del lote: ${tasksError.message}`,
      );
    }

    // Then delete the lot
    const { error } = await this.supabaseAdmin
      .from('lots')
      .delete()
      .eq('id', lotId);

    if (error) {
      throw new BadRequestException(`Error al eliminar lote: ${error.message}`);
    }
  }

  async getLotStatuses(): Promise<LotStatusRow[]> {
    const { data, error } = await this.supabaseAdmin
      .from('lot_statuses')
      .select('*')
      .order('code');

    if (error) {
      throw new BadRequestException(
        `Error al obtener estados de lotes: ${error.message}`,
      );
    }

    return data || [];
  }

  // ==================== TASKS CRUD ====================

  async getTasksByLot(lotId: string): Promise<TaskRow[]> {
    const { data, error } = await this.supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('lot_id', lotId)
      .order('scheduled_date', { ascending: true });

    if (error) {
      throw new BadRequestException(
        `Error al obtener tareas: ${error.message}`,
      );
    }

    return data || [];
  }

  async getTaskById(taskId: string): Promise<TaskRow | null> {
    const { data, error } = await this.supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new BadRequestException(`Error al obtener tarea: ${error.message}`);
    }

    return data;
  }

  async createTask(
    tenantId: string,
    dto: CreateTaskDto,
    userId?: string,
  ): Promise<TaskRow> {
    const { data, error } = await this.supabaseAdmin
      .from('tasks')
      .insert({
        tenant_id: tenantId,
        farm_id: dto.farmId || null,
        lot_id: dto.lotId,
        title: dto.title,
        description: dto.description || '',
        type_code: dto.typeCode || 'otro',
        status_code: dto.statusCode,
        scheduled_date: dto.scheduledDate || null,
        responsible_membership_id: dto.responsibleMembershipId || null,
        worker_id: dto.workerId || null,
        created_by: userId || tenantId,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Error al crear tarea: ${error.message}`);
    }

    return data;
  }

  async updateTask(taskId: string, dto: UpdateTaskDto): Promise<TaskRow> {
    const updateData: Record<string, unknown> = {};

    if (dto.farmId !== undefined) updateData.farm_id = dto.farmId;
    if (dto.lotId !== undefined) updateData.lot_id = dto.lotId;
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.typeCode !== undefined) updateData.type_code = dto.typeCode;
    if (dto.statusCode !== undefined) updateData.status_code = dto.statusCode;
    if (dto.scheduledDate !== undefined)
      updateData.scheduled_date = dto.scheduledDate;
    if (dto.responsibleMembershipId !== undefined)
      updateData.responsible_membership_id = dto.responsibleMembershipId;
    if (dto.workerId !== undefined) updateData.worker_id = dto.workerId;

    const { data, error } = await this.supabaseAdmin
      .from('tasks')
      .update(updateData)
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(
        `Error al actualizar tarea: ${error.message}`,
      );
    }

    return data;
  }

  async deleteTask(taskId: string): Promise<void> {
    const { error } = await this.supabaseAdmin
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      throw new BadRequestException(
        `Error al eliminar tarea: ${error.message}`,
      );
    }
  }

  async getTaskStatuses(): Promise<TaskStatusRow[]> {
    const { data, error } = await this.supabaseAdmin
      .from('task_statuses')
      .select('*')
      .order('code');

    if (error) {
      throw new BadRequestException(
        `Error al obtener estados de tareas: ${error.message}`,
      );
    }

    return data || [];
  }

  async getTaskTypes(): Promise<TaskTypeRow[]> {
    const { data, error } = await this.supabaseAdmin
      .from('task_types')
      .select('*')
      .order('code');

    if (error) {
      throw new BadRequestException(
        `Error al obtener tipos de tareas: ${error.message}`,
      );
    }

    return data || [];
  }
}
