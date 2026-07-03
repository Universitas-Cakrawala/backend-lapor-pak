import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

@Exclude()
export class UserResponseDto {
  @Expose()
  @ApiProperty({ description: 'ID User' })
  id: string;

  @Expose()
  @ApiProperty({ description: 'Username pengguna' })
  username: string;

  @Expose()
  @ApiProperty({ description: 'Nama lengkap' })
  fullName: string;

  @Expose()
  @ApiProperty({ description: 'Email' })
  email: string;

  @Expose()
  @ApiProperty({ description: 'Nomor telepon' })
  phone: string;

  @Expose()
  @ApiProperty({ description: 'Role pengguna', enum: Role })
  role: Role;

  @Expose()
  @ApiProperty({
    description: 'Instansi pengguna (khusus ADMIN)',
    required: false,
    nullable: true,
  })
  instansi: string | null;

  @Expose()
  @ApiProperty({ description: 'Waktu pembuatan akun' })
  createdAt: Date;
}
