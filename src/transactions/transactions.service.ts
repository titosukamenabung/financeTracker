import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity.js';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { UpdateTransactionDto } from './dto/update-transaction.dto.js';
import { Account } from '../accounts/entities/account.entity.js';
import { Category } from '../categories/entities/category.entity.js';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  findAll(): Promise<Transaction[]> {
    return this.transactionsRepository.find({
      relations: { account: true, category: true },
    });
  }

  async findById(id: string): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOne({
      where: { id },
      relations: { account: true, category: true },
    });
    if (!transaction) throw new NotFoundException(`Transaction dengan id ${id} tidak ditemukan`);
    return transaction;
  }

  async create(input: CreateTransactionDto): Promise<Transaction> {
    const account = await this.accountsRepository.findOne({
      where: { id: input.accountId },
    });
    if (!account) throw new NotFoundException(`Account dengan id ${input.accountId} tidak ditemukan`);

    const category = await this.categoriesRepository.findOne({
      where: { id: input.categoryId },
    });
    if (!category) throw new NotFoundException(`Category dengan id ${input.categoryId} tidak ditemukan`);

    const transaction = this.transactionsRepository.create({
      amount: input.amount,
      type: input.type,
      description: input.description,
      transactionDate: input.transactionDate ? new Date(input.transactionDate) : new Date(),
      account: { id: input.accountId },
      category: { id: input.categoryId },
    });

    return this.transactionsRepository.save(transaction);
  }

  async update(id: string, input: UpdateTransactionDto): Promise<Transaction> {
    const transaction = await this.findById(id);

    if (input.accountId) {
      const account = await this.accountsRepository.findOne({
        where: { id: input.accountId },
      });
      if (!account) throw new NotFoundException(`Account dengan id ${input.accountId} tidak ditemukan`);
      transaction.account = { id: input.accountId };
    }

    if (input.categoryId) {
      const category = await this.categoriesRepository.findOne({
        where: { id: input.categoryId },
      });
      if (!category) throw new NotFoundException(`Category dengan id ${input.categoryId} tidak ditemukan`);
      transaction.category = { id: input.categoryId };
    }

    if (input.amount !== undefined) transaction.amount = input.amount;
    if (input.type) transaction.type = input.type;
    if (input.description !== undefined) transaction.description = input.description;
    if (input.transactionDate) transaction.transactionDate = new Date(input.transactionDate);

    return this.transactionsRepository.save(transaction);
  }

  async remove(id: string): Promise<boolean> {
    const transaction = await this.findById(id);
    await this.transactionsRepository.remove(transaction);
    return true;
  }
}