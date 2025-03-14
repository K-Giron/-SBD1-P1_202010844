import { Module } from '@nestjs/common';
import { ClientesModule } from './clientes/clientes.module';
import { ConfigModule } from '@nestjs/config';
import { ProductosModule } from './productos/productos.module';

@Module({
  imports: [ConfigModule.forRoot(),
    ClientesModule,
    ProductosModule],
})
export class AppModule {}
