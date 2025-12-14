import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Constant } from '../entities/constant.entity';
import { CreateConstantDto, UpdateConstantDto } from '../dto';

@Injectable()
export class ConstantService {
  constructor(
    @InjectRepository(Constant)
    private constantRepository: Repository<Constant>,
  ) {}

  async create(companyId: string, createConstantDto: CreateConstantDto): Promise<Constant> {
    const constant = this.constantRepository.create({
      ...createConstantDto,
      companyId,
    });
    return this.constantRepository.save(constant);
  }

  async findAll(companyId: string): Promise<Constant[]> {
    return this.constantRepository.find({
      where: { companyId },
      order: { name: 'ASC' },
    });
  }

  async findByType(companyId: string, type: string): Promise<Constant[]> {
    return this.constantRepository.find({
      where: [
        { companyId, type: type as any },
        { companyId, type: 'both' },
      ],
      order: { name: 'ASC' },
    });
  }

  async findOne(companyId: string, id: string): Promise<Constant> {
    const constant = await this.constantRepository.findOne({
      where: { id, companyId },
    });
    if (!constant) {
      throw new NotFoundException(`Constant with ID ${id} not found`);
    }
    return constant;
  }

  async update(companyId: string, id: string, updateConstantDto: UpdateConstantDto): Promise<Constant> {
    const constant = await this.findOne(companyId, id);
    Object.assign(constant, updateConstantDto);
    return this.constantRepository.save(constant);
  }

  async remove(companyId: string, id: string): Promise<void> {
    const constant = await this.findOne(companyId, id);
    await this.constantRepository.remove(constant);
  }
}