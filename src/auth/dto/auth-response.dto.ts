import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UserPayloadDto {
  @ApiProperty({ description: 'ID User' })
  id: string;

  @ApiProperty({ description: 'Username pengguna' })
  username: string;

  @ApiProperty({ description: 'Nama lengkap' })
  fullName: string;

  @ApiProperty({ description: 'Email' })
  email: string;

  @ApiProperty({ description: 'Nomor telepon' })
  phone: string;

  @ApiProperty({ description: 'Role pengguna', enum: Role })
  role: Role;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'JWT Access Token' })
  accessToken: string;

  @ApiProperty({ description: 'Data user yang sedang login' })
  user: UserPayloadDto;
}
