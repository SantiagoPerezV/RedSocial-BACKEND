//ESTRATEGIA PARA LA VERIFICACION DEL TOKEN, TODA LA SEGURIDAD QUE NECESITA, VA A GUARD
//Injectable: Hacemos exportable el archivo como dependencia
import { Injectable, UnauthorizedException } from "@nestjs/common";

import { PassportStrategy } from '@nestjs/passport';

//Strategy nos permite una clase principal para implementar la estrategia de autenticacion de JWT
//ExtractJWT nos permite una utilidad que proporciona metodos para obtener el token JWT de la peticion http que nosotros mandamos
import { Strategy, ExtractJwt } from 'passport-jwt'

//Acceder a las variables de entorno
import { ConfigService } from "@nestjs/config";

import { AuthService, JwtPayload } from "../auth.service"; //El payload nos permite una interfaz que define la estructura del payload del token del JWT

@Injectable()

//PassportStrategy es el componente padre, por eso es un extends. En el constructor se llama lo que necesitemos de el
export class JwtStrategy extends PassportStrategy(Strategy){

    constructor(private authService: AuthService, private configService: ConfigService){

        //Traermos las vairables necesarias del componente padre
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), //Extraer el token del header, siempre y cuando sea authentication -> alli va el token
            
            ignoreExpiration: false, //Configuracion de expiracion

            secretOrKey: configService.get<string>('JWT_SECRET'), //Palabra secreta para la generación del token
        })

    }

    //Nos permite ejecutar automaticamente despues del passport la autenticacion del token. Valida que la sesión exista y devuelve el usuario. Verificamos que el payload siga existiendo.
    async validate(payload: JwtPayload){
        const user = await this.authService.findById(payload.sub) //Buscar el usuario por id
        
        if(!user){ //Puede ocurrir si fue eliminado luego de la generacion del token, no exista el id, o no funcione la BD
            throw new UnauthorizedException('Usuario no encontrado o token inválido');
        }

        return{
            id: payload.sub,
            username: payload.username,
            perfil: user.perfil || 'user' //Si no tiene ningun rol, asumimos que es un usuario
        } 
    }

}