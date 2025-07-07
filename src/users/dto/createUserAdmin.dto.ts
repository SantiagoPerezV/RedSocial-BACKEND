import { IsEmail,
    IsNotEmpty,
    IsString,
    MinLength, 
    MaxLength, 
    Matches,
    IsUrl, 
    IsOptional} 
    from 'class-validator';

export class CreateUserAdminDto {
    @IsNotEmpty({message:'El nombre de usuario es obligatorio'})
    @IsString({message: 'El nombre de usuario debe ser texto'})
    @MinLength(3, {message:'El nombre de usuario debe tener al menos 3 caracteres'})
    @MaxLength(30, {message: 'El nombre de usuario debe tener como máximo 30 caracteres'})
    @Matches(/^[a-zA-Z0-9_]+$/, {message:'El nombre de usuario permite solo alfanuméricos y guiones bajos'}) //El nombre de usuario puede tener a-z, A-Z o de 0-9
    username: string;

    @IsNotEmpty({message:'El mail es obligatorio'})
    @IsEmail({}, {message: 'Debe ser un correo electrónico válido'})
    email:string;

    @IsNotEmpty({message:'La contraseña es obligatoria'})
    @IsString({message: 'La contraseña debe ser texto'})
    @MinLength(8, {message:'La contraseña debe tener al menos 8 caracteres'})
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {message:'La contraseña debe contener al menos alguna minuscula, mayuscula y un numero'})
    password: string;

    @IsNotEmpty({message:'La contraseña es obligatoria'})
    @IsString({message: 'La contraseña debe ser texto'})
    repeatedPassword: string;

    @IsNotEmpty({message:'El nombre es obligatorio'})
    @IsString({message: 'El nombre debe ser texto'})
    @MaxLength(50, {message: 'El nombre debe tener como máximo 50 caracteres'})
    name: string;

    @IsNotEmpty({message:'El apellido es obligatorio'})
    @IsString({message: 'El apellido debe ser texto'})
    @MaxLength(50, {message: 'El apellido debe tener como máximo 50 caracteres'})
    last_name: string;

    @IsOptional()
    @IsString({message: 'La foto de perfil debe ser un string url.'})
    photo?:string;

    @IsString({message: 'El perfil debe ser texto'})
    perfil?: 'admin' | 'user'; // por defecto será user
}