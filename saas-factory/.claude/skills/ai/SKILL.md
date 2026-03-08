---
name: ai
description: "Implementar capacidades de IA usando AI Templates. Templates copy-paste para Vercel AI SDK v5 + OpenRouter. Usar cuando el usuario quiere agregar chat, streaming, vision, tools, RAG, web search, o cualquier feature de IA a su app."
argument-hint: "[template-name: setup-base|chat|action-stream|web-search|historial|vision|tools|rag|single-call|structured-outputs|generative-ui]"
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
---

# Skill: AI Templates

> Implementar: $ARGUMENTS

Stack: **Vercel AI SDK v5 + OpenRouter (300+ modelos) + Supabase**

---

## Templates Disponibles

### Secuencia de Agentes (chat path)

Construir en orden. Cada template asume que el anterior ya esta implementado.

| # | Template | Descripcion |
|---|----------|-------------|
| 00 | **setup-base** | Configuracion inicial: OpenRouter provider, variables de entorno, dependencias |
| 01 | **chat** | Chat con streaming completo. UI de mensajes + input + respuesta en tiempo real |
| 02 | **web-search** | Agregar busqueda web al agente. Grounding con resultados de internet |
| 03 | **historial** | Persistir conversaciones en Supabase. Historial por usuario |
| 04 | **vision** | Analisis de imagenes. Upload + descripcion/analisis con modelos vision |
| 05 | **tools** | Function calling. El agente puede ejecutar funciones definidas por ti |
| 06 | **rag** | Retrieval Augmented Generation. Embeddings + busqueda semantica en Supabase |

### Secuencia Alternativa (action path)

Usa `action-stream` en vez de `chat` cuando necesitas server actions en vez de API routes.

| # | Template | Descripcion |
|---|----------|-------------|
| 00 | **setup-base** | Mismo setup base |
| 01-ALT | **action-stream** | Streaming via server actions (useAction). Sin API route |
| 02+ | Los demas son iguales | web-search, historial, vision, tools, rag |

### Standalone (independientes)

No requieren la secuencia. Se pueden usar solos.

| Template | Descripcion |
|----------|-------------|
| **single-call** | Una sola llamada al modelo sin streaming. Para tareas simples (clasificar, resumir, extraer) |
| **structured-outputs** | Respuestas con schema Zod. JSON tipado garantizado del modelo |
| **generative-ui** | El modelo genera componentes React en tiempo real. UI dinamica |

---

## Dos Caminos

```
Chat Path:          00 -> 01 -> 02 -> 03 -> 04 -> 05 -> 06
Action Path:        00 -> 01-ALT -> 02 -> 03 -> 04 -> 06
```

**Chat path**: Cuando necesitas una UI de chat con API route (`/api/chat`).
**Action path**: Cuando prefieres server actions (`useAction`) sin exponer un endpoint.

---

## Mapa de Argumentos a Archivos

| Argumento | Archivo |
|-----------|---------|
| `setup-base` o `setup` | `.claude/ai_templates/agents/00-setup-base.md` |
| `chat` | `.claude/ai_templates/agents/01-chat-streaming.md` |
| `action-stream` | `.claude/ai_templates/agents/01-alt-action-stream.md` |
| `web-search` | `.claude/ai_templates/agents/02-web-search.md` |
| `historial` | `.claude/ai_templates/agents/03-historial-supabase.md` |
| `vision` | `.claude/ai_templates/agents/04-vision-analysis.md` |
| `tools` | `.claude/ai_templates/agents/05-tools-funciones.md` |
| `rag` | `.claude/ai_templates/agents/06-rag-basico.md` |
| `single-call` | `.claude/ai_templates/single-call.md` |
| `structured-outputs` | `.claude/ai_templates/structured-outputs.md` |
| `generative-ui` | `.claude/ai_templates/generative-ui.md` |

---

## Como Usar

### Si se proporciono un argumento (`$ARGUMENTS`)

1. Mapear el argumento a la ruta del template usando la tabla de arriba
2. Leer el archivo `.md` del template
3. Seguir las instrucciones del template para implementar en el proyecto
4. El template contiene codigo copy-paste listo, adaptarlo al proyecto actual

### Si NO se proporciono argumento

Mostrar la lista de templates disponibles (la tabla de arriba) y preguntar al usuario cual quiere implementar. Sugerir empezar por `setup-base` si no tiene nada configurado todavia.

---

## Reglas

- SIEMPRE empezar por `setup-base` (00) si el proyecto no tiene OpenRouter configurado
- SIEMPRE leer el template completo antes de implementar
- NUNCA hardcodear API keys en el codigo (usar variables de entorno)
- NUNCA saltar templates en la secuencia (cada uno depende del anterior)
- Si el usuario pide algo que requiere multiples templates, implementar uno a la vez en orden
