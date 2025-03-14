import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { isArray } from 'lodash';

// 定义错误响应接口
interface ErrorResponse {
  statusCode?: number;
  message?: string | string[];
  error?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  constructor(private readonly configService: ConfigService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const timestamp = new Date().toISOString();
    
    // 默认错误信息
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '系统异常，请稍后重试，或联系管理员';
    let stack: string | undefined;
    
    // 处理HTTP异常
    if (exception instanceof HttpException) {
      const errorResponse = exception.getResponse() as ErrorResponse;
      
      // 获取状态码
      status = errorResponse.statusCode || exception.getStatus();
      
      // 获取错误信息
      if (errorResponse.message) {
        message = isArray(errorResponse.message) 
          ? errorResponse.message[0] 
          : errorResponse.message;
      } else if (exception.message) {
        message = exception.message;
      }
      
      // 针对不同类型的错误使用不同的日志级别
      if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.error(
          `${request.method} ${request.url}`,
          exception.stack,
          'ExceptionFilter',
        );
      } else if (status >= HttpStatus.BAD_REQUEST) {
        this.logger.warn(
          `${request.method} ${request.url}`,
          JSON.stringify(errorResponse),
          'ExceptionFilter',
        );
      }
    } else if (exception instanceof Error) {
      // 处理非HTTP异常
      message = exception.message;
      stack = exception.stack;
      this.logger.error(
        `${request.method} ${request.url}`,
        stack,
        'ExceptionFilter',
      );
    } else {
      // 处理未知异常
      this.logger.error(
        `${request.method} ${request.url}`,
        String(exception),
        'ExceptionFilter',
      );
    }

    // 是否在开发环境下返回堆栈信息
    const isProd = this.configService.get<boolean>('env.isProd');
    
    // 构建响应数据
    const responseBody = {
      code: status,
      message,
      path: request.url,
      timestamp,
      ...(isProd ? {} : (stack ? { stack } : {})),
    };

    response.status(200).json(responseBody);
  }
}
