import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  SEND = 'send',
  PAY = 'pay'
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @Column({ name: 'actor_user_id', nullable: true })
  actorUserId: string;

  @Column({ length: 120 })
  action: string;

  @Column({ length: 60 })
  entity: string;

  @Column({ name: 'entity_id', nullable: true })
  entityId: string;

  @Column({ type: 'jsonb', nullable: true })
  before: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  after: Record<string, unknown>;

  @Column({ length: 64, nullable: true })
  ip: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne('Company')
  @JoinColumn({ name: 'company_id' })
  company: unknown;

  @ManyToOne('User', 'auditLogs')
  @JoinColumn({ name: 'actor_user_id' })
  actorUser: unknown;
}