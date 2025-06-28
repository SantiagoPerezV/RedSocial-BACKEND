import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';

//Maneja la creacion de la firma y verificacion del token JSON Web Token 
import { JwtModule } from '@nestjs/jwt';

//Integracion de la autenticacion del passport con nest
import { PassportModule } from '@nestjs/passport';

//ConfigModule nos permite cargar y gestionar variables de entorno y cnfiguracion
//ConfigService nos permite cargar servicios para acceder a las variables de configuracion
import {ConfigModule, ConfigService } from '@nestjs/config';

//Programar la estrategia de nuestra jwt
import { JwtStrategy } from './strategies/jwt.strategy'

//Darle seguridad a nuestra verificacion de JWT
import { JwtAuthGuard } from './guards/jwt-auth.guard'

//Controlador. Definimos los endpoint para cosas relacionadas al JWT
import { TokenController } from './controller/token.controller';

@Module({
  // forFeature: Es una función de configuración que registra uno o más modelos de Mongoose para que estén disponibles solo dentro de este módulo (AuthModule)
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService], //Declaro el servicio de auth como exportable para usar en otros modulos
})
export class AuthModule {}
