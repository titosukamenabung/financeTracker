import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

const VALID_ACCOUNT_TYPES = ['BANK', 'WALLET', 'E_WALLET', 'SAVINGS'] as const;

export class CreateAccountDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(VALID_ACCOUNT_TYPES, {
    message: `Tipe akun harus salah satu dari: ${VALID_ACCOUNT_TYPES.join(', ')}`,
  })
  type: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  balance?: number;

  @IsNotEmpty()
  @IsUUID()
  userId: string;
}