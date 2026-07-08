import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportStatus } from '@prisma/client';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { WeeklyReportDto, WeeklyReportItemDto } from './dto/weekly-report.dto';
import { MapReportDto } from './dto/map-report.dto';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(): Promise<DashboardStatsDto> {
    const [totalLaporan, menunggu, diproses, selesai] = await Promise.all([
      this.prisma.report.count(),
      this.prisma.report.count({ where: { status: ReportStatus.MENUNGGU } }),
      this.prisma.report.count({ where: { status: ReportStatus.DIPROSES } }),
      this.prisma.report.count({ where: { status: ReportStatus.SELESAI } }),
    ]);

    return { totalLaporan, menunggu, diproses, selesai };
  }

  async getWeeklyReports(): Promise<WeeklyReportDto> {
    const weeks: WeeklyReportItemDto[] = [];
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // Get last day of the current month
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    
    let currentStart = 1;
    while (currentStart <= lastDayOfMonth) {
      let currentEnd = currentStart + 6;
      if (currentEnd > lastDayOfMonth) {
        currentEnd = lastDayOfMonth;
      }
      
      const startDate = new Date(year, month, currentStart, 0, 0, 0, 0);
      const endDate = new Date(year, month, currentEnd, 23, 59, 59, 999);
      
      const startLabel = startDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      const endLabel = endDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      
      weeks.push({
        weekStart: startDate.toISOString(),
        weekEnd: endDate.toISOString(),
        label: `${startLabel} - ${endLabel}`,
        count: 0,
      });
      
      currentStart = currentEnd + 1;
    }

    const startDate = new Date(weeks[0].weekStart);

    // Fetch reports created in the last 8 weeks
    const reports = await this.prisma.report.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        createdAt: true,
      },
    });

    // Populate count per week
    for (const report of reports) {
      for (const week of weeks) {
        const reportDate = new Date(report.createdAt).getTime();
        const start = new Date(week.weekStart).getTime();
        const end = new Date(week.weekEnd).getTime();

        if (reportDate >= start && reportDate <= end) {
          week.count++;
          break;
        }
      }
    }

    return { weeks };
  }

  async getMapReports(): Promise<MapReportDto[]> {
    // Fetch SEMUA laporan untuk data historis dan aktif di peta
    const reports = await this.prisma.report.findMany({
      select: {
        id: true,
        roadName: true,
        latitude: true,
        longitude: true,
        status: true,
        createdAt: true,
      },
    });

    return reports;
  }
}
