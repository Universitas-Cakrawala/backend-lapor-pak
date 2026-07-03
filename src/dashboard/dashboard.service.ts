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
    // Generate 8 weeks period
    const weeks: WeeklyReportItemDto[] = [];
    const now = new Date();

    // We want to calculate from the beginning of the week (e.g., Monday)
    // To make it simpler, we just use rolling 7-day intervals backwards
    for (let i = 7; i >= 0; i--) {
      const end = new Date(now);
      end.setDate(now.getDate() - i * 7);
      end.setHours(23, 59, 59, 999);

      const start = new Date(end);
      start.setDate(end.getDate() - 6);
      start.setHours(0, 0, 0, 0);

      // Format label: "DD MMM - DD MMM"
      const startLabel = start.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
      });
      const endLabel = end.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
      });

      weeks.push({
        weekStart: start.toISOString(),
        weekEnd: end.toISOString(),
        label: `${startLabel} - ${endLabel}`,
        count: 0,
      });
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
