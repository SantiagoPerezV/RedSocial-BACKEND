import { PipeTransform, Injectable, BadRequestException, NotAcceptableException } from '@nestjs/common';

@Injectable()
export class FileValidationPipe implements PipeTransform{

    transform(file: Express.Multer.File) {
        //la imagen es opcional
        if(!file){
            return null
        }

        //Tipos de archivos permitidos
        const allowedMimeTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp'
        ];

        //Tamaño de imagen permitido: 5MB
        const maxSize = 5 * 1024 * 1024; //Transformación de mega a bits.

        //Validar tipos de archivos
        if(!allowedMimeTypes.includes(file.mimetype)){
            throw new BadRequestException('Solo se permiten archivos de imagen (JPEG, JPG, PNG, GIF, WEBP)');
        };

        if(file.size > maxSize){
            throw new BadRequestException('Solo se permiten archivos menores a 5 MB.')
        }

        return file;

    }

}