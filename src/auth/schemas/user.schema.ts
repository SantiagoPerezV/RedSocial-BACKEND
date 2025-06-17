import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose';

//Creamos una variable de tipo user(Objeto manipulable en Nest) y Document (Objeto adaptado para exportar o importar documentos de mongo)
export type UserDocument = User & Document;

@Schema({timestamps:true})

//Le indicamos propiedades a los campos
export class User {
    @Prop({required:true, unique: true, trim: true})
    username: string;

    @Prop({required:true, unique: true, trim: true, lowercase: true})
    email: string;

    @Prop({required:true})
    password: string;

    @Prop({required:true, trim: true})
    name: string;

    @Prop({required:true, trim: true})
    last_name: string;

    @Prop({default: null})
    photo: string;

    @Prop({default: 'user'})
    perfil: string;

    @Prop({default:true})
    isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

//Definición de indices para optimizar las busquedas.
UserSchema.index({username: 1});
UserSchema.index({email: 1});