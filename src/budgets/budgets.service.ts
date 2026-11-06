import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget } from './entities/budget.entity.js';
import { CreateBudgetDto } from './dto/create-budget.dto.js';
import { UpdateBudgetDto } from './dto/update-budget.dto.js';
import { User } from '../users/entities/user.entity.js';
import { Category } from '../categories/entities/category.entity.js';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(Budget)
    private readonly budgetsRepository: Repository<Budget>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  findAll(): Promise<Budget[]> {
    return this.budgetsRepository.find({
      relations: { user: true, category: true },
    });
  }

  async findById(id: string): Promise<Budget> {
    const budget = await this.budgetsRepository.findOne({
      where: { id },
      relations: { user: true, category: true },
    });
    if (!budget) throw new NotFoundException(`Budget dengan id ${id} tidak ditemukan`);
    return budget;
  }

  async create(input: CreateBudgetDto): Promise<Budget> {
    const user = await this.usersRepository.findOne({
      where: { id: input.userId },
    });
    if (!user) throw new NotFoundException(`User dengan id ${input.userId} tidak ditemukan`);

    const category = await this.categoriesRepository.findOne({
      where: { id: input.categoryId },
    });
    if (!category) throw new NotFoundException(`Category dengan id ${input.categoryId} tidak ditemukan`);

    const budget = this.budgetsRepository.create({
      amountLimit: input.amountLimit,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      user: { id: input.userId },
      category: { id: input.categoryId },
    });

    return this.budgetsRepository.save(budget);
  }

  async update(id: string, input: UpdateBudgetDto): Promise<Budget> {
    const budget = await this.findById(id);

    if (input.userId) {
      const user = await this.usersRepository.findOne({
        where: { id: input.userId },
      });
      if (!user) throw new NotFoundException(`User dengan id ${input.userId} tidak ditemukan`);
      budget.user = { id: input.userId };
    }

    if (input.categoryId) {
      const category = await this.categoriesRepository.findOne({
        where: { id: input.categoryId },
      });
      if (!category) throw new NotFoundException(`Category dengan id ${input.categoryId} tidak ditemukan`);
      budget.category = { id: input.categoryId };
    }

    if (input.amountLimit !== undefined) budget.amountLimit = input.amountLimit;
    if (input.startDate) budget.startDate = new Date(input.startDate);
    if (input.endDate) budget.endDate = new Date(input.endDate);

    return this.budgetsRepository.save(budget);
  }

  async remove(id: string): Promise<boolean> {
    const budget = await this.findById(id);
    await this.budgetsRepository.remove(budget);
    return true;
  }
}