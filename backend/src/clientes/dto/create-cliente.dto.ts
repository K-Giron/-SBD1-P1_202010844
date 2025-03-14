import { IsEmail, IsNumber, IsPositive, IsString, IsStrongPassword, MinLength } from "class-validator";

export class CreateClienteDto {


    @IsPositive()
    @IsNumber()
    id_nacional: number
    
    @IsString()
    @MinLength(3)
    nombre: string

    @IsString()
    @MinLength(3)
    apellido: string

    @IsString()
    @IsEmail()
    email: string

    @IsStrongPassword()
    password: string

    @IsString()
    @MinLength(3)
    telefono: string

    @IsString()
    @MinLength(1)
    activo: string

    @IsString()
    @MinLength(1)
    email_confirmado: number

}
