import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './api/auth/auth.module';
import { TenantModule } from './api/tenant/tenant.module';
import { WorkersModule } from './api/workers/workers.module';
import { CampoModule } from './api/campo/campo.module';
import { EmpaqueModule } from './api/empaque/empaque.module';
import { InventarioModule } from './api/inventario/inventario.module';
import { FinanzasModule } from './api/finanzas/finanzas.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    TenantModule,
    WorkersModule,
    CampoModule,
    EmpaqueModule,
    InventarioModule,
    FinanzasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
