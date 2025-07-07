import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './schemas/post.schema';
import { AuthModule } from 'src/auth/auth.module';
import { CommentsController } from './controller/comments.controller';
import { CommentsService } from './services/comments.service';
import { Comment, CommentSchema } from './schemas/comments.schema';
import { PassportModule } from '@nestjs/passport';

@Module({
    // forFeature: Es una función de configuración que registra uno o más modelos de Mongoose para que estén disponibles solo dentro de este módulo (AuthModule)
    imports: [
        MongooseModule.forFeature([
            { name: Post.name, schema: PostSchema },
            { name: Comment.name, schema: CommentSchema }
        ]),
        AuthModule, //Importamos para usarlo en los modulos, sirve para las validaciones Jwt
        PassportModule, //Proporciona estrategias de autenticación y guards, para usarlo en los modulos
    ],
    controllers: [PostsController, CommentsController],
    providers: [PostsService, CommentsService]
})
export class PostsModule {}
