
# 🚀 Beauty GO - Deploy en Netlify

Esta guía te ayudará a desplegar Beauty GO en Netlify de manera exitosa.

## 📋 Prerequisitos

- Cuenta en [Netlify](https://netlify.com)
- Repositorio de código en GitHub/GitLab/Bitbucket
- Base de datos PostgreSQL en la nube (recomendado: PlanetScale o Supabase)

## 🗄️ 1. Configuración de Base de Datos

### Opción A: PlanetScale (Recomendado para Netlify)
1. Crea una cuenta en [PlanetScale](https://planetscale.com)
2. Crea una nueva base de datos
3. Obtén la connection string
4. Configura las variables de entorno (ver paso 3)

### Opción B: Supabase
1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ve a Settings > Database
3. Copia la connection string de PostgreSQL
4. Configura las variables de entorno (ver paso 3)

### Opción C: Heroku Postgres
1. Crea una app en Heroku
2. Agrega el addon "Heroku Postgres"
3. Obtén la DATABASE_URL desde las config vars
4. Configura las variables de entorno (ver paso 3)

## 🔧 2. Preparación del Código

### Clona y prepara el repositorio:
```bash
# Clona el repositorio
git clone <tu-repositorio-url>
cd beauty-go-mvp/app

# Instala dependencias
yarn install

# Genera el cliente de Prisma
yarn prisma:generate
```

## 🌍 3. Variables de Entorno

Configura las siguientes variables de entorno en Netlify:

### Variables Requeridas:
```env
DATABASE_URL="postgresql://username:password@host:port/database"
NEXTAUTH_URL="https://tu-app.netlify.app"
NEXTAUTH_SECRET="tu-secreto-jwt-de-32-caracteres-minimo"
NODE_ENV="production"
NETLIFY="true"
```

### Generar NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### Variables Opcionales:
```env
# Para subida de archivos (Cloudinary)
CLOUDINARY_CLOUD_NAME="tu-cloud-name"
CLOUDINARY_API_KEY="tu-api-key"
CLOUDINARY_API_SECRET="tu-api-secret"

# Para emails
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="tu-email@gmail.com"
SMTP_PASS="tu-app-password"
FROM_EMAIL="noreply@tu-app.com"
```

## 🚀 4. Deploy en Netlify

### Método 1: Deploy desde Git (Recomendado)

1. **Conecta tu repositorio:**
   - Ve a [Netlify Dashboard](https://app.netlify.com)
   - Haz clic en "New site from Git"
   - Conecta tu repositorio (GitHub/GitLab/Bitbucket)
   - Selecciona el repositorio de Beauty GO

2. **Configuración de Build:**
   ```
   Build command: npm run build
   Publish directory: .next
   Base directory: app
   ```

3. **Variables de entorno:**
   - Ve a Site Settings > Environment Variables
   - Agrega todas las variables listadas en el paso 3

4. **Deploy:**
   - Haz clic en "Deploy site"
   - Espera a que termine el build

### Método 2: Deploy Manual

```bash
# Instala Netlify CLI
npm install -g netlify-cli

# Login en Netlify
netlify login

# Deploy desde el directorio del proyecto
cd beauty-go-mvp/app
netlify deploy --prod --dir=.next
```

## 🗃️ 5. Configuración de Base de Datos Post-Deploy

Después del primer deploy exitoso, configura la base de datos:

### Ejecutar Migraciones:
```bash
# Opción 1: Usar Netlify CLI
netlify dev
npx prisma migrate deploy

# Opción 2: Usar tu entorno local
DATABASE_URL="tu-database-url" npx prisma migrate deploy
```

### Poblar con Datos Iniciales:
```bash
# Ejecutar seed
DATABASE_URL="tu-database-url" npx prisma db seed
```

## 🔍 6. Verificación Post-Deploy

### Checklist de verificación:
- [ ] ✅ La aplicación carga correctamente
- [ ] ✅ El login/registro funciona
- [ ] ✅ Las APIs responden correctamente
- [ ] ✅ La base de datos está conectada
- [ ] ✅ Las imágenes se cargan (si tienes configurado upload)
- [ ] ✅ Las notificaciones funcionan (si tienes email configurado)

### URLs importantes a probar:
- `/` - Página principal
- `/auth/login` - Login
- `/auth/register` - Registro
- `/dashboard` - Dashboard (requiere autenticación)
- `/explore` - Explorar servicios
- `/api/auth/signin` - API de autenticación

## 🐛 7. Solución de Problemas Comunes

### Error: "Database connection failed"
- ✅ Verifica que DATABASE_URL esté configurada correctamente
- ✅ Asegúrate de que la base de datos sea accesible desde internet
- ✅ Verifica que las migraciones se hayan ejecutado

### Error: "NextAuth configuration error"
- ✅ Verifica que NEXTAUTH_URL coincida con tu URL de Netlify
- ✅ Asegúrate de que NEXTAUTH_SECRET tenga al menos 32 caracteres
- ✅ Verifica que las variables estén configuradas en Netlify

### Error de Build: "Module not found"
- ✅ Ejecuta `yarn install` para instalar dependencias faltantes
- ✅ Verifica que todas las dependencias estén en package.json
- ✅ Limpia caché: `rm -rf .next node_modules && yarn install`

### Error: "API routes not working"
- ✅ Verifica que netlify.toml esté configurado correctamente
- ✅ Asegúrate de que las redirects de API estén funcionando
- ✅ Revisa los logs de Netlify Functions

## 📊 8. Monitoreo y Mantenimiento

### Logs de Netlify:
- Ve a tu site dashboard en Netlify
- Haz clic en "Functions" para ver logs de API
- Revisa "Deploy log" para errores de build

### Base de Datos:
- Monitorea el uso de conexiones
- Configura backups automáticos
- Revisa métricas de performance

### Performance:
- Usa Lighthouse para auditar performance
- Configura CDN para assets estáticos
- Optimiza imágenes y recursos

## 🔄 9. Actualizaciones

Para actualizar la aplicación:

1. **Push cambios al repositorio:**
   ```bash
   git add .
   git commit -m "Actualización de features"
   git push origin main
   ```

2. **Deploy automático:**
   - Netlify detectará los cambios automáticamente
   - El build se ejecutará automáticamente

3. **Migraciones de BD (si las hay):**
   ```bash
   DATABASE_URL="tu-database-url" npx prisma migrate deploy
   ```

## 📞 10. Soporte

Si encuentras problemas:

1. **Revisa los logs de Netlify**
2. **Verifica las variables de entorno**
3. **Consulta la documentación de Netlify**
4. **Revisa el estado de tu base de datos**

---

## 📝 Notas Importantes

- **Seguridad:** Nunca expongas las variables de entorno en el código
- **Performance:** Considera usar un CDN para imágenes y assets
- **Backup:** Configura backups automáticos de tu base de datos
- **Monitoreo:** Usa herramientas como Sentry para monitorear errores en producción

¡Tu aplicación Beauty GO estará lista para usar en Netlify! 🎉
