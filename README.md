# Cheos Cafe - Frontend SPA

Frontend Single Page Application para el sistema de e-commerce de Cheos Cafe, desarrollado con React, Vite y Tailwind CSS.

---

## Descripcion del Proyecto

Interfaz de usuario completa para la plataforma de e-commerce de Cheos Cafe, empresa colombiana con 8 tiendas fisicas en Antioquia dedicada a la venta de cafe molido de especialidad.

El frontend proporciona:

- Catalogo de productos con carrusel y busqueda
- Carrito de compras con sincronizacion servidor/local
- Sistema de autenticacion (login, registro, recuperacion de contrasena)
- Checkout con integracion de pasarela de pagos Wompi
- Codigos de descuento con validacion en tiempo real
- Mapa interactivo de ubicaciones de tiendas fisicas
- Perfil de usuario con campos obligatorios para completar compra
- Panel de administracion con dashboard de metricas
- Gestion de productos, ordenes, inventario, galeria, carrusel, descuentos y usuarios
- Redes sociales flotantes (WhatsApp, Facebook, Instagram, TikTok)
- Diseno responsivo con tema de cafe personalizado

Consume la API REST del backend GoBackend_Cheos.

**Estado actual:** Aplicacion completa desplegada en Netlify.

---

## Tecnologias

### Stack Principal

- **React 19** - Biblioteca de UI
- **Vite 5** - Build tool y servidor de desarrollo
- **Tailwind CSS 3** - Framework de estilos utilitarios

### Dependencias Principales

```
react / react-dom                 # Core React 19
react-router-dom                  # Enrutamiento SPA
recharts                          # Graficos para dashboard admin
sweetalert2                       # Alertas y confirmaciones
lucide-react / react-icons        # Iconografia
react-type-animation              # Animacion de tipeo
```

---

## Guia de Instalacion

### Requisitos Previos

- Node.js 18 o superior
- npm
- Backend GoBackend_Cheos ejecutandose

### 1. Clonar el Repositorio

```bash
git clone https://github.com/RicoLancheros/ReactFront_Cheos.git
cd ReactFront_Cheos
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Crear archivo `.env` en la raiz:

```env
VITE_API_URL=http://localhost:8080/api/v1
```

### 4. Iniciar el Frontend

```bash
npm run dev
```

El servidor de desarrollo se levanta en `http://localhost:5173/`.

---

## Deployment

### Frontend en Netlify

Variable de entorno requerida:

```
VITE_API_URL=https://gobackend-cheos.onrender.com/api/v1
```

El archivo `public/_redirects` maneja el enrutamiento SPA:

```
/*    /index.html   200
```

---

## Rutas

| Ruta | Componente | Acceso | Descripcion |
|------|-----------|--------|-------------|
| `/` | Home | Publico | Pagina principal con carrusel, productos, ubicaciones, about |
| `/reset-password` | ResetPassword | Publico | Formulario de restablecimiento de contrasena |
| `/admin` | Dashboard | Admin | Panel de administracion completo |
| `/pago-exitoso` | PaymentSuccess | Publico | Confirmacion de pago Wompi |

---

## Funcionalidades por Rol

### Cliente

- Navegar catalogo de productos
- Agregar productos al carrito con validacion de stock
- Aplicar codigos de descuento
- Realizar checkout con pago via Wompi
- Registrarse e iniciar sesion
- Completar perfil (ciudad, municipio, barrio, genero, fecha de nacimiento)
- Consultar estado de ordenes
- Restablecer contrasena por correo electronico
- Ver ubicaciones de tiendas en mapa interactivo

### Administrador

- **Resumen:** KPIs de ventas, ordenes, clientes y productos
- **Ordenes:** Listado, filtros por estado, actualizacion de estado y pago
- **Ventas:** Graficos de ingresos mensuales y anuales
- **Compradores:** Lista de clientes y estadisticas
- **Productos:** CRUD completo de productos con imagenes
- **Inventario:** Control de stock, alertas de inventario bajo, historial
- **Gestion de usuarios:** Crear, editar, eliminar clientes
- **Galeria:** Subida y gestion de imagenes (Cloudinary)
- **Carrusel:** Editor de imagenes del hero section
- **Descuentos:** Crear, editar, activar/desactivar codigos
- **Ubicaciones:** CRUD de tiendas fisicas con coordenadas

---

## Gestion de Estado

| Contexto | Responsabilidad |
|----------|----------------|
| UserContext | Autenticacion JWT, perfil de usuario, roles |
| ProductContext | Catalogo de productos, mapa de stock |
| CartContext | Carrito con sincronizacion API, merge local/servidor |
| AlertContext | Alertas y confirmaciones (SweetAlert2) |

---

## Estructura del Proyecto

```
ReactFront_Cheos/
├── src/
│   ├── App.jsx                        # Router principal
│   ├── main.jsx                       # Punto de entrada
│   ├── index.css                      # Estilos globales + Tailwind
│   ├── components/
│   │   ├── Navbar.jsx                 # Navegacion y menu
│   │   ├── HeroCarousel.jsx           # Carrusel principal
│   │   ├── ProductCarousel.jsx        # Carrusel de productos
│   │   ├── ProductCard.jsx            # Tarjeta de producto
│   │   ├── CartDrawer.jsx             # Carrito y checkout
│   │   ├── LocationsSection.jsx       # Seccion de ubicaciones
│   │   ├── LocationCard.jsx           # Tarjeta de ubicacion
│   │   ├── AboutSection.jsx           # Seccion About Us
│   │   ├── Footer.jsx                 # Pie de pagina
│   │   ├── ModalLoginRegister.jsx     # Login, registro y forgot password
│   │   ├── ProfileModal.jsx           # Perfil de usuario
│   │   ├── AddProductModal.jsx        # Crear producto (Admin)
│   │   ├── EditProductModal.jsx       # Editar producto (Admin)
│   │   ├── DiscountFormModal.jsx      # Formulario de descuento (Admin)
│   │   ├── DiscountManagementModal.jsx # Gestion descuentos (Admin)
│   │   ├── CarouselEditorModal.jsx    # Editor de carrusel (Admin)
│   │   ├── GalleryManagementModal.jsx # Gestion de galeria (Admin)
│   │   ├── GalleryImageSelector.jsx   # Selector de imagenes
│   │   ├── UserManagementModal.jsx    # Gestion de usuarios (Admin)
│   │   ├── LocationModal.jsx          # CRUD ubicaciones (Admin)
│   │   ├── FloatingSocialMenu.jsx     # Redes sociales flotantes
│   │   ├── Coffeeloader.jsx           # Animacion de carga
│   │   ├── dashboard/
│   │   │   ├── SummaryPanel.jsx       # Panel de KPIs
│   │   │   ├── OrdersPanel.jsx        # Panel de ordenes
│   │   │   ├── SalesPanel.jsx         # Panel de ventas
│   │   │   ├── BuyersPanel.jsx        # Panel de compradores
│   │   │   ├── ProductsPanel.jsx      # Panel de productos
│   │   │   └── Inventorypanel.jsx     # Panel de inventario
│   │   └── wompi/
│   │       ├── Wompibutton.jsx        # Boton de pago Wompi
│   │       └── PaymentSuccess.jsx     # Resultado de pago
│   ├── context/
│   │   ├── UserContext.jsx            # Estado de autenticacion
│   │   ├── ProductContext.jsx         # Estado de productos
│   │   ├── CartContext.jsx            # Estado del carrito
│   │   └── AlertContext.jsx           # Sistema de alertas
│   ├── hooks/
│   │   └── useFetch.js               # Hook de fetch generico
│   ├── pages/
│   │   ├── Dashboard.jsx             # Panel admin
│   │   └── ResetPassword.jsx         # Restablecer contrasena
│   └── routes/
│       ├── AdminRoutes.jsx           # Proteccion de rutas admin
│       ├── products.js               # API de productos
│       ├── orders.js                 # API de ordenes
│       ├── cart.js                   # API del carrito
│       ├── discount.js               # API de descuentos
│       ├── locations.js              # API de ubicaciones
│       └── wompi.js                  # API de pagos Wompi
├── public/
│   ├── LogoCheos.png                 # Logo principal
│   └── _redirects                    # Config SPA Netlify
├── index.html
├── package.json
├── tailwind.config.cjs
├── vite.config.js
├── postcss.config.cjs
└── .env
```

---

## Comandos

```bash
npm run dev                            # Servidor de desarrollo
npm run build                          # Build de produccion
npm run preview                        # Preview del build
npm install                            # Instalar dependencias
```
