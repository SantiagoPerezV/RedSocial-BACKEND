import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './schemas/post.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    // forFeature: Es una función de configuración que registra uno o más modelos de Mongoose para que estén disponibles solo dentro de este módulo (AuthModule)
    imports: [MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]), AuthModule],
    controllers: [PostsController],
    providers: [PostsService],
})
export class PostsModule {}
