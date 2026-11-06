import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

const VALID_TRANSACTION_TYPES = ['INCOME', 'EXPENSE'] as const;

export class CreateTransactionDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsNotEmpty()
  @IsString()
  @IsIn(VALID_TRANSACTION_TYPES, {
    message: `Tipe transaksi harus salah satu dari: ${VALID_TRANSACTION_TYPES.join(', ')}`,
  })
  type: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  transactionDate?: string;

  @IsNotEmpty()
  @IsUUID()
  accountId: string;

  @IsNotEmpty()
  @IsUUID()
  categoryId: string;
}