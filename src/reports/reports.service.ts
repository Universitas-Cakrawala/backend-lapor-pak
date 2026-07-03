import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportQueryDto } from './dto/report-query.dto';
import { ReportStatus, Role, Prisma } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { ReportResponseDto } from './dto/report-response.dto';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateReportDto) {
    const report = await this.prisma.report.create({
      data: {
        userId,
        roadName: dto.roadName,
        description: dto.description,
        latitude: dto.latitude,
        longitude: dto.longitude,
        photoUrls: dto.photoUrls,
        videoUrl: dto.videoUrl,
        status: ReportStatus.MENUNGGU,
        history: {
          create: {
            status: ReportStatus.MENUNGGU,
            note: 'Laporan baru diajukan',
          },
        },
      },
      include: {
        user: { select: { id: true, fullName: true, phone: true } },
        history: { orderBy: { timestamp: 'asc' } },
      },
    });

    return plainToInstance(ReportResponseDto, report, { excludeExtraneousValues: true });
  }

  async findAll(userId: string, role: Role, query: ReportQueryDto) {
    const { page = 1, limit = 10, status, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ReportWhereInput = {};

    // 1 & 2. Role-based filtering
    if (role === Role.PELAPOR) {
      where.userId = userId;
    }

    // 3. Status filter
    if (status) {
      where.status = status;
    }

    // 4. Search filter
    if (search) {
      where.OR = [
        { roadName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, fullName: true, phone: true } },
        },
      }),
      this.prisma.report.count({ where }),
    ]);

    const data = plainToInstance(ReportResponseDto, reports, { excludeExtraneousValues: true });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string, userId: string, role: Role) {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, fullName: true, phone: true, email: true } },
        history: {
          orderBy: { timestamp: 'asc' },
          include: {
            changedBy: { select: { id: true, fullName: true } },
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException('Laporan tidak ditemukan');
    }

    if (role === Role.PELAPOR && report.userId !== userId) {
      throw new ForbiddenException('Anda tidak memiliki akses ke laporan ini');
    }

    return plainToInstance(ReportResponseDto, report, { excludeExtraneousValues: true });
  }

  async update(id: string, userId: string, dto: UpdateReportDto) {
    const report = await this.prisma.report.findUnique({ where: { id } });

    if (!report) {
      throw new NotFoundException('Laporan tidak ditemukan');
    }

    if (report.userId !== userId) {
      throw new ForbiddenException('Anda bukan pemilik laporan ini');
    }

    if (report.status !== ReportStatus.MENUNGGU) {
      throw new BadRequestException('Laporan hanya bisa diedit saat status Menunggu');
    }

    const updated = await this.prisma.report.update({
      where: { id },
      data: {
        roadName: dto.roadName,
        description: dto.description,
        latitude: dto.latitude,
        longitude: dto.longitude,
        photoUrls: dto.photoUrls,
        videoUrl: dto.videoUrl,
      },
      include: {
        user: { select: { id: true, fullName: true, phone: true } },
        history: { orderBy: { timestamp: 'asc' } },
      },
    });

    return plainToInstance(ReportResponseDto, updated, { excludeExtraneousValues: true });
  }

  async remove(id: string, userId: string) {
    const report = await this.prisma.report.findUnique({ where: { id } });

    if (!report) {
      throw new NotFoundException('Laporan tidak ditemukan');
    }

    if (report.userId !== userId) {
      throw new ForbiddenException('Anda bukan pemilik laporan ini');
    }

    if (report.status !== ReportStatus.MENUNGGU) {
      throw new BadRequestException('Laporan hanya bisa dibatalkan saat status Menunggu');
    }

    // Prisma transactional delete due to foreign keys (or use cascade if configured, but explicit is safer here if schema doesn't have onDelete: Cascade)
    await this.prisma.$transaction([
      this.prisma.statusHistory.deleteMany({ where: { reportId: id } }),
      this.prisma.report.delete({ where: { id } }),
    ]);

    return { message: 'Laporan berhasil dibatalkan' };
  }

  async getUserStats(userId: string) {
    const [total, menunggu, diproses, selesai] = await Promise.all([
      this.prisma.report.count({ where: { userId } }),
      this.prisma.report.count({ where: { userId, status: ReportStatus.MENUNGGU } }),
      this.prisma.report.count({ where: { userId, status: ReportStatus.DIPROSES } }),
      this.prisma.report.count({ where: { userId, status: ReportStatus.SELESAI } }),
    ]);

    return { total, menunggu, diproses, selesai };
  }
}
