import { IsNotEmpty, IsString} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TokenDto{
    @ApiProperty({
        description: 'Token JWT para operaciones de autenticación',
        //PONER TOKEN DE EJEMPLO
        required: true
    })
    @IsNotEmpty({message: 'El token es obligatorio'})
    @IsString({message: 'El token debe ser un string'})
    token: string;
}