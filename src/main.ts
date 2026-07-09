import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Global prefix
  app.setGlobalPrefix('api');

  // 2. CORS
  app.enableCors({
    origin: '*', // Untuk development lokal
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization,ngrok-skip-browser-warning',
    exposedHeaders: 'Content-Disposition', // Untuk download file
  });

  // 3. Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 4. Global Exception Filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // 5. Global Response Interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());

  // 6. Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Lapor Pak API')
    .setDescription('REST API Pelaporan Kerusakan Jalan')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // 7. Start application
  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://0.0.0.0:${port}/api`);
}
bootstrap();
