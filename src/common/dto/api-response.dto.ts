import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T> {
  @ApiProperty({ description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({ description: 'Pesan response' })
  message: string;

  @ApiProperty({ description: 'Data response' })
  data?: T;

  @ApiProperty({ description: 'Metadata pagination (jika ada)', required: false })
  meta?: any;
}
