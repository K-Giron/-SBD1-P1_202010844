import { Injectable } from '@nestjs/common';
import { CreateOrdeneDto } from './dto/create-ordene.dto';
import { UpdateOrdeneDto } from './dto/update-ordene.dto';
import { sdbConnection } from '../common/helpers/db-connection.helper';

@Injectable()
export class OrdenesService {
  async create(createOrdeneDto: CreateOrdeneDto) {
    const { id_cliente, items, direccion, metodo_pago } = createOrdeneDto;
    try {
      //verificar que el cliente exista
      const checkClientSql = `SELECT COUNT(*) AS total FROM CLIENTES WHERE ID_CLIENTE = :id_cliente`;
      const cnn = await sdbConnection();
      let result = await cnn.execute(checkClientSql, { id_cliente });
      if (result.rows[0].TOTAL === 0) {
        return {
          status: 'error',
          code: 404,
          message: 'El cliente no existe.',
        };
      }

      //verificar que los productos existan
      for (const item of items) {
        const checkProductSql = `SELECT COUNT(*) AS total FROM PRODUCTOS WHERE ID_PRODUCTO = :id_producto`;
        let resultProduct = await cnn.execute(checkProductSql, {
          id_producto: item.id_producto,
        });
        if (resultProduct.rows[0].TOTAL === 0) {
          return {
            status: 'error',
            code: 404,
            message: 'El producto no existe.',
          };
        }
      }

      //verificar que la dirección exista
      const checkAddressSql = `SELECT COUNT(*) AS total FROM DIRECCIONES WHERE DIRECCION = :direccion`;
      let resultAddress = await cnn.execute(checkAddressSql, { direccion });
      if (resultAddress.rows[0].TOTAL === 0) {
        return {
          status: 'error',
          code: 404,
          message: 'La dirección no existe.',
        };
      }

      //verificar que el pago_orden exista con el metodo_pago
      const checkPaymentSql = `SELECT COUNT(*) AS total FROM PAGOS_ORDEN WHERE METODO_PAGO = :metodo_pago`;
      let resultPayment = await cnn.execute(checkPaymentSql, { metodo_pago });
      if (resultPayment.rows[0].TOTAL === 0) {
        return {
          status: 'error',
          code: 404,
          message: 'El metodo de pago no existe.',
        };
      }

      //imprimir lo que se va a insertar
      console.log('id_cliente: ', id_cliente);
      console.log('items: ', items);
      console.log('direccion: ', direccion);
      console.log('metodo_pago: ', metodo_pago);
      console.log('----------------------');

      //registrar la orden
      const insertOrderSql = `INSERT INTO ORDENES (ID_ORDEN,ID_CLIENTE, ID_SEDE , CREADO) VALUES (:id_orden,:id_cliente, :id_sede, :creado)`;

      // Obtener el número de ordenes
      const counOrderSql = `SELECT COUNT(*) AS totalOrders FROM ORDENES`;
      let newOrderResult = await cnn.execute(counOrderSql);
      const newOrderId = newOrderResult.rows[0].TOTALORDERS + 1;

      // Insertar la nueva orden
      const newOrder = await cnn.execute(insertOrderSql, {
        id_orden: newOrderId,
        id_cliente,
        id_sede: 1,
        creado: new Date(),
      });

      //imprimir lo que se va a insertar
      console.log('newOrderId: ', newOrderId);
      console.log(newOrder);
      console.log('----------------------');

      //registrar los productos de la orden en la tabla detalles_orden
      const insertOrderDetailSql = `INSERT INTO DETALLES_ORDENES (ID_DETALLE_ORDEN,ID_ORDEN, ID_PRODUCTO, CANTIDAD,PRECIO,CREADO) VALUES (:id_detalle_orden, :id_orden, :id_producto, :cantidad,:precio,:creado)`;

      var orderTotal = 0;

      for (const item of items) {
        // Obtener el número de detalles de orden
        const counOrderDetailSql = `SELECT COUNT(*) AS totalOrderDetails FROM DETALLES_ORDENES`;
        let newOrderDetailResult = await cnn.execute(counOrderDetailSql);
        const newOrderDetailId =
          newOrderDetailResult.rows[0].TOTALORDERDETAILS + 1;

        //obtener el precio del producto
        const productPriceSql = `SELECT PRECIO FROM PRODUCTOS WHERE ID_PRODUCTO = :id_producto`;
        let productPriceResult = await cnn.execute(productPriceSql, {
          id_producto: item.id_producto,
        });
        const productPrice = productPriceResult.rows[0].PRECIO;

        // Insertar el nuevo detalle de orden
        const newOrderDetail = await cnn.execute(insertOrderDetailSql, {
          id_detalle_orden: newOrderDetailId,
          id_orden: newOrderId,
          id_producto: item.id_producto,
          cantidad: item.cantidad,
          //precio es el monto total del producto por la cantidad
          precio: item.cantidad * productPrice,
          creado: new Date(),
        });

        orderTotal += item.cantidad * productPrice;
      }

      await cnn.commit();
      await cnn.close();

      return {
        status: 'success',
        code: 201,
        message: 'Orden creada exitosamente',
        data: {
          id_orden: newOrderId,
          id_cliente,
          orderTotal,
          metodo_pago,
          creado: new Date(),
          status: 'En proceso',
        },
      };
    } catch (error) {
      console.log(error);
      return {
        status: 'error',
        code: 500,
        message: 'Error al crear la orden',
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
      console.log('Error: ', error);
      return {
        status: 'error',
        code: 500,
        message: 'Error al obtener las ordenes',
      };
    }
  }

  async findOne(id: number) {
    try {
      //recorrer los detalles_ordenes y obtener el id_producto, cantidad y precio
      const details = `SELECT ID_PRODUCTO, CANTIDAD, PRECIO FROM DETALLES_ORDENES WHERE ID_ORDEN = :id_orden`;

      //obtener el precio de los detalles_ordenes y sumarlos para obtener el total de la orden
      const total = `SELECT SUM(PRECIO) AS total_precio
      FROM DETALLES_ORDENES
      WHERE ID_ORDEN = :id_orden`;

      //mostar la orden con el total
      const sql = `SELECT ID_ORDEN, ID_CLIENTE, ID_SEDE, CREADO
      FROM ORDENES
      WHERE ID_ORDEN = :id`;

      const cnn = await sdbConnection();
      const result = await cnn.execute(sql, { id });
      const order = result.rows[0];

      const totalResult = await cnn.execute(total, {
        id_orden: order.ID_ORDEN,
      });
      order.TOTAL = totalResult.rows[0].TOTAL_PRECIO;

      const detailsResult = await cnn.execute(details, {
        id_orden: order.ID_ORDEN,
      });

      order.DETAILS = detailsResult.rows;

      cnn.close();
      return {
        status: 'success',
        code: 200,
        message: 'Orden retornada.',
        data: order,
      };
    } catch (error) {
      console.log('Error: ', error);
      return {
        status: 'error',
        code: 500,
        message: 'Error al obtener la orden',
      };
    }
  }

  update(id: number, updateOrdeneDto: UpdateOrdeneDto) {
    return `This action updates a #${id} ordene`;
  }

  remove(id: number) {
    return `This action removes a #${id} ordene`;
  }
}
