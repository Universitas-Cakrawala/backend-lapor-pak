import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsArray,
  MaxLength,
  Min,
  Max,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReportDto {
  @ApiProperty({ description: 'Nama jalan yang rusak', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  roadName: string;

  @ApiProperty({ description: 'Deskripsi kerusakan jalan', maxLength: 2000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description: string;

  @ApiProperty({
    description: 'Garis lintang (Latitude)',
    minimum: -90,
    maximum: 90,
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({
    description: 'Garis bujur (Longitude)',
    minimum: -180,
    maximum: 180,
  })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiProperty({ description: 'URL foto bukti kerusakan (maks. 5 foto)' })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  photoUrls: string[];

  @ApiPropertyOptional({ description: 'URL video bukti (opsional, maks 1)' })
  @IsOptional()
  @IsString()
  videoUrl?: string;
}
