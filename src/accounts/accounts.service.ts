import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity.js';
import { CreateAccountDto } from './dto/create-account.dto.js';
import { UpdateAccountDto } from './dto/update-account.dto.js';
import { User } from '../users/entities/user.entity.js';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<Account[]> {
    return this.accountsRepository.find({
      relations: { user: true, transactions: true },
    });
  }

  async findById(id: string): Promise<Account> {
    const account = await this.accountsRepository.findOne({
      where: { id },
      relations: { user: true, transactions: true },
    });
    if (!account) throw new NotFoundException(`Account dengan id ${id} tidak ditemukan`);
    return account;
  }

  async create(input: CreateAccountDto): Promise<Account> {
    const user = await this.usersRepository.findOne({
      where: { id: input.userId },
    });
    if (!user) throw new NotFoundException(`User dengan id ${input.userId} tidak ditemukan`);

    const account = this.accountsRepository.create({
      name: input.name,
      type: input.type,
      balance: input.balance ?? 0,
      user: { id: input.userId },
    });
    return this.accountsRepository.save(account);
  }

  async update(id: string, input: UpdateAccountDto): Promise<Account> {
    const account = await this.findById(id);

    if (input.userId) {
      const user = await this.usersRepository.findOne({
        where: { id: input.userId },
      });
      if (!user) throw new NotFoundException(`User dengan id ${input.userId} tidak ditemukan`);
      account.user = { id: input.userId };
    }

    if (input.name) account.name = input.name;
    if (input.type) account.type = input.type;
    if (input.balance !== undefined) account.balance = input.balance;

    return this.accountsRepository.save(account);
  }

  async remove(id: string): Promise<boolean> {
    const account = await this.findById(id);
    await this.accountsRepository.remove(account);
    return true;
  }
}