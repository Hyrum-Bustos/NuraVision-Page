# Flujo de trabajo Git

Crea una rama nueva cuando el trabajo lo amerite (feature, fix, docs, refactor, etc.). Usa un prefijo descriptivo, por ejemplo: `feature/nombre`, `fix/nombre`, `docs/nombre`.

Haz commits atómicos: cada commit debe representar un cambio lógico y completo (no mezclar features distintas ni dejar código a medio terminar). Mensajes de commit claros y en modo imperativo (ej: "agrega validación de formulario").

No hagas merge ni push directo a `main`/`master` sin confirmación explícita.

# Reporte al finalizar una tarea

Al terminar cualquier tarea, entrega un resumen breve y claro con esta estructura:

**Qué hice:** [resumen de la acción realizada]
**Qué cambió:** [archivos/funciones/módulos afectados]
**Errores o cosas a tener en cuenta:** [warnings, deuda técnica, decisiones que tomé sin confirmar contigo, riesgos]
**Siguiente paso:** [qué sigue o qué necesitas revisar/decidir]

Mantén el reporte corto y directo — evita explicaciones largas o detalles innecesarios que puedan generar confusión.
