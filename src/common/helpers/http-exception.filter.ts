import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status =
      exception instanceof HttpException
        ? (exception.getResponse() as any)?.statusCode || exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      exception instanceof HttpException
      ? (exception.getResponse() as any)?.message?.[0] || exception.message
        : '系统异常，请稍后重试，或联系管理员';
    this.logger.warn(exception, 'system request error');
    response.status(200).json({
      code: status,
      message,
      path: request.url,
    });
  }
}
