import { Injectable } from '@nestjs/common';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

export const UPLOADS_DIR = join(process.cwd(), 'uploads');

@Injectable()
export class MediaService {
  constructor() {
    mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  save(filename: string, buffer: Buffer): void {
    writeFileSync(join(UPLOADS_DIR, filename), buffer);
  }
}
