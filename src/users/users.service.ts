import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/user-response.dto';

// Reusable select object to never fetch passwordHash
const safeUserSelect = {
  id: true,
  username: true,
  fullName: true,
  email: true,
  phone: true,
  role: true,
  instansi: true,
  createdAt: true,
  fcmToken: true,
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: safeUserSelect,
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  // Digunakan oleh AuthService jika diintegrasikan di kemudian hari
  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  // Digunakan oleh AuthService jika diintegrasikan di kemudian hari
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async updateFcmToken(id: string, fcmToken: string) {
    return this.prisma.user.update({
      where: { id },
      data: { fcmToken },
    });
  }
}
