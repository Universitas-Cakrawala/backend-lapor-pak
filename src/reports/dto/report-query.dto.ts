import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ReportStatus } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ReportQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter berdasarkan status laporan',
    enum: ReportStatus,
  })
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @ApiPropertyOptional({
    description: 'Pencarian berdasarkan nama jalan atau deskripsi',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
