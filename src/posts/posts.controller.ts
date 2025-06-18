import { Controller, Post, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CreatePostDto } from './dto/createPost.dto';
import { PostsService } from './posts.service';
import { GetPostsDto } from './dto/getPosts.dto';

@Controller('posts') //ruta donde funciona este controlador
export class PostsController {
    constructor(private readonly postsService: PostsService){};
    @Post('crearPost') //Acción Post en la ruta register. (auth/register)
    @UseInterceptors(FileInterceptor('imagenUrl', { //si entra un archivo en clave photo
        storage: diskStorage({
            destination: './uploads', // carpeta donde se guarda
            filename: (req, file, cb) => { //Le indico un nombre al archivo
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9); 
                const ext = extname(file.originalname);
                cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
            },
        }),
    }))

    async crearPost( //Función que maneja el registro
    @UploadedFile() file: Express.Multer.File, //Aca cae el archivo
    @Body() postData: CreatePostDto, //Aca caen los demas atributos (string, boolean, number)
    userId: string,
    ) {
        postData.imagenUrl = file?.filename;
        return this.postsService.create(postData, userId);
    }
}