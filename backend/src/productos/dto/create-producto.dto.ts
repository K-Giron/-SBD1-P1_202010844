import { IsNumber, IsPositive, IsString,MinLength } from "class-validator";

export class CreateProductoDto {

    
    @IsString()
    @MinLength(3)
    sku: string

    @IsString()
    @MinLength(3)
    nombre: string

    @IsString()
    @MinLength(3)
    descripcion: string

    @IsPositive()
    @IsNumber()
    precio: number

    @IsString()
    @MinLength(3)
    slug: string

    @IsString()
    @MinLength(1)
    activo: string

    @IsPositive()
    @IsNumber()
    id_categoria: number


}
