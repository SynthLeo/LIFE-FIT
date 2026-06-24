# ⚡ LIFE FIT

**Plataforma integral de bienestar personal** — ejercicio, nutrición, salud clínica y psicología, todo en un solo lugar con asistencia de IA.

---

## 📋 Descripción

LIFE FIT es una aplicación web de salud y fitness que integra cuatro módulos principales de bienestar:

- 🏋️ **Ejercicio** — rutinas personalizadas, catálogo de ejercicios, entrenamiento guiado y estadísticas
- 🥗 **Alimentación / Dieta** — seguimiento nutricional, cálculo de IMC/TMB y registro diario
- 🏥 **Clínico** — monitoreo de signos vitales, evaluación de síntomas y citas médicas
- 🧠 **Psicología** — registro de estado de ánimo, test de estrés PSS-10 y herramientas de bienestar

Cada módulo cuenta con un **asistente de IA integrado** para consultas especializadas en tiempo real.

---

## 🛠️ Stack Tecnológico

| Categoría | Tecnología |
|---|---|
| Framework UI | React 19 |
| Build tool | Vite 8 |
| Estilos | Tailwind CSS v4 |
| Routing | React Router DOM v7 |
| HTTP client | Axios |
| Componentes UI | Radix UI (Avatar, Dialog, Dropdown, Tabs) |
| Gráficas | Recharts |
| Iconos | Lucide React |
| Fuentes | Inter + Bebas Neue (Google Fonts) |
| Linting | ESLint con plugins de React Hooks y React Refresh |

---

## 🏗️ Arquitectura del Proyecto

El proyecto sigue una arquitectura en capas inspirada en **Clean Architecture / DDD**:

```
src/
├── aplicacion/          # Hooks de aplicación (lógica de negocio)
│   ├── alimetacion/     # useIMC, useRegistroDiario, useCitasNutricion
│   ├── clinico/         # useCitasClinco, useSignosVitales, useSintomas
│   ├── ia/              # useIA — asistente compartido por módulos
│   └── psiclogia/       # useCitasPsicologia, useAnimos, useTestEstres
│
├── context/             # Contextos globales de React
│   ├── AuthContext.jsx  # Autenticación con JWT
│   └── ThemeContext.jsx # Tema oscuro / claro
│
├── infraestructura/     # Capa de acceso a datos (APIs)
│   └── api/             # Clientes Axios por módulo
│
├── modulos/             # Modelos de dominio (entidades)
│   ├── clinico/
│   ├── dieta/
│   └── psicologico/
│
├── presentacion/        # Capa de UI
│   ├── componentes/     # Componentes reutilizables (Chat, Layout, ThemeToggle…)
│   └── paginas/         # Páginas por módulo
│       ├── ejercicio/
│       ├── clinico/
│       ├── dieta/
│       └── psicologia/
│
└── lib/                 # Utilidades compartidas
```

---

## ✨ Funcionalidades

### 🔐 Autenticación
- Registro e inicio de sesión con JWT
- Flujo de onboarding inicial para nuevos usuarios
- Rutas protegidas con redirección automática
- Cuestionarios de perfil por área (clínico, psicológico, alimentación, ejercicio)

### 🏋️ Módulo de Ejercicio
- Dashboard con resumen de actividad
- Catálogo de ejercicios navegable
- Gestor de rutinas y días de entrenamiento
- Página de entrenamiento activo
- Estadísticas de progreso
- Feed social

### 🥗 Módulo de Alimentación
- Cálculo de IMC y Tasa Metabólica Basal
- Registro diario de alimentación
- Gestión de citas con nutricionista
- Cuestionario de hábitos alimenticios

### 🏥 Módulo Clínico
- Registro y seguimiento de signos vitales
- Evaluación de síntomas con historial
- Gestión de citas médicas
- Cuestionario clínico inicial

### 🧠 Módulo de Psicología
- Registro de estado de ánimo con historial
- Test de Estrés Percibido (PSS-10) con interpretación de resultados
- Herramientas de bienestar mental
- Gestión de citas psicológicas
- Cuestionario psicológico inicial

### 🤖 Asistente IA
- Chat integrado en cada módulo con contexto especializado
- Detección de situaciones de crisis
- Historial de conversación por sesión

### 🎨 UI / UX
- Tema oscuro y claro con transición suave
- Tipografía display con Bebas Neue + Inter
- Paleta de color primario verde neón sobre fondo oscuro
- Efectos glow, shimmer y animaciones CSS
- Diseño responsive

---

## 🚀 Instalación y Desarrollo

### Prerrequisitos

- Node.js ≥ 18
- npm ≥ 9

### Pasos

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd fit

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env y define VITE_API_URL con la URL de tu backend PHP

# 4. Iniciar servidor de desarrollo
npm run dev
```

La app estará disponible en `http://localhost:5173`.

### Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Build de producción en `/dist` |
| `npm run preview` | Vista previa del build de producción |
| `npm run lint` | Análisis estático con ESLint |

---

## ⚙️ Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=https://tu-backend.com/api
```

> El cliente HTTP (Axios) usa `VITE_API_URL` como `baseURL` y adjunta automáticamente el JWT en cada petición.

---

## 🔑 Autenticación

La app usa **JWT almacenado en `localStorage`**. El interceptor de Axios:
- Adjunta el token en el header `Authorization: Bearer <token>`
- Extrae el `id_usuario` del payload y lo inyecta en cada petición
- Redirige a `/login` y limpia el token ante respuestas `401`

---

## 📁 Rutas Principales

| Ruta | Descripción |
|---|---|
| `/login` | Inicio de sesión |
| `/registro` | Registro de usuario |
| `/onboarding` | Configuración inicial del perfil |
| `/dashboard` | Página principal de ejercicio |
| `/catalogo` | Catálogo de ejercicios |
| `/rutinas` | Mis rutinas |
| `/entrena` | Entrenamiento activo |
| `/estadisticas` | Progreso y estadísticas |
| `/social` | Feed social |
| `/clinico` | Módulo clínico |
| `/dieta` | Módulo de alimentación |
| `/psicologia` | Módulo de psicología |
| `/cuestionario` | Cuestionario de ejercicio |
| `/cuestionario-clinico` | Cuestionario clínico |
| `/cuestionario-psicologia` | Cuestionario psicológico |
| `/cuestionario-alimentacion` | Cuestionario de alimentación |

---

## 🤝 Contribución

1. Haz fork del repositorio
2. Crea una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
3. Realiza tus cambios y asegúrate de pasar el linter: `npm run lint`
4. Haz commit con mensajes descriptivos
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto es privado. Todos los derechos reservados.
