import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response, Request } from 'express';

// Map Prisma error codes → HTTP status + user-friendly message
const PRISMA_ERROR_MAP: Record<
  string,
  { status: number; message: string }
> = {
  P2000: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Data too long for this field',
  },
  P2001: {
    status: HttpStatus.NOT_FOUND,
    message: 'Record not found',
  },
  P2002: {
    status: HttpStatus.CONFLICT,
    message: 'Record already exists (duplicate slug or username)',
  },
  P2003: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Invalid foreign key reference',
  },
  P2014: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Required relation missing',
  },
  P2025: {
    status: HttpStatus.NOT_FOUND,
    message: 'Record not found for update/delete',
  },
};

@Catch()
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Prisma errors — map to standard HTTP response
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

    // HTTP errors (NestJS exceptions like NotFoundException, UnauthorizedException)
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

    // Unknown errors — do NOT expose stack trace
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: 500,
      message: 'Internal server error, please try again later',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
