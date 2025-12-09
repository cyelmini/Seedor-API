import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { WorkersService } from './workers.service';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import {
  CreateWorkerDto,
  UpdateWorkerDto,
  CreateAttendanceDto,
  UpdateAttendanceDto,
  BulkCreateAttendanceDto,
  GetAttendanceQueryDto,
} from './dto';

@ApiTags('Workers')
@ApiBearerAuth('bearer')
@Controller('workers')
export class WorkersController {
  constructor(private readonly workersService: WorkersService) {}

  // ==================== WORKERS CRUD ====================

  @UseGuards(SupabaseAuthGuard)
  @Get('tenant/:tenantId')
  async getWorkersByTenant(
    @Param('tenantId') tenantId: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    const workers = await this.workersService.getWorkersByTenant(
      tenantId,
      includeInactive === 'true',
    );
    return { workers };
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('tenant/:tenantId/search')
  async searchWorkers(
    @Param('tenantId') tenantId: string,
    @Query('q') query: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    const workers = await this.workersService.searchWorkers(
      tenantId,
      query || '',
      includeInactive === 'true',
    );
    return { workers };
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('tenant/:tenantId/area/:areaModule')
  async getWorkersByArea(
    @Param('tenantId') tenantId: string,
    @Param('areaModule') areaModule: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    const workers = await this.workersService.getWorkersByArea(
      tenantId,
      areaModule,
      includeInactive === 'true',
    );
    return { workers };
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('tenant/:tenantId/stats')
  async getWorkerStats(@Param('tenantId') tenantId: string) {
    const stats = await this.workersService.getWorkerStats(tenantId);
    return stats;
  }

  @UseGuards(SupabaseAuthGuard)
  @Get(':workerId')
  async getWorkerById(@Param('workerId') workerId: string) {
    const worker = await this.workersService.getWorkerById(workerId);
    return { worker };
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('tenant/:tenantId')
  async createWorker(
    @Param('tenantId') tenantId: string,
    @Body() dto: CreateWorkerDto,
  ) {
    const worker = await this.workersService.createWorker(tenantId, dto);
    return { worker };
  }

  @UseGuards(SupabaseAuthGuard)
  @Put(':workerId')
  async updateWorker(
    @Param('workerId') workerId: string,
    @Body() dto: UpdateWorkerDto,
  ) {
    const worker = await this.workersService.updateWorker(workerId, dto);
    return { worker };
  }

  @UseGuards(SupabaseAuthGuard)
  @Delete(':workerId')
  async softDeleteWorker(@Param('workerId') workerId: string) {
    await this.workersService.softDeleteWorker(workerId);
    return { success: true };
  }

  @UseGuards(SupabaseAuthGuard)
  @Delete(':workerId/hard')
  async hardDeleteWorker(@Param('workerId') workerId: string) {
    await this.workersService.hardDeleteWorker(workerId);
    return { success: true };
  }

  // ==================== ATTENDANCE ====================

  @UseGuards(SupabaseAuthGuard)
  @Get('tenant/:tenantId/attendance')
  async getAttendanceByTenant(
    @Param('tenantId') tenantId: string,
    @Query() query: GetAttendanceQueryDto,
  ) {
    const records = await this.workersService.getAttendanceByTenant(
      tenantId,
      query.startDate,
      query.endDate,
    );
    return { records };
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('tenant/:tenantId/attendance/date/:date')
  async getAttendanceByDate(
    @Param('tenantId') tenantId: string,
    @Param('date') date: string,
  ) {
    const records = await this.workersService.getAttendanceByDate(
      tenantId,
      date,
    );
    return { records };
  }

  @UseGuards(SupabaseAuthGuard)
  @Get(':workerId/attendance')
  async getAttendanceByWorker(
    @Param('workerId') workerId: string,
    @Query() query: GetAttendanceQueryDto,
  ) {
    const records = await this.workersService.getAttendanceByWorker(
      workerId,
      query.startDate,
      query.endDate,
    );
    return { records };
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('tenant/:tenantId/attendance')
  async createAttendance(
    @Param('tenantId') tenantId: string,
    @Body() dto: CreateAttendanceDto,
  ) {
    const record = await this.workersService.createAttendance(tenantId, dto);
    return { record };
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('tenant/:tenantId/attendance/bulk')
  async bulkCreateAttendance(
    @Param('tenantId') tenantId: string,
    @Body() dto: BulkCreateAttendanceDto,
  ) {
    const records = await this.workersService.bulkCreateAttendance(
      tenantId,
      dto.attendances,
    );
    return { records };
  }

  @UseGuards(SupabaseAuthGuard)
  @Put('attendance/:attendanceId')
  async updateAttendance(
    @Param('attendanceId') attendanceId: string,
    @Body() dto: UpdateAttendanceDto,
  ) {
    const record = await this.workersService.updateAttendance(
      attendanceId,
      dto,
    );
    return { record };
  }

  @UseGuards(SupabaseAuthGuard)
  @Delete('attendance/:attendanceId')
  async deleteAttendance(@Param('attendanceId') attendanceId: string) {
    await this.workersService.deleteAttendance(attendanceId);
    return { success: true };
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('attendance/statuses')
  async getAttendanceStatuses() {
    const statuses = await this.workersService.getAttendanceStatuses();
    return { statuses };
  }
}
