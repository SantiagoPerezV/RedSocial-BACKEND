import { ApiProperty } from "@nestjs/swagger";
import { User } from "src/auth/schemas/user.schema";
import { Post } from '../schemas/post.schema';
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export type CommentDocument = Comment & Document;

//dos claves foraneas, con posts y usuario/autor

@Schema({
    timestamps:true,
    toJSON: {
        virtuals: true, //Incluir virtuals cuando convierte a JSON
        getters: true, //Incluir ggetteers cuando convierte a JSON
        transform: (doc, ret) => {
            ret.id = ret._id; //Transformar _id a id
            delete ret._id; //Eliminar _id
            delete ret.__v; //Eliminar versión
            //Eliminamos para trabajar correctamente en Mongo
            return ret;
        }
    }
})

export class Comment{
    @ApiProperty({
        description: 'Contenido del comentario',
        example: 'Increible posteo ❤❤',
        required: true
    })
    @Prop({
        required: [true, 'El contenido del comentaraio es obligatorio'],
        maxLength: [500, 'El comentario no puede ser mayor a 500 caracteres'],
        minLength: [1, 'El comentario debe contener al menos 1 caracter']
    })
    content: string;

    @ApiProperty({
        description: 'El Id de la publicación a la que se dirige el comentario',
        example: '68563ee0b92f8b3g17d29c83'
    })
    @Prop({
        required: [true, 'La publicacion es obligatoria'],
        type: MongooseSchema.Types.ObjectId, //Tipo: id de objeto de mongo
        ref: 'Post', //Referimos al tipo Posts 
        index: true //Busquedas más eficientes
    })
    post: Post;

    @ApiProperty({
        description:'El ID del usuario perteneciente del comentario',
        example: '68485ee0b92f8b3d18d19c83'
    })
    @Prop({
        required: [true, 'El usuario es obligatorio'],
        type: MongooseSchema.Types.ObjectId,
        ref: 'User',
        index: true
    })
    author: User;

    @ApiProperty({
        description: 'Indica si el comentario fue eliminado',
        example: false,
        default: false
    })
    @Prop({
        default: false
    })
    estaEliminado: boolean;

    @ApiProperty({
        description: 'Indica si el comentario fue modificado',
        example: false,
        default: false
    })
    @Prop({
        default: false
    })
    modified: boolean

    @ApiProperty({
        description: 'Fecha de creación del comentario',
        example: '2025-06-24T19:24.32.674Z',
        type: Date
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Fecha de modificación del comentario',
        example: '2025-06-24T19:24.32.674Z',
        type: Date
    })
    updatedAt: Date;
}

//Creación del schema a partir de la clase Comment
export const CommentSchema = SchemaFactory.createForClass(Comment);

//Mejora el rendimiento de consultas frecuentes
CommentSchema.index({ post:1, createdAt: -1}); //Busca por post y ordena por fecha