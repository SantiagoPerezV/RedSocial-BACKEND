import { Injectable, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';

//Antes del authService, creamos el payload. Es el codigo donde tenemos atributos 
export interface JwtPayload{
    sub: string; //ID unico del usuario.
    username: string; //Guardamos el nombre de usuario
    roles?: string[]; //Array de roles para el control de accesos

}

@Injectable()
export class AuthService{
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>){}

    async register(registerDto: RegisterDto): Promise<any>{
        try {
            const {username, email, password} = registerDto

            //Verificar si ya existe un usuario con el mismo username o mail
            const existeUser = await this.userModel.findOne({
                $or:[
                    {username: username.toLowerCase()},
                    {email: email.toLowerCase()},
                ],
            });
            
            if(existeUser){
                if(existeUser.username === username.toLowerCase()){
                    throw new ConflictException('El nombre de usuario ya existe');
                }
                if(existeUser.email === email.toLowerCase()){
                    throw new ConflictException('El mail ya está registrado');
                }
            }

            //Verificar que las contraseñas se repiten
            if(password != registerDto.repeatedPassword){
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
                name: registerDto.name,
                last_name: registerDto.last_name,
                photo: registerDto.photo ?? null,
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

    async login (loginDto: LoginDto): Promise <any>{

        try {

            const {usernameOrMail, password} = loginDto;
    
            //Verificar si ya existe un usuario con el mismo username o mail
            const existeUser = await this.userModel.findOne({
                $or:[
                    {username: usernameOrMail.toLowerCase()},
                    {email: usernameOrMail.toLowerCase()}
                ],
            });

            if(!existeUser){
                throw new ConflictException('El nombre de usuario o mail no es correcto');
            }

            // Comparar contraseñas
            const sonIguales = await bcrypt.compare(password, existeUser.password);
            if (!sonIguales) {
                throw new BadRequestException('Contraseña incorrecta');
            }

            // Quitar el campo password antes de devolver
            const { password: _, ...userWithoutPassword } = existeUser.toObject();

            return {
                message: 'Inicio de sesión exitoso',
                user: userWithoutPassword,
            };

        } catch (error) {
            throw error;
        }
    }

    async findById(id: string): Promise<User>{
        
        const user = await this.userModel.findOne({_id: id});

        if (!user){
            throw new NotFoundException('Usuario no encontrado');
        }

        return user;
    }

}