import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from 'src/auth/auth.module';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { CommentsController } from './controller/comments.controller';
import { CommentsService } from './services/comments.service';

import { Comment, CommentSchema } from './schemas/comments.schema';
import { Post, PostSchema } from './schemas/post.schema';

import { PassportModule } from '@nestjs/passport';

import { EstadisticasModule } from './estadisticas/estadisticas.module';
import { EstadisticasController } from './estadisticas/controller/estadisticas.controller'
import { EstadisticasService } from './estadisticas/service/estadisticas.service'

@Module({
    // forFeature: Es una función de configuración que registra uno o más modelos de Mongoose para que estén disponibles solo dentro de este módulo (AuthModule)
    imports: [
        MongooseModule.forFeature([
            { name: Post.name, schema: PostSchema },
            { name: Comment.name, schema: CommentSchema }
        ]),
        AuthModule, //Importamos para usarlo en los modulos, sirve para las validaciones Jwt
        PassportModule, //Proporciona estrategias de autenticación y guards, para usarlo en los modulos
        EstadisticasModule,
    ],
    controllers: [PostsController, CommentsController, EstadisticasController],
    providers: [PostsService, CommentsService, EstadisticasService],
    exports: [MongooseModule, EstadisticasService] //Exportamos las conexiones a coment y post para las estadisticas module
})
export class PostsModule {}
