# Demo Supabase — Gestor de Tareas

Demo simple de un CRUD (Crear, Leer, Actualizar, Eliminar) conectado a Supabase,
en HTML/CSS/JS vanilla, sin frameworks ni backend propio.

## 1. Crear el proyecto en Supabase

1. Entrá a https://supabase.com/dashboard y creá un proyecto nuevo (gratis).
2. Esperá a que termine de inicializarse (tarda un par de minutos).

## 2. Crear la tabla "tareas"

En el panel de tu proyecto, abrí **SQL Editor** y corré esto:

```sql
create table tareas (
  id bigint generated always as identity primary key,
  titulo text not null,
  descripcion text,
  completada boolean default false,
  created_at timestamp with time zone default now()
);

-- habilita seguridad a nivel de fila (obligatorio en Supabase)
alter table tareas enable row level security;

-- para esta demo dejamos que cualquiera lea/escriba sin login
-- (en un proyecto real esto se reemplaza por policies mas estrictas)
create policy "permitir todo en demo" on tareas
  for all
  using (true)
  with check (true);
```

## 3. Conectar las credenciales

En **Project Settings > API** copiá:
- **Project URL**
- **anon public** key (NUNCA la `service_role`, esa es secreta)

Y pegalas en [js/supabaseClient.js](js/supabaseClient.js):

```js
const SUPABASE_URL = "https://xxxx.supabase.co";
const SUPABASE_ANON_KEY = "ey......";
```

## 4. Abrir la demo

Abrí `index.html` en el navegador (o usá la extensión "Live Server" de VS Code)
y ya deberías poder agregar, completar y borrar tareas.

## Estructura de archivos

```
demoSupaBase/
├── index.html           -> estructura de la pagina
├── style.css             -> estilos
├── js/
│   ├── supabaseClient.js -> crea el cliente de supabase (URL + anon key)
│   ├── datos.js          -> funciones que hablan con la base de datos (CRUD)
│   └── gestion.js        -> maneja el DOM: formulario, lista, botones
```

El orden de los `<script>` en `index.html` importa: primero el SDK de Supabase,
después `supabaseClient.js` (crea el cliente), después `datos.js` (lo usa) y
por último `gestion.js` (usa las funciones de `datos.js`).
