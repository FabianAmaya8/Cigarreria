# 🏪 Cigarrería JJ — Backend

Backend de la aplicación de gestión integral para **Cigarrería JJ**, construido con **FastAPI**, **SQLAlchemy**, **MySQL** y **Redis**.

El backend centraliza la lógica de negocio del sistema: autenticación, usuarios, productos, inventario, punto de venta, deudas, proveedores, compras, bolsillos, estadísticas y operaciones financieras relacionadas con cajas.

---

## 📌 Objetivo

El backend funciona como la capa de servicios y reglas de negocio de Cigarrería JJ.

Su responsabilidad principal es:

* Exponer una API REST para el frontend.
* Validar autenticación y permisos.
* Gestionar la información persistente en MySQL.
* Gestionar el estado temporal del POS mediante Redis.
* Registrar movimientos de inventario.
* Controlar ventas, deudas, compras y pagos.
* Administrar cajas y bolsillos.
* Gestionar imágenes y documentos almacenados localmente.
* Mantener trazabilidad mediante registros de actividad.

La aplicación está configurada como una API FastAPI con documentación automática en `/docs` y `/redoc`, además de una referencia Scalar disponible en `/scalar`.

---

# 🧱 Stack tecnológico

| Tecnología       | Uso                                            |
| ---------------- | ---------------------------------------------- |
| Python 3.11      | Lenguaje principal                             |
| FastAPI          | Framework de API                               |
| SQLAlchemy 1.4   | ORM y acceso a datos                           |
| MySQL 8          | Base de datos relacional                       |
| PyMySQL          | Driver MySQL                                   |
| Redis 7          | Estado temporal del POS y valores transitorios |
| Pydantic 2       | Validación y serialización                     |
| JWT              | Autenticación                                  |
| Passlib + bcrypt | Hash y validación de contraseñas               |
| Uvicorn          | Servidor ASGI                                  |
| python-multipart | Formularios y archivos                         |
| Nginx            | Servido del frontend en producción             |
| Docker           | Contenerización                                |

Las dependencias actuales están definidas en `requirements.txt`.

---

# 📁 Arquitectura

La aplicación se organiza principalmente alrededor de:

```text
Backend/
├── app/
│   ├── core/
│   │   ├── security.py
│   │   └── redis.py
│   │
│   ├── models/
│   │   └── ...
│   │
│   ├── schemas/
│   │   └── ...
│   │
│   ├── routers/
│   │   ├── auth.py
│   │   ├── bolsillos.py
│   │   ├── compras.py
│   │   ├── deudas.py
│   │   ├── estadisticas.py
│   │   ├── inventario.py
│   │   ├── productos.py
│   │   ├── proveedores.py
│   │   ├── usuario_personal.py
│   │   ├── usuarios.py
│   │   └── pos.py
│   │
│   ├── utils/
│   │   ├── file_storage.py
│   │   ├── registrar_logs.py
│   │   └── registrar_mov_inv.py
│   │
│   ├── database.py
│   └── main.py
│
├── requirements.txt
└── Dockerfile
```

La aplicación registra actualmente los routers de autenticación, bolsillos, compras, deudas, estadísticas, inventario, productos, proveedores, perfil, usuarios y POS.

---

# 🔐 Autenticación y autorización

La autenticación utiliza:

* JWT.
* Algoritmo `HS256`.
* Contraseñas protegidas mediante bcrypt.
* Dependencia `get_current_user`.
* Tokens con fecha de expiración.
* Roles numéricos.

En el login se genera un token que contiene el identificador del usuario y su rol.

## Roles actuales

| Rol           | Identificador | Uso                    |
| ------------- | ------------: | ---------------------- |
| Administrador |           `1` | Administración general |
| Vendedor      |           `2` | Operación comercial    |
| Cliente       |           `3` | Funciones de cliente   |

El frontend utiliza estos roles para proteger rutas y el backend realiza validaciones adicionales en determinados endpoints.

> Importante: no debe asumirse que todos los endpoints están protegidos de la misma forma. Antes de modificar permisos, revisar explícitamente el router y sus dependencias.

---

# 👤 Usuarios y perfiles

El backend permite:

* Registro.
* Inicio de sesión mediante usuario o correo.
* Consulta de usuarios.
* Actualización de usuarios.
* Eliminación.
* Consulta de imagen de usuario.
* Consulta del perfil propio.
* Actualización de datos personales.
* Cambio de nombre de usuario verificando unicidad.
* Cambio de contraseña.
* Cambio de imagen de perfil.

El perfil propio se encuentra bajo `/api/perfil`. El cambio de usuario devuelve conflicto `409` cuando el nombre solicitado ya existe.

---

# 📦 Productos

El módulo de productos permite trabajar con:

* Código de barras.
* Nombre.
* Descripción.
* Precio de venta.
* Stock mínimo.
* Unidad de medida.
* Marca.
* Categoría.
* Estado activo/inactivo.
* Imagen.
* Consulta por código de barras.
* Listados con información de stock.

También existen operaciones para categorías y marcas.

### Regla importante

El stock operativo no debe considerarse una propiedad aislada del producto.

El inventario se maneja mediante registros asociados a **producto + almacén**, permitiendo manejar existencias en diferentes ubicaciones.

---

# 🏬 Inventario

El módulo de inventario permite:

* Consultar inventario.
* Consultar stock acumulado de productos.
* Gestionar existencias por almacén.
* Registrar entradas y salidas.
* Realizar transferencias entre almacenes.
* Registrar movimientos de inventario.

Las operaciones importantes deben generar trazabilidad mediante movimientos de inventario y, cuando corresponda, registros de actividad.

---

# 🛒 Punto de Venta (POS)

El POS es uno de los módulos centrales del sistema.

Trabaja con **mesas persistidas temporalmente en Redis**. Cada mesa almacena su estado mientras la venta permanece abierta.

Una mesa puede contener:

```text
Mesa
├── Productos
├── Recargas
├── Chance
└── Total
```

## Funcionalidades

* Crear mesas.
* Consultar mesas abiertas.
* Cambiar de mesa.
* Agregar productos.
* Editar cantidades.
* Eliminar productos.
* Seleccionar almacén.
* Agregar recargas.
* Agregar operaciones de chance.
* Editar recargas.
* Editar chance.
* Consultar métodos de pago.
* Cerrar una mesa como venta.
* Cerrar una mesa como deuda.
* Cancelar una mesa.

Cuando se completa una venta:

1. Se registra la venta.
2. Se registran sus detalles.
3. Se registran los pagos.
4. Se descuenta inventario.
5. Se registran movimientos de inventario.
6. Se actualizan las cajas correspondientes.
7. Se registra actividad.
8. Se elimina el estado temporal de la mesa en Redis.

El cierre como deuda sigue un flujo similar, pero crea una deuda en lugar de una venta pagada.

---

# 💳 Métodos de pago y cajas

El POS diferencia operaciones de:

* Productos.
* Recargas.
* Chance.

Estas operaciones pueden afectar cajas distintas dentro del sistema.

Las cajas representan fondos operativos separados y participan también en pagos de compras y movimientos financieros.

---

# 📒 Deudas

El módulo `/api/deudas` permite administrar deudas asociadas a usuarios.

Incluye:

* Listado de deudas pendientes.
* Consulta de deudas por usuario.
* Detalle de deuda.
* Registro de productos asociados.
* Pagos de deuda.
* Actualización del estado de la deuda.

Cuando una venta POS se cierra como deuda, el inventario se descuenta y se registra el movimiento correspondiente.

---

# 🤝 Proveedores

El módulo de proveedores permite:

* Crear proveedores.
* Actualizar proveedores.
* Activar/desactivar proveedores.
* Buscar proveedores.
* Consultar información detallada.
* Consultar productos relacionados.
* Consultar compras realizadas.
* Consultar historial de precios.

Existe además un proveedor especial denominado **`YO`**, utilizado para representar compras sin proveedor formal o compras personales/alternativas.

---

# 🧾 Compras

El módulo `/api/compras` gestiona el ciclo completo de compras.

## Flujo conceptual

```text
Crear compra
      ↓
Pedido pendiente
      ↓
Recepción
      ↓
Actualización de inventario
      ↓
Pago total/parcial
      ↓
Compra saldada
```

Cada compra puede tener:

* Proveedor.
* Número de factura.
* Documento de factura.
* Fecha de pedido.
* Fecha de recepción.
* Detalles.
* Cantidad solicitada.
* Cantidad recibida.
* Precio pedido.
* Precio recibido.
* Estado de recepción.
* Estado de pago.
* Pagos.
* Orígenes del pago.
* Devoluciones.
* Compensaciones.

### Recepción

La recepción se realiza producto por producto.

Un detalle puede quedar:

* `no_recibido`
* `parcial`
* `completo`

La recepción es el evento que incrementa realmente el inventario. El sistema además permite registrar un precio recibido diferente al precio originalmente pedido.

### Pagos

Los pagos pueden hacerse con fondos provenientes de:

* Caja.
* Bolsillo.

Se valida el saldo disponible y el monto total de los orígenes debe coincidir con el pago registrado.

---

# 💰 Bolsillos

Los bolsillos representan fondos separados de las cajas.

Permiten:

* Crear bolsillos.
* Editarlos.
* Desactivarlos.
* Consultar saldo.
* Consultar total disponible.
* Registrar entradas.
* Registrar salidas.
* Registrar pagos.
* Consultar movimientos por fecha.

Los movimientos quedan registrados en `BolsilloMovimiento`.

Los bolsillos se integran con compras y compensaciones, pero mantienen su propio historial de movimientos.

---

# 📊 Estadísticas

El módulo `/api/estadisticas` actualmente permite consultar:

* Productos más vendidos.
* Productos con mayores ingresos.
* Productos con menor stock.
* Productos menos vendidos.

Los resultados se calculan directamente desde ventas e inventario.

---

# 📈 Reportes de compras y finanzas

El módulo de compras incorpora reportes para:

* Compras pendientes de pago.
* Historial de precios por producto/proveedor.
* Compensaciones pendientes.
* Información relacionada con el libro mayor.

Esto permite analizar evolución de precios y obligaciones pendientes sin almacenar simplemente un único costo global en el producto.

---

# 📂 Almacenamiento local

Los archivos ya no dependen conceptualmente de un servicio externo de almacenamiento.

El sistema utiliza un almacenamiento local configurable mediante:

```env
STORAGE_DIR=/app/storage
```

La utilidad de almacenamiento permite organizar archivos por categorías, generar nombres únicos y validar extensiones/tipos MIME. Soporta imágenes y PDF.

Ejemplo conceptual:

```text
storage/
├── usuarios/
│   └── avatares/
├── productos/
│   └── imagenes/
└── compras/
    └── facturas/
```

Los archivos se exponen desde FastAPI bajo:

```text
/uploads
```

---

# 🗃️ Base de datos

La conexión se configura mediante variables de entorno:

```env
Host_Sql=
User_Sql=
Pass_Sql=
Database_Sql=
Puerto_Sql=
```

La aplicación utiliza SQLAlchemy y construye la conexión:

```text
mysql+pymysql://usuario:password@host:puerto/base
```

---

# 🐳 Docker

El backend posee su propio `Dockerfile` basado en Python 3.11.

El contenedor:

* Instala dependencias.
* Copia la aplicación.
* Expone el puerto `8000`.
* Ejecuta Uvicorn escuchando en `0.0.0.0:8000`.

Con Docker Compose, el backend depende de:

```text
api
├── mysql
└── redis
```

y monta el almacenamiento físico del servidor dentro del contenedor mediante:

```text
STORAGE_HOST_DIR:/app/storage
```

---

# ⚙️ Variables de entorno

Ejemplo:

```env
Host_Sql=mysql
User_Sql=root
Pass_Sql=*****
Database_Sql=Cigarreria_JJ
Puerto_Sql=3306

Secret_Key=*****
Tiempo_Token=42000

REDIS_HOST=redis
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=
REDIS_TTL_MESA=86400

STORAGE_DIR=/app/storage
```

El repositorio incluye `example.env` como referencia. Las credenciales reales no deben almacenarse en Git.

---

# ▶️ Ejecución local

```bash
cd Backend

python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

### Linux/macOS

```bash
source venv/bin/activate
```

Instalar dependencias:

```bash
pip install -r requirements.txt
```

Ejecutar:

```bash
uvicorn app.main:app --reload
```

Servidor:

```text
http://127.0.0.1:8000
```

Documentación:

```text
http://127.0.0.1:8000/docs
http://127.0.0.1:8000/redoc
http://127.0.0.1:8000/scalar
```

---

# 🧠 Reglas para trabajar sobre el backend

Al modificar el proyecto:

1. Mantener separadas las responsabilidades entre `routers`, `models`, `schemas`, `core` y `utils`.
2. No colocar reglas complejas de negocio directamente en el frontend.
3. Validar permisos en backend, no confiar únicamente en las rutas de React.
4. No guardar imágenes directamente dentro de la base de datos.
5. No introducir una dependencia externa de almacenamiento sin revisar primero `file_storage.py`.
6. Las operaciones que alteren inventario deben generar el movimiento correspondiente.
7. Las modificaciones financieras deben mantener coherencia entre cajas, bolsillos, pagos y registros asociados.
8. No eliminar físicamente información histórica cuando el dominio requiera trazabilidad.
9. Antes de modificar una entidad, revisar sus relaciones SQLAlchemy y sus schemas.
10. Mantener compatibilidad con Docker y las variables de entorno existentes.

---

# 🔗 Endpoints principales

```text
/api/pos
/api/inventario
/api/productos
/api/deudas
/api/compras
/api/proveedores
/api/bolsillos
/api/estadisticas
/api/usuarios
/api/perfil

/login
/register

/uploads/*
```

Los routers actualmente registrados en `main.py` definen la superficie principal de la API.
