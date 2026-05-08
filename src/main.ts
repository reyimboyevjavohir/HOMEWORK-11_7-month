import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('CRM Panel API')
    .setDescription(`
## CRM Panel - Ta'lim markazi boshqaruv tizimi

### Rollar va huquqlar:
- **superadmin** — Barcha amallar. Admin qo'shish/o'chirish huquqi
- **admin** — O'quvchi, o'qituvchi, guruh, to'lov, davomat boshqaruvi
- **user** — Faqat ko'rish va davomat qo'shish

### Boshlash:
1. POST /api/auth/login — Token oling
2. "Authorize" tugmasini bosing
3. Bearer <token> formatida kiriting

### Default superadmin:
- Email: superadmin@crm.uz
- Parol: SuperAdmin123
    `)
    .setVersion('1.0')
    .addBearerAuth()
    .addTag("Auth (Autentifikatsiya)")
    .addTag("Dashboard (Xisobot)")
    .addTag("Users (Foydalanuvchilar)")
    .addTag("Students (O'quvchilar)")
    .addTag("Teachers (O'qituvchilar)")
    .addTag("Groups (Guruhlar)")
    .addTag("Payments (To'lovlar)")
    .addTag("Attendance (Davomat)")
    .addTag("Complaints (Murojaatlar)")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const authService = app.get(AuthService);
  await authService.seedSuperAdmin();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`\n🚀 Server: http://localhost:${port}/api`);
  console.log(`📚 Swagger: http://localhost:${port}/api/docs\n`);
}
bootstrap();
