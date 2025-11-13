<div align="center">
  
# 🏥 Clínica Behrens

<img src="https://sxdosrgvnxbxifxvasks.supabase.co/storage/v1/object/public/imagenes/diseno-logotipo-hospital-vector-cruz-medica_53876-136743.ico" alt="Logo Clínica Behrens" width="150"/>

### Sistema Integral de Gestión Médica

[![Angular](https://img.shields.io/badge/Angular-19-DD0031?style=for-the-badge&logo=angular)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Hosting-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)

🌐 **[Ver Aplicación en Producción](https://clinicabehrens.web.app)** 🌐

---

</div>

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Características Principales](#-características-principales)
- [Acceso Rápido](#-acceso-rápido)
- [Funcionalidades por Rol](#-funcionalidades-por-rol)
- [Capturas de Pantalla](#-capturas-de-pantalla)
- [Tecnologías](#-tecnologías-utilizadas)
- [Características Técnicas](#-características-técnicas-destacadas)
- [Instalación](#-instalación-y-configuración)
- [Scripts Disponibles](#-scripts-disponibles)
- [Deployment](#-deployment)
- [Seguridad](#-seguridad)
- [Próximas Mejoras](#-próximas-mejoras)

---

## 🎯 Descripción

**Clínica Behrens** es una plataforma completa de gestión médica que permite administrar **turnos**, **historias clínicas**, **pacientes** y **especialistas** de manera eficiente y moderna. 

El sistema está diseñado con una arquitectura escalable utilizando **Angular 19** en el frontend y **Supabase** como backend, ofreciendo una experiencia de usuario fluida y responsive.

### 🎖️ Características Destacadas

- ✅ Sistema de turnos con disponibilidad horaria personalizable
- ✅ Historias clínicas digitales con datos dinámicos
- ✅ Gestión de usuarios con roles y permisos
- ✅ Sistema de encuestas y calificaciones
- ✅ Exportación de PDFs con logo institucional
- ✅ Accesos rápidos para testing
- ✅ Google reCAPTCHA v2 para seguridad
- ✅ Diseño responsive y moderno
- ✅ Animaciones y transiciones suaves
- ✅ Directivas y pipes personalizados

---

## ✨ Características Principales

### 🚀 Módulos Implementados

#### 📌 Módulo de Autenticación
- Login con validación de usuarios
- Registro de Pacientes, Especialistas y Administradores
- Verificación de email obligatoria
- Sistema de aprobación para especialistas
- Google reCAPTCHA v2 para prevenir bots
- Accesos rápidos para pruebas

#### 📌 Módulo de Turnos
- **Solicitar Turno:** Selección de especialidad, especialista y horario
- **Mis Turnos (Paciente):** Ver, cancelar, calificar y completar encuestas
- **Mis Turnos (Especialista):** Aceptar, rechazar, finalizar turnos con historia clínica
- **Mis Turnos (Admin):** Visualización y gestión global de turnos
- Filtros avanzados sin combobox
- Estados: Pendiente, Aceptado, Realizado, Cancelado, Rechazado

#### 📌 Módulo de Historias Clínicas
- Datos fijos: Altura, Peso, Temperatura, Presión
- Hasta 3 datos dinámicos personalizables por turno
- Vinculación automática con turnos finalizados
- Visualización por especialista y administrador
- Exportación a PDF con logo institucional

#### 📌 Módulo de Perfiles
- Visualización de datos personales
- Edición de imágenes de perfil (1 o 2 según el rol)
- Configuración de disponibilidad horaria (Especialistas)
- Descarga de historia clínica personal (Pacientes)
- Especialistas pueden seleccionar hasta 3 especialidades

#### 📌 Módulo de Administración
- Dashboard con todos los usuarios
- Aprobar/Rechazar especialistas
- Habilitar/Inhabilitar acceso de especialistas
- Registro de cualquier tipo de usuario
- Estadísticas y métricas del sistema
- Descarga de logs de ingresos en Excel y PDF
- Visualización de estadísticas con gráficos (Chart.js)

---

## 🔐 Acceso Rápido

En la pantalla de login encontrarás botones de **Acceso Rápido** para facilitar las pruebas:

<div align="center">

### 👨‍⚕️ Administrador
<img src="https://sxdosrgvnxbxifxvasks.supabase.co/storage/v1/object/public/perfiles/admin-removebg-preview.png" alt="Admin" width="120"/>

**Email:** `admin@clinica.com`  
**Password:** `admin123`

---

### 👨‍⚕️ Especialista 1 - Dr. García
<img src="https://sxdosrgvnxbxifxvasks.supabase.co/storage/v1/object/public/perfiles/doctorUno.png" alt="Doctor Uno" width="120"/>

**Email:** `especialista@test.com`  
**Password:** `especialista123`

---

### 👨‍⚕️ Especialista 2 - Dr. Rodríguez
<img src="https://sxdosrgvnxbxifxvasks.supabase.co/storage/v1/object/public/perfiles/rodriguez.jpg" alt="Rodriguez" width="120"/>

**Email:** `rodriguez@clinica.com`  
**Password:** `rodriguez123`

---

### 👤 Paciente
<img src="https://sxdosrgvnxbxifxvasks.supabase.co/storage/v1/object/public/perfiles/paciente1.png" alt="Paciente" width="120"/>

**Email:** `paciente@test.com`  
**Password:** `paciente123`

</div>

---

## 👥 Funcionalidades por Rol

### 🔵 Administrador

El administrador tiene control total sobre el sistema:

- ✅ **Dashboard completo** con todos los usuarios
- ✅ **Gestión de usuarios**: Aprobar, rechazar, habilitar, inhabilitar
- ✅ **Registro de usuarios** de cualquier tipo
- ✅ **Solicitar turnos** en nombre de pacientes
- ✅ **Ver todos los turnos** de la clínica
- ✅ **Cancelar cualquier turno**
- ✅ **Ver todas las historias clínicas**
- ✅ **Estadísticas completas** con gráficos
- ✅ **Descargar logs** de ingresos (Excel/PDF)
- ✅ **Exportar estadísticas** (Excel/PDF)
- ✅ Acceso a todos los módulos del sistema

### 🟢 Especialista

Los especialistas gestionan sus turnos y pacientes:

- ✅ **Ver turnos asignados** con filtros
- ✅ **Aceptar/Rechazar** turnos pendientes
- ✅ **Cancelar turnos** con justificación
- ✅ **Finalizar turnos** completando historia clínica
- ✅ **Configurar disponibilidad horaria** por especialidad
- ✅ **Ver pacientes atendidos**
- ✅ **Acceder a historias clínicas** de sus pacientes
- ✅ **Ver encuestas y calificaciones** recibidas
- ✅ **Gestionar múltiples especialidades** (hasta 3)
- ✅ Mi Perfil con imágenes y datos personales

### 🟣 Paciente

Los pacientes gestionan sus consultas:

- ✅ **Solicitar turnos** por especialidad y especialista
- ✅ **Ver mis turnos** con estados actualizados
- ✅ **Cancelar turnos** con motivo
- ✅ **Completar encuestas** de satisfacción
- ✅ **Calificar atención** con estrellas y comentarios
- ✅ **Ver reseñas** del especialista
- ✅ **Acceder a mi historia clínica**
- ✅ **Descargar historia clínica** en PDF
- ✅ Mi Perfil con 2 imágenes y obra social

---

## 📸 Capturas de Pantalla

### 🏠 Página de Bienvenida
Landing page moderna con información de la clínica, servicios y estadísticas.

### 🔐 Sistema de Login
Login con validación, reCAPTCHA y botones de acceso rápido para testing.

### 📝 Registro Inteligente
Sistema de registro diferenciado por tipo de usuario con validaciones en tiempo real.

### 📅 Gestión de Turnos
Interfaz intuitiva para solicitar, gestionar y visualizar turnos con calendarios interactivos.

### 📊 Dashboard Administrativo
Panel completo con estadísticas, gráficos y gestión de usuarios.

### 🏥 Historias Clínicas
Sistema completo de historias clínicas digitales con datos fijos y dinámicos.

---

## 🛠️ Tecnologías Utilizadas

### Frontend

| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| **Angular** | 19.2.15 | Framework principal para SPA |
| **TypeScript** | ~5.7.2 | Lenguaje tipado para JavaScript |
| **SCSS** | - | Preprocesador CSS para estilos |
| **RxJS** | ~7.8.0 | Programación reactiva |
| **Angular Router** | 19.2.15 | Sistema de navegación |
| **Reactive Forms** | 19.2.15 | Manejo de formularios |

### Backend & Servicios

| Servicio | Función |
|----------|---------|
| **Supabase** | Backend as a Service (PostgreSQL, Auth, Storage) |
| **Firebase Hosting** | Hosting de la aplicación en producción |
| **Google reCAPTCHA v2** | Protección contra bots |

### Librerías Adicionales

| Librería | Uso |
|----------|-----|
| **jsPDF** | Generación de PDFs (historias clínicas, estadísticas) |
| **Chart.js** | Gráficos estadísticos interactivos |
| **XLSX (SheetJS)** | Exportación de datos a Excel |

---

## 🎨 Características Técnicas Destacadas

### 🎭 Directivas Personalizadas

#### `appResaltarFila`
Resalta filas de tablas al hacer hover con un efecto visual elegante.

**Uso:**
```html
<tr appResaltarFila>
  <td>Contenido</td>
</tr>
```

### 🔧 Pipes Personalizados

#### `formatoFecha`
Convierte fechas en formatos legibles personalizados.

**Formatos disponibles:**
- `custom`: "15 de Enero de 2025 a las 14:30"
- `customDiaMesAnioDia`: "Miércoles 15/01/2025"

**Uso:**
```html
{{ fecha | formatoFecha:'custom' }}
```

#### `capitalizar`
Capitaliza la primera letra de cada palabra.

**Uso:**
```html
{{ texto | capitalizar }}
```

### 🔒 Google reCAPTCHA v2

Sistema de protección contra bots implementado en:
- Registro de usuarios
- Login

**Configuración:**
```typescript
recaptchaSiteKey = '6LfDxwksAAAAAC0Do2awi3AZ5CmHtOiYdlHU0DKo';
```

### 📊 Sistema de Estadísticas

Gráficos interactivos con Chart.js:
- Turnos por especialidad (Barras)
- Turnos por día (Líneas)
- Turnos por médico (Torta)
- Turnos finalizados por médico (Barras)

### 📄 Generación de PDFs

PDFs personalizados con logo institucional:
- Historias clínicas de pacientes
- Estadísticas de la clínica
- Logs de ingresos al sistema

### 🎨 Diseño Circular

Elementos circulares modernos:
- Botones de selección de tipo de usuario
- Especialidades en solicitud de turno
- Especialistas con avatares circulares
- Checkboxes de especialidades

---

## 📦 Instalación y Configuración

### Prerrequisitos

Asegúrate de tener instalado:

```bash
Node.js >= 18.x
npm >= 9.x
Angular CLI >= 19.x
```

### Paso 1: Clonar el Repositorio

```bash
git clone <repository-url>
cd ClinicaBehrens/ClinicaBehrens/clinicaBehrens
```

### Paso 2: Instalar Dependencias

```bash
npm install
```

### Paso 3: Configurar Supabase

Edita `src/app/services/supabase.service.ts`:

```typescript
this.supabase = createClient(
  'TU_SUPABASE_URL',
  'TU_SUPABASE_ANON_KEY'
);
```

### Paso 4: Configurar reCAPTCHA (Opcional)

Si deseas usar tus propias keys de reCAPTCHA, edita:

**Componentes de Registro:**
- `src/app/pages/registro/registro.component.ts`
- `src/app/pages/login/login.component.ts`

```typescript
recaptchaSiteKey = 'TU_RECAPTCHA_SITE_KEY';
```

### Paso 5: Ejecutar en Desarrollo

```bash
npm start
```

La aplicación estará disponible en: `http://localhost:4200`

---

## 📜 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia el servidor de desarrollo |
| `npm run build` | Compila la aplicación para producción |
| `npm test` | Ejecuta las pruebas unitarias |
| `npm run deploy` | Despliega a Firebase Hosting |
| `ng serve` | Servidor de desarrollo (Angular CLI) |
| `ng build --configuration production` | Build de producción |

---

## 🚀 Deployment

### Firebase Hosting

#### Paso 1: Instalar Firebase CLI

```bash
npm install -g firebase-tools
```

#### Paso 2: Login en Firebase

```bash
firebase login
```

#### Paso 3: Compilar la Aplicación

```bash
npm run build
```

#### Paso 4: Desplegar

```bash
firebase deploy
```

O simplemente:

```bash
npm run deploy
```

**URL de Producción:** [https://clinicabehrens.web.app](https://clinicabehrens.web.app)

---

## 🔐 Seguridad

### Autenticación y Autorización

- ✅ Sistema de autenticación con Supabase Auth
- ✅ Verificación de email obligatoria
- ✅ JWT tokens para sesiones seguras
- ✅ Roles y permisos diferenciados
- ✅ Row Level Security (RLS) en Supabase

### Validaciones

#### Registro de Usuarios
- **DNI:** 8 dígitos numéricos, único en el sistema
- **Email:** Formato válido, único, verificación obligatoria
- **Edad:** Entre 0 y 120 años
- **Contraseña:** Mínimo 6 caracteres
- **reCAPTCHA:** Obligatorio para prevenir bots
- **Imágenes:** Formatos válidos (jpg, png), tamaño máximo 5MB

#### Sistema de Turnos
- Solo se pueden solicitar turnos en horarios disponibles
- Los especialistas deben estar habilitados y aprobados
- Los turnos se crean solo en los próximos 15 días
- No se pueden solicitar turnos duplicados

#### Historias Clínicas
- Solo especialistas pueden crear historias clínicas
- Los pacientes solo pueden ver sus propias historias
- Los datos dinámicos están limitados a 3 por turno
- Campos obligatorios: altura, peso, temperatura, presión

### Protección contra Ataques

- ✅ **CORS** configurado correctamente
- ✅ **SQL Injection** prevenido por Supabase
- ✅ **XSS** prevenido por sanitización de Angular
- ✅ **CSRF** tokens manejados por Supabase
- ✅ **reCAPTCHA v2** contra bots

---

## 📱 Responsive Design

La aplicación está completamente optimizada para:

| Dispositivo | Resolución | Estado |
|-------------|-----------|--------|
| 🖥️ Desktop | 1920px+ | ✅ Optimizado |
| 💻 Laptop | 1366px - 1919px | ✅ Optimizado |
| 📱 Tablet | 768px - 1365px | ✅ Optimizado |
| 📱 Mobile | 320px - 767px | ✅ Optimizado |

### Características Responsive

- Tablas que se adaptan a dispositivos móviles
- Navegación colapsable en pantallas pequeñas
- Botones y formularios táctiles
- Imágenes optimizadas para cada tamaño
- Grid layouts flexibles

---

## 🎨 Diseño y UX

### Paleta de Colores

| Color | Uso | Código |
|-------|-----|--------|
| Azul Principal | Primario, Botones, Headers | `#1976d2` |
| Verde | Éxito, Aceptar, Confirmar | `#388e3c` |
| Naranja | Advertencia, Rechazar | `#ff9800` |
| Rojo | Error, Cancelar | `#d32f2f` |
| Gris | Fondos, Bordes | `#f4f8fb` |

### Características UX

- ✅ Loading spinners en operaciones asíncronas
- ✅ Mensajes de error/éxito claros y visibles
- ✅ Validación en tiempo real de formularios
- ✅ Feedback visual en botones y acciones
- ✅ Transiciones suaves entre estados
- ✅ Iconos intuitivos (emojis y símbolos)
- ✅ Confirmaciones para acciones críticas
- ✅ Tooltips informativos

---





## 📜 Licencia

Este proyecto es de **uso académico** y fue desarrollado como proyecto final de la materia Laboratorio IV.

**Año:** 2025  
**Institución:** Universidad Tecnológica Nacional (UTN)

---

<div align="center">

## 🏥 ¡Gracias por usar Clínica Behrens! 🏥

<img src="https://sxdosrgvnxbxifxvasks.supabase.co/storage/v1/object/public/imagenes/diseno-logotipo-hospital-vector-cruz-medica_53876-136743.ico" alt="Logo Clínica Behrens" width="100"/>

### Sistema de Gestión Médica Integral

**[Visitar Aplicación](https://clinicabehrens.web.app)** | **[Ver Código Fuente](.)** | **[Reportar Bug](./issues)**

---

Hecho con ❤️ y ☕ por el equipo de Clínica Behrens

</div>
