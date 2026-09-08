import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { randomUUID } from 'crypto';
import { MediaService } from './media.service';

interface UploadedImage {
  buffer: Buffer;
  size: number;
  mimetype: string;
  originalname: string;
}

const ALLOWED_MIMES: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'image/gif': '.gif',
};
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post()
  @ApiBearerAuth('bearer')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload an image',
    description:
      'Uploads an image to the server. Saved to `/uploads/` and served statically at the returned URL. **Max 5 MB.** Only PNG, JPEG, WebP, and GIF are accepted.',
  })
  @ApiBody({
    description: 'Image file (PNG / JPEG / WebP / GIF, ≤ 5 MB)',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'The image file to upload',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, description: 'Upload successful — returns the public URL of the saved file' })
  @ApiResponse({ status: 400, description: 'No file provided, file too large (> 5 MB), or unsupported file type' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  upload(@UploadedFile() file: UploadedImage, @Req() req: Request) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File too large (max 5MB)');
    }
    const ext = ALLOWED_MIMES[file.mimetype];
    if (!ext) {
      throw new BadRequestException('Only PNG, JPEG, WebP or GIF images are allowed');
    }

    const filename = `${randomUUID()}${ext}`;
    this.mediaService.save(filename, file.buffer);

    const proto = req.protocol;
    const host = req.get('host');
    return { url: `${proto}://${host}/uploads/${filename}` };
  }
}
