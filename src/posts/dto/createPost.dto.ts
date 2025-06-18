import { IsNotEmpty,
 IsOptional,
 IsString,
 IsUrl
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto{
    @IsNotEmpty({message:'El titulo es obligatorio'})
    @IsString({message: 'El titulo debe ser una cadena de texto'})
    titulo: string;

    @IsNotEmpty({message:'La descripción es obligatoria'})
    @IsString({message:'La descripción debe ser una cadena de texto'})
    descripcion: string;

    @IsOptional({message: 'La imagen es opcional'})
    @IsString({message: 'La imagen debe ser una cadena de texto'})
    imagenUrl?: string
}