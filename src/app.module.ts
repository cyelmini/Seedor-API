import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './api/auth/auth.module';
import { TenantModule } from './api/tenant/tenant.module';
import { WorkersModule } from './api/workers/workers.module';
import { CampoModule } from './api/campo/campo.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    TenantModule,
    WorkersModule,
    CampoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
