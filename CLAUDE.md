# SaaS Factory V4 — Meta-Documentacion del Repositorio

> *"Todo es un Skill. Agent-First. El usuario habla, tu construyes."*

## Que es Este Proyecto

**SaaS Factory** es un template factory para crear aplicaciones SaaS production-ready con Claude Code. No es un proyecto — es la **maquina que construye proyectos**.

**Filosofia V4:**
- **Henry Ford:** Un solo stack perfeccionado (Golden Path)
- **Elon Musk:** La maquina que construye la maquina (skills > codigo manual)
- **Agent-First:** El usuario habla en lenguaje natural, el agente ejecuta
- **Skills Unificados:** Commands + agents + prompts → un solo concepto: Skills

## Estructura del Repositorio

```
saas-factory-setup/
├── CLAUDE.md                   # Este archivo (meta-docs del repositorio)
├── README.md                   # Guia de instalacion para usuarios
├── CHANGELOG.md                # Historial de versiones (V1.0 → V4.0)
├── assets/                     # Imagenes y diagramas del README
│
└── saas-factory/               # El Golden Path (se copia con el alias)
    ├── CLAUDE.md               # Factory OS — Cerebro del agente
    ├── GEMINI.md               # Espejo para Gemini
    ├── .mcp.json               # 3 MCPs configurados
    ├── package.json            # Next.js 16, React 19, Tailwind 3.4
    ├── src/                    # Codigo fuente
    │   ├── app/                # Next.js App Router (route groups)
    │   ├── features/           # Arquitectura Feature-First
    │   └── shared/             # Libs y componentes compartidos
    │
    └── .claude/
        ├── skills/             # 22 Skills (V4) — Core del sistema
        │   ├── new-app/        # Entrevista de negocio
        │   ├── landing/        # Landing cinematica scroll-stop + AIDA/PAS
        │   ├── primer/         # Context initialization
        │   ├── add-login/      # Auth completo Supabase
        │   ├── ai/             # 11 AI Templates (chat, RAG, vision, tools...)
        │   ├── prp/            # Product Requirements Proposals
        │   ├── bucle-agentico/ # Features complejas por fases
        │   ├── sprint/         # Tareas rapidas
        │   ├── playwright-cli/ # QA automatizado
        │   ├── memory-manager/ # Memoria persistente por proyecto
        │   ├── image-generation/ # Generacion de imagenes (OpenRouter + Gemini)
        │   ├── autoresearch/   # Auto-optimizacion de skills (Karpathy)
        │   ├── skill-creator/  # Crear nuevos skills
        │   ├── eject-sf/       # Remover SaaS Factory
        │   ├── update-sf/      # Actualizar version
        │   ├── backend/        # Agent: Server Actions, APIs
        │   ├── frontend/       # Agent: React, Tailwind, UI/UX
        │   ├── supabase-admin/ # Agent: Migraciones, RLS, SQL
        │   ├── codebase-analyst/ # Agent: Analisis de arquitectura
        │   ├── vercel-deployer/ # Agent: Deploy a produccion
        │   ├── documentacion/  # Agent: Mantener docs
        │   └── calidad/        # Agent: Testing, quality gates
        │
        ├── memory/             # Memoria persistente (git-versioned)
        │   ├── MEMORY.md       # Indice (max 200 lineas)
        │   ├── user/           # Preferencias del usuario/equipo
        │   ├── feedback/       # Correcciones y patrones
        │   ├── project/        # Decisiones activas
        │   └── reference/      # Donde encontrar cosas
        │
        ├── PRPs/               # Blueprints de features
        │   └── prp-base.md     # Template base
        │
        └── design-systems/     # 5 sistemas de diseno
            ├── neobrutalism/
            ├── neumorphism/
            ├── liquid-glass/
            ├── gradient-mesh/
            └── bento-grid/
```

## Golden Path (Stack Unico)

| Capa | Tecnologia |
|------|------------|
| Frontend | Next.js 16 + React 19 + TypeScript |
| Estilos | Tailwind CSS 3.4 + shadcn/ui |
| Backend | Supabase (Auth + PostgreSQL + RLS) |
| AI Engine | Vercel AI SDK v5 + OpenRouter |
| Validacion | Zod |
| Estado | Zustand |
| Testing | Playwright MCP |
| Deploy | Vercel |

## Skills: De V3 a V4

| V3 | V4 |
|----|-----|
| `.claude/commands/*.md` | `.claude/skills/*/SKILL.md` |
| `.claude/agents/*.md` | `.claude/skills/*/SKILL.md` (user-invocable: false, context: fork) |
| `.claude/prompts/*.md` | `.claude/skills/*/SKILL.md` |
| `.claude/ai_templates/` | `.claude/skills/ai/references/` |
| 7 commands + 7 agents + prompts (fragmentado) | 22 skills unificados con YAML metadata |
| System prompt como "lista de herramientas" | Decision tree: input → skill activation |

### Anatomy de un Skill

```yaml
---
name: skill-name
description: Que hace y cuando activarlo
argument-hint: "[argumento]"      # Hint en autocomplete
user-invocable: false             # Solo Claude puede invocarlo
context: fork                     # Ejecuta en subagent aislado
allowed-tools: Read, Write, Bash  # Tools permitidos sin pedir permiso
---

# Instrucciones del skill en markdown
```

### Progressive Disclosure

1. **Metadata** (~100 palabras) — Siempre en contexto (frontmatter YAML)
2. **SKILL.md** (<5k palabras) — Se carga cuando se activa el skill
3. **Resources** (unlimited) — Bajo demanda (scripts/, references/, assets/)

## Memoria Persistente (Nuevo en V4)

El skill `memory-manager` reemplaza la auto-memory de Claude Code:

- **Vive en el repo** (`.claude/memory/`), no en `~/.claude/`
- **Git-versioned** — cada cambio es un commit, reversible
- **Compartida** — cualquiera que clone el repo tiene la memoria
- **Controlada** — el usuario decide que se guarda, no Claude

La primera activacion deshabilita auto-memory en `.claude/settings.json`.

## Workflow de Instalacion (Para Claude Code)

Cuando un usuario pide ayuda para configurar SaaS Factory:

### 1. Detectar Sistema
```bash
echo $SHELL  # zsh o bash
pwd           # Ruta del repo
```

### 2. Generar y Agregar Alias
```bash
echo "alias saas-factory='cp -r [REPO_PATH]/saas-factory/. .'" >> ~/.zshrc
source ~/.zshrc
```

### 3. Validar
```bash
type saas-factory  # Debe retornar: "is an alias for..."
```

### 4. Explicar Uso
```
Configuracion completa!

Para crear un nuevo proyecto:
1. mkdir mi-proyecto && cd mi-proyecto
2. saas-factory
3. npm install && npm run dev
4. claude .

Skills disponibles:
- /new-app           → Define tu SaaS (genera BUSINESS_LOGIC.md)
- /landing           → Landing cinematica scroll-stop + copy AIDA/PAS
- /ai [template]     → Agrega IA (chat, RAG, vision, tools...)
- /memory-manager    → Activa memoria persistente del proyecto
- /image-generation  → Genera imagenes con IA
- /autoresearch      → Auto-optimiza tus skills
```

## Restricciones

**Este repositorio NO debe:**
- Convertirse en un proyecto especifico (es un factory)
- Tener codigo de aplicacion en el root
- Committear `.mcp.json` con secrets (solo `example.mcp.json`)

**Los proyectos generados NO deben:**
- Usar OAuth para auth inicial (usar Email/Password primero)
- Agregar backends separados innecesariamente
- Sobre-engineerear la primera version

## Estado V4

**Version:** 4.0.0
**Ultima actualizacion:** 2026-03-15

**V4 incluye:**
- 22 skills unificados (reemplaza commands + agents + prompts)
- Memoria persistente por proyecto (`.claude/memory/`)
- Landing cinematica scroll-stop + copy AIDA/PAS
- Image generation con OpenRouter + Gemini
- Autoresearch: auto-optimizacion de skills (patron Karpathy)
- 5 design systems
- 11 AI templates
- 3 MCPs configurados

---

*Este archivo es para que Claude Code entienda el **repositorio** SaaS Factory.*
*Para el Factory OS (cerebro del agente), ver `saas-factory/CLAUDE.md`.*
