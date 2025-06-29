import{ IsOptional, Min, IsMongoId} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetCommentsDto{
    @ApiProperty({
        description: 'Nro de pagina para la paginación',
        example: 1,
        default: 1,
        required: false
    })
    @IsOptional()
    @Type (() => Number)
    @Min(1, {message: 'La página minima es 1'})
    page?: number = 1;

    @ApiProperty({
        description: 'Cantidad de comentaarios por página',
        example: 10,
        default: 10,
        required: false
    })
    @IsOptional()
    @Type (() => Number)
    @Min(1, {message: 'La página minima es 1'})
    limit?: number = 10;

    @ApiProperty({
        description: 'ID de la publicación para filtrar comentarios de la misma',
        example: '68563ee0b96f8b3g17d54p06',
        required: true
    })
    @IsMongoId({message: 'El ID de la publicación no es válido'})
    postId: string;
}