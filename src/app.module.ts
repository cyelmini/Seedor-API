import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './api/auth/auth.module';
import { TenantModule } from './api/tenant/tenant.module';
import { WorkersModule } from './api/workers/workers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    TenantModule,
    WorkersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
