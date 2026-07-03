import { ApiProperty } from '@nestjs/swagger';

export class WeeklyReportItemDto {
  @ApiProperty({ description: 'Tanggal awal minggu (ISO String)' })
  weekStart: string;

  @ApiProperty({ description: 'Tanggal akhir minggu (ISO String)' })
  weekEnd: string;

  @ApiProperty({
    description: 'Label untuk ditampilkan di grafik (mis: 23 Jun - 29 Jun)',
  })
  label: string;

  @ApiProperty({ description: 'Jumlah laporan pada minggu ini' })
  count: number;
}

export class WeeklyReportDto {
  @ApiProperty({
    type: [WeeklyReportItemDto],
    description: 'Data laporan per minggu',
  })
  weeks: WeeklyReportItemDto[];
}
