import { ApiProperty } from '@nestjs/swagger';

export class MediaResponseDto {
  @ApiProperty({
    description: 'Array of URLs/keys untuk file yang berhasil diupload',
    type: [String],
    example: ['photos/123e4567-e89b-12d3-a456-426614174000-image.png'],
  })
  urls: string[];
}
