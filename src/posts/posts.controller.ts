import { Controller, Post, UseInterceptors, UploadedFile, Body, Headers, Get, Delete, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CreatePostDto } from './dto/createPost.dto';
import { PostsService } from './posts.service';
import { GetPostsDto, SortBy } from './dto/getPosts.dto';

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
    @Headers('user-id') userId: string, // capturás el id desde headers
    ) {
        if(file){
            postData.imagenUrl = `/uploads/${file?.filename}`;
        }

        return this.postsService.create(postData, userId);
    }

    @Get('obtenerPosts')
    async obtenerPosts(
        @Query() query: GetPostsDto
    ) 
    {
        return this.postsService.findAll(query);
    }

    @Delete('eliminarPost')
    async eliminarPost(
        @Body() deleteData
    ){
        return this.postsService.softDelete(deleteData._id, deleteData.usuario);
    }

    @Post('darMeGusta')
    async darMeGusta(
        @Body('postId') postId,
        @Body('userId') userId
    ){
        return this.postsService.addLike(postId, userId);
    }

    @Delete('quitarMeGusta')
    async quitarMeGusta(
        @Body('postId') postId,
        @Body('userId') userId
    ){
        return this.postsService.removeLike(postId, userId);
    }

    
}