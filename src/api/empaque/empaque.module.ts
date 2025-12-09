import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { EmpaqueController } from './empaque.controller';
import { EmpaqueService } from './empaque.service';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [EmpaqueController],
  providers: [EmpaqueService],
  exports: [EmpaqueService],
})
export class EmpaqueModule {}
