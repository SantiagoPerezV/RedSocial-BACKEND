//PERMITE LA SEGURIDAD, REQUIERE SIEMPRE EL TOKEN VALIDO
//SI ESTAMOS EN DESARROLLO O SWAGGER NOS OTORGA UN USUARIO DE TESTEO

//UnauthorizedException con el error 401 de validación
//Logger: sistema para gestionar de login de Nest 
import { Injectable, UnauthorizedException, Logger } from "@nestjs/common";
import { AuthGuard } from '@nestjs/passport';

@Injectable()

export class JwtAuthGuard extends AuthGuard('jwt'){ //AuthGuard tipo jwt clase padre
    private readonly logger = new Logger(JwtAuthGuard.name);

    private readonly isDevelopment = process.env.NODE_ENV !== 'production'; //Determinacion del entorno de ejecucion. Elegimos qué tipo de entorno vamos a trabajar (development). Si no estamos en development, sera produccion

    //Este metodo nos permite manejar la logica de autenticacion personalizada. Sobrescribe el metodo de la clase padre.
    //err: error de autenticación si lo hay
    //info: informacion adicional de la estrategia de autenticacion
    //context: contexto de ejecucion de Nest
    //Nos deberia retornar el usuario autenticado
    handleRequest(err, user, info, context){

        const request = context.switchToHttp().getRequest(); //Extraccion del objeto request y toda su info estando en ejecucion.
        
        //Extraer del header el referer de la peticion http
        //referer: header que indica desde que pagina url se hizo la peticion
        const referer = request.headers.referer || ''; //Si noexiste tal url, devuelve un string vacío

        const isSwaggerRequest = referer.includes('/api') //Identificar si viene del swagger

        //Gestion de error del usuario o ausencia del mismo

        if(err || !user){
            if(isSwaggerRequest && this.isDevelopment){
                if(process.env.DEBUG){ //Nos permite activar el debug y sobreescribir el logueo
                    this.logger.debug('Autenticación automática para Swagger en entorno de desarrollo');
                }

                return{
                    id: '6855debbe6c5cd1da2e205fg',
                    username:'swagger_user',
                    email: 'swagger@gmail.com',
                    roles: ['user']
                }
            }

            throw new UnauthorizedException({
                success: false,
                message: 'Usuario no encontrado. Asegura que el token JWT sea válido y no haya expirado'
            })
        }

        return user;

    }
    //¿Como Funciona?
    //Se recibe una peticion http mediante el referer,
    //verifica si viene de swagger o de un entorno de desarrollo, si es así, usa un usuario ficticio, si no, devuelve un error

}