import { IsOptional,
    IsString,
    IsEnum,
    IsNumber,
    Min
   } from "class-validator";
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from "class-transformer";

export enum SortBy{
    DATE = 'date',
    LIKES = 'likes'
} //Enum para elegir el ordenamiento

export class GetPostsDto{

    @ApiPropertyOptional({enum:SortBy, default:SortBy.DATE, description: 'Ordenamiento por date o likes'})
    @IsOptional({message: 'El ordenamiento es opcional'})
    @IsString({message: 'El ordenamiento debe ser una cadena de texto'})
    @IsEnum(SortBy)
    sortBy?: SortBy = SortBy.DATE;

    @ApiPropertyOptional({description: 'Filtrar por ID del usuario'})
    @IsString({message: 'El ID del usuario debe ser una cadena de texto'})
    @IsOptional({message: 'El ID del usuario es opcional'})
    usuarioId: string;

    @ApiPropertyOptional({default:0, description: 'Offset para paginación'})
    @IsOptional({message:'El offset es opcional'})
    @Type(() => Number)
    @IsNumber()
    offset?: number = 0;

    @ApiPropertyOptional({description: 'Link para paginación', default: 10})
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    limit?: number = 10

}