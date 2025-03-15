import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePagoDto {
  @IsNumber()
  @IsNotEmpty()
  id_orden: number;

  @IsString()
  @IsNotEmpty()
  metodo_pago: string;

  @IsNumber()
  @IsNotEmpty()
  total: number;
}
