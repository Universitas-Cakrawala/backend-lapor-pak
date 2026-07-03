import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportStatus } from '@prisma/client';

export class UpdateStatusDto {
  @ApiProperty({
    description: 'Status baru laporan (DIPROSES atau SELESAI)',
    enum: ReportStatus,
    example: ReportStatus.DIPROSES,
  })
  @IsNotEmpty({ message: 'Status tidak boleh kosong' })
  @IsEnum(ReportStatus, { message: 'Status tidak valid' })
  status: ReportStatus;

  @ApiPropertyOptional({
    description: 'Catatan admin mengenai perubahan status',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Catatan maksimal 500 karakter' })
  note?: string;

  @ApiPropertyOptional({
    description: 'URL foto bukti (wajib jika status SELESAI)',
  })
  @IsOptional()
  @IsString()
  proofPhotoUrl?: string;
}
