# **Plataforma Experiencias del Destino Plus**

## **Estado del desarrollo y funcionalidades implementadas**

## **1\. Contexto del proyecto**

**Experiencias del Destino Plus** es una plataforma digital diseñada para la **creación, gestión y comercialización de experiencias turísticas**.

La plataforma permite organizar el ecosistema de actores del proyecto mediante una estructura jerárquica:

* **Central** → gestión global del sistema  
* **Delegados** → gestión territorial  
* **Productores** → creadores de experiencias  
* **Clientes** → compradores finales

El sistema permite:

* crear experiencias turísticas  
* gestionar productores y delegados  
* vender experiencias online  
* gestionar pagos  
* calcular ingresos y comisiones  
* monitorizar actividad mediante dashboards

La plataforma está disponible en:

[**https://plus.experienciasdeldestino.com**](https://plus.experienciasdeldestino.com)

---

# 

# 

# **2\. Arquitectura del sistema**

La plataforma está estructurada en torno a **roles de usuario con diferentes permisos**.

## **Central**

Responsable de la supervisión global de la plataforma.

Funciones principales:

* gestión de delegados  
* supervisión de productores  
* supervisión de experiencias  
* control de ingresos globales  
* monitorización del funcionamiento de la red  
  ---

  ## **Delegado**

Responsable territorial dentro de la red.

Funciones principales:

* gestión de productores de su territorio  
* creación y supervisión de experiencias  
* seguimiento de ventas regionales  
* visualización de comisiones generadas  
  ---

  ## **Productor**

Creador de experiencias dentro del sistema.

Funciones principales:

* creación de experiencias  
* gestión de catálogo  
* seguimiento de reservas  
* visualización de ingresos generados  
  ---

  ## 

  ## **Cliente**

Usuario final que compra experiencias.

Funciones principales:

* exploración del catálogo  
* compra de experiencias  
* acceso a contenidos adquiridos  
  ---

  # **3\. Funcionalidades implementadas**

  ## **3.1 Interfaz pública (usuarios y compradores)**

La plataforma ya cuenta con una interfaz pública completa para la exploración y compra de experiencias.

### **Homepage**

La página principal incluye:

* **hero principal de presentación**  
* **buscador de experiencias**  
* acceso al catálogo  
  ---

  ### **Listado de experiencias**

Se ha implementado una página de catálogo que permite:

* visualizar todas las experiencias disponibles  
* aplicar **filtros de búsqueda**  
* navegar entre diferentes opciones  

**Búsqueda inteligente (semántica)**  
Además de la búsqueda tradicional por palabras clave, la plataforma incorpora una búsqueda “inteligente” que permite encontrar experiencias por intención (por ejemplo: “romántico atardecer”, “plan en familia”, “aventura”), incluso si esas palabras no aparecen literalmente en el título.  
  ---

  ### **Detalle de experiencia**

Cada experiencia dispone de su propia página donde el usuario puede ver:

* descripción completa  
* información relevante de la experiencia  
* precio  
* botón de compra  

**Prueba social / urgencia (mejora de conversión)**  
En la ficha se muestran indicadores de actividad (por ejemplo reservas recientes) para ayudar al usuario a decidir.  
  ---

  ### **Proceso de reserva (Booking flow)**

El sistema incluye un **flujo completo de compra** integrado con Stripe.

El proceso incluye:

1. selección de la experiencia  
2. confirmación de compra  
3. pago mediante Stripe  
4. confirmación de la reserva  
   ---

   ### **Confirmación de pago**

Tras completar el pago:

* el usuario recibe confirmación de compra  
* la reserva queda registrada en el sistema  
* se actualizan las métricas de la plataforma  
  ---

  # **3.2 Sistema de autenticación y gestión de usuarios**

La plataforma cuenta con un sistema de autenticación basado en **Supabase**.

### **Funcionalidades implementadas**

* login de usuarios  
* creación de contraseña para nuevos usuarios  
* gestión segura de sesiones  
* protección de rutas según rol

Esto permite que cada tipo de usuario acceda únicamente a las funcionalidades correspondientes a su rol.

---

### 

### **Invitación de usuarios administrativos**

El sistema permite que usuarios con permisos adecuados puedan:

* invitar nuevos usuarios  
* asignar roles dentro de la plataforma

Esto facilita la creación de:

* delegados  
* productores  
* administradores

Estado actual del panel Central:

* botón \+ abre modal de invitación  
* permite introducir nombre, email, rol y provincia  
* provincia es obligatoria

**Nota:** La creación de contraseña se realiza cuando el usuario acepta la invitación por email.

---

# **3.3 Creación de experiencias**

Los usuarios autorizados pueden crear y gestionar experiencias turísticas dentro de la plataforma.

Las experiencias pueden crearse de dos formas.

---

### **Creación manual**

Introduciendo la información principal de la experiencia, incluyendo:

* título  
* descripción  
* precio  
* productor asociado  
* delegado territorial  
* contenido de la experiencia

Este método permite crear experiencias directamente desde el panel de administración.

---

### **Creación mediante documento DOC**

La plataforma permite subir un **archivo DOC**, que es procesado para generar automáticamente el contenido de la experiencia dentro del sistema.

Este sistema facilita la incorporación de experiencias ya existentes, permitiendo importar contenido previamente preparado por productores o delegados.

---

# **3.4 Sistema de compra y pagos**

La plataforma integra un sistema completo de pagos mediante **Stripe Checkout**.

### **Funcionalidades implementadas**

* integración con Stripe Checkout  
* proceso de pago seguro  
* confirmación automática de pago  
* registro de la transacción

El sistema también gestiona:

* confirmación de pago mediante **webhooks de Stripe**  
* actualización automática de datos tras cada compra

**Checkout optimizado para móvil**  
Se han realizado mejoras para reducir fricción en móvil y habilitar métodos de pago disponibles según el dispositivo (por ejemplo Apple Pay / Google Pay cuando aplique).  

Actualmente el sistema se encuentra configurado en **modo test de Stripe** para realizar pruebas sin procesar pagos reales.

Tarjeta de prueba:

4242 4242 4242 4242

Exp: 02/29

CVC: 121

---

# **3.5 Sistema de reparto de ingresos**

Cuando se realiza una compra, la plataforma calcula automáticamente el reparto de ingresos entre los diferentes actores del sistema.

A diferencia de modelos con comisiones fijas, **el sistema está diseñado para permitir flexibilidad en el reparto**, ya que las condiciones pueden variar dependiendo de las negociaciones con cada productor y de las características específicas de cada experiencia.

Por este motivo:

* cada experiencia puede tener **su propio esquema de reparto**  
* las comisiones pueden **adaptarse según acuerdos comerciales**

La plataforma permite definir:

* porcentaje para el productor  
* porcentaje para el delegado  
* porcentaje para la central

Para facilitar la creación de experiencias, la interfaz puede mostrar **valores por defecto**, pero estos pueden modificarse fácilmente según cada caso.

El sistema registra automáticamente el reparto correspondiente tras cada venta.

---

# **3.6 Dashboards de gestión**

La plataforma incluye dashboards específicos para cada tipo de usuario.

---

### **Dashboard Central**

Permite visualizar el estado global de la red:

* ingresos totales  
* actividad de experiencias  
* gestión de usuarios  
* supervisión de productores y delegados  
  ---

  ### **Dashboard Delegado**

Permite gestionar la actividad regional:

* productores asociados  
* experiencias del territorio  
* ingresos generados  
* comisiones regionales  
  ---

  ### **Dashboard Productor**

Permite a cada productor gestionar su actividad:

* listado de sus experiencias  
* reservas realizadas  
* ingresos generados  
  ---

  # **3.7 Sistema de notificaciones por email**

La plataforma incluye un sistema de envío de correos automáticos utilizando servicios del proveedor:

* **SendGrid**
* **Resend (backup/fallback)**

Estos correos permiten enviar:

* confirmaciones de compra  
* notificaciones del sistema  
* invitaciones a nuevos usuarios  
  ---

  # **3.8 SEO y visibilidad (provincias)**

La plataforma incluye mejoras para mejorar la visibilidad en buscadores y facilitar el descubrimiento.

Incluye:

* páginas dinámicas por provincia con URL amigable (por ejemplo: “Mejores experiencias en [Provincia]”)  
* generación automática de \`/sitemap.xml\` y \`/robots.txt\`  

---

  # **3.9 Generación de embeddings (operativa Central)**

Para mantener la búsqueda inteligente actualizada cuando se crean experiencias nuevas, existe una acción disponible para el rol Central que permite:

* generar embeddings para experiencias nuevas o pendientes  
* asegurar que la búsqueda inteligente devuelva resultados relevantes  

---

  # **3.10 Mensajería interna (Central / Delegados / Productores)**

La plataforma incorpora un sistema de mensajería interna (tipo “inbox”) para coordinación operativa entre:

* Central  
* Delegados  
* Productores  

Permite:

* crear conversaciones (hilos)  
* enviar y recibir mensajes  
* ver el historial de cada conversación para los participantes  

---

  # **4\. Qué hace y qué no hace (limitaciones actuales)**

Para completar el despliegue de la plataforma es necesario realizar algunos ajustes finales.

## **Lo que hace**

* catálogo público completo  
* compra con Stripe  
* dashboards por rol  
* invitación de usuarios con email personalizado  
* creación de experiencias manual y por plantilla  
* reparto automático de comisiones  
* búsqueda inteligente (semántica) en el catálogo  
* páginas SEO por provincia + \`sitemap.xml\` / \`robots.txt\`  
* mensajería interna entre Central/Delegados/Productores  
  ---

  ## **Lo que no hace (pendiente o fuera de alcance)**

* gestión avanzada de reembolsos en panel  
* panel de reviews con escritura (actualmente solo lectura si existe tabla)  
* multi-idioma completo  
* soporte multi-tenant (un solo proyecto/organización)  
* backoffice de facturación detallada  
  ---

  # **5\. Estado actual del proyecto**

La plataforma se encuentra **completamente funcional en entorno de pruebas** y ya permite:

* gestionar usuarios y roles  
* crear experiencias  
* vender experiencias  
* procesar pagos de prueba  
* calcular ingresos  
* visualizar métricas mediante dashboards

Los ajustes pendientes corresponden principalmente a **configuración final para producción**.

---

# **6\. Ajustes pendientes antes del lanzamiento**

* configurar Stripe en modo producción  
* configurar dominio y remitente final de email  
* validar webhooks en producción

# **7\. Próximos pasos inmediatos**

Para poder lanzar el sistema es necesario:

1️⃣ Configurar **email oficial de EDD**

2️⃣ Realizar **pruebas completas de compra**

**3️⃣ Confirmar configuración definitiva de Stripe producción**

# **8\. Notas operativas**

* El webhook de Stripe debe apuntar a: \`https://plus.experienciasdeldestino.com/api/webhook\`  
* La invitación de usuarios crea su contraseña al aceptar el email

---

# **Historial de cambios**

**2026-03-20**

* Se añadió búsqueda inteligente (semántica) para descubrir experiencias por intención.  
* Se incorporó generación de embeddings y herramienta operativa para Central para mantener la búsqueda actualizada.  
* Se añadieron landing pages por provincia (\`/provincias/:slug\`) y generación automática de \`/sitemap.xml\` y \`/robots.txt\`.  
* Se añadieron indicadores de prueba social/urgencia en la ficha de experiencia (reservas recientes).  
* Se mejoró el checkout en móvil y compatibilidad con métodos de pago disponibles según dispositivo (cuando aplique).  
* Se mejoró el sistema de emails con SendGrid y fallback por Resend.  
* Se incorporó mensajería interna (inbox) para Central/Delegados/Productores.  
