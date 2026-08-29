import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response, Request } from 'express';

// Map Prisma error codes → HTTP status + message tiếng Việt
const PRISMA_ERROR_MAP: Record<
  string,
  { status: number; message: string }
> = {
  P2000: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Dữ liệu quá dài cho trường này',
  },
  P2001: {
    status: HttpStatus.NOT_FOUND,
    message: 'Không tìm thấy bản ghi',
  },
  P2002: {
    status: HttpStatus.CONFLICT,
    message: 'Dữ liệu đã tồn tại (trùng slug hoặc username)',
  },
  P2003: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Tham chiếu khóa ngoại không hợp lệ',
  },
  P2014: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Bắt buộc phải có liên kết',
  },
  P2025: {
    status: HttpStatus.NOT_FOUND,
    message: 'Không tìm thấy bản ghi để cập nhật/xóa',
  },
};

@Catch()
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Prisma errors — map sang HTTP response chuẩn
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const mapped = PRISMA_ERROR_MAP[exception.code];
      if (mapped) {
        return response.status(mapped.status).json({
          success: false,
          statusCode: mapped.status,
          message: mapped.message,
          timestamp: new Date().toISOString(),
          path: request.url,
        });
      }
    }

    // HTTP errors (NestJS exceptions như NotFoundException, UnauthorizedException)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      return response.status(status).json({
        success: false,
        statusCode: status,
        message:
          typeof exceptionResponse === 'string'
            ? exceptionResponse
            : (exceptionResponse as any).message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }

    // Unknown errors — KHÔNG expose stack trace cho hacker
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: 500,
      message: 'Lỗi hệ thống, vui lòng thử lại sau',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
