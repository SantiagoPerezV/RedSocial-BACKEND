import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { User, UserSchema } from 'src/auth/schemas/user.schema';
import { UsersController } from './controller/users.controller';
import { UsersService } from './services/users.service';

@Module({
    // forFeature: Es una función de configuración que registra uno o más modelos de Mongoose para que estén disponibles solo dentro de este módulo (AuthModule)
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
        ]),
        AuthModule, //Importamos para usarlo en los modulos, sirve para las validaciones Jwt
        PassportModule, //Proporciona estrategias de autenticación y guards, para usarlo en los modulos
    ],
    controllers: [UsersController],
    providers: [UsersService]
})
export class UsersModule {}
