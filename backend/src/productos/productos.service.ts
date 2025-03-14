import { Injectable } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { sdbConnection } from '../common/helpers/db-connection.helper';

@Injectable()
export class ProductosService {
  async create(createProductoDto: CreateProductoDto) {
    const { sku, nombre, descripcion, precio, slug, activo, id_categoria } =
      createProductoDto;

    try {
      //verificar que el producto no exista
      const checkProductSql = `SELECT COUNT(*) AS total FROM PRODUCTOS WHERE SKU = :sku`;
      const cnn = await sdbConnection();

      let result = await cnn.execute(checkProductSql, { sku });

      if (result.rows[0].TOTAL > 0) {
        return {
          status: 'error',
          code: 409,
          message: 'El producto ya existe.',
        };
      }

      // Crear el producto
      const counProductSql = `SELECT COUNT(*) AS totalProducts FROM PRODUCTOS`;
      const newProductSql = `INSERT INTO PRODUCTOS (ID_PRODUCTO, SKU, NOMBRE, DESCRIPCION, PRECIO, SLUG, ACTIVO,CREADO, ID_CATEGORIA) VALUES (:id_producto, :sku, :nombre, :descripcion, :precio, :slug, :activo,:creado, :id_categoria)`;

      // Obtener el número de productos
      let newProductResult = await cnn.execute(counProductSql);
      const newProductId = newProductResult.rows[0].TOTALPRODUCTS + 1;

      console.log('newsProductId: ', newProductId);

      // insertar el producto
      const newProduct = await cnn.execute(newProductSql, {
        id_producto: newProductId,
        sku,
        nombre,
        descripcion,
        precio,
        slug,
        activo,
        creado: new Date(),
        id_categoria,
      });

      cnn.commit();
      cnn.close();

      return {
        status: 'success',
        code: 201,
        message: 'Producto creado correctamente.',
        data: {
          id: newProductId,
          sku,
          nombre,
          descripcion,
          precio,
          slug,
          activo,
          id_categoria,
          creado: new Date(),
        },
      };
    } catch (error) {
      console.log('Error: ', error);
      return {
        status: 'error',
        code: 400,
        message: 'Hubo un error al crear el producto.',
      };
    }
  }

  async findAll() {
    try {
      const sql = `SELECT * FROM PRODUCTOS`;
      const cnn = await sdbConnection();
      const result = await cnn.execute(sql);
      cnn.close();
      return result.rows;
    } catch (error) {
      console.log('Error: ', error);
    }
  }

  async findOne(id: number) {
    try {
      const sql = `SELECT * FROM PRODUCTOS WHERE id_producto = :id`;
      const cnn = await sdbConnection();
      const result = await cnn.execute(sql, { id });
      cnn.close();

      if (result.rows.length === 0) {
        return {
          status: 'error',
          code: 404,
          message: 'Producto no existe.',
        };
      }

      const row = result.rows[0];
      return {
        status: 'success',
        code: 200,
        message: 'Producto encontrado.',
        data: {
          id: row.ID_PRODUCTO,
          sku: row.SKU,
          nombre: row.NOMBRE,
          descripcion: row.DESCRIPCION,
          precio: row.PRECIO,
          slug: row.SLUG,
          activo: row.ACTIVO,
          id_categoria: row.ID_CATEGORIA,
          creado: row.CREADO,
          modificado: row.MODIFICADO,
        },
      };
    } catch (error) {
      console.log('Error: ', error);
      return {
        status: 'error',
        code: 400,
        message: 'Hubo un error al obtener el producto.',
      };
    }
  }

  async update(id: number, updateProductoDto: UpdateProductoDto) {
    try {
      //extraemos y descartamos sku
      const { sku, ...fieldsToUpdate } = updateProductoDto;

      //validar que se haya enviado al menos un campo a actualizar
      if (Object.keys(fieldsToUpdate).length === 0) {
        return {
          status: 'error',
          code: 400,
          message: 'Debes enviar al menos un campo a actualizar.',
        };
      }

      //conexion a la base de datos
      const cnn = await sdbConnection();

      //verificar que el producto exista
      const checkProductSql = `SELECT COUNT(*) AS total FROM PRODUCTOS WHERE ID_PRODUCTO = :id`;
      let result = await cnn.execute(checkProductSql, { id });

      if (result.rows[0].TOTAL === 0) {
        return {
          status: 'error',
          code: 404,
          message: 'El producto no existe.',
        };
      }

      //construir la consulta de actualizacion
      let sql = `UPDATE PRODUCTOS SET `;
      const params: any = {};

      //recorrer los campos a actualizar
      for (const key in fieldsToUpdate) {
        if (
          fieldsToUpdate.hasOwnProperty(key) &&
          fieldsToUpdate[key] !== undefined
        ) {
          sql += `${key} = :${key}, `;
          params[key] = fieldsToUpdate[key];
          //actualizar la fecha de modificacion
          sql += `MODIFICADO = :modificado, `;
          params['modificado'] = new Date();
        }
      }

      //quitar la ultima coma y espacio
      sql = sql.slice(0, -2) + ' WHERE ID_PRODUCTO = :id';
      params.id = id;

      //ejecutar la consulta
      await cnn.execute(sql, params);
      cnn.commit();
      cnn.close();

      return {
        status: 'success',
        code: 200,
        message: 'Producto actualizado correctamente.',
      };
    } catch (error) {
      console.log('Error: ', error);
      return {
        status: 'error',
        code: 400,
        message: 'Hubo un error al actualizar el producto.',
      };
    }
  }

  async remove(id: number) {
    try {
      //conexion a la base de datos
      const cnn = await sdbConnection();

      //verificar que el producto exista
      const checkProductSql = `SELECT COUNT(*) AS total FROM PRODUCTOS WHERE ID_PRODUCTO = :id`;
      let result = await cnn.execute(checkProductSql, { id });

      if (result.rows[0].TOTAL === 0) {
        return {
          status: 'error',
          code: 404,
          message: 'El producto no existe.',
        };
      }

      //eliminar el producto
      const sql = `DELETE FROM PRODUCTOS WHERE ID_PRODUCTO = :id`;
      await cnn.execute(sql, { id });
      cnn.commit();
      cnn.close();

      return {
        status: 'success',
        code: 200,
        message: 'Producto eliminado correctamente.',
      };
    } catch (error) {
      console.log('Error: ', error);
      return {
        status: 'error',
        code: 400,
        message: 'Hubo un error al eliminar el producto.',
      };
    }
  }
}
