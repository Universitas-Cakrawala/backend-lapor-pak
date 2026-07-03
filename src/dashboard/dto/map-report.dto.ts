import { ApiProperty } from '@nestjs/swagger';
import { ReportStatus } from '@prisma/client';

export class MapReportDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  roadName: string;

  @ApiProperty()
  latitude: number;

  @ApiProperty()
  longitude: number;

  @ApiProperty({ enum: ReportStatus })
  status: ReportStatus;

  @ApiProperty()
  createdAt: Date;
}
