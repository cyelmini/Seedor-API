import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  IngresoFrutaRow,
  PreprocesoRow,
  PalletRow,
  DespachoRow,
  EgresoFrutaRow,
} from './types';
import {
  CreateIngresoFrutaDto,
  UpdateIngresoFrutaDto,
  CreatePreprocesoDto,
  UpdatePreprocesoDto,
  CreatePalletDto,
  UpdatePalletDto,
  CreateDespachoDto,
  UpdateDespachoDto,
  CreateEgresoFrutaDto,
  UpdateEgresoFrutaDto,
} from './dto';

@Injectable()
export class EmpaqueService {
  private supabaseAdmin: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseServiceKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  // ==================== INGRESO FRUTA ====================

  async getIngresosByTenant(tenantId: string): Promise<IngresoFrutaRow[]> {
    const { data, error } = await this.supabaseAdmin
      .from('ingreso_fruta')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('fecha', { ascending: false });

    if (error) {
      throw new BadRequestException(
        `Error al obtener ingresos: ${error.message}`,
      );
    }

    return data || [];
  }

  async getIngresoById(ingresoId: string): Promise<IngresoFrutaRow | null> {
    const { data, error } = await this.supabaseAdmin
      .from('ingreso_fruta')
      .select('*')
      .eq('id', ingresoId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new BadRequestException(
        `Error al obtener ingreso: ${error.message}`,
      );
    }

    return data;
  }

  async createIngreso(
    tenantId: string,
    dto: CreateIngresoFrutaDto,
  ): Promise<IngresoFrutaRow> {
    const { data, error } = await this.supabaseAdmin
      .from('ingreso_fruta')
      .insert({
        tenant_id: tenantId,
        fecha: dto.fecha,
        estado_liquidacion: dto.estadoLiquidacion ?? false,
        num_ticket: dto.numTicket ?? null,
        num_remito: dto.numRemito ?? null,
        productor: dto.productor,
        finca: dto.finca ?? null,
        producto: dto.producto,
        lote: dto.lote ?? null,
        contratista: dto.contratista ?? null,
        tipo_cosecha: dto.tipoCosecha ?? null,
        cant_bin: dto.cantBin,
        tipo_bin: dto.tipoBin,
        peso_neto: dto.pesoNeto,
        transporte: dto.transporte ?? null,
        chofer: dto.chofer ?? null,
        chasis: dto.chasis ?? null,
        acoplado: dto.acoplado ?? null,
        operario: dto.operario ?? null,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Error al crear ingreso: ${error.message}`);
    }

    return data;
  }

  async updateIngreso(
    ingresoId: string,
    dto: UpdateIngresoFrutaDto,
  ): Promise<IngresoFrutaRow> {
    const updateData: Record<string, unknown> = {};

    if (dto.fecha !== undefined) updateData.fecha = dto.fecha;
    if (dto.estadoLiquidacion !== undefined)
      updateData.estado_liquidacion = dto.estadoLiquidacion;
    if (dto.numTicket !== undefined) updateData.num_ticket = dto.numTicket;
    if (dto.numRemito !== undefined) updateData.num_remito = dto.numRemito;
    if (dto.productor !== undefined) updateData.productor = dto.productor;
    if (dto.finca !== undefined) updateData.finca = dto.finca;
    if (dto.producto !== undefined) updateData.producto = dto.producto;
    if (dto.lote !== undefined) updateData.lote = dto.lote;
    if (dto.contratista !== undefined) updateData.contratista = dto.contratista;
    if (dto.tipoCosecha !== undefined)
      updateData.tipo_cosecha = dto.tipoCosecha;
    if (dto.cantBin !== undefined) updateData.cant_bin = dto.cantBin;
    if (dto.tipoBin !== undefined) updateData.tipo_bin = dto.tipoBin;
    if (dto.pesoNeto !== undefined) updateData.peso_neto = dto.pesoNeto;
    if (dto.transporte !== undefined) updateData.transporte = dto.transporte;
    if (dto.chofer !== undefined) updateData.chofer = dto.chofer;
    if (dto.chasis !== undefined) updateData.chasis = dto.chasis;
    if (dto.acoplado !== undefined) updateData.acoplado = dto.acoplado;
    if (dto.operario !== undefined) updateData.operario = dto.operario;

    const { data, error } = await this.supabaseAdmin
      .from('ingreso_fruta')
      .update(updateData)
      .eq('id', ingresoId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(
        `Error al actualizar ingreso: ${error.message}`,
      );
    }

    return data;
  }

  async deleteIngreso(ingresoId: string): Promise<void> {
    const { error } = await this.supabaseAdmin
      .from('ingreso_fruta')
      .delete()
      .eq('id', ingresoId);

    if (error) {
      throw new BadRequestException(
        `Error al eliminar ingreso: ${error.message}`,
      );
    }
  }

  // ==================== PREPROCESO ====================

  async getPreprocesosByTenant(tenantId: string): Promise<PreprocesoRow[]> {
    const { data, error } = await this.supabaseAdmin
      .from('preseleccion')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('fecha', { ascending: false });

    if (error) {
      throw new BadRequestException(
        `Error al obtener preprocesos: ${error.message}`,
      );
    }

    return data || [];
  }

  async getPreprocesoById(preprocesoId: string): Promise<PreprocesoRow | null> {
    const { data, error } = await this.supabaseAdmin
      .from('preseleccion')
      .select('*')
      .eq('id', preprocesoId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new BadRequestException(
        `Error al obtener preproceso: ${error.message}`,
      );
    }

    return data;
  }

  async createPreproceso(
    tenantId: string,
    dto: CreatePreprocesoDto,
  ): Promise<PreprocesoRow> {
    const { data, error } = await this.supabaseAdmin
      .from('preseleccion')
      .insert({
        tenant_id: tenantId,
        semana: dto.semana,
        fecha: dto.fecha,
        duracion: dto.duracion,
        bin_volcados: dto.binVolcados,
        ritmo_maquina: dto.ritmoMaquina,
        duracion_proceso: dto.duracionProceso,
        bin_pleno: dto.binPleno,
        bin_intermedio_I: dto.binIntermedioI,
        bin_intermedio_II: dto.binIntermedioII,
        bin_incipiente: dto.binIncipiente,
        cant_personal: dto.cantPersonal,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(
        `Error al crear preproceso: ${error.message}`,
      );
    }

    return data;
  }

  async updatePreproceso(
    preprocesoId: string,
    dto: UpdatePreprocesoDto,
  ): Promise<PreprocesoRow> {
    const updateData: Record<string, unknown> = {};

    if (dto.semana !== undefined) updateData.semana = dto.semana;
    if (dto.fecha !== undefined) updateData.fecha = dto.fecha;
    if (dto.duracion !== undefined) updateData.duracion = dto.duracion;
    if (dto.binVolcados !== undefined)
      updateData.bin_volcados = dto.binVolcados;
    if (dto.ritmoMaquina !== undefined)
      updateData.ritmo_maquina = dto.ritmoMaquina;
    if (dto.duracionProceso !== undefined)
      updateData.duracion_proceso = dto.duracionProceso;
    if (dto.binPleno !== undefined) updateData.bin_pleno = dto.binPleno;
    if (dto.binIntermedioI !== undefined)
      updateData.bin_intermedio_I = dto.binIntermedioI;
    if (dto.binIntermedioII !== undefined)
      updateData.bin_intermedio_II = dto.binIntermedioII;
    if (dto.binIncipiente !== undefined)
      updateData.bin_incipiente = dto.binIncipiente;
    if (dto.cantPersonal !== undefined)
      updateData.cant_personal = dto.cantPersonal;

    const { data, error } = await this.supabaseAdmin
      .from('preseleccion')
      .update(updateData)
      .eq('id', preprocesoId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(
        `Error al actualizar preproceso: ${error.message}`,
      );
    }

    return data;
  }

  async deletePreproceso(preprocesoId: string): Promise<void> {
    const { error } = await this.supabaseAdmin
      .from('preseleccion')
      .delete()
      .eq('id', preprocesoId);

    if (error) {
      throw new BadRequestException(
        `Error al eliminar preproceso: ${error.message}`,
      );
    }
  }

  // ==================== PALLETS ====================

  async getPalletsByTenant(tenantId: string): Promise<PalletRow[]> {
    const { data, error } = await this.supabaseAdmin
      .from('pallets')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('fecha', { ascending: false });

    if (error) {
      throw new BadRequestException(
        `Error al obtener pallets: ${error.message}`,
      );
    }

    return data || [];
  }

  async getPalletById(palletId: string): Promise<PalletRow | null> {
    const { data, error } = await this.supabaseAdmin
      .from('pallets')
      .select('*')
      .eq('id', palletId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new BadRequestException(
        `Error al obtener pallet: ${error.message}`,
      );
    }

    return data;
  }

  async createPallet(
    tenantId: string,
    dto: CreatePalletDto,
  ): Promise<PalletRow> {
    const { data, error } = await this.supabaseAdmin
      .from('pallets')
      .insert({
        tenant_id: tenantId,
        semana: dto.semana ?? null,
        fecha: dto.fecha ?? null,
        num_pallet: dto.numPallet ?? null,
        producto: dto.producto ?? null,
        productor: dto.productor ?? null,
        categoria: dto.categoria ?? null,
        cod_envase: dto.codEnvase ?? null,
        destino: dto.destino ?? null,
        kilos: dto.kilos ?? null,
        cant_cajas: dto.cantCajas ?? null,
        peso: dto.peso ?? null,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Error al crear pallet: ${error.message}`);
    }

    return data;
  }

  async updatePallet(
    palletId: string,
    dto: UpdatePalletDto,
  ): Promise<PalletRow> {
    const updateData: Record<string, unknown> = {};

    if (dto.semana !== undefined) updateData.semana = dto.semana;
    if (dto.fecha !== undefined) updateData.fecha = dto.fecha;
    if (dto.numPallet !== undefined) updateData.num_pallet = dto.numPallet;
    if (dto.producto !== undefined) updateData.producto = dto.producto;
    if (dto.productor !== undefined) updateData.productor = dto.productor;
    if (dto.categoria !== undefined) updateData.categoria = dto.categoria;
    if (dto.codEnvase !== undefined) updateData.cod_envase = dto.codEnvase;
    if (dto.destino !== undefined) updateData.destino = dto.destino;
    if (dto.kilos !== undefined) updateData.kilos = dto.kilos;
    if (dto.cantCajas !== undefined) updateData.cant_cajas = dto.cantCajas;
    if (dto.peso !== undefined) updateData.peso = dto.peso;

    const { data, error } = await this.supabaseAdmin
      .from('pallets')
      .update(updateData)
      .eq('id', palletId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(
        `Error al actualizar pallet: ${error.message}`,
      );
    }

    return data;
  }

  async deletePallet(palletId: string): Promise<void> {
    const { error } = await this.supabaseAdmin
      .from('pallets')
      .delete()
      .eq('id', palletId);

    if (error) {
      throw new BadRequestException(
        `Error al eliminar pallet: ${error.message}`,
      );
    }
  }

  // ==================== DESPACHO ====================

  async getDespachosByTenant(tenantId: string): Promise<DespachoRow[]> {
    const { data, error } = await this.supabaseAdmin
      .from('despacho')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('fecha', { ascending: false });

    if (error) {
      throw new BadRequestException(
        `Error al obtener despachos: ${error.message}`,
      );
    }

    return data || [];
  }

  async getDespachoById(despachoId: string): Promise<DespachoRow | null> {
    const { data, error } = await this.supabaseAdmin
      .from('despacho')
      .select('*')
      .eq('id', despachoId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new BadRequestException(
        `Error al obtener despacho: ${error.message}`,
      );
    }

    return data;
  }

  async createDespacho(
    tenantId: string,
    dto: CreateDespachoDto,
  ): Promise<DespachoRow> {
    const { data, error } = await this.supabaseAdmin
      .from('despacho')
      .insert({
        tenant_id: tenantId,
        fecha: dto.fecha,
        num_remito: dto.numRemito ?? null,
        cliente: dto.cliente ?? null,
        DTV: dto.DTV ?? null,
        codigo_cierre: dto.codigoCierre ?? null,
        termografo: dto.termografo ?? null,
        DTC: dto.DTC ?? null,
        destino: dto.destino ?? null,
        transporte: dto.transporte ?? null,
        total_pallets: dto.totalPallets ?? null,
        total_cajas: dto.totalCajas ?? null,
        cuit: dto.cuit ?? null,
        chasis: dto.chasis ?? null,
        acoplado: dto.acoplado ?? null,
        chofer: dto.chofer ?? null,
        dni: dto.dni ?? null,
        celular: dto.celular ?? null,
        operario: dto.operario ?? null,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(
        `Error al crear despacho: ${error.message}`,
      );
    }

    return data;
  }

  async updateDespacho(
    despachoId: string,
    dto: UpdateDespachoDto,
  ): Promise<DespachoRow> {
    const updateData: Record<string, unknown> = {};

    if (dto.fecha !== undefined) updateData.fecha = dto.fecha;
    if (dto.numRemito !== undefined) updateData.num_remito = dto.numRemito;
    if (dto.cliente !== undefined) updateData.cliente = dto.cliente;
    if (dto.DTV !== undefined) updateData.DTV = dto.DTV;
    if (dto.codigoCierre !== undefined)
      updateData.codigo_cierre = dto.codigoCierre;
    if (dto.termografo !== undefined) updateData.termografo = dto.termografo;
    if (dto.DTC !== undefined) updateData.DTC = dto.DTC;
    if (dto.destino !== undefined) updateData.destino = dto.destino;
    if (dto.transporte !== undefined) updateData.transporte = dto.transporte;
    if (dto.totalPallets !== undefined)
      updateData.total_pallets = dto.totalPallets;
    if (dto.totalCajas !== undefined) updateData.total_cajas = dto.totalCajas;
    if (dto.cuit !== undefined) updateData.cuit = dto.cuit;
    if (dto.chasis !== undefined) updateData.chasis = dto.chasis;
    if (dto.acoplado !== undefined) updateData.acoplado = dto.acoplado;
    if (dto.chofer !== undefined) updateData.chofer = dto.chofer;
    if (dto.dni !== undefined) updateData.dni = dto.dni;
    if (dto.celular !== undefined) updateData.celular = dto.celular;
    if (dto.operario !== undefined) updateData.operario = dto.operario;

    const { data, error } = await this.supabaseAdmin
      .from('despacho')
      .update(updateData)
      .eq('id', despachoId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(
        `Error al actualizar despacho: ${error.message}`,
      );
    }

    return data;
  }

  async deleteDespacho(despachoId: string): Promise<void> {
    const { error } = await this.supabaseAdmin
      .from('despacho')
      .delete()
      .eq('id', despachoId);

    if (error) {
      throw new BadRequestException(
        `Error al eliminar despacho: ${error.message}`,
      );
    }
  }

  // ==================== EGRESO FRUTA ====================

  async getEgresosByTenant(tenantId: string): Promise<EgresoFrutaRow[]> {
    const { data, error } = await this.supabaseAdmin
      .from('egreso_fruta')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('fecha', { ascending: false });

    if (error) {
      throw new BadRequestException(
        `Error al obtener egresos: ${error.message}`,
      );
    }

    return data || [];
  }

  async getEgresoById(egresoId: string): Promise<EgresoFrutaRow | null> {
    const { data, error } = await this.supabaseAdmin
      .from('egreso_fruta')
      .select('*')
      .eq('id', egresoId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new BadRequestException(
        `Error al obtener egreso: ${error.message}`,
      );
    }

    return data;
  }

  async createEgreso(
    tenantId: string,
    dto: CreateEgresoFrutaDto,
  ): Promise<EgresoFrutaRow> {
    const { data, error } = await this.supabaseAdmin
      .from('egreso_fruta')
      .insert({
        tenant_id: tenantId,
        fecha: dto.fecha,
        num_remito: dto.numRemito ?? null,
        cliente: dto.cliente ?? null,
        finca: dto.finca ?? null,
        producto: dto.producto ?? null,
        DTV: dto.DTV ?? null,
        tara: dto.tara ?? null,
        peso_neto: dto.pesoNeto ?? null,
        transporte: dto.transporte ?? null,
        chasis: dto.chasis ?? null,
        acoplado: dto.acoplado ?? null,
        chofer: dto.chofer ?? null,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Error al crear egreso: ${error.message}`);
    }

    return data;
  }

  async updateEgreso(
    egresoId: string,
    dto: UpdateEgresoFrutaDto,
  ): Promise<EgresoFrutaRow> {
    const updateData: Record<string, unknown> = {};

    if (dto.fecha !== undefined) updateData.fecha = dto.fecha;
    if (dto.numRemito !== undefined) updateData.num_remito = dto.numRemito;
    if (dto.cliente !== undefined) updateData.cliente = dto.cliente;
    if (dto.finca !== undefined) updateData.finca = dto.finca;
    if (dto.producto !== undefined) updateData.producto = dto.producto;
    if (dto.DTV !== undefined) updateData.DTV = dto.DTV;
    if (dto.tara !== undefined) updateData.tara = dto.tara;
    if (dto.pesoNeto !== undefined) updateData.peso_neto = dto.pesoNeto;
    if (dto.transporte !== undefined) updateData.transporte = dto.transporte;
    if (dto.chasis !== undefined) updateData.chasis = dto.chasis;
    if (dto.acoplado !== undefined) updateData.acoplado = dto.acoplado;
    if (dto.chofer !== undefined) updateData.chofer = dto.chofer;

    const { data, error } = await this.supabaseAdmin
      .from('egreso_fruta')
      .update(updateData)
      .eq('id', egresoId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(
        `Error al actualizar egreso: ${error.message}`,
      );
    }

    return data;
  }

  async deleteEgreso(egresoId: string): Promise<void> {
    const { error } = await this.supabaseAdmin
      .from('egreso_fruta')
      .delete()
      .eq('id', egresoId);

    if (error) {
      throw new BadRequestException(
        `Error al eliminar egreso: ${error.message}`,
      );
    }
  }
}