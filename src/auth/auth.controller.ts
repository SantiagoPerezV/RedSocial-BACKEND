import { Controller, Post, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { FileValidationPipe } from 'src/common/pipes/file-validation.pipe';
import { LoginDto } from './dto/login.dto';


@Controller('auth') //ruta donde funciona este controlador
export class AuthController {
    constructor(private readonly authService: AuthService){};
    @Post('register') //Acción Post en la ruta register. (auth/register)
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

    async register( //Función que maneja el registro
    @UploadedFile(FileValidationPipe) file: Express.Multer.File, //Aca cae el archivo
    @Body() userData: RegisterDto //Aca caen los demas atributos (string, boolean, number)
    ) {
        if(file){
            userData.photo = `/uploads/${file?.filename}`;
        }
        return this.authService.register(userData);
    }
    
    @Post('login') //Acción Post en la ruta login. (auth/login)
    async login(
        @Body() userLogin: LoginDto
    ) {
        return this.authService.login(userLogin);
    }

}
  
