import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { WorkerRow, AttendanceRecordRow, AttendanceStatusRow } from './types';
import {
  CreateWorkerDto,
  UpdateWorkerDto,
  CreateAttendanceDto,
  UpdateAttendanceDto,
} from './dto';

@Injectable()
export class WorkersService {
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

  // ==================== WORKERS CRUD ====================

  async getWorkersByTenant(
    tenantId: string,
    includeInactive = false,
  ): Promise<WorkerRow[]> {
    let query = this.supabaseAdmin
      .from('workers')
      .select('*')
      .eq('tenant_id', tenantId);

    if (!includeInactive) {
      query = query.eq('status', 'active');
    }

    const { data, error } = await query.order('full_name', { ascending: true });

    if (error) {
      throw new BadRequestException(
        `Error al obtener trabajadores: ${error.message}`,
      );
    }

    return data || [];
  }

  async getWorkerById(workerId: string): Promise<WorkerRow | null> {
    const { data, error } = await this.supabaseAdmin
      .from('workers')
      .select('*')
      .eq('id', workerId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new BadRequestException(
        `Error al obtener trabajador: ${error.message}`,
      );
    }

    return data;
  }

  async createWorker(
    tenantId: string,
    dto: CreateWorkerDto,
  ): Promise<WorkerRow> {
    const { data, error } = await this.supabaseAdmin
      .from('workers')
      .insert({
        tenant_id: tenantId,
        full_name: dto.fullName,
        document_id: dto.documentId,
        email: dto.email,
        phone: dto.phone || null,
        area_module: dto.areaModule,
        membership_id: dto.membershipId || null,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(
        `Error al crear trabajador: ${error.message}`,
      );
    }

    return data;
  }

  async updateWorker(
    workerId: string,
    dto: UpdateWorkerDto,
  ): Promise<WorkerRow> {
    const updateData: Record<string, any> = {};

    if (dto.fullName !== undefined) updateData.full_name = dto.fullName;
    if (dto.documentId !== undefined) updateData.document_id = dto.documentId;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.areaModule !== undefined) updateData.area_module = dto.areaModule;
    if (dto.membershipId !== undefined)
      updateData.membership_id = dto.membershipId;
    if (dto.status !== undefined) updateData.status = dto.status;

    const { data, error } = await this.supabaseAdmin
      .from('workers')
      .update(updateData)
      .eq('id', workerId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(
        `Error al actualizar trabajador: ${error.message}`,
      );
    }

    return data;
  }

  async softDeleteWorker(workerId: string): Promise<void> {
    const { error } = await this.supabaseAdmin
      .from('workers')
      .update({ status: 'inactive' })
      .eq('id', workerId);

    if (error) {
      throw new BadRequestException(
        `Error al desactivar trabajador: ${error.message}`,
      );
    }
  }

  async hardDeleteWorker(workerId: string): Promise<void> {
    // 1. Delete attendance records
    const { error: attendanceError } = await this.supabaseAdmin
      .from('attendance_records')
      .delete()
      .eq('worker_id', workerId);

    if (attendanceError) {
      throw new BadRequestException(
        `Error al eliminar registros de asistencia: ${attendanceError.message}`,
      );
    }

    // 2. Delete tasks assigned to worker
    const { error: tasksError } = await this.supabaseAdmin
      .from('tasks')
      .delete()
      .eq('worker_id', workerId);

    if (tasksError) {
      throw new BadRequestException(
        `Error al eliminar tareas: ${tasksError.message}`,
      );
    }

    // 3. Delete worker
    const { error: workerError } = await this.supabaseAdmin
      .from('workers')
      .delete()
      .eq('id', workerId);

    if (workerError) {
      throw new BadRequestException(
        `Error al eliminar trabajador: ${workerError.message}`,
      );
    }
  }

  async searchWorkers(
    tenantId: string,
    query: string,
    includeInactive = false,
  ): Promise<WorkerRow[]> {
    let dbQuery = this.supabaseAdmin
      .from('workers')
      .select('*')
      .eq('tenant_id', tenantId)
      .or(
        `full_name.ilike.%${query}%,email.ilike.%${query}%,document_id.ilike.%${query}%`,
      );

    if (!includeInactive) {
      dbQuery = dbQuery.eq('status', 'active');
    }

    const { data, error } = await dbQuery.order('full_name', {
      ascending: true,
    });

    if (error) {
      throw new BadRequestException(
        `Error al buscar trabajadores: ${error.message}`,
      );
    }

    return data || [];
  }

  async getWorkersByArea(
    tenantId: string,
    areaModule: string,
    includeInactive = false,
  ): Promise<WorkerRow[]> {
    let query = this.supabaseAdmin
      .from('workers')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('area_module', areaModule);

    if (!includeInactive) {
      query = query.eq('status', 'active');
    }

    const { data, error } = await query.order('full_name', { ascending: true });

    if (error) {
      throw new BadRequestException(
        `Error al obtener trabajadores por área: ${error.message}`,
      );
    }

    return data || [];
  }

  // ==================== ATTENDANCE ====================

  async getAttendanceByTenant(
    tenantId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<AttendanceRecordRow[]> {
    let query = this.supabaseAdmin
      .from('attendance_records')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('date', { ascending: false });

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw new BadRequestException(
        `Error al obtener asistencias: ${error.message}`,
      );
    }

    return data || [];
  }

  async getAttendanceByWorker(
    workerId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<AttendanceRecordRow[]> {
    let query = this.supabaseAdmin
      .from('attendance_records')
      .select('*')
      .eq('worker_id', workerId)
      .order('date', { ascending: false });

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw new BadRequestException(
        `Error al obtener asistencias del trabajador: ${error.message}`,
      );
    }

    return data || [];
  }

  async getAttendanceByDate(
    tenantId: string,
    date: string,
  ): Promise<AttendanceRecordRow[]> {
    const { data, error } = await this.supabaseAdmin
      .from('attendance_records')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('date', date);

    if (error) {
      throw new BadRequestException(
        `Error al obtener asistencias por fecha: ${error.message}`,
      );
    }

    return data || [];
  }

  async createAttendance(
    tenantId: string,
    dto: CreateAttendanceDto,
  ): Promise<AttendanceRecordRow> {
    const { data, error } = await this.supabaseAdmin
      .from('attendance_records')
      .insert({
        tenant_id: tenantId,
        worker_id: dto.workerId,
        date: dto.date,
        status: dto.status,
        reason: dto.reason || null,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(
        `Error al crear registro de asistencia: ${error.message}`,
      );
    }

    return data;
  }

  async updateAttendance(
    attendanceId: string,
    dto: UpdateAttendanceDto,
  ): Promise<AttendanceRecordRow> {
    const updateData: Record<string, any> = {};

    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.reason !== undefined) updateData.reason = dto.reason;

    const { data, error } = await this.supabaseAdmin
      .from('attendance_records')
      .update(updateData)
      .eq('id', attendanceId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(
        `Error al actualizar asistencia: ${error.message}`,
      );
    }

    return data;
  }

  async deleteAttendance(attendanceId: string): Promise<void> {
    const { error } = await this.supabaseAdmin
      .from('attendance_records')
      .delete()
      .eq('id', attendanceId);

    if (error) {
      throw new BadRequestException(
        `Error al eliminar asistencia: ${error.message}`,
      );
    }
  }

  async bulkCreateAttendance(
    tenantId: string,
    attendances: CreateAttendanceDto[],
  ): Promise<AttendanceRecordRow[]> {
    const recordsToInsert = attendances.map((att) => ({
      tenant_id: tenantId,
      worker_id: att.workerId,
      date: att.date,
      status: att.status,
      reason: att.reason || null,
    }));

    const { data, error } = await this.supabaseAdmin
      .from('attendance_records')
      .insert(recordsToInsert)
      .select();

    if (error) {
      throw new BadRequestException(
        `Error al crear registros de asistencia en bulk: ${error.message}`,
      );
    }

    return data || [];
  }

  async getAttendanceStatuses(): Promise<AttendanceStatusRow[]> {
    const { data, error } = await this.supabaseAdmin
      .from('attendance_statuses')
      .select('*')
      .order('code');

    if (error) {
      throw new BadRequestException(
        `Error al obtener estados de asistencia: ${error.message}`,
      );
    }

    return data || [];
  }

  // ==================== STATS ====================

  async getWorkerStats(tenantId: string): Promise<{
    total: number;
    active: number;
    inactive: number;
    byArea: Record<string, number>;
  }> {
    const { data, error } = await this.supabaseAdmin
      .from('workers')
      .select('status, area_module')
      .eq('tenant_id', tenantId);

    if (error) {
      throw new BadRequestException(
        `Error al obtener estadísticas: ${error.message}`,
      );
    }

    const workers = data || [];
    const stats = {
      total: workers.length,
      active: workers.filter((w) => w.status === 'active').length,
      inactive: workers.filter((w) => w.status === 'inactive').length,
      byArea: {} as Record<string, number>,
    };

    workers.forEach((w) => {
      if (w.status === 'active') {
        stats.byArea[w.area_module] = (stats.byArea[w.area_module] || 0) + 1;
      }
    });

    return stats;
  }
}
