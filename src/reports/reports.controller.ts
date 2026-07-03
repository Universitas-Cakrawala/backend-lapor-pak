import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query, HttpStatus } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportQueryDto } from './dto/report-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReportResponseDto } from './dto/report-response.dto';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Membuat laporan baru' })
  @ApiResponse({ status: 201, description: 'Laporan berhasil dibuat', type: ReportResponseDto })
  async create(@GetUser() user: any, @Body() createReportDto: CreateReportDto) {
    const report = await this.reportsService.create(user.id, createReportDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Laporan berhasil dibuat',
      data: report,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Mendapatkan daftar laporan (dengan filter & pagination)' })
  @ApiResponse({ status: 200, description: 'Daftar laporan' })
  async findAll(@GetUser() user: any, @Query() query: ReportQueryDto) {
    const result = await this.reportsService.findAll(user.id, user.role, query);
    return {
      statusCode: HttpStatus.OK,
      message: 'Daftar laporan berhasil diambil',
      ...result,
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Mendapatkan statistik laporan (mini-stats untuk Home)' })
  @ApiResponse({ status: 200, description: 'Statistik laporan' })
  async getStats(@GetUser() user: any) {
    const stats = await this.reportsService.getUserStats(user.id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Statistik laporan berhasil diambil',
      data: stats,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mendapatkan detail laporan' })
  @ApiResponse({ status: 200, description: 'Detail laporan', type: ReportResponseDto })
  async findOne(@Param('id') id: string, @GetUser() user: any) {
    const report = await this.reportsService.findById(id, user.id, user.role);
    return {
      statusCode: HttpStatus.OK,
      message: 'Detail laporan berhasil diambil',
      data: report,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mengedit laporan' })
  @ApiResponse({ status: 200, description: 'Laporan berhasil diperbarui', type: ReportResponseDto })
  async update(
    @Param('id') id: string,
    @GetUser() user: any,
    @Body() updateReportDto: UpdateReportDto,
  ) {
    const report = await this.reportsService.update(id, user.id, updateReportDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Laporan berhasil diperbarui',
      data: report,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Membatalkan / menghapus laporan' })
  @ApiResponse({ status: 200, description: 'Laporan berhasil dibatalkan' })
  async remove(@Param('id') id: string, @GetUser() user: any) {
    await this.reportsService.remove(id, user.id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Laporan berhasil dibatalkan',
    };
  }
}
