import { Controller, Get, UseGuards, HttpStatus } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { WeeklyReportDto } from './dto/weekly-report.dto';
import { MapReportDto } from './dto/map-report.dto';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({
    summary: 'Mendapatkan statistik dashboard (total & distribusi status)',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistik dashboard',
    type: DashboardStatsDto,
  })
  async getStats() {
    const stats = await this.dashboardService.getStats();
    return {
      statusCode: HttpStatus.OK,
      message: 'Statistik dashboard',
      data: stats,
    };
  }

  @Get('weekly')
  @ApiOperation({
    summary: 'Mendapatkan grafik laporan mingguan (8 minggu terakhir)',
  })
  @ApiResponse({
    status: 200,
    description: 'Grafik laporan mingguan',
    type: WeeklyReportDto,
  })
  async getWeeklyReports() {
    const weeklyData = await this.dashboardService.getWeeklyReports();
    return {
      statusCode: HttpStatus.OK,
      message: 'Grafik laporan mingguan',
      data: weeklyData,
    };
  }

  @Get('map')
  @ApiOperation({ summary: 'Mendapatkan data peta laporan dengan koordinat' })
  @ApiResponse({
    status: 200,
    description: 'Data peta laporan',
    type: [MapReportDto],
  })
  async getMapReports() {
    const mapData = await this.dashboardService.getMapReports();
    return {
      statusCode: HttpStatus.OK,
      message: 'Data peta laporan',
      data: mapData,
    };
  }
}
