# Manual de Pruebas de Funcionalidades — Experiencias del Destino Plus

Este documento describe qué hace la plataforma y cómo probar cada funcionalidad paso a paso. Está pensado para el equipo de negocio y para validar el funcionamiento general antes de lanzamiento.

URL principal:
- https://plus.experienciasdeldestino.com

---

## 1. Home pública (landing)
**Qué hace**
- Presenta la marca y el acceso al catálogo.
- Muestra buscador y accesos principales.

**Cómo probar**
1. Abrir la URL principal.
2. Verificar que el hero principal, menú y footer cargan correctamente.
3. Desplazarse hacia abajo y validar secciones informativas.

**Imagen sugerida**
- Captura del hero principal y buscador.

---

## 2. Catálogo de experiencias
**Qué hace**
- Muestra todas las experiencias disponibles.
- Permite filtrar por provincia, precio y grupo.

**Cómo probar**
1. Ir a “Experiencias”.
2. Validar que aparecen tarjetas con imagen, título y precio.
3. Probar filtros (provincia, precio, grupo) y confirmar que cambian los resultados.

**Imagen sugerida**
- Captura del listado con filtros visibles.

---

## 3. Detalle de experiencia
**Qué hace**
- Muestra descripción completa, imágenes, precio y formulario de reserva.

**Cómo probar**
1. Entrar a una experiencia desde el catálogo.
2. Verificar que cargan imágenes y texto completo.
3. Revisar que el precio aparece correctamente.

**Imagen sugerida**
- Captura del detalle con galería y formulario visible.

---

## 4. Proceso de reserva (Booking)
**Qué hace**
- Permite reservar una experiencia y pagar con Stripe.

**Cómo probar**
1. En el detalle de una experiencia, completar nombre y email.
2. Ajustar número de personas.
3. Pulsar “Reservar”.
4. Confirmar redirección a Stripe Checkout.

**Imagen sugerida**
- Captura de Stripe Checkout.

---

## 5. Confirmación de pago
**Qué hace**
- Tras pagar, se confirma la reserva.

**Cómo probar**
1. Completar el pago en Stripe (tarjeta de prueba).
2. Confirmar redirección a `/booking/success`.
3. Verificar mensaje de confirmación.

**Imagen sugerida**
- Captura de la página de éxito de reserva.

---

## 6. Registro de reservas
**Qué hace**
- Guarda la reserva y la muestra en el dashboard.

**Cómo probar**
1. Iniciar sesión como usuario Central.
2. Ir al dashboard.
3. Confirmar que la reserva recién hecha aparece en la lista.

**Imagen sugerida**
- Captura del dashboard con reserva visible.

---

## 7. Autenticación y acceso por rol
**Qué hace**
- Permite login con Supabase y restringe acceso según rol.

**Cómo probar**
1. Ir a `/login`.
2. Iniciar sesión con un usuario Central.
3. Confirmar acceso a dashboard Central.

**Imagen sugerida**
- Captura del formulario de login.

---

## 8. Invitación de usuarios (Central)
**Qué hace**
- Central puede invitar delegados o productores por email.

**Cómo probar**
1. Desde dashboard Central, pulsar el botón “+”.
2. Completar nombre, email, rol y provincia.
3. Enviar invitación.
4. Verificar mensaje de éxito.

**Imagen sugerida**
- Captura del modal de invitación.

---

## 9. Email de invitación
**Qué hace**
- Envía email con link para crear contraseña.

**Cómo probar**
1. Revisar bandeja de entrada del email invitado.
2. Verificar branding (logo y nombre correcto).
3. Abrir el enlace de invitación.

**Imagen sugerida**
- Captura del email recibido.

---

## 10. Creación de contraseña (usuario invitado)
**Qué hace**
- El usuario invitado crea su contraseña y activa su cuenta.

**Cómo probar**
1. Abrir enlace de invitación.
2. Crear contraseña.
3. Confirmar acceso correcto al rol asignado.

**Imagen sugerida**
- Captura de la pantalla “Crear contraseña”.

---

## 11. Email de confirmación de reserva
**Qué hace**
- Envía email con detalles de la reserva.

**Cómo probar**
1. Realizar una compra.
2. Verificar email de confirmación.
3. Confirmar que incluye:
   - Experiencia reservada
   - Ubicación
   - Participantes
   - Total
   - ID de reserva

**Imagen sugerida**
- Captura del email de confirmación con detalle de experiencia.

---

## 12. Navegación móvil
**Qué hace**
- Interfaz adaptada a móvil con menú inferior.

**Cómo probar**
1. Abrir en móvil o modo responsive.
2. Verificar navegación inferior.
3. Confirmar que todas las páginas se visualizan correctamente.

**Imagen sugerida**
- Captura en modo móvil con menú inferior.

---

## 13. Importación por plantilla (Productor)
**Qué hace**
- Permite cargar experiencias desde DOCX o Excel.

**Cómo probar**
1. Iniciar sesión como Productor.
2. Abrir “Importar por plantilla”.
3. Subir un DOCX o Excel.
4. Verificar previsualización y guardar.

**Imagen sugerida**
- Captura del modal de importación con preview.

---

## Observaciones adicionales
- En producción se debe validar el webhook de Stripe.
- Los emails deben estar correctamente configurados con SendGrid/Resend.
- El branding debe reflejar Experiencias del Destino.

