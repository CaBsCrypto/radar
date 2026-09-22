# 🇨🇱 Chile AI Radar & Map

<div align="center">

[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase_Firestore-Cloud-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

Plataforma interactiva del ecosistema de **Inteligencia Artificial y Tecnología en Chile**: mapa territorial de las 16 regiones, radar de hackathons y convocatorias, directorio de empresas WebMCP, boletín nacional y panel de control administrativo en tiempo real.

🌐 **Producción:** [https://radar.browns.studio](https://radar.browns.studio)  
🔗 **Mirror Vercel:** [https://lucid-goodall.vercel.app](https://lucid-goodall.vercel.app)  
🛡️ **Panel Administrativo:** [https://radar.browns.studio/admin](https://radar.browns.studio/admin)

</div>

---

## 📑 Tabla de Contenidos

1. [Características Principales](#-características-principales)
2. [Arquitectura y Stack Tecnológico](#-arquitectura-y-stack-tecnológico)
3. [Módulos de la Aplicación](#-módulos-de-la-aplicación)
4. [Estructura del Proyecto](#-estructura-del-proyecto)
5. [Instalación y Configuración Local](#-instalación-y-configuración-local)
6. [Variables de Entorno y Firebase](#-variables-de-entorno-y-firebase)
7. [Seguridad y Reglas de Firestore](#-seguridad-y-reglas-de-firestore)
8. [Despliegue y Dominios](#-despliegue-y-dominios)
9. [Scripts Disponibles](#-scripts-disponibles)
10. [Contacto y Comunidad](#-contacto-y-comunidad)

---

## ✨ Características Principales

- 🗺️ **Mapa Territorial Interactivo**: Exploración geográfica por las 16 regiones de Chile con métricas de adopción de IA, ecosistemas locales y filtrado dinámico.
- 📅 **Radar de Eventos y Hackathons**: Notificaciones en vivo, cuentas regresivas para cierres de inscripciones, filtros por modalidad (virtual/presencial) y premios.
- 🤖 **WebMCP Hub & Diagnóstico B2B**: Espacio dedicado a la adopción empresarial de agentes de IA y el estándar Model Context Protocol (MCP).
- 📬 **Lista de Espera y Boletín Nacional**: Captura segura de suscriptores con segmentación regional e intereses temáticos.
- 🛡️ **Panel Administrativo (`/admin`)**: Acceso restringido vía Google OAuth para moderación de postulaciones, visualización de métricas en tiempo real y exportación instantánea a CSV.
- ⚡ **Rendimiento Ultrarrápido**: Construido sobre Vite 8, React 19 y Tailwind CSS v4 para tiempos de carga mínimos y animaciones fluidas.

---

## 🛠️ Arquitectura y Stack Tecnológico

| Capa | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 (`react`, `react-dom`) | Interfaz de usuario declarativa y componentes modulares |
| **Bundler & Tooling** | Vite 8 + TypeScript | Compilación ultrarrápida, HMR y tipado estricto |
| **Estilos & UI** | Tailwind CSS v4, Lucide Icons, Motion | Sistema de diseño responsivo y animaciones fluidas |
| **Base de Datos** | Google Cloud Firestore | Almacenamiento en la nube NoSQL en tiempo real |
| **Autenticación** | Firebase Auth (Google OAuth Provider) | Control de acceso seguro para el panel de administración |
| **Hosting & Edge** | Vercel Edge Network | Despliegue global con soporte SPA y certificados SSL automáticos |
| **Dominio Web3 / DNS** | Unstoppable Domains (`radar.browns.studio`) | Resolución descentralizada y enrutamiento CNAME |

---

## 🧩 Módulos de la Aplicación

### 1. Mapa Territorial (`/` o tab `#mapa`)
- Visualización interactiva de Chile con selector de regiones.
- Fichas de organizaciones, startups, scaleups, centros I+D y universidades.
- Indicadores macro del ecosistema nacional y liderazgo según el Índice Latinoamericano de IA (ILIA).

### 2. Agenda de Convocatorias y Eventos (`/eventos`)
- Calendario sincronizado con hackathons, meetups, datathons y cumbres.
- Sistema de campana de notificaciones con conteo de eventos urgentes no leídos.
- Botones de postulación directa y detalle de bases/premios.

### 3. Empresas & WebMCP (`/webmcp`)
- Formulario de postulación para que empresas chilenas soliciten diagnóstico e integración de agentes IA.
- Directorio de casos de uso y herramientas tecnológicas implementadas en producción.

### 4. Panel de Administración (`/admin`)
- Autenticación con Google reservada para el administrador (`cabscryptocontacto@gmail.com`).
- Tablas en vivo de `waitlist_subscribers` y `business_submissions`.
- Modificación de estados (*Pendiente*, *Contactado*, *Verificado*), borrado seguro y exportación a archivos `.csv`.

---

## 📁 Estructura del Proyecto

```text
├── public/                     # Recursos estáticos
├── src/
│   ├── assets/                 # Iconos, imágenes y recursos gráficos
│   ├── components/             # Componentes modulares de React
│   │   ├── AddEntityModal.tsx      # Modal para sumar organizaciones/eventos
│   │   ├── AdminDashboard.tsx      # Panel de control administrativo
│   │   ├── BrochureModal.tsx       # Modal de presentación ejecutiva
│   │   ├── ChileMap.tsx            # Mapa territorial interactivo
│   │   ├── CompanyDirectory.tsx    # Directorio de empresas
│   │   ├── EventsHistory.tsx       # Listado y agenda de eventos
│   │   ├── Footer.tsx              # Pie de página y links de comunidad
│   │   ├── GlobalSearch.tsx        # Búsqueda global en tiempo real
│   │   ├── Navbar.tsx              # Barra de navegación principal y notificaciones
│   │   ├── NewsletterSubscription.tsx # Formulario de suscripción a la waitlist
│   │   └── WebMcpBusinessSection.tsx  # Sección comercial WebMCP
│   ├── data/
│   │   └── mockData.ts         # Datos base del ecosistema, regiones y eventos
│   ├── lib/
│   │   └── firebase.ts         # Métodos de Firestore (waitlist, submissions, error handling)
│   ├── services/
│   │   ├── firebaseConfig.ts   # Inicialización de Firebase App, Auth y Firestore
│   │   └── firestoreService.ts # Subscripciones en tiempo real y autenticación admin
│   ├── types.ts                # Definiciones de tipos TypeScript
│   ├── App.tsx                 # Componente raíz y enrutamiento SPA
│   ├── index.css               # Estilos globales de Tailwind CSS v4
│   └── main.tsx                # Punto de entrada de la aplicación
├── .env.example                # Plantilla de variables de entorno
├── .npmrc                      # Configuración de resolución de dependencias
├── firebase-applet-config.json # Configuración de conexión de Firebase
├── firestore.rules             # Reglas de seguridad para Cloud Firestore
├── vercel.json                 # Configuración de rewrites para rutas SPA en Vercel
├── vite.config.ts              # Configuración de compilación Vite
└── package.json                # Dependencias y scripts del proyecto
```

---

## 🚀 Instalación y Configuración Local

### Prerrequisitos
- [Node.js](https://nodejs.org/) (versión 20 o superior recomendada)
- `npm` o `bun`
- Git

### 1. Clonar el repositorio
```bash
git clone https://github.com/CaBsCrypto/radar.git
cd radar
```

### 2. Instalar dependencias
```bash
npm install --legacy-peer-deps
```

### 3. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`:
```bash
cp .env.example .env
```

### 4. Iniciar el servidor de desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`.

---

## 🔐 Variables de Entorno y Firebase

La conexión a Firebase Firestore y Firebase Auth se encuentra centralizada en [firebase-applet-config.json](firebase-applet-config.json) y [src/services/firebaseConfig.ts](src/services/firebaseConfig.ts):

```json
{
  "projectId": "gen-lang-client-0574841717",
  "appId": "1:609187490201:web:f2b3aff7bfc6f1f36a4b08",
  "apiKey": "AIzaSyCaYLl7qa2L4ZudLDJXe1HBX9x9kcOmn44",
  "authDomain": "gen-lang-client-0574841717.firebaseapp.com",
  "firestoreDatabaseId": "ai-studio-buildingaroundch-14a717a6-1a8c-4a12-8298-ace3d4e81316",
  "storageBucket": "gen-lang-client-0574841717.firebasestorage.app",
  "messagingSenderId": "609187490201",
  "oAuthClientId": "609187490201-3uchq9juaatqk51or0cfdiekdh5nsbda.apps.googleusercontent.com"
}
```

---

## 🛡️ Seguridad y Reglas de Firestore

Las políticas de acceso a la base de datos están estrictamente definidas en [firestore.rules](firestore.rules):

- **`organizations` & `events`**: Lectura pública (`allow read: if true`). Creación comunitaria con validación estricta de esquema. Modificación y eliminación restringida a administradores.
- **`waitlist_subscribers`**: Creación pública (`allow create: if true`) para que los usuarios puedan registrarse libremente. Lectura, listado y gestión exclusivamente restringidos a la cuenta administradora (`cabscryptocontacto@gmail.com`).
- **`business_submissions`**: Creación pública validada. Gestión y consulta restringida al administrador.

---

## 🌐 Despliegue y Dominios

### Despliegue en Vercel
El proyecto cuenta con integración continua y soporte para despliegues directos mediante la CLI de Vercel:

```bash
# Despliegue a Producción
vercel --prod
```

### Configuración DNS (Unstoppable Domains / Registrar)
Para vincular el subdominio `radar.browns.studio`:

| Tipo | Host | Valor / Destino | TTL |
| :--- | :--- | :--- | :--- |
| **CNAME** | `radar` | `cname.vercel-dns.com` | 300 / Auto |
| *(Alt) **A*** | `radar` | `76.76.21.21` | 300 / Auto |

---

## 📜 Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo local en el puerto 3000.
- `npm run build`: Compila y genera el bundle optimizado para producción en la carpeta `/dist`.
- `npm run preview`: Previsualiza localmente el build de producción.
- `npm run lint`: Ejecuta la verificación estricta de tipos con el compilador de TypeScript (`tsc --noEmit`).

---

## 📬 Contacto y Comunidad

- **Autor / Organización:** CaBsCrypto
- **Dominio Principal:** [https://browns.studio](https://browns.studio)
- **Email de Contacto:** `cabscryptocontacto@gmail.com`
- **Repositorio:** [github.com/CaBsCrypto/radar](https://github.com/CaBsCrypto/radar)

---

<div align="center">
  <sub>Construido con pasión para impulsar el ecosistema de Inteligencia Artificial en Chile y Latinoamérica 🇨🇱 🚀</sub>
</div>
