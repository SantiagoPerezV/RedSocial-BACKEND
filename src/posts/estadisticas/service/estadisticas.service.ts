import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostDocument, Post } from 'src/posts/schemas/post.schema';
import { CommentDocument, Comment } from 'src/posts/schemas/comments.schema'

@Injectable()
export class EstadisticasService {
    constructor(
        @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
        @InjectModel(Comment.name) private readonly commentModel: Model<CommentDocument>
    ){}

    async getPublicacionesPorUsuario(desde: string, hasta:string, perfil: string){

        if(perfil !== 'admin'){
            throw new ForbiddenException('No tienes permisos para obtener la petición');
        }

        return this.postModel.aggregate([
            {
                $match: 
                {
                    createdAt: 
                    {
                        $gte: new Date(desde),
                        $lte: new Date(hasta)
                    },
                },
            },
            {
                $group:
                {
                    _id: '$usuario',
                    cantidadPublicaciones: 
                    {
                        $sum : 1
                    },
                },
            },
        ])
    }

    async getComentariosEnTiempo(desde: string, hasta:string, perfil: string){

        if(perfil !== 'admin'){
            throw new ForbiddenException('No tienes permisos para obtener la petición');
        }

        return this.commentModel.aggregate([
            {
                $match:
                {
                    createdAt:
                    {
                        $gte: new Date(desde),
                        $lte: new Date(hasta)
                    },
                },
            },
            {
                $group: 
                {
                    _id: null,
                    cantidadComentarios: { $sum: 1 }
                },
            },
            {
            $project: 
            {
                _id: 0,
                cantidadComentarios: 1
            },
            }
        ]);
    }

    async getComentariosPorPublicacion(desde: string, hasta: string, perfil: string){

        if(perfil !== 'admin'){
            throw new ForbiddenException('No tienes permisos para obtener la petición');
        }

        return this.commentModel.aggregate([
            {
                $match:
                {
                    createdAt: 
                    {
                        $gte: new Date(desde),
                        $lte: new Date(hasta)
                    },
                },
            },
            {
                $group:
                {
                    _id: '$post',
                    cantidadComentarios: 
                    {
                        $sum : 1
                    }
                },
            },
        ])
    }

}
