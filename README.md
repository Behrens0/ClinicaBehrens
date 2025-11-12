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

## 📦 Instalación y Configuración

### Prerrequisitos
```bash
Node.js >= 18.x
npm >= 9.x
Angular CLI >= 19.x
```

### Clonar el Repositorio
```bash
git clone <repository-url>
cd ClinicaBehrens/ClinicaBehrens/clinicaBehrens
```

### Instalar Dependencias
```bash
npm install
```

### Configurar Variables de Entorno
Editar `src/app/services/supabase.service.ts` con tus credenciales de Supabase:
```typescript
this.supabase = createClient(
  'TU_SUPABASE_URL',
  'TU_SUPABASE_ANON_KEY'
);
```

### Ejecutar en Desarrollo
```bash
npm start
# o
ng serve
```

La aplicación estará disponible en `http://localhost:4200`

### Compilar para Producción
```bash
npm run build
# o
ng build --configuration production
```

### Deploy a Firebase
```bash
npm run deploy
# o
firebase deploy
```

---

## 🗄️ Estructura de la Base de Datos

### Tablas Principales

#### `perfiles`
- `id` (uuid)
- `user_id` (uuid) - Referencia a auth.users
- `nombre` (varchar)
- `apellido` (varchar)
- `edad` (integer)
- `dni` (varchar) - Único
- `obra_social` (varchar) - Solo pacientes
- `especialidad` (varchar) - Solo especialistas
- `tipo` (varchar) - paciente | especialista | administrador
- `imagen_perfil` (text)
- `imagen_perfil2` (text) - Solo pacientes
- `aprobado` (boolean)
- `rechazado` (boolean)
- `email` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### `especialidades`
- `id` (uuid)
- `nombre` (varchar) - Único
- `descripcion` (text)
- `activa` (boolean)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### `turnos`
- `id` (uuid)
- `pacienteid` (uuid)
- `pacientenombre` (text)
- `especialistaid` (uuid)
- `especialistanombre` (text)
- `especialidad` (text)
- `fecha` (timestamp)
- `estado` (text) - pendiente | aceptado | realizado | cancelado | rechazado
- `comentariopaciente` (text)
- `comentarioespecialista` (text)
- `encuestacompletada` (boolean)
- `calificacionatencion` (jsonb)
- `resena` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### `historias_clinicas`
- `id` (uuid)
- `paciente_id` (uuid)
- `especialista_id` (uuid)
- `turno_id` (uuid)
- `fecha_atencion` (timestamp)
- `altura` (numeric)
- `peso` (numeric)
- `temperatura` (numeric)
- `presion` (varchar)
- `datos_dinamicos` (jsonb)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### `disponibilidad`
- `id` (uuid)
- `especialista_id` (uuid)
- `especialidad` (text)
- `dia` (text)
- `hora_inicio` (time)
- `hora_fin` (time)

---

## 🔐 Seguridad y Validaciones

### Autenticación
- Sistema de autenticación con Supabase Auth
- Verificación de email obligatoria
- Sesiones seguras con JWT
- Manejo de sesiones activas

### Validaciones de Formularios
- DNI: 8 dígitos, único
- Email: formato válido, único
- Edad: 0-120 años
- Contraseña: mínimo 6 caracteres
- Captcha obligatorio en registro

### Roles y Permisos
- **Administrador:** Acceso total al sistema
- **Especialista:** Acceso después de aprobación
- **Paciente:** Acceso después de verificar email

### Row Level Security (RLS)
- Políticas de acceso a nivel de base de datos
- Usuarios solo pueden ver sus propios datos
- Administradores tienen permisos elevados

---

## 📱 Responsive Design

La aplicación está completamente optimizada para:
- 💻 Desktop (1920px+)
- 💻 Laptop (1366px - 1919px)
- 📱 Tablet (768px - 1365px)
- 📱 Mobile (320px - 767px)

---

## 🎨 Características de UI/UX

- ✅ Diseño moderno y profesional
- ✅ Animaciones suaves
- ✅ Loading spinners
- ✅ Mensajes de error/éxito claros
- ✅ Validación en tiempo real
- ✅ Iconos intuitivos
- ✅ Paleta de colores médica
- ✅ Accesibilidad mejorada

---

## 🐛 Troubleshooting

### Error de conexión a Supabase
- Verificar que las credenciales sean correctas
- Comprobar que el proyecto de Supabase esté activo
- Revisar las políticas de CORS

### Error en el deploy de Firebase
- Verificar que estés logueado: `firebase login`
- Comprobar que el proyecto esté configurado en `.firebaserc`
- Ejecutar `npm run build` antes de `firebase deploy`

### Usuarios no pueden iniciar sesión
- Verificar que el email esté confirmado
- Para especialistas, verificar que estén aprobados
- Revisar la consola del navegador para errores

---

## 📝 Próximas Mejoras

- [ ] Sistema de notificaciones push
- [ ] Chat en tiempo real
- [ ] Videollamadas
- [ ] Historial de cambios en perfiles
- [ ] Exportación de reportes
- [ ] Panel de estadísticas avanzado
- [ ] Sistema de recordatorios automáticos
- [ ] Integración con sistemas de pago
- [ ] App móvil nativa

---

## 👨‍💻 Autor

**Clínica Behrens**
- Sistema desarrollado como proyecto académico
- Año: 2025

---

## 📄 Licencia

Este proyecto es de uso académico.

---

## 🙏 Agradecimientos

- Angular Team
- Supabase Team
- Firebase Team
- Comunidad de desarrolladores

---

## 📞 Soporte

Para reportar bugs o sugerir mejoras, por favor crear un issue en el repositorio del proyecto.

---

**¡Gracias por usar Clínica Behrens! 🏥**
