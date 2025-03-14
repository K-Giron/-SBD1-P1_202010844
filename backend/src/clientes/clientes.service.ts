/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { sdbConnection } from '../common/helpers/db-connection.helper';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ClientesService {
  async create(createClienteDto: CreateClienteDto) {
    const {
      id_nacional,
      nombre,
      apellido,
      telefono,
      email,
      activo,
      email_confirmado,
      password,
    } = createClienteDto;

    try {
      // Verificar si el email o el username ya existen en la base de datos
      const checkEmailSql = `SELECT COUNT(*) AS total FROM CLIENTES WHERE EMAIL = :email`;
      const checkUsernameSql = `SELECT COUNT(*) AS total FROM CLIENTES WHERE ID_NACIONAL = :id_nacional`;

      // Conectar a la base de datos
      let cnn = await sdbConnection();

      // Comprobar si el email ya está registrado
      let result = await cnn.execute(checkEmailSql, { email });
      if (result.rows[0].TOTAL > 0) {
        return {
          status: 'error',
          code: 409,
          message: 'El correo ya está registrado.',
        };
      }

      // Comprobar si el id nacional ya está registrado
      result = await cnn.execute(checkUsernameSql, {
        id_nacional: id_nacional,
      });
      if (result.rows[0].TOTAL > 0) {
        return {
          status: 'error',
          code: 409,
          message: 'El usuario ya está registrado.',
        };
      }

      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generar un nuevo ID de cliente
      const counClietnSql = `SELECT COUNT(*) AS totalClients FROM CLIENTES`;
      const newClientSql = `INSERT INTO CLIENTES (ID_CLIENTE, ID_NACIONAL, NOMBRE, APELLIDO, TELEFONO, EMAIL, ACTIVO, EMAIL_CONFIRMADO, PASSWORD,CREADO) VALUES (:id_cliente, :id_nacional, :nombre, :apellido, :telefono, :email, :activo, :email_confirmado, :password,:creado)`;

      // Obtener el número de clientes
      let newClientResult = await cnn.execute(counClietnSql);
      const newClientId = newClientResult.rows[0].TOTALCLIENTS + 1;

      // Insertar el nuevo cliente
      const newClient = await cnn.execute(newClientSql, {
        id_cliente: newClientId,
        id_nacional: Number(id_nacional),
        nombre,
        apellido,
        telefono,
        email,
        activo,
        email_confirmado,
        password: hashedPassword, // Usamos la contraseña hasheada
        creado: new Date(),
      });

      await cnn.commit();
      await cnn.close();

      return {
        status: 'success',
        code: 201,
        message: 'Usuario creado exitosamente',
      };
    } catch (error) {
      console.log('Error:', error);
      return {
        status: 'error',
        code: 400,
        message: 'Hubo un error al crear el usuario.',
      };
    }
  }

  async findAll() {
    try {
      const sql = `SELECT id_cliente, id_nacional,nombre,apellido,email,activo FROM CLIENTES`;
      const cnn = await sdbConnection();
      const result = await cnn.execute(sql);
      cnn.close();
      return result.rows;
    } catch (error) {
      console.log('Error: ', error);
    }
  }

  //localhost:3000/clientes/id
  async findOne(id: number) {
    try {
      const sql = `SELECT id_cliente, id_nacional,nombre,apellido,email,activo,creado,modificado FROM CLIENTES WHERE id_cliente = :id`;
      const cnn = await sdbConnection();
      const result = await cnn.execute(sql, { id });
      cnn.close();

      if (result.rows.length === 0) {
        return {
          status: 'error',
          code: 404,
          message: 'Usuario no existe.',
        };
      }

      const row = result.rows[0];
      return {
        status: 'success',
        code: 200,
        message: 'Perfil retornado.',
        data: {
          id: row.ID_CLIENTE,
          nombre: row.NOMBRE,
          apellido: row.APELLIDO,
          email: row.EMAIL,
          activo: row.ACTIVO,
          creado: row.CREADO,
          modificado: row.MODIFICADO,
        },
      };
    } catch (error) {
      console.log('Error: ', error);
      return {
        status: 'error',
        code: 400,
        message: 'Hubo un error al obtener el perfil.',
      };
    }
  }

  //localhost:3000/clientes/id
  async update(id: number, updateClienteDto: UpdateClienteDto) {
    try {
      // Extraemos y descartamos la propiedad 'password' si se envía
      const { password, ...fieldsToUpdate } = updateClienteDto;

      // Validar que se hayan enviado campos a actualizar
      if (Object.keys(fieldsToUpdate).length === 0) {
        return {
          status: 'error',
          code: 400,
          message:
            'No se permiten modificar contraseña o no agrego campos a modificar.',
        };
      }

      // Conectar a la base de datos
      const cnn = await sdbConnection();

      // Verificar si el usuario existe
      const checkQuery = `SELECT id_cliente FROM CLIENTES WHERE ID_CLIENTE = :id`;
      const checkResult = await cnn.execute(checkQuery, { id });
      if (checkResult.rows.length === 0) {
        await cnn.close();
        return {
          status: 'error',
          code: 404,
          message: 'Usuario no existe.',
        };
      }

      // Construir la consulta de UPDATE de forma dinámica y parametrizada
      let sql = 'UPDATE CLIENTES SET ';
      const params: any = {};

      for (const key in fieldsToUpdate) {
        if (
          fieldsToUpdate.hasOwnProperty(key) &&
          fieldsToUpdate[key] !== undefined
        ) {
          // Mapeo: si el campo es "phone", usar el nombre de columna TELEFONO
          let columnName = key.toUpperCase();
          if (key === 'phone') {
            columnName = 'TELEFONO';
          }
          sql += `${columnName} = :${key}, `;
          params[key] = fieldsToUpdate[key];
          //actualizar la fecha de modificación
          sql += `MODIFICADO = :modificado, `;
          params.modificado = new Date();
        }
      }
      // Remover la última coma y espacio, y agregar la cláusula WHERE
      sql = sql.slice(0, -2) + ' WHERE ID_CLIENTE = :id';
      params.id = id;

      await cnn.execute(sql, params);
      await cnn.commit();
      await cnn.close();

      return {
        status: 'success',
        code: 200,
        message: 'User updated successfully',
      };
    } catch (error) {
      console.log('Error: ', error);
      return {
        status: 'error',
        code: 400,
        message: 'Hubo un error al actualizar el usuario.',
      };
    }
  }

  //localhost:3000/clientes/id
  async remove(id: number) {
    try {
      const sql = `UPDATE CLIENTES SET ACTIVO = 'F' WHERE ID_CLIENTE = :id`;

      const cnn = await sdbConnection();
      const result = await cnn.execute(sql, { id });
      await cnn.commit();
      cnn.close();
      if (result.rowsAffected === 0) {
        return {
          status: 'error',
          code: 404,
          message: 'Usuario no encontrado.',
        };
      }
      const row = result.rows;

      return {
        status: 'success',
        code: 200,
        message: 'Usuario desactivado exitosamente',
        data: row,
      };
    } catch (error) {
      console.log('Error: ', error);
    }
  }

  //localhost:3000/clientes/login
  async login(email: string, password: string) {
    try {
      console.log('Email:', email);
      console.log('Password:', password);

      // Verificar si el email existe en la base de datos
      const checkEmailSql = `SELECT * FROM CLIENTES WHERE EMAIL = :email`;
      let cnn = await sdbConnection();
      let result = await cnn.execute(checkEmailSql, { email });

      if (result.rows.length === 0) {
        return {
          status: 'error',
          code: 404,
          message: 'El correo no está registrado.',
        };
      }

      // Obtenemos el password almacenado
      const storedPassword = result.rows[0].PASSWORD;
      let passwordCorrect = false;

      // Si el password comienza con "$2", asumimos que ya está hasheado
      if (storedPassword.startsWith('$2')) {
        passwordCorrect = await bcrypt.compare(password, storedPassword);
      } else {
        // En caso contrario, es un password en texto plano
        passwordCorrect = storedPassword === password;

        // Opcional: Si coincide, actualizamos el registro para guardar la versión hasheada
        if (passwordCorrect) {
          const hashedPassword = await bcrypt.hash(password, 10);
          const updateQuery =
            'UPDATE CLIENTES SET password = :password WHERE EMAIL = :email';
          await cnn.execute(updateQuery, { password: hashedPassword, email });
          await cnn.commit();
        }
      }

      if (!passwordCorrect) {
        cnn.close();
        return {
          status: 'error',
          code: 401,
          message: 'La contraseña es incorrecta.',
        };
      }

      const sessionId = uuidv4();
      cnn.close();
      return {
        status: 'success',
        code: 200,
        message: 'Inicio de sesión exitoso.',
        sessionId,
      };
    } catch (error) {
      console.log('Error:', error);
      return {
        status: 'error',
        code: 400,
        message: 'Hubo un error al iniciar sesión.',
      };
    }
  }
}
