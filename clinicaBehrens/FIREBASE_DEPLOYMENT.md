# Guía de Deployment en Firebase Hosting

## Configuración Completada ✅

Se han creado los siguientes archivos de configuración:
- `firebase.json` - Configuración de Firebase Hosting
- `.firebaserc` - Configuración del proyecto Firebase
- Script `deploy` agregado al `package.json`

## Pasos para Deployar tu Aplicación

### 1. Iniciar Sesión en Firebase

Primero, debes autenticarte con tu cuenta de Google:

```bash
firebase login
```

Esto abrirá tu navegador para que inicies sesión con tu cuenta de Google.

### 2. Crear un Proyecto en Firebase Console (si no lo has hecho)

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Agregar proyecto" o "Add project"
3. Dale un nombre a tu proyecto (ej: "clinica-behrens")
4. Sigue los pasos del asistente

### 3. Configurar el ID del Proyecto

Después de crear tu proyecto en Firebase Console, edita el archivo `.firebaserc` y reemplaza `"your-project-id"` con el ID real de tu proyecto de Firebase.

```json
{
  "projects": {
    "default": "tu-id-de-proyecto-real"
  }
}
```

### 4. Compilar y Deployar

Ahora puedes deployar tu aplicación con un solo comando:

```bash
npm run deploy
```

Este comando:
1. Compilará tu aplicación Angular en modo producción
2. Subirá los archivos a Firebase Hosting
3. Te dará una URL donde podrás ver tu aplicación

### 5. Acceder a tu Aplicación

Una vez completado el deployment, Firebase te mostrará una URL similar a:
```
https://tu-proyecto.web.app
```
o
```
https://tu-proyecto.firebaseapp.com
```

## Comandos Útiles

- `firebase login` - Iniciar sesión en Firebase
- `firebase logout` - Cerrar sesión
- `firebase projects:list` - Ver tus proyectos de Firebase
- `firebase use <project-id>` - Cambiar de proyecto
- `npm run deploy` - Compilar y deployar
- `firebase deploy --only hosting` - Solo deployar hosting (sin compilar)
- `ng build --configuration production` - Solo compilar sin deployar

## Troubleshooting

### Error: "No project active"
- Asegúrate de haber configurado correctamente el archivo `.firebaserc` con tu ID de proyecto

### Error de permisos
- Ejecuta `firebase login` nuevamente para reautenticarte

### La aplicación no carga correctamente
- Verifica que el outputPath en `angular.json` sea `dist/clinica-behrens`
- Asegúrate de que el `public` en `firebase.json` apunte a `dist/clinica-behrens/browser`

### Cambios no se reflejan
- Firebase puede cachear contenido. Usa Ctrl+Shift+R para forzar una recarga sin caché
- O espera unos minutos para que se propague el cambio

## Configuración Actual

El proyecto está configurado para:
- **Output Directory**: `dist/clinica-behrens/browser`
- **Build Command**: `ng build --configuration production`
- **Rewrite Rules**: Todas las rutas redirigen a `index.html` (necesario para Angular routing)

## Notas Importantes

1. **Supabase**: Asegúrate de que tu configuración de Supabase permita requests desde tu dominio de Firebase
2. **Variables de Entorno**: Si tienes variables de entorno sensibles, considera usar Firebase Environment Config
3. **CORS**: Verifica que tus servicios backend acepten requests desde tu dominio de Firebase

## Actualizar la Aplicación

Para actualizar tu aplicación después de hacer cambios:

```bash
npm run deploy
```

Esto recompilará y redesplegará automáticamente.

