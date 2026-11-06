import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  findAll(): Promise<Category[]> {
    return this.categoriesRepository.find({
      relations: { transactions: true, budgets: true },
    });
  }

  async findById(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: { transactions: true, budgets: true },
    });
    if (!category) throw new NotFoundException(`Category dengan id ${id} tidak ditemukan`);
    return category;
  }

  async create(input: CreateCategoryDto): Promise<Category> {
    const category = this.categoriesRepository.create(input);
    return this.categoriesRepository.save(category);
  }

  async update(id: string, input: UpdateCategoryDto): Promise<Category> {
    const category = await this.findById(id);
    Object.assign(category, input);
    return this.categoriesRepository.save(category);
  }

  async remove(id: string): Promise<boolean> {
    const category = await this.findById(id);
    await this.categoriesRepository.remove(category);
    return true;
  }
}