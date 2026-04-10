import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import multipart from '@fastify/multipart';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const multipartPlugin = multipart as unknown as Parameters<
    typeof app.register
  >[0];
  await app.register(multipartPlugin);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // loại bỏ field thừa
      forbidNonWhitelisted: true, // field lạ -> 400
      transform: true, // auto transform type
    }),
  );

  await app.listen(process.env.PORT ?? 4000, '0.0.0.0');
}
bootstrap().catch((err) => {
  console.error('Error starting application:', err);
  process.exit(1);
});
