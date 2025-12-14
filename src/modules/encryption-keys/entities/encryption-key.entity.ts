import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from '../../companies/entities/company.entity';

@Entity('encryption_keys')
export class EncryptionKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @Column({ name: 'key_name', length: 255 })
  keyName: string;

  @Column({ name: 'encrypted_key', type: 'text' })
  encryptedKey: string;

  @Column({ name: 'key_version', type: 'int', default: 1 })
  keyVersion: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'rotated_at', type: 'timestamp', nullable: true })
  rotatedAt: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;
}
