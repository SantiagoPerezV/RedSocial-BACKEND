//FUNCIONALIDADES:
//PERMITE LAS OPERACIONES CON JWT, TODAS LAS FUNCIONES CON EL TOKEN: VALIDACION Y AUTORIZACION, EXPIRADO

import { Controller, UseGuards, Post, Body, Req, HttpCode, HttpStatus, UnauthorizedException, Logger } from '@nestjs/common'
//HttpStatus: enum con codigo de estado de http que podemos utilizar
//HttpCode: Decorador para establecer el código de respuesta del HTTP

import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger'
//ApiTags: endpoints en la documentacion
//ApiOperation: describir la operacion del endpoint
//ApiResponse: define las posibles respuestas
//ApiBody: define el esquema del cuerpo de la peticion
//ApiBearerAuth: Indica en que point requiere el JWT
//ApiConsumes: Tipo de contenido que consume el endpoin

import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { InjectModel } from '@nestjs/mongoose'; //Decorador para inyectar modelos de mongoose
import { Model } from 'mongoose';

import { User, UserDocument } from '../schemas/user.schema'
import { TokenDto } from '../dto/token.dto';


@ApiTags('Auth') //Nos permite agrupar los endpoints bajo la etiqueta. Es buena practica tener el mismo nombre que el controller
@Controller('auth')

export class TokenController{
    private readonly logger = new Logger(TokenController.name);

    constructor(private readonly jwtService: JwtService, @InjectModel(User.name) private userModel: Model<UserDocument>)
    {}

    @Post('autorizar')
    @HttpCode(HttpStatus.OK)
    @ApiConsumes('application/json') //Definimos cómo se va a consumir nuestra api en particular
    @ApiOperation({
        summary: 'Validar token y obtener datos del usuario', //Resumen de qué hará
        description: 'Verifica si un token JWT es válido y devuelve los datos del usuario. Retorna 401 si está expirado o es inválido' //Decripción de qué hace
    }) //Incorporador de swagger qué explica masomenos que hace la petición
    @ApiBody({
        type: TokenDto,
        description: 'Token JWT a validar',
        examples: {
            validToken: {
                summary: 'Token JWT válido',
                value: {token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJz...'} //PONER TOKEN DE EJEMPLO
            }
        }
    }) //Indicamos explicaciones del body, que tipo tiene que devolver, descripcion y un ejemplo de devolución

    async autorizar(
        @Body() tokenDto: TokenDto
    ){
        try{
            const {token} = tokenDto;

            //Verificar la integridad y validez del token
            const payload = this.jwtService.verify(token); //Método para verificar el token
            this.logger.debug('Token verificado correctamente') //Debuggeo

            //Extraer el ID del usuario
            const userId = payload.sub;
            if(!userId){
                this.logger.warn('Token sin id (sub) de usuario') //Advertencia que se guarda 
                throw new UnauthorizedException('Token con estructura inválida')
            }

            //Verificar que el usuario existe en la base de datos
            const user = await this.userModel.findById(userId).select('-password -__v').exec(); //Excluimos campos sensibles o externos
            if(!user){
                this.logger.warn('Usuario no encontrado en la base de datos');
                throw new UnauthorizedException('Token es válido pero el usuario no existe');
            }

            //Construir la respuesta con datos del usuario
            const userData = user.toObject ? user.toObject(): user;

            return{
                success: true,
                message: 'Token válido',
                data:{
                    id: userData._id,
                    username: userData.username,
                    email: userData.email,
                    name: userData.name,
                    last_name: userData.last_name,
                    photo: userData.photo,
                    perfil: userData.perfil 
                },
                timestamp: new Date().toISOString()
            };

        }catch(error){
            if(error.name == 'TokenExpiredError'){
                throw new UnauthorizedException('Token expirado')
            }
        }
    }

    @Post('refrescar-token')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    refrescarToken(@Req() req) {
        const user = req.user;
        const payload = {
            sub: user.id,
            username: user.username,
        };

        const nuevoToken = this.jwtService.sign(payload);
        return { token: nuevoToken } ;
    }
}