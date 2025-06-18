import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/auth/schemas/user.schema';

//Creamos una variable de tipo post(Objeto manipulable en Nest) y Document (Objeto adaptado para exportar o importar documentos de mongo)
export type PostDocument = Post & Document;

@Schema({timestamps:true})
export class Post {
    @Prop({required: true})
    titulo:string;

    @Prop({required: true})
    descripcion: string;

    @Prop()
    imagenUrl: string;
    
    @Prop({required: true, type: MongooseSchema.Types.ObjectId, ref: 'User'}) //Hace referencia al id del usuario en la base de mongoose
    usuario: User;

    @Prop({default: false})
    estaEliminado: boolean;

    @Prop({type: MongooseSchema.Types.ObjectId, ref: 'User'})
    likes: User[];

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);