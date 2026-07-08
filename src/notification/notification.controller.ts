import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Mendapatkan daftar notifikasi user' })
  async findAll(@GetUser() user: any) {
    const notifications = await this.notificationService.getUserNotifications(
      user.id,
    );
    return {
      statusCode: 200,
      message: 'Notifikasi berhasil diambil',
      data: notifications,
    };
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Menandai semua notifikasi sebagai telah dibaca' })
  async markAllAsRead(@GetUser() user: any) {
    await this.notificationService.markAllAsRead(user.id);
    return {
      statusCode: 200,
      message: 'Semua notifikasi ditandai sebagai telah dibaca',
    };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Menandai notifikasi sebagai telah dibaca' })
  async markAsRead(@Param('id') id: string, @GetUser() user: any) {
    await this.notificationService.markAsRead(id, user.id);
    return {
      statusCode: 200,
      message: 'Notifikasi ditandai sebagai telah dibaca',
    };
  }
}
