import {
  Controller,
  Patch,
  Param,
  Body,
  UseGuards,
  Get,
  HttpStatus,
} from '@nestjs/common';
import { StatusService } from './status.service';
import { UpdateStatusDto } from './dto/update-status.dto';
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
} from '@nestjs/swagger';
import { StatusHistoryResponseDto } from './dto/status-history-response.dto';

@ApiTags('status')
@ApiBearerAuth()
@Controller()
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Patch('admin/reports/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update status laporan (Khusus ADMIN)' })
  @ApiResponse({
    status: 200,
    description: 'Status laporan berhasil diperbarui',
  })
  async updateStatus(
    @Param('id') id: string,
    @GetUser() admin: any,
    @Body() dto: UpdateStatusDto,
  ) {
    const report = await this.statusService.updateStatus(id, admin.id, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Status laporan berhasil diperbarui',
      data: report,
    };
  }

  @Get('reports/:id/history')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mendapatkan riwayat status laporan' })
  @ApiResponse({
    status: 200,
    description: 'Riwayat status',
    type: [StatusHistoryResponseDto],
  })
  async getHistory(@Param('id') id: string) {
    const history = await this.statusService.getHistory(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Riwayat status laporan',
      data: history,
    };
  }
}
