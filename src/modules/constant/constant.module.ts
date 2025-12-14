import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConstantService } from './services/constant.service';
import { ConstantController } from './controllers/constant.controller';
import { Constant } from './entities/constant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Constant])],
  controllers: [ConstantController],
  providers: [ConstantService],
  exports: [ConstantService],
})
export class ConstantModule {}