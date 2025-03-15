
CREATE TABLE CATEGORIAS
(
    id_categoria INTEGER CONSTRAINT categoria_pk PRIMARY KEY,
    nombre VARCHAR2(150) CONSTRAINT categorias_nombre_nn NOT NULL,
    creado DATE,
    modificado DATE
);
------revisar primary key para solo id_cliente
CREATE TABLE CLIENTES
(
    id_cliente INTEGER CONSTRAINT cliente_pk PRIMARY KEY,
    id_nacional INTEGER,
    nombre VARCHAR2(150) CONSTRAINT clientes_nombre_nn NOT NULL,
    apellido VARCHAR2(150) CONSTRAINT clientes_apellido_nn NOT NULL,
    telefono VARCHAR2(150) CONSTRAINT clientes_telefono_nn NOT NULL,
    email VARCHAR2(320) CONSTRAINT clientes_email_nn NOT NULL,
    activo CHAR(1) CONSTRAINT clientes_activo_nn NOT NULL,
    email_confirmado CHAR(1) CONSTRAINT clientes_email_confirmado_nn NOT NULL,
    password VARCHAR2(150) CONSTRAINT clientes_password_nn NOT NULL,
    creado DATE,
    modificado DATE
);

CREATE TABLE DEPARTAMENTOS
(
    id_departamento INTEGER CONSTRAINT departamento_pk PRIMARY KEY,
    nombre VARCHAR2(150) CONSTRAINT departamentos_nombre_nn NOT NULL,
    creado DATE,
    modificado DATE
);

CREATE TABLE SEDES
(
    id_sede    INTEGER CONSTRAINT sede_pk PRIMARY KEY,
    nombre     VARCHAR2(200) CONSTRAINT sedes_nombre_nn NOT NULL,
    creado     DATE,
    modificado DATE
);
----
CREATE TABLE ORDENES
(
    id_orden INTEGER CONSTRAINT orden_pk PRIMARY KEY,
    creado DATE,
    modificado DATE,
    id_cliente INTEGER CONSTRAINT orden_cliente_fk REFERENCES  CLIENTES(id_cliente),
    id_sede INTEGER CONSTRAINT orden_sede_fk REFERENCES SEDES(id_sede)
);

CREATE TABLE PRODUCTOS
(
    id_producto             INTEGER CONSTRAINT producto_pk PRIMARY KEY,
    sku                     VARCHAR2(50) CONSTRAINT productos_sku_nn NOT NULL,
    nombre                  VARCHAR2(150) CONSTRAINT productos_nombre_nn NOT NULL,
    descripcion             VARCHAR2(200),
    precio                  INTEGER CONSTRAINT productos_precio_nn NOT NULL,
    slug                    VARCHAR2(200) CONSTRAINT productos_slug_nn NOT NULL,
    activo                  CHAR(1) CONSTRAINT productos_activo_nn NOT NULL,
    creado                  DATE,
    modificado              DATE,
    id_categoria INTEGER CONSTRAINT producto_categoria_fk REFERENCES CATEGORIAS(id_categoria)
);

CREATE TABLE DETALLES_ORDENES
(
    id_detalle_orden INTEGER CONSTRAINT detalle_orden_pk PRIMARY KEY,
    cantidad INTEGER CONSTRAINT detalles_cantidad_nn NOT NULL,
    precio INTEGER CONSTRAINT detalles_precio_nn NOT NULL,
    creado DATE,
    modificado DATE,
    id_orden INTEGER CONSTRAINT detalle_orden_orden_fk REFERENCES ORDENES(id_orden),
    id_producto INTEGER CONSTRAINT detalle_orden_producto_fk REFERENCES PRODUCTOS(id_producto)
);

CREATE TABLE TRASLADOS
(
    id_traslado     INTEGER CONSTRAINT traslado_pk PRIMARY KEY,
    status          VARCHAR2(50) CONSTRAINT traslads_status_nn NOT NULL,
    arribo_estimado DATE,
    solicitado      DATE,
    creado          DATE,
    modificado      DATE,
    id_sede_envio   INTEGER CONSTRAINT traslado_sede_envio_fk REFERENCES SEDES(id_sede),
    id_sede_recepcion  INTEGER CONSTRAINT traslado_sede_recep_fk REFERENCES SEDES(id_sede)
);

CREATE TABLE DETALLES_TRASLADOS
(
    id_detalle_traslado INTEGER CONSTRAINT detalle_traslado_pk PRIMARY KEY,
    cantidad INTEGER CONSTRAINT detalles_traslados_cantidad_nn NOT NULL,
    creado DATE,
    modificado DATE,
    id_producto INTEGER CONSTRAINT detalle_traslado_producto_fk REFERENCES PRODUCTOS(id_producto),
    id_traslado INTEGER CONSTRAINT detalle_traslado_traslado_fk REFERENCES TRASLADOS(id_traslado)
);

CREATE TABLE DIRECCIONES
(
    id_direccion INTEGER CONSTRAINT direccion_pk PRIMARY KEY,
    direccion VARCHAR2(200) CONSTRAINT direcciones_direccion_nn NOT NULL,
    creado DATE,
    modificado DATE,
    id_cliente INTEGER CONSTRAINT direccion_cliente_fk REFERENCES CLIENTES(id_cliente)
);


CREATE TABLE EMPLEADOS
(
    id_empleado INTEGER CONSTRAINT empleado_pk primary key,
    id_nacional INTEGER,
    nombre VARCHAR2(150) CONSTRAINT empleados_nombre_nn NOT NULL,
    apellido VARCHAR2(150) CONSTRAINT empleados_apellido_nn NOT NULL,
    puesto VARCHAR2(150) CONSTRAINT empleados_puesto_nn NOT NULL,
    telefono VARCHAR2(150) CONSTRAINT empleados_telefono_nn NOT NULL,
    email VARCHAR2(320) CONSTRAINT empleados_email_nn NOT NULL,
    activo CHAR(1) CONSTRAINT empleados_activo_nn NOT NULL,
    creado DATE,
    modificado DATE,
    id_sede INTEGER CONSTRAINT empleado_sede_fk REFERENCES SEDES(id_sede),
    id_departamento CONSTRAINT empleado_departamento_fk REFERENCES DEPARTAMENTOS(id_departamento)
);

CREATE TABLE ENVIOS
(
    id_envio INTEGER CONSTRAINT envio_pk PRIMARY KEY,
    empresa VARCHAR2(200) CONSTRAINT envios_empresa_nn NOT NULL,
    direccion VARCHAR2(200) CONSTRAINT envios_direccion_nn NOT NULL,
    numero_empresa INTEGER CONSTRAINT envios_numero_empresa_nn NOT NULL,
    status VARCHAR2(50) CONSTRAINT envios_status_nn NOT NULL,
    entregado DATE CONSTRAINT envios_entregado_nn NOT NULL,
    creado DATE,
    modificado DATE,
    id_orden INTEGER CONSTRAINT envio_orden_fk REFERENCES ORDENES(id_orden)
);

CREATE TABLE IMAGENES
(
    id_imagen INTEGER CONSTRAINT imagen_pk PRIMARY KEY,
    imagen VARCHAR2(320) CONSTRAINT imagenes_imagen_nn NOT NULL,
    creado DATE,
    modificado DATE,
    id_producto INTEGER CONSTRAINT imagen_producto_fk REFERENCES PRODUCTOS(id_producto)
);

CREATE TABLE INVENTARIOS
(
    id_inventario INTEGER CONSTRAINT inventario_pk PRIMARY KEY,
    cantidad INTEGER CONSTRAINT inventarios_cantidad_nn NOT NULL,
    creado DATE,
    modificado DATE,
    id_producto INTEGER CONSTRAINT inventario_producto_fk REFERENCES PRODUCTOS(id_producto),
    id_sede INTEGER CONSTRAINT inventario_sede_fk REFERENCES SEDES(id_sede)
);

CREATE TABLE METODOS_PAGO
(
    id_metodo_pago INTEGER CONSTRAINT metodos_pago_pk PRIMARY KEY,
    metodo_pago VARCHAR2(150) CONSTRAINT metodos_pago_metodo_nn NOT NULL,
    creado DATE,
    modificado DATE,
    id_cliente INTEGER CONSTRAINT metodo_cliente_fk REFERENCES CLIENTES(id_cliente)
);

CREATE TABLE PAGOS_ORDEN
(
    id_pago_orden INTEGER CONSTRAINT pago_orden_pk PRIMARY KEY,
    metodo_pago   VARCHAR2(200) CONSTRAINT pagos_metodo_nn NOT NULL,
    status        VARCHAR2(50) CONSTRAINT pagos_status_nn NOT NULL,
    creado        DATE,
    modificado    DATE,
    id_orden INTEGER CONSTRAINT pago_orden_fk REFERENCES ORDENES(id_orden)
);

CREATE TABLE PRODUCTOS_DEVOLUCIONES
(
    id_producto_devolucion INTEGER CONSTRAINT producto_devolucion_pk PRIMARY KEY,
    descripcion            VARCHAR2(200) CONSTRAINT devoluciones_descripcion_nn NOT NULL,
    status                 VARCHAR2(50) CONSTRAINT devoluciones_status_nn NOT NULL,
    solicitado             DATE,
    creado                 DATE,
    modificado             DATE,
    id_producto  INTEGER CONSTRAINT devolucion_producto_fk REFERENCES PRODUCTOS(id_producto)
);
