# Directivas y Pipes - Nombres en Español

## 📦 **3 Pipes Personalizados**

### 1. **CapitalizarPipe** (`pipes/capitalizar.pipe.ts`)
Capitaliza la primera letra de cada palabra.

**Uso:**
```html
<h3>{{ usuario.nombre | capitalizar }}</h3>
<!-- "juan pérez" → "Juan Pérez" -->
```

### 2. **FormatoFechaPipe** (`pipes/formato-fecha.pipe.ts`)
Formatea fechas en diferentes estilos: corta, larga, personalizada.

**Uso:**
```html
<p>{{ turno.fecha | formatoFecha:'corta' }}</p>
<!-- Resultado: "10/11/2025" -->

<p>{{ turno.fecha | formatoFecha:'larga' }}</p>
<!-- Resultado: "martes, 10 de noviembre de 2025" -->

<p>{{ turno.fecha | formatoFecha:'customDiaMesAnioDia' }}</p>
<!-- Resultado: "martes, 10/11/2025" -->
```

### 3. **EstadoTurnoPipe** (`pipes/estado-turno.pipe.ts`)
Convierte estados de turnos a texto legible.

**Uso:**
```html
<span>{{ turno.estado | estadoTurno }}</span>
<!-- "pendiente" → "Pendiente" -->
<!-- "realizado" → "Realizado" -->
```

---

## 🎨 **3 Directivas Personalizadas**

### 1. **ResaltarDirective** (`directives/resaltar.directive.ts`)
Resalta elementos con un color de fondo personalizable.

**Selector:** `[appResaltar]`

**Uso:**
```html
<!-- Resaltar con amarillo (por defecto) -->
<span appResaltar>Texto importante</span>

<!-- Resaltar con color personalizado -->
<span [appResaltar]="'#ffeb3b'">Texto resaltado</span>
<span [appResaltar]="'lightblue'">Otro texto</span>
```

**Características:**
- Color de fondo personalizable
- Padding automático de 4px 8px
- Bordes redondeados
- Transición suave

### 2. **EfectoHoverDirective** (`directives/efecto-hover.directive.ts`)
Agrega efectos de zoom y sombra al hacer hover sobre un elemento.

**Selector:** `[appEfectoHover]`

**Inputs:**
- `escalaHover`: Escala del zoom (default: '1.05')
- `colorHover`: Color de la sombra (default: '#667eea')

**Uso:**
```html
<!-- Efecto hover básico -->
<button appEfectoHover>Hover sobre mí</button>

<!-- Efecto hover con escala personalizada -->
<div appEfectoHover [escalaHover]="'1.1'">
  Tarjeta con zoom grande
</div>

<!-- Efecto hover con color personalizado -->
<button appEfectoHover [escalaHover]="'1.05'" [colorHover]="'#28a745'">
  Botón verde
</button>
```

**Características:**
- Zoom suave al hacer hover
- Sombra dinámica basada en el color
- Transición de 0.3s
- Restauración automática al quitar el mouse

### 3. **PermisoDirective** (`directives/permiso.directive.ts`)
Muestra u oculta elementos según el tipo de usuario autenticado.

**Selector:** `[appPermiso]`

**Input:**
- `appPermiso`: Array de tipos de usuario permitidos

**Uso:**
```html
<!-- Solo visible para administradores -->
<div *appPermiso="['administrador']">
  <button>Borrar usuario</button>
</div>

<!-- Visible para especialistas y administradores -->
<div *appPermiso="['especialista', 'administrador']">
  <button>Ver historias clínicas</button>
</div>

<!-- Visible solo para pacientes -->
<div *appPermiso="['paciente']">
  <button>Mis turnos</button>
</div>
```

**Características:**
- Control de acceso basado en roles
- Verifica sesión activa
- Oculta completamente el elemento (no solo lo deshabilita)
- Asíncrono (verifica con el backend)

---

## 💡 **Ejemplos de Uso Combinado**

### Ejemplo 1: Tarjeta con múltiples directivas y pipes
```html
<div appEfectoHover [escalaHover]="'1.03'" *appPermiso="['administrador']">
  <h3 [appResaltar]="'#e3f2fd'">
    {{ usuario.nombre | capitalizar }}
  </h3>
  <p>Último ingreso: {{ log.fecha_hora | formatoFecha:'larga' }}</p>
  <span>Estado: {{ turno.estado | estadoTurno }}</span>
</div>
```

### Ejemplo 2: Botón con permisos y efectos
```html
<button 
  appEfectoHover 
  [colorHover]="'#dc3545'"
  *appPermiso="['administrador']">
  <span [appResaltar]="'#fff3cd'">Eliminar</span>
</button>
```

### Ejemplo 3: Lista con formato
```html
<ul>
  <li *ngFor="let log of logs" appEfectoHover>
    <strong>{{ log.usuario_nombre | capitalizar }}</strong> - 
    <span [appResaltar]="'lightgreen'">{{ log.usuario_tipo }}</span> - 
    {{ log.fecha_hora | formatoFecha:'corta' }}
  </li>
</ul>
```

---

## 📋 **Tipos de Usuario para PermisoDirective**

Los valores válidos para `appPermiso` son:
- `'administrador'`
- `'especialista'`
- `'paciente'`

---

## 🎯 **Casos de Uso Recomendados**

### ResaltarDirective
- Resaltar información importante
- Destacar estados o badges
- Marcar campos obligatorios

### EfectoHoverDirective
- Botones interactivos
- Tarjetas clicables
- Menús y navegación
- Cards de productos/servicios

### PermisoDirective
- Botones de administración
- Secciones restringidas
- Menús contextuales
- Acciones sensibles

---

## ⚙️ **Configuración**

Todas las directivas y pipes son **standalone**, por lo que solo necesitas importarlas en los componentes donde las uses:

```typescript
import { CapitalizarPipe } from './pipes/capitalizar.pipe';
import { FormatoFechaPipe } from './pipes/formato-fecha.pipe';
import { EstadoTurnoPipe } from './pipes/estado-turno.pipe';
import { ResaltarDirective } from './directives/resaltar.directive';
import { EfectoHoverDirective } from './directives/efecto-hover.directive';
import { PermisoDirective } from './directives/permiso.directive';

@Component({
  // ...
  imports: [
    CommonModule,
    CapitalizarPipe,
    FormatoFechaPipe,
    EstadoTurnoPipe,
    ResaltarDirective,
    EfectoHoverDirective,
    PermisoDirective
  ]
})
```

---

**✨ Tip:** Puedes combinar múltiples directivas en un mismo elemento para crear efectos más complejos!

