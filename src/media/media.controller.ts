import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Get,
  Param,
  Res,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { MediaResponseDto } from './dto/media-response.dto';

@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Upload foto/video ke MinIO' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File berhasil diupload',
    type: MediaResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validasi file gagal' })
  @UseInterceptors(FilesInterceptor('files', 6))
  async uploadMedia(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Minimal satu file harus diupload');
    }

    let photoCount = 0;
    let videoCount = 0;

    // Validate files
    for (const file of files) {
      if (file.mimetype.startsWith('image/')) {
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedImageTypes.includes(file.mimetype)) {
          throw new BadRequestException(
            'Format foto hanya mendukung JPEG, PNG, dan WebP',
          );
        }
        photoCount++;
      } else if (file.mimetype.startsWith('video/')) {
        if (file.mimetype !== 'video/mp4') {
          throw new BadRequestException('Format video harus MP4');
        }
        if (file.size > 10 * 1024 * 1024) {
          // 10MB
          throw new BadRequestException('Ukuran video maksimal 10MB');
        }
        videoCount++;
      } else {
        throw new BadRequestException(
          `Tipe file tidak didukung: ${file.mimetype}`,
        );
      }
    }

    if (photoCount > 5) {
      throw new BadRequestException('Foto maksimal 5 file');
    }
    if (videoCount > 1) {
      throw new BadRequestException('Video maksimal 1 file');
    }

    const urls = await this.mediaService.uploadFiles(files);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'File berhasil diupload',
      data: { urls },
    };
  }

  // Endpoint to serve file
  @Get('*key')
  @ApiOperation({ summary: 'Mendapatkan/menampilkan file dari S3/MinIO' })
  @ApiResponse({ status: 200, description: 'File dikirim melalui stream' })
  @ApiResponse({ status: 404, description: 'File tidak ditemukan' })
  async getFile(@Param('key') rawKey: any, @Res() res: Response) {
    if (!rawKey) {
      throw new BadRequestException('Key harus disertakan');
    }

    let key = Array.isArray(rawKey) ? rawKey.join('/') : String(rawKey);

    if (key.startsWith('/')) {
      key = key.substring(1);
    }

    // Validate or set content type based on extension
    if (key.endsWith('.mp4')) {
      res.setHeader('Content-Type', 'video/mp4');
    } else if (key.endsWith('.jpg') || key.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (key.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (key.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    }

    const stream = await this.mediaService.getFileStream(key);
    stream.pipe(res);
  }
}
