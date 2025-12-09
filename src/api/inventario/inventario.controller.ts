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
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InventarioService } from './inventario.service';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { CreateItemDto, UpdateItemDto } from './dto/item.dto';
import { CreateCategoryDto } from './dto/category.dto';
import { CreateLocationDto } from './dto/location.dto';
import { CreateMovementDto } from './dto/movement.dto';

@ApiTags('Inventario')
@ApiBearerAuth('bearer')
@Controller('inventario')
export class InventarioController {
  constructor(private readonly inventarioService: InventarioService) {}

  // ==================== ITEMS ====================

  @UseGuards(SupabaseAuthGuard)
  @Get('items/tenant/:tenantId')
  async getItems(
    @Param('tenantId') tenantId: string,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('locationId') locationId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const items = await this.inventarioService.getItemsByTenant(tenantId, {
      search,
      categoryId,
      locationId,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
    return { items };
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('items/:id')
  async getItemById(@Param('id') id: string) {
    const item = await this.inventarioService.getItemById(id);
    return { item };
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('items/tenant/:tenantId')
  async createItem(
    @Param('tenantId') tenantId: string,
    @Body() dto: CreateItemDto,
  ) {
    const item = await this.inventarioService.createItem(tenantId, dto);
    return { item };
  }

  @UseGuards(SupabaseAuthGuard)
  @Put('items/:id')
  async updateItem(@Param('id') id: string, @Body() dto: UpdateItemDto) {
    const item = await this.inventarioService.updateItem(id, dto);
    return { item };
  }

  @UseGuards(SupabaseAuthGuard)
  @Delete('items/:id')
  async deleteItem(@Param('id') id: string) {
    await this.inventarioService.deleteItem(id);
    return { success: true };
  }

  // ==================== CATEGORIES ====================

  @UseGuards(SupabaseAuthGuard)
  @Get('categories/tenant/:tenantId')
  async getCategories(@Param('tenantId') tenantId: string) {
    const categories =
      await this.inventarioService.getCategoriesByTenant(tenantId);
    return { categories };
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('categories/tenant/:tenantId')
  async createCategory(
    @Param('tenantId') tenantId: string,
    @Body() dto: CreateCategoryDto,
  ) {
    const category = await this.inventarioService.createCategory(tenantId, dto);
    return { category };
  }

  @UseGuards(SupabaseAuthGuard)
  @Delete('categories/:id')
  async deleteCategory(@Param('id') id: string) {
    await this.inventarioService.deleteCategory(id);
    return { success: true };
  }

  // ==================== LOCATIONS ====================

  @UseGuards(SupabaseAuthGuard)
  @Get('locations/tenant/:tenantId')
  async getLocations(@Param('tenantId') tenantId: string) {
    const locations =
      await this.inventarioService.getLocationsByTenant(tenantId);
    return { locations };
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('locations/tenant/:tenantId')
  async createLocation(
    @Param('tenantId') tenantId: string,
    @Body() dto: CreateLocationDto,
  ) {
    const location = await this.inventarioService.createLocation(tenantId, dto);
    return { location };
  }

  @UseGuards(SupabaseAuthGuard)
  @Delete('locations/:id')
  async deleteLocation(@Param('id') id: string) {
    await this.inventarioService.deleteLocation(id);
    return { success: true };
  }

  // ==================== MOVEMENTS ====================

  @UseGuards(SupabaseAuthGuard)
  @Get('movement-types')
  async getMovementTypes() {
    const types = await this.inventarioService.getMovementTypes();
    return { types };
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('movements/tenant/:tenantId')
  async getMovements(
    @Param('tenantId') tenantId: string,
    @Query('itemId') itemId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const movements = await this.inventarioService.getMovementsByTenant(
      tenantId,
      {
        itemId,
        limit: limit ? parseInt(limit, 10) : undefined,
        offset: offset ? parseInt(offset, 10) : undefined,
      },
    );
    return { movements };
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('movements/tenant/:tenantId')
  async createMovement(
    @Param('tenantId') tenantId: string,
    @Body() dto: CreateMovementDto,
  ) {
    const movement = await this.inventarioService.createMovement(tenantId, dto);
    return { movement };
  }

  @UseGuards(SupabaseAuthGuard)
  @Delete('movements/:id')
  async deleteMovement(@Param('id') id: string) {
    await this.inventarioService.deleteMovement(id);
    return { success: true };
  }

  // ==================== SUMMARY ====================

  @UseGuards(SupabaseAuthGuard)
  @Get('summary/tenant/:tenantId')
  async getSummary(@Param('tenantId') tenantId: string) {
    const summary = await this.inventarioService.getInventorySummary(tenantId);
    return { summary };
  }
}
