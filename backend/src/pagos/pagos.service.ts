import { Injectable } from '@nestjs/common';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { sdbConnection } from '../common/helpers/db-connection.helper';
import { stat } from 'fs';

@Injectable()
export class PagosService {
  async create(createPagoDto: CreatePagoDto) {
    const { id_orden, metodo_pago, total } = createPagoDto;
    try {
      //verificar que la orden exista
      const checkOrderSql = `SELECT COUNT(*) AS total FROM ORDENES WHERE ID_ORDEN = :id_orden`;
      const cnn = await sdbConnection();
      let result = await cnn.execute(checkOrderSql, { id_orden });
      if (result.rows[0].TOTAL === 0) {
        return {
          status: 'error',
          code: 404,
          message: 'La orden no existe.',
        };
      }

      //insertar en pagos_orden
      const countPaymentSql = `SELECT COUNT(*) AS totalPayments FROM PAGOS_ORDEN`;
      const newPaymentSql = `INSERT INTO PAGOS_ORDEN (ID_PAGO_ORDEN, ID_ORDEN, METODO_PAGO, STATUS, CREADO) VALUES (:id_pago_orden, :id_orden, :metodo_pago, :status, :creado)`;

      //obtener el número de pagos
      let newPaymentResult = await cnn.execute(countPaymentSql);
      const newPaymentId = newPaymentResult.rows[0].TOTALPAYMENTS + 1;

      //insertar el pago
      const newPayment = await cnn.execute(newPaymentSql, {
        id_pago_orden: newPaymentId,
        id_orden,
        metodo_pago,
        status: 'PAGADO',
        creado: new Date(),
      });

      cnn.commit();
      cnn.close();

      return {
        status: 'success',
        code: 201,
        message: 'Pago registrado correctamente.',
        data: {
          id: newPaymentId,
          id_orden,
          metodo_pago,
        },
      };
    } catch (error) {
      console.log('error: ', error);
      return {
        status: 'error',
        code: 500,
        message: 'Error al crear el pago.',
      };
    }
  }

  async findAll() {
    try {
      //obtener el precio de los detalles_ordenes y sumarlos para obtener el total de la orden
      const total = `SELECT SUM(PRECIO) AS total_precio
      FROM DETALLES_ORDENES
      WHERE ID_ORDEN = :id_orden`;

      //mostar las ordenes con el total de cada una
      const sql = `SELECT ID_ORDEN, ID_CLIENTE, ID_SEDE, CREADO
      FROM ORDENES`;

      const cnn = await sdbConnection();
      const result = await cnn.execute(sql);
      const orders = result.rows;

      for (const order of orders) {
        const totalResult = await cnn.execute(total, {
          id_orden: order.ID_ORDEN,
        });
        order.TOTAL = totalResult.rows[0].TOTAL_PRECIO;
      }

      cnn.close();
      return orders;
    } catch (error) {
      console.log('error: ', error);
      return {
        status: 'error',
        code: 500,
        message: 'Error al obtener los pagos.',
      };
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} pago`;
  }

  update(id: number, updatePagoDto: UpdatePagoDto) {
    return `This action updates a #${id} pago`;
  }

  remove(id: number) {
    return `This action removes a #${id} pago`;
  }
}
