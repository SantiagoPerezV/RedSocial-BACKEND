import { EstadisticasService } from '../service/estadisticas.service'

import{ Controller, Get, Query, Req, UseGuards, Logger, BadRequestException } from '@nestjs/common';
import {ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('estadisticas')
export class EstadisticasController {

    constructor( private estadisticasService: EstadisticasService){}

    @Get('publicacionesPorUsuario')
    async publicacionesPorUsuario(
        @Query('desde') desde: string,
        @Query('hasta') hasta: string,
        @Req() req
    ){
        try{
            const user = req.user

            if(!user){
                throw new BadRequestException('El token jwt no es válido')
            }

            const desdeDate = new Date(desde);
            const hastaDate = new Date(hasta);

            // Verifico que las fechas sean válidas
            if (isNaN(desdeDate.getTime()) || isNaN(hastaDate.getTime())) {
                throw new BadRequestException('Fechas no válidas');
            }

            const data = await this.estadisticasService.getPublicacionesPorUsuario(desdeDate.toISOString(), hastaDate.toISOString(), req.user.perfil);

            return{
                success: true,
                message: 'Publicaciones por cada usuario obtenido correctamente',
                data
            }
        }catch(err){
            console.error('Error al obtener publicaciones por cada usuario');
            throw err;
        }

    }

    @Get('comentariosEnTiempo')
    async comentariosEnTiempo(
        @Query('desde') desde: string,
        @Query('hasta') hasta: string,
        @Req() req
    ){
        try{
            const user = req.user

            if(!user){
                throw new BadRequestException('El token jwt no es válido')
            }

            const desdeDate = new Date(desde);
            const hastaDate = new Date(hasta);

            // Verifico que las fechas sean válidas
            if (isNaN(desdeDate.getTime()) || isNaN(hastaDate.getTime())) {
                throw new BadRequestException('Fechas no válidas');
            }

            const data = await this.estadisticasService.getComentariosEnTiempo(desdeDate.toISOString(), hastaDate.toISOString(), req.user.perfil);

            return{
                success: true,
                message: 'Comentarios obtenidos correctamente',
                data
            }
        }catch(err){
            console.error('Error al obtener los comentarios');
            throw err;
        }

    }

    @Get('comentariosPorPublicacion')
    async comentariosPorPublicacion(
        @Query('desde') desde: string,
        @Query('hasta') hasta: string,
        @Req() req
    ){

        try{

            const user = req.user

            if(!user){
                throw new BadRequestException('El token jwt no es válido')
            }

            const desdeDate = new Date(desde);
            const hastaDate = new Date(hasta);

            // Verifico que las fechas sean válidas
            if (isNaN(desdeDate.getTime()) || isNaN(hastaDate.getTime())) {
                throw new BadRequestException('Fechas no válidas');
            }

            const data = await this.estadisticasService.getComentariosPorPublicacion(desdeDate.toISOString(), hastaDate.toISOString(), req.user.perfil);

            return{
                success: true,
                message: 'Comentarios por publicación obtenido correctamente',
                data
            }

        }catch(err){
            console.error('Error al obtener comentarios por publicación');
            throw err;
        }

    }

}
