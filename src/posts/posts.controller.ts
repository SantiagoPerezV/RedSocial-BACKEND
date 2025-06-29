import { Controller, Post, UseInterceptors, UploadedFile, Body, UseGuards, Get, Delete, Query, Req, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CreatePostDto } from './dto/createPost.dto';
import { PostsService } from './posts.service';
import { GetPostsDto, SortBy } from './dto/getPosts.dto';
import {ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Posts')
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
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth() 
    async crearPost( //Función que maneja el registro
    @UploadedFile() file: Express.Multer.File, //Aca cae el archivo
    @Body() postData: CreatePostDto, //Aca caen los demas atributos (string, boolean, number)
    @Req() req // capturás el id authentication headers
    ) {
        if(file){
            postData.imagenUrl = `/uploads/${file?.filename}`;
        }

        const userId = req.user?.id

        if(!userId){
            throw new BadRequestException('ID de usuario no disponible en el token');
        }

        return this.postsService.create(postData, userId);
    }

    @Get('obtenerPosts')
    async obtenerPosts(
        @Query() query: GetPostsDto,
    ) 
    {
        return this.postsService.findAll(query);
    }

    @Delete('eliminarPost')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async eliminarPost(
        @Body() deleteData,
        @Req() req
    ){
        const userId = req.user?.id

        if(!userId){
            throw new BadRequestException('ID de usuario no disponible en el token');
        }

        return this.postsService.softDelete(deleteData._id, userId);
    }

    @Post('darMeGusta')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async darMeGusta(
        @Body('postId') postId,
        @Req() req
    ){
        const userId = req.user?.id

            if(!userId){
                throw new BadRequestException('ID de usuario no disponible en el token');
            }

        return this.postsService.addLike(postId, userId);
    }

    @Delete('quitarMeGusta')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async quitarMeGusta(
        @Body() dataPost,
        @Req() req
    ){
        const userId = req.user?.id

        if(!userId){
            throw new BadRequestException('ID de usuario no disponible en el token');
        }

        return this.postsService.removeLike(dataPost._id, userId);
    }

    
}