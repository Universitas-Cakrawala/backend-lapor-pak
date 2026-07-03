import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportStatus } from '@prisma/client';
import { UserResponseDto } from '../../users/dto/user-response.dto';

@Exclude()
export class StatusHistoryResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty({ enum: ReportStatus })
  status: ReportStatus;

  @Expose()
  @ApiPropertyOptional()
  note?: string;

  @Expose()
  @ApiPropertyOptional()
  proofPhotoUrl?: string;

  @Expose()
  @ApiPropertyOptional()
  changedById?: string;

  @Expose()
  @ApiProperty()
  timestamp: Date;

  @Expose()
  @ApiPropertyOptional({ type: () => UserResponseDto })
  @Type(() => UserResponseDto)
  changedBy?: UserResponseDto;
}
