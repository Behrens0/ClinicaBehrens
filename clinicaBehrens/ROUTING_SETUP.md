# Configuración de Rutas - Clínica Behrens

## Estructura de Rutas Actualizada

### Rutas Principales

```typescript
export const routes: Routes = [
  {
    path: '',                    // Ruta raíz
    redirectTo: '/login',        // Redirige a login
    pathMatch: 'full'
  },
  {
    path: 'login',               // Página de login
    loadChildren: () => import('./pages/login/login.routes')
  },
  {
    path: 'registro',            // Página de registro
    loadChildren: () => import('./pages/registro/registro.routes')
  },
  {
    path: 'dashboard-paciente',  // Dashboard de pacientes
    loadComponent: () => import('./pages/dashboard-paciente/dashboard-paciente.component')
  },
  {
    path: 'dashboard-especialista', // Dashboard de especialistas
    loadComponent: () => import('./pages/dashboard-especialista/dashboard-especialista.component')
  },
  {
    path: 'dashboard-admin',     // Dashboard de administradores
    loadComponent: () => import('./pages/dashboard-admin/dashboard-admin.component')
  },
  {
    path: 'dashboard',           // Dashboard general
    loadComponent: () => import('./pages/dashboard/dashboard.component')
  },
  {
    path: '**',                  // Ruta no encontrada
    redirectTo: '/login'         // Redirige a login
  }
];
```

## Flujo de Navegación

### 1. Acceso Inicial
- **URL**: `http://localhost:4200/`
- **Acción**: Redirige automáticamente a `/login`
- **Resultado**: Muestra la pantalla de login

### 2. Login Exitoso
- **Pacientes**: Redirige a `/dashboard-paciente`
- **Especialistas**: Redirige a `/dashboard-especialista`
- **Administradores**: Redirige a `/dashboard-admin`

### 3. Navegación Manual
- **Login**: `http://localhost:4200/login`
- **Registro**: `http://localhost:4200/registro`
- **Dashboard Paciente**: `http://localhost:4200/dashboard-paciente`
- **Dashboard Especialista**: `http://localhost:4200/dashboard-especialista`
- **Dashboard Admin**: `http://localhost:4200/dashboard-admin`

### 4. Rutas No Encontradas
- **Cualquier URL inválida**: Redirige a `/login`

## Componentes Creados

### Dashboards Básicos
- ✅ `DashboardPacienteComponent` - Dashboard para pacientes
- ✅ `DashboardEspecialistaComponent` - Dashboard para especialistas
- ✅ `DashboardAdminComponent` - Dashboard para administradores
- ✅ `DashboardComponent` - Dashboard general

### Características
- **Lazy Loading**: Los dashboards se cargan solo cuando se necesitan
- **Standalone Components**: Componentes independientes
- **Placeholder Content**: Contenido básico para desarrollo

## Configuración de Angular

### app.config.ts
```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes)
  ]
};
```

### app.component.html
```html
<router-outlet></router-outlet>
```

## Próximos Pasos

### 1. Desarrollar Dashboards
- [ ] Implementar funcionalidades específicas para cada tipo de usuario
- [ ] Agregar navegación entre secciones
- [ ] Implementar logout
- [ ] Agregar guards de autenticación

### 2. Mejorar UX
- [ ] Agregar loading states
- [ ] Implementar breadcrumbs
- [ ] Agregar notificaciones
- [ ] Mejorar responsive design

### 3. Seguridad
- [ ] Implementar guards de ruta
- [ ] Agregar interceptors de autenticación
- [ ] Implementar refresh tokens
- [ ] Agregar validación de permisos

## Testing

### Probar Rutas
1. **Acceso directo**: `http://localhost:4200/` → Debe redirigir a login
2. **Login manual**: `http://localhost:4200/login` → Debe mostrar login
3. **Registro**: `http://localhost:4200/registro` → Debe mostrar registro
4. **Ruta inválida**: `http://localhost:4200/invalid` → Debe redirigir a login

### Probar Navegación
1. **Botón registro**: Desde login → Debe ir a registro
2. **Login exitoso**: Según tipo de usuario → Debe ir al dashboard correspondiente
3. **Acceso rápido**: Botones de login → Debe funcionar correctamente

## Troubleshooting

### Problemas Comunes

1. **Error 404 en rutas**
   - Verificar que los componentes existen
   - Verificar la configuración de rutas
   - Verificar imports correctos

2. **No redirige a login**
   - Verificar `redirectTo: '/login'`
   - Verificar `pathMatch: 'full'`
   - Verificar orden de rutas

3. **Lazy loading no funciona**
   - Verificar sintaxis de import
   - Verificar que los archivos existen
   - Verificar configuración de Angular

### Logs de Debug
```typescript
// En el componente de login
console.log('Redirigiendo a:', ruta);
console.log('Tipo de usuario:', tipoUsuario);
``` 