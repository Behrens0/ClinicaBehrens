# 🏥 Clínica Behrens - Sistema de Gestión Médica

## 📋 Descripción

Clínica Behrens es un sistema integral de gestión de clínica médica desarrollado en Angular 19 con Supabase como backend. Permite la gestión completa de turnos, pacientes, especialistas y administradores.

🌐 **Aplicación en Producción:** [https://clinicabehrens.web.app](https://clinicabehrens.web.app)

---

## ✨ Características Principales

### Sprint 1 ✅
- ✅ Página de Bienvenida (Home/Landing Page)
- ✅ Sistema de Login con validación de usuarios
- ✅ Botones de Acceso Rápido para testing
- ✅ Registro de Usuarios (Pacientes, Especialistas, Administradores)
- ✅ Captcha personalizado
- ✅ Gestión de Usuarios (Admin)
- ✅ Habilitar/Inhabilitar Especialistas
- ✅ Loading Spinner Global
- ✅ Favicon personalizado
- ✅ Deployado en Firebase Hosting

### Sprint 2 (En Desarrollo) 🚧
- 🚧 Mis Turnos (Paciente, Especialista, Administrador)
- 🚧 Solicitar Turno
- 🚧 Mi Perfil con horarios de disponibilidad
- 🚧 Filtros de búsqueda sin combobox
- 🚧 Sistema de reseñas y calificaciones

---

## 🚀 Acceso al Sistema

### Usuarios de Prueba

#### 👨‍⚕️ Administrador
- **Email:** `admin@clinica.com`
- **Password:** `admin123`

#### 👤 Paciente
- **Email:** `paciente@test.com`
- **Password:** `paciente123`

#### 👩‍⚕️ Especialista
- **Email:** `especialista@test.com`
- **Password:** `especialista123`

*Nota: Puedes usar los botones de "Acceso Rápido" en la pantalla de login para ingresar automáticamente con estos usuarios.*

---

## 🖥️ Pantallas y Secciones

### 1. Página de Bienvenida (`/home`)
- **Descripción:** Landing page con información de la clínica
- **Acceso:** Público
- **Características:**
  - Información sobre servicios
  - Botones para Login y Registro
  - Estadísticas de la clínica
  - Diseño responsive moderno

### 2. Login (`/login`)
- **Descripción:** Pantalla de inicio de sesión
- **Acceso:** Público
- **Características:**
  - Validación de credenciales
  - Botones de acceso rápido para testing
  - Verificación de email
  - Redirección según tipo de usuario
  - Manejo de sesiones activas

### 3. Registro (`/registro`)
- **Descripción:** Registro de nuevos usuarios
- **Acceso:** Público / Administradores
- **Tipos de Usuario:**
  
  #### Paciente
  - Nombre, Apellido, Edad, DNI
  - Obra Social
  - Email y Contraseña
  - 2 imágenes de perfil
  
  #### Especialista
  - Nombre, Apellido, Edad, DNI
  - Especialidad (seleccionable o nueva)
  - Email y Contraseña
  - 1 imagen de perfil
  - Requiere aprobación de administrador
  
  #### Administrador (solo desde Admin)
  - Nombre, Apellido, Edad, DNI
  - Email y Contraseña
  - 1 imagen de perfil

- **Validaciones:**
  - Captcha personalizado
  - DNI único (8 dígitos)
  - Email válido y único
  - Contraseña segura (mínimo 6 caracteres)
  - Edad válida (0-120 años)

### 4. Dashboard Administrador (`/dashboard-admin`)
- **Acceso:** Solo Administradores
- **Funcionalidades:**
  - Ver todos los usuarios del sistema
  - Aprobar/Rechazar especialistas pendientes
  - **Habilitar/Inhabilitar** acceso de especialistas
  - Registrar nuevos usuarios
  - Estadísticas por tipo de usuario
  - Tabla con información completa

### 5. Dashboard Especialista (`/dashboard-especialista`)
- **Acceso:** Solo Especialistas aprobados
- **Funcionalidades:**
  - Ver turnos asignados
  - Gestionar disponibilidad horaria
  - Ver pacientes atendidos
  - Acceso a historias clínicas

### 6. Dashboard Paciente (`/dashboard-paciente`)
- **Acceso:** Solo Pacientes
- **Funcionalidades:**
  - Solicitar turnos
  - Ver mis turnos
  - Acceder a mi perfil
  - Ver historia clínica

### 7. Mis Turnos
#### Paciente (`/mis-turnos-paciente`)
- Ver turnos solicitados
- Cancelar turnos (con comentario)
- Ver reseñas
- Completar encuestas
- Calificar atención

#### Especialista (`/mis-turnos-especialista`)
- Ver turnos asignados
- Aceptar/Rechazar turnos
- Finalizar turnos con reseña
- Cancelar turnos
- Filtrar por especialidad/paciente

#### Administrador (`/mis-turnos-administrador`)
- Ver todos los turnos de la clínica
- Cancelar turnos
- Filtrar por especialidad/especialista

### 8. Solicitar Turno (`/turnos`)
- **Acceso:** Pacientes y Administradores
- **Funcionalidades:**
  - Seleccionar especialidad
  - Seleccionar especialista
  - Elegir día y horario (próximos 15 días)
  - Horarios según disponibilidad del especialista
  - Admin puede seleccionar paciente

### 9. Mi Perfil (`/mi-perfil`)
- **Acceso:** Todos los usuarios logueados
- **Información:**
  - Datos personales
  - Imágenes de perfil
  - Especialidades (Especialistas)
  - **Configurar horarios de disponibilidad** (Especialistas)
  - Descargar historia clínica (Pacientes)

### 10. Historias Clínicas
#### Crear Historia Clínica (`/crear-historia-clinica/:turnoId`)
- **Acceso:** Especialistas
- **Campos:**
  - Altura, Peso, Temperatura, Presión
  - Datos dinámicos personalizables
  - Vinculado al turno finalizado

#### Ver Historias Clínicas (`/historias-clinicas-admin`)
- **Acceso:** Administradores
- **Funcionalidades:**
  - Ver todas las historias clínicas
  - Filtrar por paciente
  - Exportar a PDF

### 11. Pacientes del Especialista (`/pacientes-especialista`)
- **Acceso:** Especialistas
- **Funcionalidades:**
  - Ver pacientes atendidos
  - Ver historia clínica de cada paciente
  - Filtrar y buscar

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Angular 19** - Framework principal
- **TypeScript** - Lenguaje de programación
- **SCSS** - Estilos
- **RxJS** - Programación reactiva
- **Angular Router** - Navegación
- **Reactive Forms** - Formularios

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL Database
  - Authentication
  - Storage
  - Real-time subscriptions

### Hosting & Deployment
- **Firebase Hosting** - Hosting de la aplicación
- **Firebase CLI** - Herramientas de deployment

### Librerías Adicionales
- **jsPDF** - Generación de PDFs
- **html2canvas** - Captura de elementos HTML

---





---

**¡Gracias por usar Clínica Behrens! 🏥**
