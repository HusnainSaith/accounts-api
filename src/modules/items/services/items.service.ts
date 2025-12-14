import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Item } from '../entities/item.entity';
import { Company } from '../../companies/entities/company.entity';
import { CreateItemDto, UpdateItemDto } from '../dto';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private itemsRepository: Repository<Item>,
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
  ) {}

  async create(createItemDto: CreateItemDto, companyId: string): Promise<Item> {
    // Generate item code if not provided
    if (!createItemDto.itemCode) {
      createItemDto.itemCode = await this.generateItemCode(companyId);
    }
    
    const item = this.itemsRepository.create({ ...createItemDto, companyId });
    return this.itemsRepository.save(item);
  }

  private async generateItemCode(companyId: string): Promise<string> {
    // Get company name
    const company = await this.companiesRepository.findOne({
      where: { id: companyId }
    });
    
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Get first 3 characters of company name (uppercase)
    const prefix = company.name.substring(0, 3).toUpperCase().padEnd(3, 'A');
    
    // Get next sequence number for this company
    const lastItem = await this.itemsRepository.findOne({
      where: { companyId },
      order: { createdAt: 'DESC' }
    });

    let sequence = 1;
    if (lastItem?.itemCode) {
      // Extract number from last item code (format: AAA-00-000)
      const match = lastItem.itemCode.match(/-(\d+)-(\d+)$/);
      if (match) {
        const lastNumber = parseInt(match[2]);
        sequence = lastNumber + 1;
      }
    }

    // Format: AAA-00-000
    const category = '00'; // Default category, can be customized later
    const sequenceStr = sequence.toString().padStart(3, '0');
    
    return `${prefix}-${category}-${sequenceStr}`;
  }

  async findAll(companyId: string, search?: string): Promise<Item[]> {
    const where: FindOptionsWhere<Item> = { companyId, isActive: true };

    if (search) {
      where.nameEn = Like(`%${search}%`);
    }

    return this.itemsRepository.find({
      where,
      order: { nameEn: 'ASC' },
    });
  }

  async findOne(id: string, companyId: string): Promise<Item> {
    const item = await this.itemsRepository.findOne({
      where: { id, companyId },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    return item;
  }

  async update(
    id: string,
    updateItemDto: UpdateItemDto,
    companyId: string,
  ): Promise<Item> {
    await this.itemsRepository.update({ id, companyId }, updateItemDto);
    return this.findOne(id, companyId);
  }

  async remove(id: string, companyId: string): Promise<void> {
    const result = await this.itemsRepository.update(
      { id, companyId },
      { isActive: false },
    );

    if (result.affected === 0) {
      throw new NotFoundException('Item not found');
    }
  }

  async getStatistics(companyId: string): Promise<any> {
    const [total, active] = await Promise.all([
      this.itemsRepository.count({ where: { companyId } }),
      this.itemsRepository.count({ where: { companyId, isActive: true } }),
    ]);

    return { total, active, inactive: total - active };
  }

  async getAISuggestions(companyId: string, query: string): Promise<Item[]> {
    return this.itemsRepository.find({
      where: {
        companyId,
        aiSuggested: true,
        isActive: true,
        nameEn: Like(`%${query}%`),
      },
      take: 10,
    });
  }
}