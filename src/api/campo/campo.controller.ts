import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CampoService } from './campo.service';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import {
  CreateFarmDto,
  UpdateFarmDto,
  CreateLotDto,
  UpdateLotDto,
  CreateTaskDto,
  UpdateTaskDto,
} from './dto';

@Controller('campo')
export class CampoController {
  constructor(private readonly campoService: CampoService) {}

  // ==================== FARMS ====================

  @UseGuards(SupabaseAuthGuard)
  @Get('farms/tenant/:tenantId')
  async getFarmsByTenant(@Param('tenantId') tenantId: string) {
    const farms = await this.campoService.getFarmsByTenant(tenantId);
    return { farms };
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('farms/:farmId')
  async getFarmById(@Param('farmId') farmId: string) {
    const farm = await this.campoService.getFarmById(farmId);
    return { farm };
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('farms/tenant/:tenantId')
  async createFarm(
    @Param('tenantId') tenantId: string,
    @Body() dto: CreateFarmDto,
    @Request() req: { user: { id: string } },
  ) {
    const userId = req.user.id;
    const farm = await this.campoService.createFarm(tenantId, userId, dto);
    return { farm };
  }

  @UseGuards(SupabaseAuthGuard)
  @Put('farms/:farmId')
  async updateFarm(
    @Param('farmId') farmId: string,
    @Body() dto: UpdateFarmDto,
  ) {
    const farm = await this.campoService.updateFarm(farmId, dto);
    return { farm };
  }

  @UseGuards(SupabaseAuthGuard)
  @Delete('farms/:farmId')
  async deleteFarm(@Param('farmId') farmId: string) {
    await this.campoService.deleteFarm(farmId);
    return { success: true };
  }

  // ==================== LOTS ====================

  @UseGuards(SupabaseAuthGuard)
  @Get('lots/farm/:farmId')
  async getLotsByFarm(@Param('farmId') farmId: string) {
    const lots = await this.campoService.getLotsByFarm(farmId);
    return { lots };
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('lots/:lotId')
  async getLotById(@Param('lotId') lotId: string) {
    const lot = await this.campoService.getLotById(lotId);
    return { lot };
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('lots/tenant/:tenantId')
  async createLot(
    @Param('tenantId') tenantId: string,
    @Body() dto: CreateLotDto,
  ) {
    const lot = await this.campoService.createLot(tenantId, dto);
    return { lot };
  }

  @UseGuards(SupabaseAuthGuard)
  @Put('lots/:lotId')
  async updateLot(@Param('lotId') lotId: string, @Body() dto: UpdateLotDto) {
    const lot = await this.campoService.updateLot(lotId, dto);
    return { lot };
  }

  @UseGuards(SupabaseAuthGuard)
  @Delete('lots/:lotId')
  async deleteLot(@Param('lotId') lotId: string) {
    await this.campoService.deleteLot(lotId);
    return { success: true };
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('lots/statuses/all')
  async getLotStatuses() {
    const statuses = await this.campoService.getLotStatuses();
    return { statuses };
  }

  // ==================== TASKS ====================

  @UseGuards(SupabaseAuthGuard)
  @Get('tasks/lot/:lotId')
  async getTasksByLot(@Param('lotId') lotId: string) {
    const tasks = await this.campoService.getTasksByLot(lotId);
    return { tasks };
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('tasks/:taskId')
  async getTaskById(@Param('taskId') taskId: string) {
    const task = await this.campoService.getTaskById(taskId);
    return { task };
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('tasks/tenant/:tenantId')
  async createTask(
    @Param('tenantId') tenantId: string,
    @Body() dto: CreateTaskDto,
    @Request() req: { user: { id: string } },
  ) {
    const userId = req.user.id;
    const task = await this.campoService.createTask(tenantId, dto, userId);
    return { task };
  }

  @UseGuards(SupabaseAuthGuard)
  @Put('tasks/:taskId')
  async updateTask(
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    const task = await this.campoService.updateTask(taskId, dto);
    return { task };
  }

  @UseGuards(SupabaseAuthGuard)
  @Delete('tasks/:taskId')
  async deleteTask(@Param('taskId') taskId: string) {
    await this.campoService.deleteTask(taskId);
    return { success: true };
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('tasks/statuses/all')
  async getTaskStatuses() {
    const statuses = await this.campoService.getTaskStatuses();
    return { statuses };
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('tasks/types/all')
  async getTaskTypes() {
    const types = await this.campoService.getTaskTypes();
    return { types };
  }
}
