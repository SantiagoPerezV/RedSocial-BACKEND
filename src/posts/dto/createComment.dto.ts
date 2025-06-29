import{ IsNotEmpty, IsString, Length, IsMongoId} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto{
    @ApiProperty({
        description: 'Contenido del comentario',
        example: 'Muy buena publicacion',
        minLength:1,
        maxLength: 500
    })
    @IsNotEmpty({message: 'El contenido es obligatorio'})
    @IsString({message: 'El contenido debe ser texto'})
    @Length(1, 500, {message: 'El contenido debe tener entre 1 y 500 caracteres'})
    content: string;

    @ApiProperty({
        description: 'Id de la publicación donde se hace el comentario',
        example: '68563ee0b96f8b3g17d29c83'
    })
    @IsNotEmpty({message: 'el ID de la publicación es obligatorio'})
    @IsMongoId({message: 'El id de la publicación no es válido'})
    postId: string;
}