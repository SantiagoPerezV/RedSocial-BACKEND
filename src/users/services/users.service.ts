import { Injectable, ConflictException, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../../auth/schemas/user.schema';
import { CreateUserAdminDto } from '../dto/createUserAdmin.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService{
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>){}

    async findAll(perfil: string) {
        if(perfil !== 'admin'){
            throw new ForbiddenException(`No tienes permisos para obtener usuarios`);
        }
        return this.userModel.find().select('-password -__v');
    }
    
    async create(dto: CreateUserAdminDto, perfil:string) {
        
        if(perfil !== 'admin'){
            throw new ForbiddenException(`No tienes permisos para registrar usuarios`);
        }

        try {
            const {username, email, password} = dto

            //Verificar si ya existe un usuario con el mismo username o mail
            const existeUser = await this.userModel.findOne({
                $or:[
                    {username: username.toLowerCase()},
                    {email: email.toLowerCase()},
                ],
            });
            
            if(existeUser){
                if(existeUser.username === username.toLowerCase()){
                    throw new ConflictException({success: false, message: 'El nombre de usuario ya existe'});
                }
                if(existeUser.email === email.toLowerCase()){
                    throw new ConflictException({success: false, message: 'El mail ya está registrado'});
                }
            }

            //Verificar que las contraseñas se repiten
            if(password != dto.repeatedPassword){
                throw new BadRequestException({success: false, message:'Las contraseñas no son iguales'})
            }

            //Encriptar las contraseñas. Permite que la contraseña no sea legible para nadie, ni para las bd
            const salt = 12;
            const hashedPassword = await bcrypt.hash(password, salt);

            //Una vez pasados los errores y encriptada la contraseña, crear un nuevo usuario
            const newUser = new this.userModel({
                username: username.toLowerCase(),
                email: email.toLowerCase(),
                password: hashedPassword,
                name: dto.name,
                last_name: dto.last_name,
                photo: dto.photo ?? null,
                perfil: dto.perfil || 'user'
            })

            //Una vez creado el usuario, lo guardamos en la bd
            const savedUser = await newUser.save();

            //Convertir a objetos y eliminar la contraseña de la respuesta. Ya que no tiene que quedar de ninguna forma en el código
            const userObject = savedUser.toObject();
            const {password: _, ...UserWithoutPassword } = userObject;

            return{
                success: true,
                message: 'Registrado exitosamente',
                data: {
                    user:UserWithoutPassword,
                    userId: (savedUser._id as Types.ObjectId).toString()
                }
            }

        } catch (error) {
            //error de validación de mongoose
            if(error.name === 'ValidationError'){
                const validationError = Object.values(error.error).map(
                    (err: any) => err.message
                );
                throw new BadRequestException({
                    success: false,
                    message: 'Error de Validación', //Mensaje para el usuaario
                    errors: validationError //Aparece en consola
                });
            }

        }     

    }

    async deactivate(id: string, perfil: string) {
        
        if(perfil !== 'admin'){
            throw new ForbiddenException(`No tienes permisos para desactivar usuarios`);
        }

        const user = await this.userModel.findById(id)

        if(!user){
            throw new BadRequestException('No se encontró el usuario');
        }

        if(!user.isActive){
            throw new BadRequestException('El usuario ya está desactivado');
        }

        user.isActive = false;
        const nuevoUser = await user.save();

        return { success: true, message: 'Usuario desactivado correctamente', data: nuevoUser };
        
    }

    async activate(id: string, perfil: string) {
        
        if(perfil !== 'admin'){
            throw new ForbiddenException(`No tienes permisos para activar usuarios`);
        }

        const user = await this.userModel.findById(id)

        if(!user){
            throw new BadRequestException('No se encontró el usuario');
        }

        if(user.isActive){
            throw new BadRequestException('El usuario ya está activado');
        }

        user.isActive = true;
        const nuevoUser = await user.save();

        return { success: true, message: 'Usuario activado correctamente', data: nuevoUser };
    }
}