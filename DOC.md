# Plataforma Experiencias del Destino Plus

## 1. Contexto del proyecto
Experiencias del Destino Plus es una plataforma digital para crear, gestionar y comercializar experiencias turísticas. El ecosistema se organiza en una jerarquía de roles:
- Central → gestión global del sistema
- Delegados → gestión territorial
- Productores → creadores de experiencias
- Clientes → compradores finales

La plataforma permite:
- crear experiencias turísticas
- gestionar productores y delegados
- vender experiencias online
- gestionar pagos
- calcular ingresos y comisiones
- monitorizar actividad mediante dashboards

URL pública:
- https://plus.experienciasdeldestino.com

## 2. Arquitectura del sistema (roles)
### Central
Responsable de la supervisión global.
- gestión de delegados
- supervisión de productores
- supervisión de experiencias
- control de ingresos globales
- monitorización de la red

### Delegado
Responsable territorial.
- gestión de productores de su territorio
- creación y supervisión de experiencias
- seguimiento de ventas regionales
- visualización de comisiones generadas

### Productor
Creador de experiencias.
- creación de experiencias
- gestión de catálogo
- seguimiento de reservas
- visualización de ingresos generados

### Cliente
Comprador final.
- exploración del catálogo
- compra de experiencias
- acceso a contenidos adquiridos

## 3. Funcionalidades implementadas

### 3.1 Interfaz pública (usuarios y compradores)
**Homepage**
- hero principal de presentación
- buscador de experiencias
- acceso al catálogo

**Listado de experiencias**
- visualización de experiencias disponibles
- filtros de búsqueda
- navegación entre resultados

**Detalle de experiencia**
- descripción completa
- información relevante
- precio
- botón de compra

**Proceso de reserva (Booking flow)**
- selección de experiencia
- confirmación de compra
- pago mediante Stripe Checkout
- confirmación de reserva

**Confirmación de pago**
- registro de reserva
- actualización de métricas

### 3.2 Autenticación y gestión de usuarios
**Auth**
- login de usuarios
- creación de contraseña para nuevos usuarios vía invitación
- gestión segura de sesiones
- protección de rutas por rol

**Invitación de usuarios administrativos**
- Central puede invitar usuarios
- asignación de rol y provincia
- envío de invitación por email

Estado actual del panel Central:
- botón `+` abre modal
- permite nombre, email, rol, provincia
- provincia es obligatoria

**Nota**
- La creación de contraseña se realiza cuando el usuario acepta la invitación por email.

### 3.3 Creación de experiencias
Las experiencias pueden crearse de dos formas:

**Creación manual**
- título
- descripción
- precio
- productor asociado
- delegado territorial
- contenido de la experiencia

**Creación mediante plantilla (DOCX / Excel)**
- subida de DOCX o Excel
- parseo automático del contenido
- previsualización antes de guardar

### 3.4 Sistema de compra y pagos
**Stripe Checkout**
- proceso de pago seguro
- confirmación automática
- registro de transacción
- webhooks de Stripe para confirmar pago

Modo actual:
- configurable para test o producción

### 3.5 Sistema de reparto de ingresos
- porcentajes configurables por experiencia
- reparto entre productor, delegado y central
- valores por defecto editables
- registro automático tras cada venta

### 3.6 Dashboards de gestión
**Dashboard Central**
- ingresos totales
- actividad de experiencias
- gestión de usuarios
- supervisión de productores y delegados

**Dashboard Delegado**
- productores asociados
- experiencias del territorio
- ingresos generados
- comisiones regionales

**Dashboard Productor**
- listado de experiencias
- reservas realizadas
- ingresos generados

### 3.7 Notificaciones por email
- invitaciones a nuevos usuarios
- confirmaciones de compra
- notificaciones del sistema

Proveedor:
- SendGrid (configurable)

### 3.8 Imágenes y contenido
- imágenes locales servidas desde `/frontend/public/images/...`
- rutas normalizadas a ASCII
- soporte para importación masiva de imágenes

### 3.9 PWA / Mobile
- manifest y service worker
- navegación móvil con menú inferior
- soporte responsive

## 4. Qué hace y qué no hace (limitaciones actuales)

### Lo que hace
- catálogo público completo
- compra con Stripe
- dashboards por rol
- invitación de usuarios con email personalizado
- creación de experiencias manual y por plantilla
- reparto automático de comisiones

### Lo que no hace (pendiente o fuera de alcance)
- gestión avanzada de reembolsos en panel
- panel de reviews con escritura (actualmente solo lectura si existe tabla)
- multi-idioma completo
- soporte multi-tenant (un solo proyecto/organización)
- backoffice de facturación detallada

## 5. Estado actual del proyecto
- funcional en entorno de pruebas
- permite gestionar usuarios y roles
- permite crear experiencias
- permite vender experiencias
- calcula ingresos y comisiones
- dashboards operativos

## 6. Ajustes pendientes antes del lanzamiento
- configurar Stripe en modo producción
- configurar dominio y remitente final de email
- validar webhooks en producción

## 7. Próximos pasos inmediatos
1. Configurar email oficial de EDD
2. Probar flujo completo de compra en producción
3. Confirmar configuración definitiva de Stripe

## 8. Notas operativas
- El webhook de Stripe debe apuntar a: `https://plus.experienciasdeldestino.com/api/webhook`
- La invitación de usuarios crea su contraseña al aceptar el email

