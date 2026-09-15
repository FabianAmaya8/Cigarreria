# 🏪 Cigarrería JJ — Frontend

Frontend de la aplicación de gestión de **Cigarrería JJ**, desarrollado con **React + Vite**.

La aplicación proporciona la interfaz visual para clientes, vendedores y administradores, consumiendo la API de FastAPI y utilizando React Query para gestionar datos remotos.

---

# 🧱 Tecnologías

| Tecnología           | Uso                             |
| -------------------- | ------------------------------- |
| React 19             | Interfaz                        |
| Vite 7               | Desarrollo y build              |
| React Router DOM 7   | Enrutamiento                    |
| TanStack React Query | Estado y cache de datos remotos |
| Material UI          | Componentes de interfaz         |
| Emotion              | Estilos utilizados por MUI      |
| Sass                 | Sistema de estilos propio       |
| SweetAlert2          | Alertas y diálogos              |
| Lucide React         | Iconografía                     |
| React Icons          | Iconografía adicional           |
| Chart.js             | Gráficos                        |
| Motion               | Animaciones                     |
| jwt-decode           | Lectura del JWT                 |

Las dependencias actuales se encuentran en `package.json`.

---

# 📁 Estructura general

```text
Frontend/
├── src/
│   ├── assets/
│   │   └── Css/
│   │
│   ├── Components/
│   │   ├── Admin/
│   │   ├── Client/
│   │   └── Vendedor/
│   │
│   ├── Pages/
│   │   ├── Context/
│   │   ├── Layouts/
│   │   └── Funcionales/
│   │
│   ├── modules/
│   │   └── Pos/
│   │
│   ├── router.jsx
│   └── main.jsx
│
├── public/
├── index.html
├── package.json
├── Dockerfile
└── nginx.conf
```

La entrada principal de React se encuentra en `src/main.jsx`.

---

# 🚦 Inicialización de la aplicación

El frontend utiliza una cadena de providers:

```text
QueryClientProvider
        ↓
ColorContexts
        ↓
AuthProvider
        ↓
RouterProvider
```

Esto permite centralizar:

* React Query.
* Tema visual.
* Autenticación.
* Rutas.

---

# 🔐 Autenticación

La autenticación se gestiona mediante `AuthContext`.

El token JWT:

* Se guarda en `localStorage`.
* Se decodifica para obtener la información del usuario.
* Determina si la sesión continúa activa.
* Se elimina al cerrar sesión.
* Se revisa periódicamente para detectar expiración.

Al cerrar sesión también se limpia la información de `sessionStorage` y la cache de React Query.

---

# 🎨 Sistema de temas

La aplicación dispone de tres preferencias:

```text
claro
oscuro
system
```

El sistema:

* Detecta el tema del sistema operativo.
* Reacciona a cambios de preferencia del sistema.
* Guarda la preferencia en `localStorage`.
* Aplica `data-theme` al `<body>`.
* Ajusta `color-scheme`.

Los estilos globales están organizados principalmente mediante:

```text
Global.Claro.scss
Global.Oscuro.scss
Global.css
```

El tema utiliza variables CSS reutilizables para colores, superficies, texto, inputs, botones, overlays y elementos específicos del POS.

---

# 🧭 Enrutamiento

El router divide la aplicación por nivel de acceso.

## Público

```text
/
 /login
 /Register
 /logout
```

## Cliente

```text
/Deudas
/Detallesdeuda/:id
/Catalogo
/Personal
```

## Vendedor

```text
/Estadisticas
/ListaDeudas
/CrearDeuda
/EditarDeuda
/GestionInventario
/Gestion/Productos
/Gestion/Marcas
/Gestion/Categorias
/Gestion/Almacenes
/CierreDia
/CierreDia/Bolsillos
/POS
/Proveedores
/Compras
```

## Administrador

```text
/Administrador
```

Las rutas privadas están agrupadas mediante `LayoutPrivado` y utilizan los roles `1`, `2` y `3`.

---

# 👥 Roles visuales

El frontend diferencia principalmente:

### Administrador

Tiene acceso al panel administrativo.

### Vendedor

Tiene acceso a las operaciones del negocio:

* POS.
* Inventario.
* Productos.
* Marcas.
* Categorías.
* Almacenes.
* Deudas.
* Compras.
* Proveedores.
* Estadísticas.
* Cierre del día.
* Bolsillos.

### Cliente

Dispone de funciones orientadas al usuario final:

* Catálogo.
* Deudas.
* Perfil/personal.
* Consulta de información.

---

# 🛒 Punto de Venta

El POS está separado del resto del frontend como un módulo:

```text
src/modules/Pos/
├── components/
├── config/
├── hooks/
├── pages/
└── utils/
```

El componente principal es:

```text
PosLayout.jsx
```

El POS integra:

* Escáner/campo de código de barras.
* Buscador de productos.
* Selector de almacén.
* Ticket.
* Mesas.
* Nueva mesa.
* Cambio de mesa.
* Productos.
* Recargas.
* Chance.
* Cierre de venta.
* Cierre de deuda.
* Métodos de pago.

---

# ⌨️ Teclado del POS

El POS dispone de navegación mediante teclado a través del hook:

```text
useTecladoPOS
```

y utiliza una configuración centralizada:

```text
POS_CONFIG
```

Actualmente contempla acciones como:

* Mesa rápida.
* Mesa anterior.
* Mesa siguiente.
* Nueva mesa.
* Consulta de producto.
* Recarga.
* Chance.
* Cerrar venta.
* Cerrar deuda.
* Cerrar modal.
* Confirmar modal.
* Enfocar escáner.
* Cambiar almacén.

---

# 📦 Gestión de inventario

El frontend contiene vistas específicas para:

```text
GestionInventario
├── Productos
├── Marcas
├── Categorías
└── Almacenes
```

Estas interfaces consumen el backend para administrar productos y existencias.

El inventario trabaja conceptualmente por almacén, no simplemente como un campo aislado del producto.

---

# 🤝 Proveedores

La sección de proveedores permite trabajar con:

* Lista de proveedores.
* Búsqueda.
* Alta.
* Edición.
* Productos relacionados.
* Compras relacionadas.
* Historial de precios.

Existe también una representación especial del proveedor `YO`, utilizada por la lógica de compras del backend.

---

# 🧾 Compras

La interfaz de compras acompaña el ciclo:

```text
Compra
 ↓
Detalles
 ↓
Recepción
 ↓
Inventario
 ↓
Pagos
 ↓
Saldo pendiente / compra pagada
```

El frontend debe reflejar los estados que devuelve la API y no duplicar reglas de negocio relacionadas con recepción, inventario o pagos.

El backend contempla además:

* Compras pendientes.
* Historial de precios.
* Alertas.
* Compensaciones.
* Libro mayor.
* Devoluciones.

---

# 💰 Cierre del día y bolsillos

El frontend incluye:

```text
/CierreDia
/CierreDia/Bolsillos
```

Estas vistas permiten trabajar con el cierre operativo y la administración de bolsillos.

Los bolsillos representan fondos separados de las cajas y poseen movimientos propios.

---

# 📊 Estadísticas

La vista `/Estadisticas` consume información del backend para mostrar métricas relacionadas con:

* Productos más vendidos.
* Productos que generan más ingresos.
* Productos con menor disponibilidad.
* Productos menos vendidos.

El backend proporciona estos datos mediante `/api/estadisticas`.

---

# 🎨 Arquitectura de estilos

Los estilos propios se encuentran principalmente en:

```text
src/assets/Css/
```

El sistema utiliza:

* CSS.
* SCSS.
* CSS Modules.
* Variables CSS.
* Temas claro y oscuro.

El POS, por ejemplo, utiliza módulos SCSS específicos para sus componentes.

### Regla importante

Las nuevas pantallas deben reutilizar las variables y tokens existentes antes de crear colores o valores duplicados.

---

# 🌐 Backend

La URL del backend se configura mediante:

```env
VITE_URL_BACKEND=
```

Durante el build de Docker esta variable se entrega como argumento al frontend:

```text
VITE_URL_BACKEND
```

---

# ▶️ Desarrollo local

Instalar dependencias:

```bash
cd Frontend
npm install
```

Ejecutar:

```bash
npm run dev
```

Por defecto Vite utiliza:

```text
http://localhost:5173
```

---

# 🏗️ Build

Generar producción:

```bash
npm run build
```

Vista previa del build:

```bash
npm run preview
```

Lint:

```bash
npm run lint
```

Estos scripts están definidos en `package.json`.

---

# 🐳 Docker

El frontend utiliza un build de dos etapas:

```text
Node 20
   ↓
npm install
   ↓
npm run build
   ↓
dist/
   ↓
Nginx Alpine
```

El resultado final se sirve mediante Nginx en el puerto `80`.

En Docker Compose:

```text
frontend
 └── depende de api
```

y el servicio se publica mediante:

```text
80:80
```

---

# 🧠 Reglas para trabajar sobre el frontend

1. Las reglas de negocio deben permanecer en el backend.
2. El frontend debe consumir la API existente antes de crear lógica paralela.
3. Las rutas deben respetar el sistema de roles existente.
4. Utilizar React Query para datos remotos cuando el módulo ya esté integrado con este patrón.
5. Mantener la separación del módulo POS.
6. Reutilizar componentes y estilos existentes.
7. No introducir nuevos tokens visuales si existe un token equivalente.
8. Mantener compatibilidad con tema claro y oscuro.
9. No colocar secretos en variables que terminen expuestas al cliente.
10. Antes de modificar una ruta o componente principal, revisar sus relaciones con `router.jsx`, `AuthContext` y los layouts.

---

# 🗺️ Principales módulos del frontend

```text
Autenticación
├── Login
└── Registro

Cliente
├── Inicio
├── Catálogo
├── Deudas
└── Perfil

Vendedor
├── Estadísticas
├── POS
├── Inventario
├── Productos
├── Marcas
├── Categorías
├── Almacenes
├── Deudas
├── Compras
├── Proveedores
├── Cierre del día
└── Bolsillos

Administrador
└── Dashboard
```

Esta organización corresponde a las rutas actualmente definidas en `router.jsx`.
