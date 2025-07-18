
# 🚀 Instrucciones Rápidas de Deploy - Beauty GO

## Pasos Rápidos para Deploy en Netlify

### 1. Preparar Base de Datos
```bash
# Usar PlanetScale (recomendado)
# 1. Crear cuenta en planetscale.com
# 2. Crear database "beauty-go"
# 3. Obtener connection string
```

### 2. Configurar Variables en Netlify
```env
DATABASE_URL=postgresql://user:pass@host:port/db
NEXTAUTH_URL=https://tu-app.netlify.app
NEXTAUTH_SECRET=generar-con-openssl-rand-base64-32
NODE_ENV=production
NETLIFY=true
```

### 3. Build Settings en Netlify
```
Build command: npm run build
Publish directory: .next
Base directory: app
```

### 4. Post-Deploy
```bash
# Ejecutar migraciones
npx prisma migrate deploy

# Poblar datos iniciales
npx prisma db seed
```

### 5. Verificar Funcionamiento
- ✅ `/` - Home page
- ✅ `/auth/login` - Login
- ✅ `/dashboard` - Dashboard  
- ✅ `/api/health` - Health check

## 🔗 Enlaces Útiles
- [Netlify Dashboard](https://app.netlify.com)
- [PlanetScale](https://planetscale.com)
- [Documentación Completa](./README-NETLIFY-DEPLOY.md)

## 🆘 Soporte Rápido
1. Revisa logs en Netlify Dashboard
2. Verifica variables de entorno
3. Confirma conexión a base de datos
