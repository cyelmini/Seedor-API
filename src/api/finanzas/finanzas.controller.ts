import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { FinanzasService } from './finanzas.service';
import { CreateMovementDto, UpdateMovementDto } from './dto/movement.dto';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Controller('finanzas')
export class FinanzasController {
  constructor(private readonly finanzasService: FinanzasService) {}

  // ==================== MOVEMENTS ====================

  @Get('movements/tenant/:tenantId')
  async getMovements(
    @Param('tenantId') tenantId: string,
    @Query('kind') kind?: 'ingreso' | 'egreso',
    @Query('categoryId') categoryId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const movements = await this.finanzasService.getMovements(tenantId, {
      kind,
      categoryId,
      startDate,
      endDate,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
    return { movements };
  }

  @Get('movements/:id')
  async getMovementById(@Param('id') id: string) {
    const movement = await this.finanzasService.getMovementById(id);
    return { movement };
  }

  @Post('movements/tenant/:tenantId')
  async createMovement(
    @Param('tenantId') tenantId: string,
    @Body() dto: CreateMovementDto,
  ) {
    const movement = await this.finanzasService.createMovement(tenantId, dto);
    return { movement };
  }

  @Put('movements/:id')
  async updateMovement(
    @Param('id') id: string,
    @Body() dto: UpdateMovementDto,
  ) {
    const movement = await this.finanzasService.updateMovement(id, dto);
    return { movement };
  }

  @Delete('movements/:id')
  async deleteMovement(@Param('id') id: string) {
    await this.finanzasService.deleteMovement(id);
    return { success: true };
  }

  // ==================== CATEGORIES ====================

  @Get('categories/tenant/:tenantId')
  async getCategories(
    @Param('tenantId') tenantId: string,
    @Query('kind') kind?: 'ingreso' | 'egreso',
  ) {
    const categories = await this.finanzasService.getCategories(tenantId, kind);
    return { categories };
  }

  @Post('categories/tenant/:tenantId')
  async createCategory(
    @Param('tenantId') tenantId: string,
    @Body() dto: CreateCategoryDto,
  ) {
    const category = await this.finanzasService.createCategory(tenantId, dto);
    return { category };
  }

  @Put('categories/:id')
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    const category = await this.finanzasService.updateCategory(id, dto);
    return { category };
  }

  @Delete('categories/:id')
  async deleteCategory(@Param('id') id: string) {
    await this.finanzasService.deleteCategory(id);
    return { success: true };
  }

  // ==================== FINANCE KINDS ====================

  @Get('kinds')
  async getFinanceKinds() {
    const kinds = await this.finanzasService.getFinanceKinds();
    return { kinds };
  }

  // ==================== SUMMARY & REPORTS ====================

  @Get('summary/tenant/:tenantId')
  async getSummary(
    @Param('tenantId') tenantId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const summary = await this.finanzasService.getSummary(
      tenantId,
      startDate,
      endDate,
    );
    return { summary };
  }

  @Get('balance/tenant/:tenantId')
  async getPeriodBalance(
    @Param('tenantId') tenantId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('openingBalance') openingBalance?: string,
  ) {
    const balance = await this.finanzasService.getPeriodBalance(
      tenantId,
      startDate,
      endDate,
      openingBalance ? parseFloat(openingBalance) : 0,
    );
    return { balance };
  }
}
