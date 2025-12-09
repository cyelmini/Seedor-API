import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { CampoController } from './campo.controller';
import { CampoService } from './campo.service';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [CampoController],
  providers: [CampoService],
  exports: [CampoService],
})
export class CampoModule {}
