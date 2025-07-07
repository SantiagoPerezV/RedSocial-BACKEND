import { Controller, Post, UseInterceptors, Param, UseGuards, UploadedFile, Body, Get, Delete, Req, BadRequestException} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FileValidationPipe } from '../../common/pipes/file-validation.pipe';
import { CreateUserAdminDto } from '../dto/createUserAdmin.dto';
import { UsersService } from '../services/users.service';
import {ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';

// users.controller.ts
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('dashboard/users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  findAll(
    @Req() req
  )
    {
        const user = req.user;

        if(!user){
            throw new BadRequestException('Id del usuario no disponible en el token')
        }

        return this.userService.findAll(user.perfil);
    }

  @Post()
  @UseInterceptors(FileInterceptor('photo', { //si entra un archivo en clave photo
    storage: diskStorage({
        destination: './uploads', // carpeta donde se guarda
        filename: (req, file, cb) => { //Le indico un nombre al archivo
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9); 
            const ext = extname(file.originalname);
            cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
    }),
}))
  create(
    @UploadedFile(FileValidationPipe) file: Express.Multer.File, //Aca cae el archivo
    @Body() dto: CreateUserAdminDto,
    @Req() req
    ) 
    {
        const user = req.user;

        if(!user){
            throw new BadRequestException('Id del usuario no disponible en el token')
        } 

        if(file){
            dto.photo = `/uploads/${file?.filename}`;
        }else{
            dto.photo = `/uploads/photo-predeterminate.webp`
        }

        return this.userService.create(dto, user.perfil);
    }

  @Delete(':id')
  deactivate(
    @Param('id') id: string,
    @Req() req
    ) 
    {
        const user = req.user;

        if(!user){
            throw new BadRequestException('Id del usuario no disponible en el token')
        }  

        return this.userService.deactivate(id, user.perfil);
    }

  @Post(':id/activar')
  activate(
    @Param('id') id: string,
    @Req() req
    ) 
    {
        const user = req.user;

        if(!user){
            throw new BadRequestException('Id del usuario no disponible en el token')
        } 

        return this.userService.activate(id, user.perfil);
    }
}