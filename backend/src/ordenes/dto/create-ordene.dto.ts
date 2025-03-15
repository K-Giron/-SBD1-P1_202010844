import {
  IsNumber,
  IsString,
  MinLength,
  IsPositive,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsNumber()
  @IsPositive()
  id_producto: number;

  @IsNumber()
  @IsPositive()
  cantidad: number;
}

export class CreateOrdeneDto {
  @IsPositive()
  @IsNumber()
  id_cliente: number;

  @IsString()
  @MinLength(2)
  direccion: string;

  @IsString()
  @MinLength(2)
  metodo_pago: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
