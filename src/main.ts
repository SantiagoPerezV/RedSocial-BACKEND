import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  //Nest factory hace referencia a cuando se renderiza la app, en este caso dice que levante app module
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  //Validación global de DTOs. Nos permite a nivel global validar diferentes archivos DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    //Configuraciones especificas para cada DTO.
  }));

  //Servir archivo estático (Imagen de perfil). Indico donde estaran las imagenes.
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/' //Dentro de essta caarpeta estaran las fotos de perfil
  })

  //Habilitar CORS
  app.enableCors();

  //Configuracion del swagger
  const configSwagger = new DocumentBuilder()
    .setTitle('RedSocial API')
    .setDescription('Documentación de la API del TP 2 de red social')
    .addTag('auth', 'Endpoints de autenticación')
    .addTag('posts','Endpoints de publicaciones')
    .addTag('users', 'Endpoints de usuarios')
    .addBearerAuth(
      {
        type:'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingresa tu token JWT',
        in: 'header'
      },
    )
    .build();

  const document = SwaggerModule.createDocument(app, configSwagger);
  SwaggerModule.setup('swagger', app, document); //Accede a la documentación en /swagger

  await app.listen(3000);
  console.log('Servidor corriendo en http://localhost:3000 - tp-final-backend')
}
bootstrap();
