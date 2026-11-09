import {
  ArgumentsHost,
  Catch,
  ClassSerializerInterceptor,
  ExceptionFilter,
  HttpException,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module.js';
import type { Response } from 'express';

class ValidationException extends HttpException {
  constructor(readonly validationMessage: string) {
    super(validationMessage, 400);
  }
}

@Catch(ValidationException)
class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: ValidationException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const body = exception.getResponse();
    const message =
      typeof body === 'string'
        ? body
        : typeof body === 'object' && body !== null && 'message' in body
          ? body.message
          : exception.validationMessage;
    response
      .status(400)
      .type('text/plain')
      .send(Array.isArray(message) ? message.join(', ') : String(message));
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Mengaktifkan CORS agar Web Platform & Mobile Scanner dapat mengakses API
  app.enableCors();

  // Memasang Global Exception Filter untuk pesan error validasi
  app.useGlobalFilters(new ValidationExceptionFilter());

  // Mengaktifkan Validasi Global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const messages = errors.flatMap((error) =>
          Object.values(error.constraints ?? {}),
        );
        return new ValidationException(messages.join(', '));
      },
    }),
  );

  // Memasang Global Interceptor
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(` Aplikasi Personal Finance Tracker Backend berjalan di: http://localhost:${port}`);
}
bootstrap();
