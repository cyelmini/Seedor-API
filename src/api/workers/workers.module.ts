import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { WorkersController } from './workers.controller';
import { WorkersService } from './workers.service';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [WorkersController],
  providers: [WorkersService],
  exports: [WorkersService],
})
export class WorkersModule {}
