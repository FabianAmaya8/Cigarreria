# 🏪 Cigarrería JJ

## Contexto general del proyecto

**Cigarrería JJ** es una aplicación web de gestión integral para una cigarrería, diseñada para centralizar las operaciones comerciales, administrativas y financieras del negocio.

El sistema está construido como una aplicación **Full Stack**, separando claramente frontend, backend, base de datos y servicios auxiliares.

```text
                    ┌──────────────────────┐
                    │       Usuario        │
                    │ Cliente / Vendedor   │
                    │     Administrador    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │       Frontend       │
                    │    React + Vite      │
                    └──────────┬───────────┘
                               │ HTTP
                               ▼
                    ┌──────────────────────┐
                    │       Backend        │
                    │       FastAPI        │
                    └───────┬───────┬──────┘
                            │       │
                ┌───────────┘       └───────────┐
                ▼                               ▼
        ┌──────────────┐                ┌──────────────┐
        │    MySQL     │                │    Redis     │
        │ Persistencia │                │ Estado POS   │
        └──────────────┘                └──────────────┘

                       │
                       ▼
                ┌──────────────┐
                │  /storage    │
                │ Imágenes/PDF │
                └──────────────┘
```

La arquitectura actual del repositorio contiene `Backend`, `Frontend`, `Database`, `docker-compose.yml` y configuración mediante variables de entorno.

---

# 🎯 Propósito del sistema

El propósito de Cigarrería JJ es reducir la dependencia de procesos manuales y centralizar en una sola plataforma:

* Venta de productos.
* Control de inventario.
* Gestión de almacenes.
* Gestión de deudas.
* Compras.
* Proveedores.
* Pagos.
* Cajas.
* Bolsillos.
* Cierre operativo.
* Estadísticas.
* Gestión de usuarios.
* Archivos e imágenes.

El sistema busca que las operaciones de una venta, compra o movimiento financiero tengan un flujo trazable entre sus diferentes módulos.

---

# 🧩 Módulos funcionales

## 1. Autenticación y usuarios

Sistema de identificación mediante usuario/correo y contraseña.

Utiliza:

* JWT.
* Bcrypt.
* Roles.
* Sesiones persistidas en el frontend.

Roles actuales:

```text
1 → Administrador
2 → Vendedor
3 → Cliente
```

---

# 2. Catálogo de productos

Cada producto representa un artículo comercializable.

Puede contener:

* Código de barras.
* Nombre.
* Descripción.
* Precio de venta.
* Imagen.
* Marca.
* Categoría.
* Unidad de medida.
* Stock mínimo.
* Estado.

Los productos se utilizan por múltiples módulos:

```text
Producto
 ├── POS
 ├── Inventario
 ├── Compras
 ├── Deudas
 ├── Estadísticas
 └── Proveedores
```

---

# 3. Inventario

El inventario representa la existencia física del negocio.

La existencia se maneja por:

```text
Producto + Almacén
```

Esto permite que un mismo producto tenga diferentes cantidades dependiendo de su ubicación.

Los movimientos pueden representar:

```text
Entrada
Salida
Transferencia
```

Los eventos importantes del sistema deben mantener trazabilidad mediante movimientos de inventario.

---

# 4. Punto de Venta

El POS es el núcleo de la operación diaria.

Una venta se construye sobre una **mesa**.

Una mesa puede contener:

```text
Mesa
├── Productos
├── Recargas
├── Chance
└── Total
```

Las mesas abiertas se mantienen temporalmente en Redis.

El POS permite:

* Crear mesas.
* Navegar entre mesas.
* Agregar productos.
* Modificar cantidades.
* Eliminar productos.
* Seleccionar almacén.
* Agregar recargas.
* Agregar chance.
* Cerrar venta.
* Cerrar deuda.
* Cancelar mesa.
* Aplicar métodos de pago.

---

# 5. Ventas

Cuando una mesa se cierra como venta:

```text
Mesa
 ↓
Venta
 ↓
Detalle de venta
 ↓
Pago
 ↓
Descuento de inventario
 ↓
Movimiento de inventario
 ↓
Actualización de caja
 ↓
Registro de actividad
```

El sistema debe conservar la relación entre estos eventos.

No debe considerarse una venta únicamente como un cambio de stock o una suma monetaria aislada.

---

# 6. Deudas

Una mesa también puede convertirse en una deuda.

```text
Mesa
 ↓
Deuda
 ↓
Detalle de deuda
 ↓
Pago posterior
```

La deuda está asociada a un usuario y el inventario se descuenta al momento de registrar la operación.

---

# 7. Proveedores

Los proveedores representan los lugares/personas desde donde se adquieren productos.

El sistema permite relacionar:

```text
Proveedor
 ├── Productos
 └── Compras
       └── Historial de precios
```

Existe el proveedor especial:

```text
YO
```

Este representa compras realizadas sin un proveedor formal o compras personales/alternativas.

---

# 8. Compras

La compra tiene un ciclo propio:

```text
Pedido
   ↓
Recepción
   ↓
Inventario
   ↓
Pago
   ↓
Saldo pendiente / pagado
```

Una compra puede estar:

```text
Pedido:
pendiente / completada

Recepción:
pendiente / parcial / completa

Pago:
pendiente / parcial / pagada
```

La creación de una compra **no debe aumentar automáticamente el inventario**.

El inventario aumenta cuando la compra se recibe.

Además, el precio de recepción puede diferir del precio inicialmente solicitado.

---

# 9. Historial de precios

El sistema no depende de un único costo permanente almacenado dentro del producto.

Las compras guardan información histórica de precios por operación, permitiendo analizar:

```text
Producto
   ↓
Proveedor
   ↓
Fecha
   ↓
Precio pedido
   ↓
Precio recibido
```

Esto facilita detectar cambios de precio y comparar proveedores.

---

# 10. Pagos de compras

Las compras pueden pagarse:

* Totalmente.
* Parcialmente.
* En momentos posteriores.

Además, el origen de un pago puede ser:

```text
Caja
Bolsillo
```

El sistema valida que los fondos realmente existan antes de registrar el pago.

---

# 11. Cajas

Las cajas representan fondos operativos diferenciados.

El POS puede afectar diferentes cajas dependiendo del tipo de operación.

Por ejemplo:

```text
Caja productos
Caja chance
Caja recargas
```

La arquitectura financiera debe preservar estas separaciones porque no representan necesariamente el mismo flujo de dinero.

---

# 12. Bolsillos

Los bolsillos son fondos separados de las cajas.

Pueden representar dinero destinado a:

* Ahorro.
* Reservas.
* Gastos.
* Pagos.
* Otros usos internos del negocio.

Los movimientos se registran independientemente mediante `BolsilloMovimiento`.

Esto significa que **bolsillos y libro mayor no deben tratarse automáticamente como una sola cosa**.

---

# 13. Compensaciones

El sistema contempla compensaciones entre cajas y bolsillos.

Una compensación puede quedar:

```text
Pendiente
Parcial
Completada
```

Estas operaciones permiten controlar dinero que debe trasladarse o reconocerse entre diferentes fondos.

---

# 14. Libro mayor

El sistema contempla un `LibroMayor` para registrar determinados movimientos financieros y relaciones entre:

```text
Origen
Destino
Monto
Usuario
Compra
Pago
Compensación
Concepto
Estado
```

No todo movimiento de bolsillo debe convertirse automáticamente en una entrada independiente del libro mayor; el código actual mantiene operaciones específicas de bolsillos mediante `BolsilloMovimiento`.

---

# 15. Cierre del día

El cierre del día representa la consolidación de la operación diaria.

Conceptualmente permite analizar:

```text
Ventas
+ Pagos
+ Cajas
+ Fondos
+ Movimientos
= Situación de cierre
```

El cierre no debe interpretarse como simplemente "poner un contador en cero". Debe conservar información histórica de la operación y de los fondos resultantes.

---

# 16. Estadísticas

El sistema dispone de estadísticas de:

```text
Más vendidos
Más ingresos
Menor stock
Menos vendidos
```

Esto permite utilizar los datos transaccionales como herramienta de decisión.

---

# 17. Archivos

El sistema utiliza almacenamiento local para archivos.

Actualmente se contempla almacenamiento organizado de:

```text
Usuarios
 └── Avatares

Productos
 └── Imágenes

Compras
 └── Facturas
```

Las imágenes y PDF son validados antes de almacenarse y reciben nombres únicos.

La API publica estos archivos mediante:

```text
/uploads
```

---

# 🏗️ Arquitectura técnica

## Backend

```text
FastAPI
   ↓
Routers
   ↓
Schemas
   ↓
SQLAlchemy Models
   ↓
MySQL
```

Servicios auxiliares:

```text
Redis
Storage local
Logs
```

El backend registra actualmente módulos separados para autenticación, POS, inventario, productos, proveedores, compras, deudas, estadísticas, usuarios y bolsillos.

---

# 🎨 Frontend

```text
React
 ↓
React Router
 ↓
Layouts
 ↓
Pages / Components / Modules
 ↓
API
```

React Query se utiliza como administrador de estado remoto, mientras `AuthContext` controla autenticación y `ColorContexts` controla el tema visual.

---

# 🐳 Infraestructura

Docker Compose actualmente contempla:

```text
api
mysql
redis
frontend
```

Puertos publicados:

```text
API       → 8000
MySQL     → 3307
Redis     → 6379
Frontend  → 80
```

El backend monta el almacenamiento físico en `/app/storage` y MySQL utiliza un volumen para mantener persistencia.

---

# 🔄 Flujo de información principal

## Venta de producto

```text
Usuario
 ↓
Frontend POS
 ↓
FastAPI
 ↓
Redis + MySQL
 ↓
Venta
 ↓
Detalle de venta
 ↓
Pago
 ↓
Inventario
 ↓
Caja
```

## Venta a crédito

```text
Usuario
 ↓
POS
 ↓
Deuda
 ↓
Detalle deuda
 ↓
Inventario
```

## Compra

```text
Proveedor
 ↓
Compra
 ↓
Detalle compra
 ↓
Recepción
 ↓
Inventario
 ↓
Pago
 ↓
Caja/Bolsillo
 ↓
Registros financieros
```

---

# 🧠 Contexto obligatorio para una IA que modifique el proyecto

Una IA que trabaje sobre este repositorio debe comprender las siguientes reglas conceptuales:

### 1. No mezclar inventario con productos

El producto describe **qué se vende**.

El inventario describe **cuánto existe y dónde existe**.

---

### 2. No aumentar inventario al crear una compra

Crear una compra representa una intención/pedido.

La recepción representa la llegada física y es el momento que actualiza existencias.

---

### 3. POS y Redis

Redis se utiliza para mantener el estado temporal de las mesas del POS.

Por tanto, modificar el POS requiere considerar tanto:

```text
Estado temporal
```

como:

```text
Persistencia final
```

---

### 4. Todo cambio de inventario debe ser trazable

Una entrada o salida no debería limitarse a modificar `stock`.

Debe existir el movimiento correspondiente cuando la operación del dominio lo requiera.

---

### 5. Cajas y bolsillos son conceptos diferentes

No asumir que:

```text
Caja = Bolsillo
```

Los bolsillos tienen sus propios saldos y movimientos.

---

### 6. El historial de precios pertenece a las operaciones de compra

No implementar un único costo global en el producto simplemente para solucionar una consulta.

Consultar el historial cuando se necesite analizar evolución de precios.

---

### 7. El frontend no es la autoridad de seguridad

Ocultar un botón o una ruta no equivale a autorizar una operación.

Las validaciones críticas deben existir en el backend.

---

### 8. No introducir servicios externos innecesariamente

El proyecto dispone de almacenamiento local para imágenes y documentos.

Antes de introducir servicios externos de archivos, revisar la infraestructura existente.

---

### 9. Mantener trazabilidad

Las operaciones críticas pueden afectar simultáneamente:

```text
Usuario
Venta/Compra
Inventario
Caja
Bolsillo
Libro mayor
Logs
```

Una modificación aparentemente pequeña debe analizar sus efectos sobre todos los módulos relacionados.

---

### 10. Revisar el código existente antes de crear nuevas abstracciones

Antes de implementar una funcionalidad:

```text
1. Buscar el router existente.
2. Buscar el model existente.
3. Buscar el schema existente.
4. Buscar el servicio/utilidad existente.
5. Revisar cómo lo consume el frontend.
6. Reutilizar antes de duplicar.
```

---

# 🗂️ Estructura conceptual del dominio

```text
                         USUARIOS
                            │
                ┌───────────┴───────────┐
                │                       │
             ROLES                   PERFIL
                │
                ▼
        OPERACIÓN COMERCIAL
                │
        ┌───────┼────────┐
        ▼       ▼        ▼
      POS    COMPRAS   DEUDAS
        │       │
        │       ├──────────────┐
        │       ▼              ▼
        │   PROVEEDORES   HISTORIAL PRECIOS
        │
        ▼
    INVENTARIO
        │
        ▼
    PRODUCTOS
        │
        ├── CATEGORÍAS
        ├── MARCAS
        └── ALMACENES

        OPERACIÓN FINANCIERA
                 │
        ┌────────┼────────┐
        ▼        ▼        ▼
      CAJAS   BOLSILLOS  PAGOS
        │        │        │
        └────────┼────────┘
                 ▼
         COMPENSACIONES
                 │
                 ▼
           LIBRO MAYOR
```

---

# 🚀 Objetivo de evolución

El proyecto está diseñado para continuar creciendo como un sistema de gestión integral de una cigarrería.

Las futuras modificaciones deben priorizar:

* Consistencia de datos.
* Trazabilidad.
* Separación de responsabilidades.
* Persistencia segura.
* Reutilización.
* Experiencia de usuario.
* Compatibilidad con Docker.
* Mantenimiento sencillo.
* Claridad del dominio.

---

# 📚 Dónde debe comenzar una IA

Cuando una IA reciba una tarea relacionada con el proyecto, debe comenzar identificando qué capa está siendo modificada:

```text
¿Es UI?
    ↓
Frontend

¿Es una regla de negocio?
    ↓
Backend

¿Es persistencia?
    ↓
Modelos / SQL

¿Es estado temporal del POS?
    ↓
Redis

¿Es un archivo?
    ↓
file_storage

¿Es una operación financiera?
    ↓
Caja / Bolsillo / Pago / Libro Mayor
```

Luego debe buscar primero implementaciones existentes para evitar duplicar funcionalidades.

---

# ▶️ Ejecución

## Docker Compose

Desde la raíz:

```bash
docker compose up -d --build
```

Arquitectura:

```text
Frontend :80
API      :8000
MySQL    :3307
Redis    :6379
```

## Desarrollo sin Docker

### Backend

```bash
cd Backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

---

# 👨‍💻 Filosofía del proyecto

Cigarrería JJ no debe tratarse como un simple CRUD de productos.

Es un sistema donde:

```text
VENTAS
   ↕
INVENTARIO
   ↕
COMPRAS
   ↕
PROVEEDORES
   ↕
PAGOS
   ↕
CAJAS
   ↕
BOLSILLOS
   ↕
FINANZAS
```

están conectados.

Por eso, cualquier nueva funcionalidad debe analizar:

**qué información crea, qué información modifica, qué saldo afecta, qué inventario modifica, qué historial debe conservar y qué otros módulos dependen de ella.**
