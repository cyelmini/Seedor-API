import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { EmpaqueService } from './empaque.service';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import {
  CreateIngresoFrutaDto,
  UpdateIngresoFrutaDto,
} from './dto/ingreso-fruta.dto';
import { CreatePreprocesoDto, UpdatePreprocesoDto } from './dto/preproceso.dto';
import { CreatePalletDto, UpdatePalletDto } from './dto/pallet.dto';
import { CreateDespachoDto, UpdateDespachoDto } from './dto/despacho.dto';
import {
  CreateEgresoFrutaDto,
  UpdateEgresoFrutaDto,
} from './dto/egreso-fruta.dto';

@Controller('empaque')
export class EmpaqueController {
  constructor(private readonly empaqueService: EmpaqueService) {}

  // ==================== INGRESO FRUTA ====================

  @UseGuards(SupabaseAuthGuard)
  @Get('ingreso-fruta/tenant/:tenantId')
  async getIngresosFruta(@Param('tenantId') tenantId: string) {
    const ingresos = await this.empaqueService.getIngresosByTenant(tenantId);
    return { ingresos };
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('ingreso-fruta/:id')
  async getIngresoFrutaById(@Param('id') id: string) {
    const ingreso = await this.empaqueService.getIngresoById(id);
    return { ingreso };
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('ingreso-fruta/tenant/:tenantId')
  async createIngresoFruta(
    @Param('tenantId') tenantId: string,
    @Body() dto: CreateIngresoFrutaDto,
  ) {
    const ingreso = await this.empaqueService.createIngreso(tenantId, dto);
    return { ingreso };
  }

  @UseGuards(SupabaseAuthGuard)
  @Put('ingreso-fruta/:id')
  async updateIngresoFruta(
    @Param('id') id: string,
    @Body() dto: UpdateIngresoFrutaDto,
  ) {
    const ingreso = await this.empaqueService.updateIngreso(id, dto);
    return { ingreso };
  }

  @UseGuards(SupabaseAuthGuard)
  @Delete('ingreso-fruta/:id')
  async deleteIngresoFruta(@Param('id') id: string) {
    await this.empaqueService.deleteIngreso(id);
    return { success: true };
  }

  // ==================== PREPROCESO ====================

  @UseGuards(SupabaseAuthGuard)
  @Get('preproceso/tenant/:tenantId')
  async getPreprocesos(@Param('tenantId') tenantId: string) {
    const preprocesos =
      await this.empaqueService.getPreprocesosByTenant(tenantId);
    return { preprocesos };
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('preproceso/:id')
  async getPreprocesoById(@Param('id') id: string) {
    const preproceso = await this.empaqueService.getPreprocesoById(id);
    return { preproceso };
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('preproceso/tenant/:tenantId')
  async createPreproceso(
    @Param('tenantId') tenantId: string,
    @Body() dto: CreatePreprocesoDto,
  ) {
    const preproceso = await this.empaqueService.createPreproceso(
      tenantId,
      dto,
    );
    return { preproceso };
  }

  @UseGuards(SupabaseAuthGuard)
  @Put('preproceso/:id')
  async updatePreproceso(
    @Param('id') id: string,
    @Body() dto: UpdatePreprocesoDto,
  ) {
    const preproceso = await this.empaqueService.updatePreproceso(id, dto);
    return { preproceso };
  }

  @UseGuards(SupabaseAuthGuard)
  @Delete('preproceso/:id')
  async deletePreproceso(@Param('id') id: string) {
    await this.empaqueService.deletePreproceso(id);
    return { success: true };
  }

  // ==================== PALLETS ====================

  @UseGuards(SupabaseAuthGuard)
  @Get('pallets/tenant/:tenantId')
  async getPallets(@Param('tenantId') tenantId: string) {
    const pallets = await this.empaqueService.getPalletsByTenant(tenantId);
    return { pallets };
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('pallets/:id')
  async getPalletById(@Param('id') id: string) {
    const pallet = await this.empaqueService.getPalletById(id);
    return { pallet };
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('pallets/tenant/:tenantId')
  async createPallet(
    @Param('tenantId') tenantId: string,
    @Body() dto: CreatePalletDto,
  ) {
    const pallet = await this.empaqueService.createPallet(tenantId, dto);
    return { pallet };
  }

  @UseGuards(SupabaseAuthGuard)
  @Put('pallets/:id')
  async updatePallet(@Param('id') id: string, @Body() dto: UpdatePalletDto) {
    const pallet = await this.empaqueService.updatePallet(id, dto);
    return { pallet };
  }

  @UseGuards(SupabaseAuthGuard)
  @Delete('pallets/:id')
  async deletePallet(@Param('id') id: string) {
    await this.empaqueService.deletePallet(id);
    return { success: true };
  }

  // ==================== DESPACHO ====================

  @UseGuards(SupabaseAuthGuard)
  @Get('despacho/tenant/:tenantId')
  async getDespachos(@Param('tenantId') tenantId: string) {
    const despachos = await this.empaqueService.getDespachosByTenant(tenantId);
    return { despachos };
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('despacho/:id')
  async getDespachoById(@Param('id') id: string) {
    const despacho = await this.empaqueService.getDespachoById(id);
    return { despacho };
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('despacho/tenant/:tenantId')
  async createDespacho(
    @Param('tenantId') tenantId: string,
    @Body() dto: CreateDespachoDto,
  ) {
    const despacho = await this.empaqueService.createDespacho(tenantId, dto);
    return { despacho };
  }

  @UseGuards(SupabaseAuthGuard)
  @Put('despacho/:id')
  async updateDespacho(
    @Param('id') id: string,
    @Body() dto: UpdateDespachoDto,
  ) {
    const despacho = await this.empaqueService.updateDespacho(id, dto);
    return { despacho };
  }

  @UseGuards(SupabaseAuthGuard)
  @Delete('despacho/:id')
  async deleteDespacho(@Param('id') id: string) {
    await this.empaqueService.deleteDespacho(id);
    return { success: true };
  }

  // ==================== EGRESO FRUTA ====================

  @UseGuards(SupabaseAuthGuard)
  @Get('egreso-fruta/tenant/:tenantId')
  async getEgresosFruta(@Param('tenantId') tenantId: string) {
    const egresos = await this.empaqueService.getEgresosByTenant(tenantId);
    return { egresos };
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('egreso-fruta/:id')
  async getEgresoFrutaById(@Param('id') id: string) {
    const egreso = await this.empaqueService.getEgresoById(id);
    return { egreso };
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('egreso-fruta/tenant/:tenantId')
  async createEgresoFruta(
    @Param('tenantId') tenantId: string,
    @Body() dto: CreateEgresoFrutaDto,
  ) {
    const egreso = await this.empaqueService.createEgreso(tenantId, dto);
    return { egreso };
  }

  @UseGuards(SupabaseAuthGuard)
  @Put('egreso-fruta/:id')
  async updateEgresoFruta(
    @Param('id') id: string,
    @Body() dto: UpdateEgresoFrutaDto,
  ) {
    const egreso = await this.empaqueService.updateEgreso(id, dto);
    return { egreso };
  }

  @UseGuards(SupabaseAuthGuard)
  @Delete('egreso-fruta/:id')
  async deleteEgresoFruta(@Param('id') id: string) {
    await this.empaqueService.deleteEgreso(id);
    return { success: true };
  }
}
