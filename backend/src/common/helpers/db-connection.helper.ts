const oracledb = require('oracledb');

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

export const sdbConnection = async () => {
  try {
    // logger.log('USER_DB: ', process.env.USER_DB);
    // logger.log('PASSWORD_DB: ', process.env.PASSWORD_DB);
    // logger.log('CONNECT_STRING: ', process.env.CONNECT_STRING);
    const connection = await oracledb.getConnection({
      user: process.env.USER_DB, // Tomar de las variables de entorno
      password: process.env.PASSWORD_DB, // Tomar de las variables de entorno
      connectString: process.env.CONNECT_STRING,
    });
    return connection;
  } catch (error) {
    console.log('Error: ', error);
  }
};
