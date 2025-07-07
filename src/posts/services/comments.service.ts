import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from '../schemas/comments.schema';
import { Post, PostDocument } from '../schemas/post.schema';
import { CreateCommentDto } from '../dto/createComment.dto'
import { UpdateCommentsDto } from '../dto/updateComments.dto'
import { GetCommentsDto } from '../dto/getComments.dto'

@Injectable()
export class CommentsService{
    private readonly logger = new Logger(CommentsService.name);

    constructor(
        //Instanciamos los modelos de las colecciones
        @InjectModel(Comment.name) private commentModel: Model <CommentDocument>,
        @InjectModel(Post.name) private postModel: Model<PostDocument>
    ){}

    async create(createCommentDto: CreateCommentDto, userId: string): Promise<CommentDocument> {
        this.logger.log(`Creación de comentario en la publicación ${createCommentDto.postId} por usuario ${userId}`);

        //Verificar que la publicación exista
        const post = await this.postModel.findOne({
            _id: createCommentDto.postId, //Buscamos el posts que igual al postId y que no esté eliminada
            estaEliminado: false
        });

        if(!post){
            this.logger.warn(`Publicación ${createCommentDto.postId} no encontrado o eliminado`); //Advertencia en el logger
            throw new NotFoundException(`La publicación no existe o ha sido eliminada`); //Lanzo el error
        }

        const comment = new this.commentModel({
            content: createCommentDto.content,
            post: createCommentDto.postId,
            author: userId,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const savedComment = await comment.save(); //Funcionalidad de mongo para guardar el objeto 
        this.logger.log(`Comentario creado con ID: ${savedComment._id}`);

        //Poblar los campos de autor con datos del mismo
        return savedComment.populate('author', 'username name photo');
    }


    async findByPostId(getCommentsDto: GetCommentsDto): Promise<{
        comments: CommentDocument[],
        pagination: { //total de comentario, cantidad de paginas, en qué pagina esta y el límite por pagina
            total: number,
            pages: number,
            page: number,
            limit: number;
        }
    }> {
        const { postId, page = 1, limit = 10 } = getCommentsDto;
        const skip = ( page - 1 ) * limit;

        this.logger.log(`Obteniendo comentarios de publicacion ${postId} | pagina: ${page} | limite: ${limit}`);

        //Verificar que la publicación existe
        const post = await this.postModel.findOne({
            _id: postId, //Buscamos el posts que igual al postId y que no esté eliminada
            estaEliminado: false
        });

        if(!post){
            this.logger.warn(`Publicación ${getCommentsDto.postId} no encontrado o eliminado`); //Advertencia en el logger
            throw new NotFoundException(`La publicación no existe o ha sido eliminada`); //Lanzo el error
        }

        //Cuenta total de comentarios (que no esten eliminados)
        const total = await this.commentModel.countDocuments({
            post: postId,
            estaEliminado: false
        });

        //Calculamos el total de paginas. 
        const pages =  Math.ceil(total / limit);

        //Obtener comentarios paginados y ordenador por fecha descendente (más recientess primero)
        const comments = await this.commentModel.find({post: postId, estaEliminado: false})
        .sort({ createdAd: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'username name photo')
        .exec();

        this.logger.debug(`Encontrados ${comments.length} comentarios para la publicación ${postId}`);

        return {
            comments,
            pagination: {
                total,
                pages,
                page,
                limit
            }
        };

    }

    async update (id:string, updateCommentsDto: UpdateCommentsDto, userId: string, isAdmin = false): Promise<CommentDocument> {
        
        if(!Types.ObjectId.isValid(id)) {
            throw new NotFoundException('ID del comentario inválido');
        }

        this.logger.log(`Actualizando comentario ${id} por usuario ${userId}`);

        const comment = await this.commentModel.findOne({
            _id: id,
            estaEliminado: false
        });

        //Verificar que el comentario exista
        if(!comment){
            this.logger.warn(`Comentario con ID ${id} no encontrado o eliminado`);
            throw new NotFoundException(`El comentario no existe o ha sido eliminado`);
        }

        //Validar que lo modifique el autor o un Admin
        if(!isAdmin && comment.author.toString() !== userId) {
            this.logger.warn(`Usuario ${userId} no es el autor del comentario`);
            throw new ForbiddenException(`No tienes permisos para editar este comentario`);
        }

        const updates = {
            ...updateCommentsDto,
            modified: true,
            updatedAt: new Date()
        };

        const updatedComment = await this.commentModel.findByIdAndUpdate(
            id,
            updates,
            { new: true }
        ).populate('author', 'username name photo')

        if(!updatedComment) {
            this.logger.warn(`No se pudo actualizar el comentario ${id}`);
            throw new NotFoundException(`No se pudo actualizar el comentario`);
        }

        this.logger.log(`Comentario ${id} actualizado exitosamente`);

        return updatedComment as CommentDocument;
    }

    async softDelete(id: string, userId: string, isAdmin=false): Promise<CommentDocument> {
        if(!Types.ObjectId.isValid(id)) {
            throw new NotFoundException('ID del comentario inválido');
        }

        this.logger.log(`Eliminando comentario ${id} por usuario ${userId}`);

        const comment = await this.commentModel.findOne({
            _id: id,
            estaEliminado: false
        });

        //Verificar que el comentario exista
        if(!comment){
            this.logger.warn(`Comentario con ID ${id} no encontrado o eliminado`);
            throw new NotFoundException(`El comentario no existe o ya ha sido eliminado`);
        }

        //Validar que lo modifique el autor o un Admin
        if(!isAdmin && comment.author.toString() !== userId) {
            this.logger.warn(`Usuario ${userId} no es el autor del comentario`);
            throw new ForbiddenException(`No tienes permisos para borrar este comentario`);
        }

        comment.estaEliminado = true;
        comment.updatedAt = new Date();
        await comment.save();

        this.logger.log(`Comentario ${id} eliminado`);

        return comment;
    }

}