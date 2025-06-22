import { Injectable, ForbiddenException, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Post, PostDocument } from "./schemas/post.schema";
import { CreatePostDto } from './dto/createPost.dto';
import { GetPostsDto, SortBy } from './dto/getPosts.dto';
import { AuthService } from '../auth/auth.service'
import { User } from "src/auth/schemas/user.schema";

@Injectable()
export class PostsService{
    constructor(
        @InjectModel(Post.name) private postModel: Model<PostDocument>,
        private authService: AuthService
    ){}

    async create(createPostDto: CreatePostDto, UserId: string, imagenPath?: string): Promise<Post>{
        //Si se subio una imagen, usar la ruta en lugar de la URL de la imagen del DTO
        const finalImagenUrl = imagenPath || createPostDto.imagenUrl;

        const newPost = new this.postModel({
            ...createPostDto, //Todos los valores que tiene el dto, no hace falta definirlos todos como aca
            usuario: UserId,
            imagenUrl: finalImagenUrl, //Del dto solo se modifica la imagenUrl
            likes:[],
        })

        const savePost = newPost.save();

        return savePost
    }

    async findAll(getPostsDto: GetPostsDto): Promise<{posts: Post[]; total: number}>{ //Devuelve un array de post y el número total de documentos traídos
        //Desestructuramos el Objeto DTO
        const{ sortBy, usuarioId, offset = 0, limit = 10} = getPostsDto;

        //Consultar a la base, excluir publicaciones eliminadas
        const query = this.postModel.find({estaEliminado:false})

        //filtrar por usuario si se especifica
        if(usuarioId){
            if(!Types.ObjectId.isValid(usuarioId)){//Si hay un usuario id pero no esta guardado en la base
                throw new NotFoundException('ID de usuario inválido'); //Lanzar esta excepción
            }
            query.where('usuario').equals(usuarioId)
        }

        //ordenar por fecha o cantidad de likes
        if(sortBy === SortBy.LIKES){
            query.sort({'likes.length': -1, 'createdAt': -1})
        }else{
            query.sort({'createdAt': -1})
        }

        //Aplicación paginación
        query.skip(offset).limit(limit);

        //Poblar la información del usuario
        query.populate('usuario', 'username name last_name photo')

        //Ejecutar la consulta
        const posts = await query.exec();

        //Obtener el conteo total de paginación
        const total = await this.postModel.countDocuments({
            estaEliminado:false, ...(usuarioId ? {usuario: usuarioId} : {})})

        return {posts, total}
    }

    async findOne(id: string): Promise<Post>{
        if(!Types.ObjectId.isValid(id)){
            throw new NotFoundException('ID del post inválido');
        }
        
        const post = await this.postModel.findOne({
            _id: id,
            estaEliminado:false
        }).populate('usuario', 'username name last_name photo').exec()

        if (!post){
            throw new NotFoundException('Post no encontrado')
        }

        return post
    }

    async softDelete(id: string, usuarioId: string): Promise<Post>{
        if(!Types.ObjectId.isValid(id)){
            throw new NotFoundException('ID del post inválido');
        }

        const post = await this.postModel.findOne({_id: id});

        if (!post){
            throw new NotFoundException('Post no encontrado')
        }

        //Verificar si el usuario es el autor o si es un administrador
        const user = await this.authService.findById(usuarioId);
        const isAdmin = user && user.perfil ? user.perfil.includes('admin'): false;
        const isAutor = post.usuario ? post.usuario.toString() === usuarioId: false;

        if(!isAdmin && !isAutor){
            throw new ForbiddenException('No tiene permiso para eliminar la publicación');
        }

        const updatePost = await this.postModel.findByIdAndUpdate(
            id,
            {estaEliminado: true},
            {new: true} //Actualizacion de la fecha de editado
        ).exec();

        if(!updatePost){
            throw new NotFoundException('No se puedo encontrar la publicación para actualizar');
        }

        return updatePost

    }

    async addLike(postId: string, usuarioId: string): Promise<Post>{
        if(!Types.ObjectId.isValid(postId)){
            throw new NotFoundException('ID del post inválido');
        }

        const post = await this.findOne(postId);

        //Verificar si el usuario ya le dio me gusta a la publicación
        if(post.likes && post.likes.some(like => like.toString() === usuarioId)){
            throw new ForbiddenException('Ya le has dado me gusta')
        }

        const postUpdate = await this.postModel.findByIdAndUpdate(
            postId,
            {$push: {likes: usuarioId}},
            {new: true}
        ).exec();

        if(!postUpdate){
            throw new NotFoundException('No se ha encontrado la publicación a la que has querido dar like');
        }

        return postUpdate;
    }

    async removeLike(postId: string, usuarioId: string): Promise<Post>{
        if(!Types.ObjectId.isValid(postId)){
            throw new NotFoundException('ID del post inválido');
        }

        const post = await this.findOne(postId);

        //Verificar si el usuario no le dio me gusta a la publicación
        if(!post.likes || !post.likes.some(like => like.toString() === usuarioId)){
            throw new ForbiddenException('No le has dado me gusta aún')
        }

        const postUpdate = await this.postModel.findByIdAndUpdate(
            postId,
            {$pull: {likes: usuarioId}},
            {new: true}
        ).exec();

        if(!postUpdate){
            throw new NotFoundException('No se ha encontrado la publicación a la que has querido dar like');
        }

        return postUpdate;
    }

    // async like(postId: string, usuarioId: string): Promise<Post>{
    //     let postUpdate!: Post;

    //     if(!Types.ObjectId.isValid(postId)){
    //         throw new NotFoundException('ID del post inválido');
    //     }

    //     const post = await this.findOne(postId);

    //     //Verificar si el usuario no le dio me gusta a la publicación
    //     if(!post.likes || !(post.likes.some(like => like?toString() === usuarioId))){
    //         postUpdate = await this.postModel.findByIdAndUpdate(
    //             postId,
    //             {$pull: {likes: usuarioId}},
    //             {new: true}
    //         ).exec();
    //     }else{
    //         postUpdate = await this.postModel.findByIdAndUpdate(
    //             postId,
    //             {$push: {likes: usuarioId}},
    //             {new: true}
    //         ).exec();
    //     }


    //     if(!postUpdate){
    //         throw new NotFoundException('No se ha encontrado la publicación a la que has querido dar like');
    //     }

    //     return postUpdate;
    // }
}