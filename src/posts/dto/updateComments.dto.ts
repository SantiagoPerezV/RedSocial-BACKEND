import{ IsNotEmpty, IsString, Length} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommentsDto{
    @ApiProperty({
        description: 'Contenido actualizado del comentario',
        example: 'Muy buena publicacion (editado)',
        minLength:1,
        maxLength: 500
    })
    @IsNotEmpty({message: 'El contenido es obligatorio'})
    @IsString({message: 'El contenido debe ser texto'})
    @Length(1, 500, {message: 'El contenido debe tener entre 1 y 500 caracteres'})
    content: string;
}