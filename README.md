# StackHard Org - Gestor de Proyectos, Dominios & Cobros

Sistema de gestión centralizado para desarrolladores y agencias freelance. Permite organizar landing pages, sistemas web y aplicaciones, monitorear vencimientos de dominios, asociar cuentas de Google e infraestructura (hosting y bases de datos), y llevar un control estricto de ingresos (pagos únicos, mantenimientos mensuales y cobros anuales).

---

## 🚀 Características Principales

1. **Control de Cobros e Ingresos:**
   - **Total Generado:** Cálculo automático acumulado de cobros únicos y pagos periódicos.
   - **MRR (Ingresos Recurrentes Mensuales):** Estimación en tiempo real del dinero mensual ingresado por mantenimientos y servicios activos.
   - **ARR Estimado:** Proyección anual de ingresos.
   - **Registro de Pagos:** Módulo integrado para registrar pagos con fecha, concepto (mantenimiento mensual, desarrollo inicial, renovación de dominio) y estado.

2. **Gestión de Dominios y Renovaciones:**
   - Monitoreo de dominios (`.com`, `.net`, etc.) y sus registradores (Namecheap, GoDaddy, Porkbun, etc.).
   - Alertas visuales con código de colores según días restantes para el vencimiento (alerta a ≤30 días y ≤15 días).
   - Control de costo de renovación anual y opción para proyectos que no requieren renovación.

3. **Cuentas de Google e Infraestructura:**
   - Identificación directa de la **cuenta de Google** vinculada a cada proyecto (dónde está guardado el Drive, consola GCP, Firebase, Analytics o correo).
   - Filtro rápido para ver todos los sistemas bajo una misma cuenta de Google.
   - Registro de servidores/hosting (Vercel, Railway, Hostinger, VPS) y bases de datos (Supabase, Neon, Firebase, etc.).

4. **Diseño Responsive & Minimalista:**
   - Interfaz limpia y optimizada para **móviles y PC**.
   - Búsqueda en tiempo real por proyecto, cliente, dominio o notas.
   - Filtros por tipo de proyecto (Landing Page, Sistema Web, SaaS, E-commerce) y estado (Activo, Entregado, Desarrollo, etc.).

---

## 🛠️ Stack Tecnológico

- **Frontend & Fullstack:** Next.js 14 (App Router) + TypeScript
- **Estilos & UI:** Tailwind CSS + Lucide Icons
- **Base de Datos:** PostgreSQL en Supabase
- **Hosting / Deploy:** Optimizado para Vercel

---

## ⚙️ Configuración y Despliegue en Vercel

### 1. Variables de Entorno

Configura en tu archivo local `.env.local` o en la consola de Vercel (**Settings > Environment Variables**):

```env
NEXT_PUBLIC_SUPABASE_URL=https://wnyczsikqpevioplsqln.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndueWN6c2lrcXBldmlvcGxzcWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NTEyMzEsImV4cCI6MjEwNzEyNzIzMX0.B_olMs25ruqxN0ddznrjq0DgzDKQ5T_JO2mBPV7OT4c
```

### 2. Despliegue en Vercel

1. Ve a [Vercel](https://vercel.com) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **Add New... > Project**.
3. Importa el repositorio `stackhardofficial-design/stackHardOrg`.
4. En **Environment Variables**, añade las dos variables mencionadas arriba.
5. Haz clic en **Deploy**. ¡Listo en menos de 1 minuto!

---

## 💻 Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.