import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Username untuk login',
    example: 'johndoe',
    minLength: 3,
    maxLength: 30,
  })
  @IsString({ message: 'Username harus berupa teks' })
  @IsNotEmpty({ message: 'Username tidak boleh kosong' })
  @MinLength(3, { message: 'Username minimal 3 karakter' })
  @MaxLength(30, { message: 'Username maksimal 30 karakter' })
  username: string;

  @ApiProperty({ description: 'Nama lengkap pelapor', example: 'John Doe' })
  @IsString({ message: 'Nama lengkap harus berupa teks' })
  @IsNotEmpty({ message: 'Nama lengkap tidak boleh kosong' })
  fullName: string;

  @ApiProperty({ description: 'Email pelapor', example: 'john@example.com' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  email: string;

  @ApiProperty({ description: 'Nomor telepon pelapor', example: '08123456789' })
  @IsString({ message: 'Nomor telepon harus berupa teks' })
  @IsNotEmpty({ message: 'Nomor telepon tidak boleh kosong' })
  phone: string;

  @ApiProperty({
    description: 'Password akun',
    example: 'secret123',
    minLength: 8,
  })
  @IsString({ message: 'Password harus berupa teks' })
  @IsNotEmpty({ message: 'Password tidak boleh kosong' })
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  password: string;

  @ApiProperty({ description: 'Konfirmasi password', example: 'secret123' })
  @IsString({ message: 'Konfirmasi password harus berupa teks' })
  @IsNotEmpty({ message: 'Konfirmasi password tidak boleh kosong' })
  rePassword: string;
}
