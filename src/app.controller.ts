import { Controller, Get, HttpStatus } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async getHealth() {
    let databaseStatus = 'disconnected';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      databaseStatus = 'connected';
    } catch (e) {
      databaseStatus = 'disconnected';
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: databaseStatus,
      },
    };
  }
}
