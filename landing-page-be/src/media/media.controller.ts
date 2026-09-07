import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
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

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
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
