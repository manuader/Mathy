---
name: mathy-nivel
description: >-
  Cómo se construye un nodo o un nivel de Mathy para que se juegue igual que los
  demás: la lección (qué enseña, objetivo, llave), la guía interactiva con Lumi,
  las tarjetas de entrada y cierre, la chuleta que se llena con llaves, y el
  estilo visual de juego (color con significado, objetos con volumen, jugo en
  cada gesto, mundo por área). Usar SIEMPRE que se construya, rediseñe o revise
  un minijuego, un nodo de la espina, un nivel, una escena de `apps/mathy`, una
  guía o tutorial, una llave de la chuleta, o el arte del juego; también cuando
  un agente recibe el prompt de nodo de U3. No hace falta para cambios en
  `packages/` que no tocan lo que ve el jugador.
---

# Construir un nivel de Mathy

Mathy es un juego que enseña matemática a cualquier edad, y tiene que competir por
la atención con cualquier otro juego del teléfono. Esta skill es el estándar que
hace que los 51 nodos se jueguen como un solo juego. **El nodo 1
(`found.count.cardinality`) es la implementación de referencia**: ante la duda,
se copia su forma.

Leé también, enteros: [N](../../../docs/N-ux-ui.md) (la estética y lo prohibido),
[U4](../../../docs/U-desarrollo/U4-rediseno-juego.md) (por qué el juego se ve así)
y [U3](../../../docs/U-desarrollo/U3-prompt-de-nodo.md) (el procedimiento de agentes).

## La regla que decide todo

**El color, la luz y el movimiento no decoran: explican.** Todo lo que se agrega
para que el nivel sea más estimulante tiene que decir algo del concepto. Si un
efecto no dice nada, no entra.

Y lo que sigue prohibido aunque otros juegos lo usen (N §10): puntos, monedas,
vidas, corazones, rachas, rankings, confeti, "+20", "¡Excelente!", la palabra
"incorrecto", el rojo de error. Lo que no avanza se muestra, no se castiga.

## Qué ya existe y qué pone el nodo

El marco común (`ui/ActivityShell.tsx`) le da a **todos** los nodos, sin tocar su
actividad: el paisaje del área detrás (por el prefijo del id), la barra de vidrio
con "‹ Niveles", la chuleta y la calculadora, la tarjeta de entrada y la de
cierre con "Siguiente nivel". El nodo pone cuatro cosas:

| Qué | Dónde | Detalle |
|---|---|---|
| La lección | `apps/mathy/src/lessons/<slug>.ts` + una línea en `lessons/index.ts` | [references/leccion-y-guia.md](references/leccion-y-guia.md) |
| Los textos | `apps/mathy/src/i18n.ts` | claves, nunca literales; reglas de microcopy abajo |
| La guía en la actividad | la actividad del nodo | señales, foco, pausa de ronda: [references/integracion.md](references/integracion.md) |
| La escena con estilo de juego | `apps/mathy/src/scenes/` | volumen, color, jugo: [references/estilo-visual.md](references/estilo-visual.md) |

## Un nivel, de punta a punta

1. **Tarjeta de entrada** (la dibuja el marco): qué idea se aprende (`why`), el
   objetivo en una frase (`goal`), las llaves anteriores que sirven (`uses`), y la
   silueta de la llave que se va a ganar. Lumi pensando.
2. **Guía en la primera ronda**, sólo si el nivel no se superó antes. Lumi al lado
   de un cartel; cada paso señala objetos reales del tablero con anillos dorados
   y, si hay que arrastrar, una luz que muestra el recorrido. Los pasos de "hacelo"
   avanzan solos cuando el jugador hace el gesto; el paso que explica el resultado
   frena la ronda hasta que dice "Entendido".
3. **El juego.** El cartel muestra el objetivo y una marca por ronda. Cada gesto
   responde con jugo (§ estilo visual). La línea de abajo cuenta lo que pasó:
   menta si coincidió, ámbar si pide que miren.
4. **Tarjeta de cierre** (la dibuja el marco): "superado", la llave nueva con luz
   que sube, las llaves del concepto, qué viene y un botón grande para seguir.
5. **La llave queda en la chuleta** y los niveles siguientes la piden en `uses`.

## Cómo se diseña la guía

- **Se juega, no se lee.** 3 a 5 pasos: `look` (mirá esto, botón) → uno o dos
  pasos de hacer (avanzan por señal) → `reveal` (qué pasó y qué significa;
  `holds`). Un nivel que repite un gesto conocido lleva un solo paso `recall` que
  nombra la llave a usar.
- **Cada paso señala algo del tablero de esa ronda**, calculado de la geometría,
  no un rectángulo fijo. Si el jugador hace el gesto antes de que se lo pidan, la
  guía salta ese paso sola.
- **El `reveal` pone el nombre a lo que el jugador acaba de hacer**, en una frase:
  "Comparaste sin contar". Es el momento en que la manipulación se vuelve idea.
- **Nada corre contra el reloj antes de `play`**: timers, tapados, latencias.

## Cómo se escribe una llave

Una por nivel. Es la idea que el jugador probó con las manos, dicha de forma que
**le sirva para resolver un nivel posterior**: una estrategia o una propiedad, no
una definición escolar.

- Título de cinco palabras o menos, como idea: "Emparejar compara", "Mover no
  cambia cuántas hay". Nunca el nombre de un tema ("Cardinalidad").
- Cuerpo de una o dos frases, narrable en voz alta, con cuándo sirve.
- Un dibujo (`KeyGlyph`) que la cuente sin palabras; si ninguno sirve, se agrega
  uno a `DRAWINGS` en `ui/KeyGlyph.tsx`.
- Al diseñar los niveles siguientes (de este nodo o de otros), se busca qué llave
  anterior resuelve el nivel y se pone en `uses`: así la chuleta deja de ser un
  archivo y pasa a ser una herramienta.

## Microcopy (N §9)

Segunda persona con voseo ("arrastrá", "fijate"), frases cortas, sin
exclamaciones, sin diminutivos, sin elogios vacíos, nunca "mal" ni "incorrecto".
Pasos de la guía de 25 palabras o menos. Las claves siguen
`lesson.<nodo>.<n>.why|goal|coach.<paso>`, `key.<id>.title|body` y
`node.<nodo>.learned`; `tf()` interpola `{nombre}`. Una clave sin traducción se ve
como clave: que duela.

## Estilo visual, en una tabla

| Color o efecto | Su único trabajo |
|---|---|
| `accent` · `coral` · `violet` | equipo: a qué colección pertenece algo |
| `ok` (menta) | coincide: pareja hecha, balanza nivelada, tarjeta correcta |
| `warn` (ámbar) | mirá acá: lo que quedó sin pareja, lo inclinado |
| `gold` | lo aprendido: la llave, la guía, el botón que sigue |
| rebote al soltar | "llegó a un lugar" |
| chispas en el objeto | el evento que el nivel enseña, una vez |
| anillo ámbar que late | atención, sin decir "mal" |

Los objetos matemáticos son **vectores en Skia con volumen** (degradado, brillo,
sombra), **nunca PNG** y **nunca con cara**: la única cara es la de Lumi, y el
limón nunca es una fruta para contar. Todo color y medida sale de
`ui/theme.ts`. Detalle y recetas de código en
[references/estilo-visual.md](references/estilo-visual.md).

## Verificación (nada se da por bueno sin correr)

```bash
npm test --workspaces --if-present
npx tsc --noEmit -p apps/mathy && npx tsc --noEmit -p packages/mechanics
python3 tools/validate.py
```

Y en el navegador, con un perfil limpio (`http://[::1]:8081`, que tiene su propio
`localStorage`): tarjeta de entrada → cada paso de la guía avanza con el gesto real
→ el `reveal` frena la ronda → las rondas siguientes sin guía → tarjeta de cierre →
la llave en la chuleta → "Siguiente nivel" abre el siguiente con su tarjeta. La
receta para el panel oculto y los arrastres sintéticos está en
[references/integracion.md](references/integracion.md). Lo que no se pudo mirar se
dice como no verificado.

## Arte ilustrado

Los paisajes de área y Lumi ya existen (`apps/mathy/assets/art/`, vía el
manifiesto `src/art/manifest.ts`). Un nodo **no** necesita arte nuevo: su área ya
tiene mundo. Si hace falta una pose o un mundo nuevo, se genera con
`~/Desktop/projects/automatic-image-generation` (motor `chat-gpt`, proyectos
`mathy-lumi` y `mathy-mundos`, reglas en sus `OBJETIVO.md`) y se integra con
`tools/art/sync_art.py`. Nunca se importa un PNG directo desde un componente.

## Antes de entregar

- [ ] `lessons/<slug>.ts` con un `LevelLesson` por nivel y registrado en `LESSONS`.
- [ ] Todas las claves de texto en `i18n.ts`, revisadas contra el microcopy.
- [ ] La actividad emite las señales de sus pasos, frena la ronda en `holds`, y
      calcula el foco de cada paso desde la geometría.
- [ ] Nada corre antes de `play`; la actividad no tiene fondo propio ni botón "‹ Niveles".
- [ ] La escena usa los tokens con su significado y tiene jugo en el evento que enseña.
- [ ] Tests, dos `tsc` y el validador en verde; el recorrido completo mirado.
- [ ] El reporte dice qué se verificó mirando y qué no.
