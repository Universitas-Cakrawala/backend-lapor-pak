import { ApiProperty } from '@nestjs/swagger';

export class DashboardStatsDto {
  @ApiProperty({ description: 'Total seluruh laporan' })
  totalLaporan: number;

  @ApiProperty({ description: 'Total laporan berstatus MENUNGGU' })
  menunggu: number;

  @ApiProperty({ description: 'Total laporan berstatus DIPROSES' })
  diproses: number;

  @ApiProperty({ description: 'Total laporan berstatus SELESAI' })
  selesai: number;
}
