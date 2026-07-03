import { Controller, Get, Param, UseGuards, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Role } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Mendapatkan profil user yang sedang login' })
  @ApiResponse({
    status: 200,
    description: 'Profil berhasil diambil',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyProfile(@GetUser() user: any) {
    const userProfile = await this.usersService.findById(user.id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Profil berhasil diambil',
      data: userProfile,
    };
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get(':id')
  @ApiOperation({ summary: 'Mendapatkan detail user tertentu (khusus ADMIN)' })
  @ApiParam({ name: 'id', description: 'ID User' })
  @ApiResponse({
    status: 200,
    description: 'Data user berhasil diambil',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Hanya ADMIN yang dapat mengakses',
  })
  @ApiResponse({ status: 404, description: 'User tidak ditemukan' })
  async getUserById(@Param('id') id: string) {
    const userProfile = await this.usersService.findById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Data user berhasil diambil',
      data: userProfile,
    };
  }
}
