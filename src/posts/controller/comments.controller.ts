import{Controller, Get, Post, Put, Body, Param, Query, Req, UseGuards, Logger, BadRequestException} from '@nestjs/common';
import {ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CommentsService } from '../services/comments.service';
import { CreateCommentDto } from '../dto/createComment.dto';
import { GetCommentsDto } from '../dto/getComments.dto';
import { UpdateCommentsDto } from '../dto/updateComments.dto';

@ApiTags('Comentarios')
@Controller('comments')
export class CommentsController {
    private readonly logger = new Logger(CommentsController.name);

    constructor (private readonly commentsService: CommentsService){}

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth() //Necesita el token para poder ejecutar el endpoint
    @ApiOperation({
        summary: 'Crea un nuevo comentario',
        description: 'Crea un nuevo comentario en una publicación existente',
    })
    @ApiResponse({ status: 201, description: 'Comentario creado exitosamente' })
    @ApiResponse({ status: 400, description: 'Datos inválidos' })
    @ApiResponse({ status: 404, description: 'Publicación no encontrada' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    async create(
        @Body() createCommentDto: CreateCommentDto,
        @Req() req
    ){
        try{
            const userId = req.user?.id

            if(!userId){
                throw new BadRequestException('ID de usuario no disponible en el token');
            }
            const comment = await this.commentsService.create(createCommentDto, userId)

            this.logger.log(`Comentario ${comment._id} creado`);

            return{
                success: true,
                message: 'Comentario creado exitosamente',
                data: comment
            };

        }catch(error){
            this.logger.warn(`Error al querer crear un comentario: ${error.message}`);
            throw error;
        }
    }

    @Get()
    //Descripción del endpoint por swagger
    @ApiOperation({
        summary: 'Obtener comentarios de una publicación',
        description: 'Devuelve los comentarios de una publicación con paginación'
    })
    //Descripción de los parámetros por swagger
    @ApiQuery({name: 'postId', required: true, description: 'ID de la publicación'})
    @ApiQuery({name: 'page', required: false, description: 'Numero de pagina, por defecto = 1'})
    @ApiQuery({name: 'limit', required: false, description: 'Comentaarios por pagina, por defecto = 10'})
    //Descripción de las devoluciones por swagger
    @ApiResponse({status: 200,description: 'Lista de comentarios enviada'})
    @ApiResponse({ status: 400, description: 'Parámetros inválidos'})
    @ApiResponse({status: 404,description: 'Publicación no encontrada'})
    async findByPostId(
        @Query() getCommentsDto: GetCommentsDto
    ){
        try{
            const result = await this.commentsService.findByPostId(getCommentsDto);

            this.logger.log(`Comentarios obtenidos`);

            return {
                success: true,
                message: 'Comentarios obtenidos exitosamente',
                data: {
                    comments: result.comments,
                    pagination: result.pagination
                }
            };
        }catch(error){
            this.logger.warn(`Error al obtener comentarios: ${error.message}`);
            throw error;
        }
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    //Descripción del endpoint por swagger
    @ApiOperation({
        summary: 'Actualizar un comentario',
        description: 'Modifica un comentario existente y lo marca editado'
    })
    //Descripción de los parámetros por swagger
    @ApiParam({name: 'id', description: 'ID del comentario'})
    //Descripción de las devoluciones por swagger
    @ApiResponse({status: 200,description: 'Comentario actualizado correctamente'})
    @ApiResponse({ status: 400, description: 'Datos inválidos'})
    @ApiResponse({status: 404,description: 'Comentario no encontrado'})
    @ApiResponse({status: 403,description: 'Sin permiso para modificar'})
    @ApiResponse({status: 401,description: 'No autorizado'})
    async update(
        @Param('id') id: string,
        @Body() updateCommentsDto: UpdateCommentsDto,
        @Req() req
    ){
        try{
            const userId = req.user?.id;
            if(!userId){
                throw new BadRequestException('Id del usuario no disponible en el token')
            }

            const isAdmin = req.user?.perfil === 'admin';

            const updatedComment = await this.commentsService.update(
                id,
                updateCommentsDto,
                userId,
                isAdmin
            );

            this.logger.log(`Comentario ${id} editado`);

            return{
                success: true,
                message: 'Comentario actualizado correctamente',
                data: updatedComment
            }

        }catch(error){
            this.logger.warn(`Error al actualizar comentario ${id}: ${error.message}`);
            throw error;
        }
    }

    @Put(':id/delete')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    //Descripción del endpoint por swagger
    @ApiOperation({
        summary: 'Eliminar un comentario',
        description: 'Elimina un comentario'
    })
    //Descripción de los parámetros por swagger
    @ApiParam({name: 'id', description: 'ID del comentario'})
    //Descripción de las devoluciones por swagger
    @ApiResponse({status: 200,description: 'Comentario eliminado correctamente'})
    @ApiResponse({ status: 400, description: 'Datos inválidos'})
    @ApiResponse({status: 404,description: 'Comentario no encontrado'})
    @ApiResponse({status: 403,description: 'Sin permiso para eliminar el comentario'})
    @ApiResponse({status: 401,description: 'No autorizado'})
    async delete(
        @Param('id') id: string,
        @Req() req
    ){
        try{
            const userId = req.user?.id;
            if(!userId){
                throw new BadRequestException('Id del usuario no disponible en el token')
            }

            const isAdmin = req.user?.perfil === 'admin';

            const deletedComment = await this.commentsService.softDelete(
                id,
                userId,
                isAdmin
            );

            this.logger.log(`Comentario ${id} creado`);

            return{
                success: true,
                message: 'Comentario eliminado correctamente',
                data: {
                    id: (deletedComment as any)._id,
                    estaEliminado: deletedComment.estaEliminado,
                    deletedAt: new Date().toISOString() 
                }
            };

        }catch(error){
            this.logger.warn(`Error al eliminar comentario ${id}: ${error.message}`);
            throw error;
        }
    }

}