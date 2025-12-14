import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EncryptionKey } from '../entities/encryption-key.entity';
import { CreateEncryptionKeyDto, UpdateEncryptionKeyDto } from '../dto';

@Injectable()
export class EncryptionKeysService {
  constructor(
    @InjectRepository(EncryptionKey)
    private encryptionKeysRepository: Repository<EncryptionKey>,
  ) {}

  async create(createDto: CreateEncryptionKeyDto & { companyId: string }): Promise<EncryptionKey> {
    const key = this.encryptionKeysRepository.create(createDto);
    return this.encryptionKeysRepository.save(key);
  }

  async findByCompany(companyId: string): Promise<EncryptionKey[]> {
    return this.encryptionKeysRepository.find({ where: { companyId }, order: { createdAt: 'DESC' } });
  }

  async findActiveKey(companyId: string, keyName: string): Promise<EncryptionKey> {
    const key = await this.encryptionKeysRepository.findOne({ 
      where: { companyId, keyName, isActive: true },
      order: { keyVersion: 'DESC' }
    });
    if (!key) {
      throw new NotFoundException('Active encryption key not found');
    }
    return key;
  }

  async update(id: string, updateDto: UpdateEncryptionKeyDto): Promise<EncryptionKey> {
    const result = await this.encryptionKeysRepository.update(id, updateDto);
    if (result.affected === 0) {
      throw new NotFoundException('Encryption key not found');
    }
    const key = await this.encryptionKeysRepository.findOne({ where: { id } });
    if (!key) {
      throw new NotFoundException('Encryption key not found');
    }
    return key;
  }

  async rotateKey(companyId: string, keyName: string, newEncryptedKey: string): Promise<EncryptionKey> {
    await this.encryptionKeysRepository.update({ companyId, keyName, isActive: true }, { isActive: false, rotatedAt: new Date() });
    const latestKey = await this.encryptionKeysRepository.findOne({ 
      where: { companyId, keyName },
      order: { keyVersion: 'DESC' }
    });
    const newVersion = latestKey ? latestKey.keyVersion + 1 : 1;
    return this.create({ companyId, keyName, encryptedKey: newEncryptedKey, keyVersion: newVersion, isActive: true });
  }
}
