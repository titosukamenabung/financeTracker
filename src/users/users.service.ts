import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: { accounts: true, budgets: true },
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: { accounts: true, budgets: true },
    });
    if (!user) throw new NotFoundException(`User dengan id ${id} tidak ditemukan`);
    return user;
  }

  async create(input: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: input.email },
    });
    if (existingUser) {
      throw new ConflictException(`User dengan email "${input.email}" sudah terdaftar`);
    }

    const user = this.usersRepository.create(input);
    return this.usersRepository.save(user);
  }

  async update(id: string, input: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    if (input.email && input.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: input.email },
      });
      if (existingUser) {
        throw new ConflictException(`User dengan email "${input.email}" sudah terdaftar`);
      }
    }

    Object.assign(user, input);
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<boolean> {
    const user = await this.findById(id);
    await this.usersRepository.remove(user);
    return true;
  }
}