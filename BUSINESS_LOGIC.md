# BUSINESS_LOGIC.md - Patitos Café

> Generado por SaaS Factory | Fecha: 2026-03-26

## 1. Problema de Negocio
**Dolor:** La imagen del menú no es navegable, no es interactiva, y genera 30 min/día en aclaraciones por WhatsApp. Los clientes no entienden precios por talla, extras, ni sabores disponibles.
**Costo actual:** ~$8,000+/mes (15 hrs tiempo, $5,850 pedidos perdidos, $720 errores)

## 2. Solución
**Propuesta de valor:** Un menú digital donde los clientes de Patitos exploran las categorías fácilmente, eligen qué pedir y llegan al mostrador ya decididos — o envían su pedido directo por WhatsApp.

**Flujo principal (Happy Path):**
1. Escanea QR o abre link desde WhatsApp/Instagram
2. Ve grid de categorías (9 categorías con emoji + color pastel)
3. Toca una categoría → ve productos con foto, sabores, talla y precio
4. Elige producto → selecciona talla + sabor + extras → agrega al pedido
5. Pedir por WhatsApp (mensaje pre-llenado) o va al mostrador decidido

## 3. Usuario Objetivo
**Cliente:** 25-40 años, cómodo con el celular, accede desde QR en local, link en Instagram bio, o link en WhatsApp
**Admin:** Empleado no-técnico que actualiza el menú semanalmente vía panel con PIN

## 4. Arquitectura de Datos

**Input:**
- Productos (nombre, categoría, precios M/G/único, sabores, imagen)
- Categorías (nombre, emoji, color, orden)
- Extras globales (nombre, precio)
- PINs de empleados
- WhatsApp del cliente (para lealtad)

**Output:**
- Menú interactivo público (sin login)
- Mensaje WhatsApp pre-llenado al +529981398309
- Tarjeta de sellos visual (5×2 grid de patitos)
- Dashboard de productos más vistos

**Storage (Supabase tables):**
- `categories`: 9 categorías con emoji y color pastel
- `products`: ~50 productos con precios M/G/único y sabores
- `extras`: 8 extras globales ($10-$15)
- `employee_pins`: PINs individuales por empleado
- `loyalty_cards`: Tarjetas por número de WhatsApp
- `loyalty_events`: Auditoría de sellos con employee_id
- `product_views`: Analytics de vistas por producto

## 5. KPI de Éxito
**Métrica principal:** "El menú está en el QR, el empleado puede actualizarlo solo, y los clientes lo usan sin que nadie se los explique."
- +20 visitas/día en semana 2
- Al menos 5 clics a WhatsApp/día
- Top 3 productos más vistos identificados

## 6. Especificación Técnica

### Features Implementadas
```
src/features/
├── menu-public/        # Menú público con grid de categorías y productos
├── menu-admin/         # CRUD productos + disponibilidad (staff PIN)
├── whatsapp-order/     # Carrito + mensaje pre-llenado WhatsApp
├── loyalty/            # Tarjeta de sellos (staff + público)
└── analytics/          # Tracking de vistas + dashboard
```

### Stack
- **Frontend:** Next.js 16 + React 19 + TypeScript + Tailwind 3.4
- **Backend:** Supabase (DB + Storage + RLS)
- **Fuente:** Nunito (Google Fonts)
- **Estado:** Zustand (carrito WhatsApp)
- **Auth Staff:** PIN individual por empleado (cookie httpOnly)

### Rutas
- `/` — Home: grid de categorías
- `/categoria/[slug]` — Productos de categoría + agregar al pedido
- `/mi-tarjeta` — Consultar sellos (público)
- `/staff/admin` — CRUD menú (PIN)
- `/staff/disponibilidad` — Toggles del día (PIN)
- `/staff/sellos` — Gestión de sellos (PIN)
