import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EncryptionKeysService } from './services/encryption-keys.service';
import { EncryptionKeysController } from './controllers/encryption-keys.controller';
import { EncryptionKey } from './entities/encryption-key.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EncryptionKey])],
  controllers: [EncryptionKeysController],
  providers: [EncryptionKeysService],
  exports: [EncryptionKeysService],
})
export class EncryptionKeysModule {}
