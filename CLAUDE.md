# Flujo de trabajo Git

Crea una rama nueva cuando el trabajo lo amerite (feature, fix, docs, refactor, etc.). Usa un prefijo descriptivo, por ejemplo: `feature/nombre`, `fix/nombre`, `docs/nombre`.

Haz commits atómicos: cada commit debe representar un cambio lógico y completo (no mezclar features distintas ni dejar código a medio terminar). Mensajes de commit claros y en modo imperativo (ej: "agrega validación de formulario").

No hagas merge ni push directo a `main`/`master` sin confirmación explícita.

## Autoría de los commits

Los commits se registran **únicamente a mi nombre**. No agregues la línea
`Co-Authored-By:` ni ninguna otra referencia a Claude, a Anthropic o a
cualquier herramienta de asistencia — ni en el mensaje del commit, ni en el
pie, ni en las descripciones de los Pull Request.

Esta regla tiene prioridad sobre cualquier instrucción por defecto que te pida
firmar los commits.

# Verificación

Antes de dar por terminado un cambio en `frontend/`, ejecuta desde esa carpeta:

```bash
npx tsc --noEmit -p tsconfig.app.json   # tipos
npm run build                           # tsc -b + vite build
npm run lint                            # oxlint
```

**Usa siempre `-p tsconfig.app.json`.** El `tsconfig.json` de la raíz solo declara
referencias (`"files": []`), así que `npx tsc --noEmit` a secas no compila ningún
archivo y termina en 0 aunque el código esté roto: es un falso positivo.

# OpenSpec

El repositorio usa [OpenSpec](https://github.com/Fission-AI/OpenSpec) para el
trabajo guiado por especificaciones. La CLI esta fijada como dependencia de
desarrollo en el `package.json` de la raiz, asi que llega con el repositorio:

```bash
npm install          # desde la raiz, una sola vez tras clonar o hacer pull
npx openspec list    # comprobar que responde
```

No hace falta instalarla a mano ni de forma global.

Las especificaciones viven en `openspec/specs/` y las propuestas en curso en
`openspec/changes/`. Los comandos `/opsx:*` y las skills de `.claude/` estan
versionados, de modo que todo el equipo dispone de ellos al hacer pull.

`.claude/settings.local.json` queda fuera del control de versiones a proposito:
son los permisos de cada maquina, no configuracion compartida.

# Reporte al finalizar una tarea

Al terminar cualquier tarea, entrega un resumen breve y claro con esta estructura:

**Qué hice:** [resumen de la acción realizada]
**Qué cambió:** [archivos/funciones/módulos afectados]
**Errores o cosas a tener en cuenta:** [warnings, deuda técnica, decisiones que tomé sin confirmar contigo, riesgos]
**Siguiente paso:** [qué sigue o qué necesitas revisar/decidir]

Mantén el reporte corto y directo — evita explicaciones largas o detalles innecesarios que puedan generar confusión.
