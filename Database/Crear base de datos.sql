-- =======================================
-- CREACIÓN DE BASE DE DATOS
-- =======================================
DROP DATABASE IF EXISTS Cigarreria_JJ;
CREATE DATABASE Cigarreria_JJ;
USE Cigarreria_JJ;

-- =======================================
-- TABLAS DE CATÁLOGO
-- =======================================

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
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria)
);

CREATE TABLE productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    codigo_barras VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    imagen VARCHAR(255),
    descripcion TEXT,
    id_marca INT,
    precio_compra DECIMAL(12,2) NOT NULL,
    precio_venta DECIMAL(12,2) NOT NULL,
    stock_actual INT DEFAULT 0,
    stock_minimo INT DEFAULT 0,
    unidad_medida VARCHAR(50),
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_marca) REFERENCES marcas(id_marca)
);

-- =======================================
-- ROLES Y USUARIOS
-- =======================================

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
    FOREIGN KEY (rol) REFERENCES roles(id_rol)
);

-- =======================================
-- ALMACENES E INVENTARIO
-- =======================================

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
    FOREIGN KEY (id_almacen) REFERENCES almacenes(id_almacen),
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);

-- =======================================
-- PROVEEDORES Y COMPRAS
-- =======================================

CREATE TABLE proveedores (
    id_proveedor INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    nit VARCHAR(50),
    telefono VARCHAR(50),
    correo VARCHAR(100),
    direccion VARCHAR(150),
    ciudad VARCHAR(100),
    pais VARCHAR(100)
);

-- Relación muchos a muchos proveedores-productos
CREATE TABLE proveedores_productos (
    id_proveedor INT,
    id_producto INT,
    precio_sugerido DECIMAL(12,2),
    PRIMARY KEY (id_proveedor, id_producto),
    FOREIGN KEY (id_proveedor) REFERENCES proveedores(id_proveedor),
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);

CREATE TABLE compras (
    id_compra INT AUTO_INCREMENT PRIMARY KEY,
    id_proveedor INT,
    fecha_compra TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(12,2),
    estado ENUM('pendiente','recibida','cancelada'),
    observaciones TEXT,
    FOREIGN KEY (id_proveedor) REFERENCES proveedores(id_proveedor)
);

CREATE TABLE detalle_compra (
    id_detalle_compra INT AUTO_INCREMENT PRIMARY KEY,
    id_compra INT,
    id_producto INT,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) AS (cantidad * precio_unitario) STORED,
    FOREIGN KEY (id_compra) REFERENCES compras(id_compra) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);

-- =======================================
-- CAJAS Y VENTAS
-- =======================================

CREATE TABLE cajas (
    id_caja INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    saldo_inicial DECIMAL(12,2) DEFAULT 0,
    saldo_actual DECIMAL(12,2) DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE ventas (
    id_venta INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    id_caja INT,
    fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(12,2),
    estado ENUM('pendiente','pagada','cancelada','fiada'),
    observaciones TEXT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_caja) REFERENCES cajas(id_caja)
);

CREATE TABLE detalle_venta (
    id_detalle_venta INT AUTO_INCREMENT PRIMARY KEY,
    id_venta INT,
    id_producto INT,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) AS (cantidad * precio_unitario) STORED,
    FOREIGN KEY (id_venta) REFERENCES ventas(id_venta) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);

-- Métodos de pago y pagos asociados a ventas
CREATE TABLE metodos_pago (
    id_metodo INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

CREATE TABLE pagos_venta (
    id_pago INT AUTO_INCREMENT PRIMARY KEY,
    id_venta INT,
    id_metodo INT,
    monto DECIMAL(12,2),
    FOREIGN KEY (id_venta) REFERENCES ventas(id_venta) ON DELETE CASCADE,
    FOREIGN KEY (id_metodo) REFERENCES metodos_pago(id_metodo)
);

-- =======================================
-- DEUDAS (clientes = usuarios con rol Usuario)
-- =======================================

CREATE TABLE deudas (
    id_deuda INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(12,2) NOT NULL,
    estado ENUM('pendiente','pagada','parcial') DEFAULT 'pendiente',
    observaciones TEXT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

CREATE TABLE detalle_deuda (
    id_detalle_deuda INT AUTO_INCREMENT PRIMARY KEY,
    id_deuda INT,
    id_producto INT,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) AS (cantidad * precio_unitario) STORED,
    FOREIGN KEY (id_deuda) REFERENCES deudas(id_deuda) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);

-- =======================================
-- MOVIMIENTOS DE INVENTARIO
-- =======================================

CREATE TABLE movimientos_inventario (
    id_movimiento INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT,
    tipo ENUM('entrada','salida','ajuste','transferencia'),
    cantidad INT NOT NULL,
    id_almacen_origen INT,
    id_almacen_destino INT,
    motivo TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_usuario INT,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto),
    FOREIGN KEY (id_almacen_origen) REFERENCES almacenes(id_almacen),
    FOREIGN KEY (id_almacen_destino) REFERENCES almacenes(id_almacen),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- =======================================
-- LOGS
-- =======================================

CREATE TABLE logs (
    id_log INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    accion VARCHAR(100),
    tabla_afectada VARCHAR(100),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    descripcion TEXT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- =======================================
-- TRANSACCIONES DE CAJA
-- =======================================

CREATE TABLE transacciones_caja (
    id_transaccion_caja INT AUTO_INCREMENT PRIMARY KEY,
    id_caja INT,
    tipo ENUM('ingreso','egreso','ajuste'),
    monto DECIMAL(12,2) NOT NULL,
    concepto VARCHAR(150),
    id_usuario INT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observaciones TEXT,
    FOREIGN KEY (id_caja) REFERENCES cajas(id_caja),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

CREATE TABLE arqueos_caja (
    id_arqueo INT AUTO_INCREMENT PRIMARY KEY,
    id_caja INT,
    fecha_apertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre TIMESTAMP,
    saldo_apertura DECIMAL(12,2),
    saldo_cierre DECIMAL(12,2),
    observaciones TEXT,
    id_usuario INT,
    FOREIGN KEY (id_caja) REFERENCES cajas(id_caja),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- =======================================
-- INSERCIÓN DE DATOS BÁSICOS
-- =======================================

INSERT INTO roles (nombre_rol) VALUES
    ('Admin'),
    ('Vendedor'),
    ('Cliente');

INSERT INTO almacenes (nombre, activo) VALUES
    ('Bodega', true),
    ('Vitrinas', true);

INSERT INTO cajas (nombre, activo) VALUES
    ('Caja Principal', true),
    ('Chanse', true),
    ('Recargas', true);

INSERT INTO metodos_pago (nombre) VALUES
    ('Efectivo'),
    ('Tarjeta'),
    ('Daviplata'),
    ('Nequi');
