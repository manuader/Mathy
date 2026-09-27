# Reel 02 — "El caminante"

La segunda pieza para pauta. Donde el [reel 01](../reel-01/PLAN.md) contaba la tesis con la
balanza, esta la cuenta con un **personaje**: el caminante del juego recorre sus mundos y
aprende en el camino. Mismo formato (9:16, 24,5 s, 4K 60 fps, 120 BPM) y misma identidad.

## Los personajes, tal como están en el código

No se inventó ni se rediseñó nada. Cada personaje se portó desde su función de geometría:

| Personaje | Dónde vive en el juego | Cómo se dibuja |
|---|---|---|
| **El caminante** | `TrackScene.buildWalker` (nodos 2, 3, 4, 7, 18–21) | trazos en acento, cabeza hueca, sin cara; la bandera ámbar cuando mira hacia un lado; los brazos en alto cuando no la lleva |
| **Las piedras y el agua** | `TrackScene.buildGeom` | banda `#16324a`, piedras `#3a4a5c`; caer entre dos piedras es hundirse |
| **La bandera de llegada** | `TrackScene` | trazo verde con halo sobre la piedra |
| **La manivela** | `TrackScene.buildCrank` | 12 dientes: un diente, una piedra |
| **El edificio y el ascensor** | `TrackScene.buildShaft` / `buildCar` | ventanas arriba, luz de garaje ámbar abajo, la calle verde en el cero |
| **Las frutas** | `LedgerScene.shapePath` | manzana, pera y uva, en los tres colores de clase |
| **El cajón cerrado** | `LedgerScene.shapePath("crate")` | siempre en acento: es la incógnita |

La animación es de marioneta sobre esas mismas piezas: el caminante salta de piedra en
piedra (como en el juego), con anticipación, squash & stretch al caer y piernas que se
recogen en el aire. Las proporciones no cambian.

## Guion por tiempos

| Tiempo | Acto | Imagen | Texto |
|---|---|---|---|
| 0,0 – 2,4 | **Hook** | Primerísimo plano del caminante sobre una piedra en el agua. La cámara se abre: el camino, la bandera lejos | Este es el caminante. / No sabe sumar. / **Todavía.** |
| 2,4 – 4,0 | Contar | Aparece la manivela; un dedo la gira: cada diente, un salto, una piedra. Se dan vuelta las tarjetas 1, 2, 3 | Un diente, una piedra. |
| 4,0 – 5,4 | Sumar | La ficha **2** cae en la manivela: un solo tirón de dos piedras, con la estela de arcos, y llega a la bandera | Sumar es avanzar. |
| 5,4 – 6,4 | Restar | Se da vuelta y vuelve | Restar es volver. |
| 6,4 – 9,4 | Negativos | El camino gira 90° y se vuelve el edificio: el caminante baja en el ascensor, cruza la calle y sigue hasta el garaje | **El cero no frena.** |
| 9,4 – 13,0 | Funciones | Sale a la cuadrícula y sube la rampa; cada paso deja una gota y el rastro se vuelve la gráfica | Cada paso deja un rastro. / El rastro es una gráfica. |
| 13,0 – 17,0 | Álgebra | Llueven frutas y se ordenan en filas; el caminante empuja el cajón cerrado a su fila; las filas se vuelven `3`, `2` y el cajón, `x` | La caja cerrada es la x. |
| 17,0 – 20,5 | Escala | Salta de concepto en concepto por los 21 nodos jugables | De contar frutas a funciones inversas. |
| 20,5 – 24,5 | Cierre | Clava la bandera junto a la marca y levanta los brazos. Mathy, promesa, CTA. Zoom a él: el loop empalma con el cuadro 0 | Mathy · Tocalo antes de escribirlo. · Jugá ahora |

## Por qué funciona para pauta

- **Un personaje genera empatía antes que una idea**: "no sabe sumar... todavía" es un arco
  de personaje en tres palabras, y el espectador se queda a ver si lo logra.
- **Cada acto es una victoria chica** (llega a la bandera, cruza el cero, dibuja la
  gráfica): recompensas cada 3 segundos sostienen la retención.
- **Muestra la dinámica real**: manivela, tirón, ascensor, rastro y cajón son mecánicas
  jugables hoy, con sus frases reales de `i18n.ts`.
- El mismo loop, las mismas zonas seguras y los mismos reclamos honestos que el reel 01.
