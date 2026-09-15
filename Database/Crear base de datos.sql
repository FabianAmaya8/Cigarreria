-- =======================================
-- BASE DE DATOS PRINCIPAL - CIGARRERIA JJ
-- =======================================
DROP DATABASE IF EXISTS Cigarreria_JJ;
CREATE DATABASE Cigarreria_JJ;
USE Cigarreria_JJ;


-- ============================================================
-- 1. TABLAS DE CATÁLOGO
-- ============================================================

CREATE TABLE categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT
);


CREATE TABLE marcas (
    id_marca INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    id_categoria INT,
    FOREIGN KEY (id_categoria)
        REFERENCES categorias(id_categoria)
);


-- ============================================================
-- 2. PRODUCTOS
-- ============================================================

CREATE TABLE productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    codigo_barras VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    imagen VARCHAR(255),
    descripcion TEXT,
    id_marca INT,
    precio_venta DECIMAL(12,2) NOT NULL,
    stock_minimo INT DEFAULT 0,
    unidad_medida VARCHAR(50),
    activo BOOLEAN DEFAULT TRUE,

    FOREIGN KEY (id_marca)
        REFERENCES marcas(id_marca)
);


-- ============================================================
-- 3. ROLES Y USUARIOS
-- ============================================================

CREATE TABLE roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50)
);


CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    imagen VARCHAR(255),
    rol INT,
    activo BOOLEAN DEFAULT TRUE,

    FOREIGN KEY (rol)
        REFERENCES roles(id_rol)
);


-- ============================================================
-- 4. ALMACENES E INVENTARIO
-- ============================================================

CREATE TABLE almacenes (
    id_almacen INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT TRUE
);


CREATE TABLE inventario (
    id_inventario INT AUTO_INCREMENT PRIMARY KEY,
    id_almacen INT,
    id_producto INT,
    stock INT DEFAULT 0,

    UNIQUE (id_almacen, id_producto),

    FOREIGN KEY (id_almacen)
        REFERENCES almacenes(id_almacen),

    FOREIGN KEY (id_producto)
        REFERENCES productos(id_producto)
);


-- ============================================================
-- 5. PROVEEDORES
-- ============================================================

CREATE TABLE proveedores (
    id_proveedor INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    nit VARCHAR(50),
    telefono VARCHAR(50),
    correo VARCHAR(100),
    direccion VARCHAR(150),
    ciudad VARCHAR(100),
    pais VARCHAR(100),
    observaciones TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 6. RELACIÓN PROVEEDORES - PRODUCTOS
-- ============================================================

CREATE TABLE proveedores_productos (
    id_proveedor INT,
    id_producto INT,

    PRIMARY KEY (id_proveedor, id_producto),

    FOREIGN KEY (id_proveedor)
        REFERENCES proveedores(id_proveedor),

    FOREIGN KEY (id_producto)
        REFERENCES productos(id_producto)
);


-- ============================================================
-- 7. COMPRAS
-- ============================================================

CREATE TABLE compras (
    id_compra INT AUTO_INCREMENT PRIMARY KEY,

    id_proveedor INT,

    fecha_pedido TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    fecha_recepcion TIMESTAMP NULL,

    fecha_entrega TIMESTAMP NULL,

    numero_factura VARCHAR(100) NULL,

    archivo_factura VARCHAR(255) NULL,

    estado_pedido ENUM(
        'pendiente',
        'cancelada',
        'completada'
    ) NOT NULL DEFAULT 'pendiente',

    estado_recepcion ENUM(
        'pendiente',
        'parcial',
        'completa'
    ) NOT NULL DEFAULT 'pendiente',

    estado_pago ENUM(
        'pendiente',
        'parcial',
        'pagada',
        'credito'
    ) NOT NULL DEFAULT 'pendiente',

    total DECIMAL(12,2),

    observaciones TEXT,

    FOREIGN KEY (id_proveedor)
        REFERENCES proveedores(id_proveedor)
);


-- ============================================================
-- 8. DETALLE DE COMPRA
-- ============================================================

CREATE TABLE detalle_compra (
    id_detalle_compra INT AUTO_INCREMENT PRIMARY KEY,

    id_compra INT,

    id_producto INT,

    cantidad_solicitada INT NOT NULL,

    precio_pedido DECIMAL(12,2) NOT NULL,

    cantidad_recibida INT NOT NULL DEFAULT 0,

    precio_recibido DECIMAL(12,2) NULL,

    estado ENUM(
        'pendiente',
        'parcial',
        'completo',
        'no_recibido'
    ) NOT NULL DEFAULT 'pendiente',

    subtotal_pedido DECIMAL(12,2)
        AS (
            cantidad_solicitada * precio_pedido
        ) STORED,

    subtotal_recibido DECIMAL(12,2)
        AS (
            cantidad_recibida *
            COALESCE(precio_recibido, precio_pedido)
        ) STORED,

    FOREIGN KEY (id_compra)
        REFERENCES compras(id_compra)
        ON DELETE CASCADE,

    FOREIGN KEY (id_producto)
        REFERENCES productos(id_producto)
);


-- ============================================================
-- 9. CAJAS
-- ============================================================

CREATE TABLE cajas (
    id_caja INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    saldo_inicial DECIMAL(12,2) DEFAULT 0,
    saldo_actual DECIMAL(12,2) DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE
);


-- ============================================================
-- 10. VENTAS
-- ============================================================

CREATE TABLE ventas (
    id_venta INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    id_caja INT,
    fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(12,2),
    estado ENUM(
        'pendiente',
        'pagada',
        'cancelada',
        'fiada'
    ),
    observaciones TEXT,

    FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario),

    FOREIGN KEY (id_caja)
        REFERENCES cajas(id_caja)
);


CREATE TABLE detalle_venta (
    id_detalle_venta INT AUTO_INCREMENT PRIMARY KEY,
    id_venta INT,
    id_producto INT,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(12,2) NOT NULL,

    subtotal DECIMAL(12,2)
        AS (
            cantidad * precio_unitario
        ) STORED,

    FOREIGN KEY (id_venta)
        REFERENCES ventas(id_venta)
        ON DELETE CASCADE,

    FOREIGN KEY (id_producto)
        REFERENCES productos(id_producto)
);


-- ============================================================
-- 11. MÉTODOS DE PAGO
-- ============================================================

CREATE TABLE metodos_pago (
    id_metodo INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);


CREATE TABLE pagos_venta (
    id_pago INT AUTO_INCREMENT PRIMARY KEY,
    id_venta INT,
    id_metodo INT,
    monto DECIMAL(12,2),

    FOREIGN KEY (id_venta)
        REFERENCES ventas(id_venta)
        ON DELETE CASCADE,

    FOREIGN KEY (id_metodo)
        REFERENCES metodos_pago(id_metodo)
);


-- ============================================================
-- 12. DEUDAS
-- ============================================================

CREATE TABLE deudas (
    id_deuda INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(12,2) NOT NULL,

    estado ENUM(
        'pendiente',
        'pagada',
        'parcial'
    ) DEFAULT 'pendiente',

    observaciones TEXT,

    FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
);


CREATE TABLE detalle_deuda (
    id_detalle_deuda INT AUTO_INCREMENT PRIMARY KEY,
    id_deuda INT,
    id_producto INT,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(12,2) NOT NULL,

    subtotal DECIMAL(12,2)
        AS (
            cantidad * precio_unitario
        ) STORED,

    FOREIGN KEY (id_deuda)
        REFERENCES deudas(id_deuda)
        ON DELETE CASCADE,

    FOREIGN KEY (id_producto)
        REFERENCES productos(id_producto)
);


-- ============================================================
-- 13. MOVIMIENTOS DE INVENTARIO
-- ============================================================

CREATE TABLE movimientos_inventario (
    id_movimiento INT AUTO_INCREMENT PRIMARY KEY,

    id_producto INT,

    id_detalle_compra INT NULL,

    tipo ENUM(
        'entrada',
        'salida',
        'ajuste',
        'transferencia'
    ),

    cantidad INT NOT NULL,

    id_almacen_origen INT,

    id_almacen_destino INT,

    motivo TEXT,

    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    id_usuario INT,

    FOREIGN KEY (id_producto)
        REFERENCES productos(id_producto),

    FOREIGN KEY (id_detalle_compra)
        REFERENCES detalle_compra(id_detalle_compra),

    FOREIGN KEY (id_almacen_origen)
        REFERENCES almacenes(id_almacen),

    FOREIGN KEY (id_almacen_destino)
        REFERENCES almacenes(id_almacen),

    FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
);


-- ============================================================
-- 14. LOGS
-- ============================================================

CREATE TABLE logs (
    id_log INT AUTO_INCREMENT PRIMARY KEY,

    id_usuario INT,

    accion VARCHAR(100),

    tabla_afectada VARCHAR(100),

    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    descripcion TEXT,

    FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
);


-- ============================================================
-- 15. BOLSILLOS
-- ============================================================

CREATE TABLE bolsillos (
    id_bolsillo INT AUTO_INCREMENT PRIMARY KEY,

    nombre VARCHAR(100) NOT NULL,

    descripcion TEXT,

    saldo_actual DECIMAL(12,2) NOT NULL DEFAULT 0,

    activo BOOLEAN DEFAULT TRUE,

    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 16. MOVIMIENTOS DE BOLSILLOS
-- ============================================================

CREATE TABLE bolsillo_movimientos (
    id_movimiento INT AUTO_INCREMENT PRIMARY KEY,

    id_bolsillo INT NOT NULL,

    id_caja INT NOT NULL,

    id_usuario INT NOT NULL,

    tipo ENUM(
        'entrada',
        'salida'
    ) NOT NULL,

    monto DECIMAL(12,2) NOT NULL,

    motivo VARCHAR(255),

    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_bolsillo)
        REFERENCES bolsillos(id_bolsillo)
        ON DELETE CASCADE,

    FOREIGN KEY (id_caja)
        REFERENCES cajas(id_caja),

    FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
);


-- ============================================================
-- 17. ARQUEOS DE CAJA
-- ============================================================

CREATE TABLE arqueos_caja (
    id_arqueo INT AUTO_INCREMENT PRIMARY KEY,

    id_caja INT,

    fecha_apertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    fecha_cierre TIMESTAMP,

    saldo_apertura DECIMAL(12,2),

    saldo_cierre DECIMAL(12,2),

    observaciones TEXT,

    id_usuario INT,

    FOREIGN KEY (id_caja)
        REFERENCES cajas(id_caja),

    FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
);


-- ============================================================
-- 18. CIERRES DE DÍA
-- ============================================================

CREATE TABLE cierres_dia (
    id_cierre INT AUTO_INCREMENT PRIMARY KEY,

    fecha DATE NOT NULL,

    id_caja INT NOT NULL,

    total_ventas DECIMAL(12,2) NOT NULL,

    saldo_caja DECIMAL(12,2) NOT NULL,

    cantidad_a_dejar DECIMAL(12,2) NOT NULL DEFAULT 0,

    total_enviado_bolsillos DECIMAL(12,2) NOT NULL DEFAULT 0,

    id_usuario INT NOT NULL,

    fecha_cierre TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    observaciones TEXT,

    FOREIGN KEY (id_caja)
        REFERENCES cajas(id_caja),

    FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario),

    UNIQUE(fecha)
);


-- ============================================================
-- 19. DETALLE DE MÉTODOS DE PAGO DEL CIERRE
-- ============================================================

CREATE TABLE cierre_metodos_pago (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,

    id_cierre INT NOT NULL,

    id_metodo_pago INT NOT NULL,

    total DECIMAL(12,2) NOT NULL,

    FOREIGN KEY (id_cierre)
        REFERENCES cierres_dia(id_cierre)
        ON DELETE CASCADE,

    FOREIGN KEY (id_metodo_pago)
        REFERENCES metodos_pago(id_metodo)
);


-- ============================================================
-- 20. PAGOS DE COMPRAS
-- ============================================================

CREATE TABLE pagos_compra (
    id_pago_compra INT AUTO_INCREMENT PRIMARY KEY,

    id_compra INT NOT NULL,

    id_usuario INT NOT NULL,

    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    monto DECIMAL(12,2) NOT NULL,

    estado ENUM(
        'registrado',
        'anulado'
    ) NOT NULL DEFAULT 'registrado',

    observaciones TEXT,

    FOREIGN KEY (id_compra)
        REFERENCES compras(id_compra),

    FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
);


-- ============================================================
-- 21. ORÍGENES DE UN PAGO
-- ============================================================

CREATE TABLE pago_origen (
    id_pago_origen INT AUTO_INCREMENT PRIMARY KEY,

    id_pago_compra INT NOT NULL,

    tipo_origen ENUM(
        'caja',
        'bolsillo'
    ) NOT NULL,

    id_origen INT NOT NULL,

    monto DECIMAL(12,2) NOT NULL,

    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    observaciones TEXT,

    FOREIGN KEY (id_pago_compra)
        REFERENCES pagos_compra(id_pago_compra)
        ON DELETE CASCADE
);


-- ============================================================
-- 22. LIBRO MAYOR FINANCIERO
-- ============================================================

CREATE TABLE libro_mayor (
    id_movimiento BIGINT AUTO_INCREMENT PRIMARY KEY,

    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    tipo_movimiento ENUM(
        'pago_compra',
        'devolucion_compra',
        'compensacion',
        'transferencia',
        'ajuste',
        'otro'
    ) NOT NULL,

    origen_tipo VARCHAR(50) NOT NULL,

    origen_id INT NULL,

    destino_tipo VARCHAR(50) NOT NULL,

    destino_id INT NULL,

    monto DECIMAL(12,2) NOT NULL,

    id_usuario INT NOT NULL,

    id_compra INT NULL,

    id_pago_compra INT NULL,

    referencia_tipo VARCHAR(50) NULL,

    referencia_id INT NULL,

    concepto VARCHAR(255),

    observaciones TEXT,

    estado ENUM(
        'activo',
        'anulado'
    ) NOT NULL DEFAULT 'activo',

    FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario),

    FOREIGN KEY (id_compra)
        REFERENCES compras(id_compra),

    FOREIGN KEY (id_pago_compra)
        REFERENCES pagos_compra(id_pago_compra)
);


-- ============================================================
-- 23. COMPENSACIONES
-- ============================================================

CREATE TABLE compensaciones (
    id_compensacion INT AUTO_INCREMENT PRIMARY KEY,

    id_caja INT NOT NULL,

    id_bolsillo INT NOT NULL,

    id_compra INT NULL,

    id_pago_compra INT NULL,

    monto_original DECIMAL(12,2) NOT NULL,

    monto_compensado DECIMAL(12,2) NOT NULL DEFAULT 0,

    monto_pendiente DECIMAL(12,2)
        AS (
            monto_original - monto_compensado
        ) STORED,

    estado ENUM(
        'pendiente',
        'parcial',
        'compensada',
        'anulada'
    ) NOT NULL DEFAULT 'pendiente',

    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    fecha_ultima_compensacion TIMESTAMP NULL,

    id_usuario INT NOT NULL,

    observaciones TEXT,

    FOREIGN KEY (id_caja)
        REFERENCES cajas(id_caja),

    FOREIGN KEY (id_bolsillo)
        REFERENCES bolsillos(id_bolsillo),

    FOREIGN KEY (id_compra)
        REFERENCES compras(id_compra),

    FOREIGN KEY (id_pago_compra)
        REFERENCES pagos_compra(id_pago_compra),

    FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
);


-- ============================================================
-- 24. DEVOLUCIONES DE COMPRAS
-- ============================================================

CREATE TABLE devoluciones_compra (
    id_devolucion INT AUTO_INCREMENT PRIMARY KEY,

    id_compra INT NOT NULL,

    id_usuario INT NOT NULL,

    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    estado ENUM(
        'registrada',
        'reclamada',
        'aceptada',
        'rechazada',
        'cerrada'
    ) NOT NULL DEFAULT 'registrada',

    observaciones TEXT,

    FOREIGN KEY (id_compra)
        REFERENCES compras(id_compra),

    FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
);


-- ============================================================
-- 25. DETALLE DE DEVOLUCIONES DE COMPRAS
-- ============================================================

CREATE TABLE detalle_devolucion_compra (
    id_detalle_devolucion INT AUTO_INCREMENT PRIMARY KEY,

    id_devolucion INT NOT NULL,

    id_detalle_compra INT NOT NULL,

    cantidad INT NOT NULL,

    motivo VARCHAR(255),

    FOREIGN KEY (id_devolucion)
        REFERENCES devoluciones_compra(id_devolucion)
        ON DELETE CASCADE,

    FOREIGN KEY (id_detalle_compra)
        REFERENCES detalle_compra(id_detalle_compra)
);


-- ============================================================
-- 26. ÍNDICES
-- ============================================================

CREATE INDEX idx_compras_proveedor
    ON compras(id_proveedor);

CREATE INDEX idx_compras_fecha_pedido
    ON compras(fecha_pedido);

CREATE INDEX idx_compras_estado_pago
    ON compras(estado_pago);

CREATE INDEX idx_detalle_compra_producto
    ON detalle_compra(id_producto);

CREATE INDEX idx_movimientos_inventario_detalle
    ON movimientos_inventario(id_detalle_compra);

CREATE INDEX idx_pagos_compra_compra
    ON pagos_compra(id_compra);

CREATE INDEX idx_pagos_compra_fecha
    ON pagos_compra(fecha_pago);

CREATE INDEX idx_pago_origen_pago
    ON pago_origen(id_pago_compra);

CREATE INDEX idx_libro_mayor_fecha
    ON libro_mayor(fecha);

CREATE INDEX idx_libro_mayor_tipo
    ON libro_mayor(tipo_movimiento);

CREATE INDEX idx_libro_mayor_compra
    ON libro_mayor(id_compra);

CREATE INDEX idx_libro_mayor_pago
    ON libro_mayor(id_pago_compra);

CREATE INDEX idx_compensaciones_estado
    ON compensaciones(estado);

CREATE INDEX idx_compensaciones_caja
    ON compensaciones(id_caja);

CREATE INDEX idx_compensaciones_bolsillo
    ON compensaciones(id_bolsillo);

CREATE INDEX idx_devoluciones_compra
    ON devoluciones_compra(id_compra);

CREATE INDEX idx_detalle_devolucion_detalle
    ON detalle_devolucion_compra(id_detalle_compra);


-- ============================================================
-- 27. INSERCIÓN DE DATOS BÁSICOS
-- ============================================================

INSERT INTO roles (
    nombre_rol
) VALUES
    ('Admin'),
    ('Vendedor'),
    ('Cliente');


INSERT INTO almacenes (
    nombre,
    activo
) VALUES
    ('Bodega', TRUE),
    ('Vitrinas', TRUE);


INSERT INTO cajas (
    nombre,
    activo
) VALUES
    ('Caja Principal', TRUE),
    ('Chanse', TRUE),
    ('Recargas', TRUE);


INSERT INTO metodos_pago (
    nombre
) VALUES
    ('Efectivo'),
    ('Tarjeta'),
    ('Daviplata'),
    ('Nequi');


-- ============================================================
-- 28. PROVEEDOR ESPECIAL "YO"
-- ============================================================

INSERT INTO proveedores (
    nombre,
    observaciones,
    activo
)
SELECT
    'YO',
    'Proveedor interno utilizado para listas de compra y compras realizadas en diferentes establecimientos.',
    TRUE
WHERE NOT EXISTS (
    SELECT 1
    FROM proveedores
    WHERE nombre = 'YO'
);


-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================