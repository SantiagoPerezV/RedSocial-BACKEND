import { IsEmail,
    IsNotEmpty,
    IsString,
    MinLength, 
    Matches,} 
    from 'class-validator';

export class LoginDto {

    @IsNotEmpty({message:'El nombre de usuario o mail es obligatorio'})
    @IsString({message: 'El nombre de usuario o mail debe ser texto'})
    @MinLength(3, {message:'El nombre de usuario o mail debe tener al menos 3 caracteres'})
    usernameOrMail: string;

    @IsNotEmpty({message:'La contraseña es obligatoria'})
    @IsString({message: 'La contraseña debe ser texto'})
    @MinLength(8, {message:'La contraseña debe tener al menos 8 caracteres'})
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {message:'La contraseña debe contener al menos alguna minuscula, mayuscula y un numero'})
    password: string;

}