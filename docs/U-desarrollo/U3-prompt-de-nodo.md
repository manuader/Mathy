# U3 — Cómo seguir construyendo la espina con agentes

Para quien continúa sin supervisión. Es el procedimiento que llevó la espina de 5 a 21
nodos jugables en una sesión, con lo que costó aprenderlo. El estado del proyecto está en
[HANDOFF](../HANDOFF.md); el plan y la tabla de nodos pendientes, en [U2](U2-plan-espina.md).

## El bucle

1. **Dos agentes a la vez, no más.** El panel del navegador es uno solo y con tres los
   agentes se renavegan la pestaña entre sí: lo primero que se pierde es la verificación
   (HANDOFF, trampa 20). Uno de los dos usa `localhost` y el otro `[::1]`, para no pisarse
   el `localStorage`.
2. **Elegir qué nodo sigue.** Primero los que tienen todas sus mecánicas con escena (tabla
   en U2). Cuando una mecánica no tiene escena, la estrena **el nodo que la tiene como
   mecánica principal** y la escribe configurable para todos los que la esperan:
   `construct` con el nodo 38, `sorter` con el 53 o el 45, `fill_accumulate` con el 28.
3. **Lanzar con la plantilla de abajo**, completando "qué reusar" con la tabla de escenas
   de HANDOFF §3 y "el corazón del nodo" con el invariante que el nodo tiene que hacer ver.
   Son tareas complejas: modelo Opus.
4. **Al aterrizar cada agente**, en este orden:
   - leer el reporte entero, con la lista de abajo;
   - `npm test --workspaces --if-present`, los dos `tsc` y `python3 tools/validate.py`;
   - mirar el diff de los tres archivos compartidos, y que cada `export *` apunte a un
     módulo que entra en el mismo commit (el comando está en HANDOFF §6);
   - commitear con **rutas explícitas**, nunca `git add -A` con otro agente en vuelo;
   - si el reporte trae una trampa nueva, o desmiente una vieja, **corregir HANDOFF §7 en
     ese momento**. Cuatro entradas estuvieron mal escritas y alguien las habría creído.
5. **Lanzar el siguiente** para mantener dos en vuelo.
6. **Al cerrar la sesión**, el protocolo de HANDOFF §0.

## Qué mirar en un reporte antes de commitear

| Pregunta | Por qué |
|---|---|
| ¿Volvió a jugar los nodos cuyas escenas tocó? | es lo único que evita romperlos; si no pudo, tiene que decir por qué |
| ¿Emite solo ids que el catálogo de L apunta a su nodo? | un id inventado ensucia la remediación para siempre |
| ¿Anotó dónde se apartó del documento del minijuego? | casi siempre es la regla capa-o-parámetros, y tiene que poder auditarse |
| ¿Lo no verificado está dicho como no verificado? | con el panel oculto se verifica por estado; está bien, si se dice |
| Si escribió una escena nueva, ¿la justificó? | la duplicación de escenas es la deuda más cara del proyecto |
| ¿Tocó `docs/`? | no debería: la prosa se reconcilia en un solo lugar |

## Plantilla: construir un nodo

```text
Construí el minijuego del nodo {N} de la espina, `{ID}`, en
`/Users/manuader/Desktop/projects/Mathy`. Todo en español: comentarios, mensajes, nombres
de tests.

## Leé primero, completo
- `docs/HANDOFF.md` — reglas (§2), escenas (§3) y las trampas ya pagadas (§7). Las que
  más tiempo ahorran: la 3 (panel oculto), la 4 (cómo probar gestos y qué no se puede), la
  9 y la 21.
- `docs/F-minijuegos/{ID}.md` y `docs/D-curriculum/D1-espina/{NN}-{ID}.md`.
- Los nodos ya construidos que comparten mecánica con este, para copiarles la forma.

## Qué reusar
{Por cada mecánica del nodo: la escena que la dibuja y quién la escribió, o "no tiene
escena: estrenala configurable para los nodos {lista}, y documentá sus props".} Leé las
escenas enteras, incluidas sus cabeceras. Props aditivas sí; romper a los nodos que las
comparten no, y hay que comprobarlo jugándolos después. Escribir una escena nueva para una
mecánica que ya tiene es el último recurso y se justifica en el reporte.

## El corazón del nodo
{Un párrafo: el invariante que el nodo tiene que hacer ver sin enunciarlo, y de qué
problema nace el símbolo que introduce.}

## Qué entregar
- `packages/mechanics/src/{SLUG}.ts` — niveles como datos y generador determinista
  (`makeRandom`), `Level extends LevelBase`, y
  `registerNode({ id: NODE, n: {N}, prereqs: [...], levels: {PREFIJO}_LEVELS })` con los
  prerequisitos **de `docs/C-knowledge-graph/spine.yaml`**. Prefijá todos tus símbolos:
  `index.ts` reúne todos los nodos con `export *`.
- Tests en `packages/mechanics/test/{SLUG}.test.ts`, incluido el de la regla
  capa-o-parámetros.
- `apps/mathy/src/activities/{JUEGO}.tsx`, envuelta en `ActivityShell` y midiendo con
  `useActivityViewport()`.
- Tres líneas en los compartidos (`packages/mechanics/src/index.ts`, `ACTIVITIES` en
  `apps/mathy/src/activities/index.tsx`, `apps/mathy/src/i18n.ts`). Antes de editar
  `index.ts`, mirá que los módulos que ya referencia existan en disco. Si una clave de
  texto ya existe y dice lo mismo, reusala.
- Si falta un glifo, horneálo (trampa 24) y comprobá que el diff sea puramente aditivo.

## Eventos
`sawLayer` al entrar; un `attempt` por cada verbo de `level.evidence` en cada movimiento,
con `latency`, y `misconception` **solo** si el id está en
`docs/L-modelo-errores/misconceptions.yaml` apuntando a este nodo; `levelDone` al cerrar.
Si la prosa nombra un error que el catálogo no apunta acá, no lo emitas y reportalo.

## Verificación
Servidor en `http://{ORIGEN}:8081`. Sembrá los prerequisitos con eventos `levelDone` bajo
`mathy.events.v1`. Recorré todos los niveles y mirá la consola. Volvé a jugar los nodos
cuyas escenas tocaste. Lo que no puedas verificar mirando, decilo.
Al terminar, limpios: `npx tsc --noEmit -p apps/mathy`, `npx tsc --noEmit -p
packages/mechanics` y `npm test --workspaces --if-present` ({TESTS} tests hoy).

## Coordinación
Hay otro agente en paralelo en el nodo {OTRO}. Ediciones chicas en los compartidos,
releyendo justo antes. No toques `docs/`. No hagas commit ni push.

Reportá: qué niveles quedaron y por qué, cómo se ve el invariante, qué props agregaste y si
los nodos que comparten esas escenas siguen andando, qué verificaste nivel por nivel y qué
no, y qué quedó afuera del diseño y por qué.
```

## Plantilla: ascender un nodo del grafo a la espina (diseño, sin código)

```text
Sos diseñador pedagógico del proyecto Mathy. Diseño, no código: no toques `packages/` ni
`apps/`. Ascendé a la espina estos nodos, con los números reservados:
| n | id | prereqs |

## Leé primero
`docs/README.md`, `docs/C-knowledge-graph/C0-esquema.md`,
`docs/C-knowledge-graph/schema/node.schema.yaml`, `docs/D-curriculum/D1-espina/_plantilla.md`,
`docs/F-minijuegos/F0-principios.md`, el nodo de calibración (D1 13 y su minijuego), los
vecinos de la espina más cercanos, `docs/E-mecanicas/E0-catalogo.md` (las 13 mecánicas son
las que hay: no inventes una), `docs/G-analogias/G0-reglas.md`,
`docs/H-progresion-abstraccion.md`, `docs/Q-edad-universal.md`,
`docs/R-cheatsheet/R0-cheatsheet.md`, y `docs/S-desafios/S0-desafios.md` si hay desafíos.

## Por cada nodo, entregá
1. El D1 con los 14 pasos. 2. El minijuego con los 10 campos de F0. 3. La entrada del
grafo pasada de forma de flujo a forma de bloque, con `spine: true`, `probes` de los seis
verbos, `doc`, `cheatsheet` y el resto de los campos de un nodo de espina. 4. La línea en
`spine.yaml`. 5. La entrada en `minigames.yaml`. 6. Las entradas de
`cheatsheet_entries.yaml`. 7. Las claves en `docs/locales/es/`: ningún YAML de contenido
lleva texto visible. 8. Escenas en `scenes.yaml`, solo con primitivas confirmadas en
`docs/I-manim/I0-mapping.md`. 9. Desafíos, si el nodo los pide. 10. Misconceptions nuevas,
si hay errores que el catálogo no tiene, con su patrón y su mecánica.

## La regla
Capas en orden; la analogía preserva la estructura y se retira cuando deja de aportar;
todo símbolo nace de un problema que el jugador ya tuvo; cada nivel cambia de capa o
endurece parámetros, nunca las dos cosas.

## Verificación
`python3 tools/validate.py` en cero errores.

## Coordinación
Un agente por archivo de área del grafo. No toques `docs/README.md`, `C0-esquema.md` ni
`D0-mapa.md`: los conteos de la espina se reconcilian una sola vez, al final. En los YAML
compartidos, edición mínima releyendo justo antes. No commitees.

Reportá: la mecánica de cada nodo y por qué, la analogía y en qué capa se retira, de qué
problema nace cada símbolo, cuántos niveles, y las decisiones dudosas.
```

**Cuando aterrizan los agentes de diseño**, la reconciliación es de quien orquesta: el
número de conceptos de la espina aparece en `docs/README.md`, `docs/D-curriculum/D0-mapa.md`,
`docs/I-manim/I0-mapping.md` (§3 y §9), `docs/R-cheatsheet/R0-cheatsheet.md`, U2 y el
banner de HANDOFF. Recalcular desde los YAML, no restar a mano.

## Elegir qué nodos ascender

Ningún nodo de fuera de la espina es prerequisito de uno de adentro —la espina se escribió
cerrada sobre sí misma—, así que la medida es cuántos nodos del grafo dependen de cada
candidato, con el nivel como desempate (HANDOFF, decisión 10). Al parsear el grafo, cuidado
con la trampa 25: los nodos que no son de espina están en forma de flujo, una línea
`- {id: …}`.

De los diez de la primera tanda, siete están diseñados (45–47, 51–54). Quedan reservados sin
diseñar el 48 (`arith.pow.repeated_scaling`), el 49 (`arith.div.remainder`) y el 50
(`arith.frac.equivalent`); los tres son de `graph/arith.yaml`, así que los diseña un solo
agente.
