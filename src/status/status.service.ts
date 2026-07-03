import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateStatusDto } from './dto/update-status.dto';
import { NotificationService } from '../notification/notification.service';
import { ReportStatus } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { StatusHistoryResponseDto } from './dto/status-history-response.dto';
import { ReportResponseDto } from '../reports/dto/report-response.dto';

@Injectable()
export class StatusService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async updateStatus(reportId: string, adminId: string, dto: UpdateStatusDto) {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
      include: { user: true },
    });

    if (!report) {
      throw new NotFoundException('Laporan tidak ditemukan');
    }

    const currentStatus = report.status;
    const newStatus = dto.status;

    // Validate state machine transitions
    if (currentStatus === ReportStatus.SELESAI) {
      throw new BadRequestException(
        'Transisi status tidak valid: laporan sudah SELESAI',
      );
    }
    if (
      currentStatus === ReportStatus.DIPROSES &&
      newStatus === ReportStatus.MENUNGGU
    ) {
      throw new BadRequestException(
        'Transisi status tidak valid: DIPROSES ke MENUNGGU',
      );
    }
    if (
      currentStatus === ReportStatus.MENUNGGU &&
      newStatus === ReportStatus.SELESAI
    ) {
      throw new BadRequestException(
        'Transisi status tidak valid: tidak bisa langsung SELESAI dari MENUNGGU',
      );
    }

    // Execute update inside a transaction to ensure atomicity
    const updatedReport = await this.prisma.$transaction(async (prisma) => {
      const updated = await prisma.report.update({
        where: { id: reportId },
        data: { status: newStatus },
        include: {
          user: { select: { id: true, fullName: true, phone: true } },
          history: {
            orderBy: { timestamp: 'asc' },
            include: { changedBy: { select: { id: true, fullName: true } } },
          },
        },
      });

      await prisma.statusHistory.create({
        data: {
          reportId,
          status: newStatus,
          note: dto.note,
          proofPhotoUrl: dto.proofPhotoUrl,
          changedById: adminId,
        },
      });

      // refetch history to include the newly created one
      const finalReport = await prisma.report.findUnique({
        where: { id: reportId },
        include: {
          user: { select: { id: true, fullName: true, phone: true } },
          history: {
            orderBy: { timestamp: 'asc' },
            include: { changedBy: { select: { id: true, fullName: true } } },
          },
        },
      });

      return finalReport;
    });

    // Fire & forget push notification
    this.notificationService.sendStatusChangeNotification(
      report.user.fcmToken,
      reportId,
      newStatus,
      report.roadName,
    );

    return plainToInstance(ReportResponseDto, updatedReport, {
      excludeExtraneousValues: true,
    });
  }

  async getHistory(reportId: string) {
    const history = await this.prisma.statusHistory.findMany({
      where: { reportId },
      include: {
        changedBy: { select: { id: true, fullName: true } },
      },
      orderBy: { timestamp: 'asc' },
    });

    return plainToInstance(StatusHistoryResponseDto, history, {
      excludeExtraneousValues: true,
    });
  }
}
