import { Module } from '@nestjs/common';
import { ClientesModule } from './clientes/clientes.module';
import { ConfigModule } from '@nestjs/config';
import { ProductosModule } from './productos/productos.module';
import { OrdenesModule } from './ordenes/ordenes.module';
import { PagosModule } from './pagos/pagos.module';

@Module({
  imports: [ConfigModule.forRoot(),
    ClientesModule,
    ProductosModule,
    OrdenesModule,
    PagosModule],
})
export class AppModule {}
