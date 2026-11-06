import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

const VALID_TRANSACTION_TYPES = ['INCOME', 'EXPENSE'] as const;

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(VALID_TRANSACTION_TYPES, {
    message: `Tipe kategori harus salah satu dari: ${VALID_TRANSACTION_TYPES.join(', ')}`,
  })
  type: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;
}