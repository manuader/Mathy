# Sesión 2026-09-11 — las lecciones de los 21 nodos, y que cada nivel se pueda terminar

Continúa [SESSION-2026-09-10-juego-estimulante.md](SESSION-2026-09-10-juego-estimulante.md),
en la misma rama `rediseno-juego`, sin mergear a `main`. La noche anterior dejó el marco
del juego en todos los nodos, pero la lección (tarjeta de entrada, guía, llaves) sólo en
el nodo 1. Esta sesión la llevó a los 21 y jugó cada nivel hasta el cierre.

## Qué se pidió

En palabras del dueño, en este orden:

1. "Levantalo así puedo probarlo."
2. "El juego de dos caminantes está roto. No funciona. Corregí la lógica. Luego continuá
   con el desarrollo."
3. "Dar vuelta el piso está bugeado", y enseguida: "bandas sin números no funciona
   correctamente".

"Continuá con el desarrollo" se leyó como el punto 3 del handoff anterior: la lección de
los nodos 2 a 21. Los tres bugs del dueño decían que además hacía falta jugar cada nivel
hasta el cierre, no sólo escribir su guía: así se hizo en cada tanda.

## Lo que se construyó, y por qué con esa forma

**Un módulo por nodo** (`4a00703`). Cada nodo tiene su `lessons/<slug>.ts`, que exporta
`{ lesson, texts, glyphs }`. `t()` cae en `LESSON_TEXTS` si la clave no está en `i18n.ts`, y
`KeyGlyph` cae en `LESSON_GLYPHS`. La razón es de trabajo, no de arquitectura: con todo en
`i18n.ts` y `KeyGlyph.tsx`, dos agentes no podían escribir lecciones a la vez sin pisarse.

**La lección de los 21 nodos: 152 niveles, una llave por nivel.** Tarjeta de entrada con
qué se aprende y el objetivo; guía de Lumi en la primera ronda de cada gesto o pregunta
nueva, o un recordatorio (`recall`) cuando el nivel repite algo ya enseñado; la llave que
vuela al llavero. La escribieron agentes en paralelo, cada uno dueño de sus archivos, en
seis tandas. Cada agente jugó sus niveles de punta a punta; eso encontró la mayoría de los
bugs de abajo.

**Tomi sigue a la pregunta de la ronda** (`361622f`, `cf8b3b9`). En los niveles que
alternan preguntas, el "Mirá acá" de Tomi señalaba el paso de la guía de la primera,
aunque la ronda preguntara otra cosa. Ahora la actividad avisa con
`preferHint(id | null | "")`: un paso concreto, el de la guía, o nada que señalar.

**Llaves que cruzan nodos** (`767614a`). El `uses` de un nivel puede nombrar llaves de otro
nodo, y Tomi las ofrece como pista: la vuelta pide la llave del tramo, la banda pide la de
la regla.

**El teléfono.** A 390×844 la actividad quedaba debajo de la barra y el tablero del nodo 1
se salía (`0126d15`: `ActivityShell` reserva 64 px y el tablero se mide). Después:
- la barra no entraba y "Calculadora" quedaba cortada (`dea277d`);
- la tarjeta de concepto completo medía 858 px y el botón de seguir quedaba abajo del
  borde (`beff09b`, ahora 657);
- "Saltar guía" se salía del cartel (`a4923be`).

Todo medido en el navegador.

**Dos detalles del marco**: las tarjetas caen con resorte (`44076d7`), y con el nivel hecho
todas las marcas de ronda se encienden antes de la tarjeta de cierre (`d5ee5d4`).

## Los bugs, y de dónde salieron

**Los tres que reportó el dueño:**
- **Dos caminantes** (`db2b6c8`): la regla sólo nacía de un caminante, y el hueco donde va
  la ficha no se veía. Ahora nace en cualquiera de los dos, y el hueco se dibuja en dorado,
  debajo de la regla.
- **Dar vuelta el piso** (`bc3cd44`): girarlo pedía mantener el dedo y un toque no hacía
  nada. Ahora un toque lo gira.
- **Bandas sin números** (`bc3cd44`): la marca correcta tenía vecinas sin número a 23 px, y
  el dedo tocaba la de al lado. Quedan sólo la correcta y su espejo, con un blanco más ancho.

**Los que encontraron los agentes jugando, que dejaban un nivel imposible:**
- **La balanza** (`48570cc`): ninguna pesa arrastrada caía en un plato. El cartel de Lumi
  baja el lienzo sin cambiarle el tamaño, y en web `onLayout` no avisa (trampa 36).
- **Fichas que no existían en la primera ronda**, muertas en la segunda: la banda niveles
  2 y 5, la vuelta niveles 4 y 5 (`e400498`), la rampa niveles 4 a 6 (`91a2ea8`), el
  llavero nivel 4 (`8514700`).
- **La llave que encoge, nivel 3** (`817f1fa`): un toque en carrera con un arrastre apagado
  no contestaba nunca.
- **Dos habitaciones** (`3ef3669`): la primera tira de cada ronda se evaluaba contra el
  marco de la ronda anterior (trampa 34), y la pared resolvía rondas sin contestar. Y en
  el nivel 4 las fichas del libro nacían apagadas en la ronda de la pared y no se movían
  nunca en la de anotar (`e889576`).
- **La máquina en reversa** (`8514700`): el diagrama del nivel 4 no respondía, el toque del
  5 sólo contaba en el medio de la curva, la máquina fantasma del 7 no tenía gesto y la
  recta del 8 estaba clavada.
- **Composición, nivel 4**: se ganaba eligiendo siempre el carril de arriba.

Y en casi todos los nodos, **rechazos mudos**: soltar una ficha en el aire, o tocar algo sin
efecto, no decía nada. Para quien está aprendiendo eso se lee como que el juego no anda.
Ahora cada rechazo dice qué mirar.

## Los diagnósticos, y lo que costaron

1. **Metro se cayó tres veces**, siempre por el mismo bucle: `Aborted()` de CanvasKit en
   pestañas que habían vivido muchas recargas en caliente, con `TilesScene` o
   `BalanceScene` en la pila (trampa 32). Con seis agentes guardando archivos a la vez,
   cada guardado recarga todas las pestañas. Nunca pasó en una pestaña nueva. Se arregla
   cerrando las pestañas y recién después reiniciando.
2. **La trampa 33 se precisó.** Se había escrito como "un gesto nacido con
   `.enabled(false)` no despierta nunca en web". Tres agentes la probaron: un arrastre
   solo nacido apagado quedó muerto (las fichas de «Dos habitaciones»); gestos en
   `Gesture.Race` nacidos apagados sí despertaron; y un `Gesture.Tap` en carrera con un
   `Pan` apagado no contestó nunca. La entrada dice ahora eso, y el patrón que no falla.
3. **Un agente se colgó diez minutos** probando con `computer` con el panel oculto, sin
   dejar nada en disco (trampa 38). Se relanzó partido en dos, con sólo `javascript_tool`.
4. **La receta del toque sintético estaba mal.** Decía "esperá con la herramienta entre
   bajar y subir". Así se pasan los 500 ms que acepta `Gesture.Tap`, y parece un bug que
   no existe. Ahora se baja y se sube en la misma llamada, esperando con `MessageChannel`.
5. **`tsc` tardó más de diez minutos** con cinco agentes corriéndolo a la vez.

## Números

| | al empezar | al cerrar |
|---|---:|---:|
| nodos con lección | 1 de 21 | 21 de 21 |
| niveles con llave | 6 | 152 |
| tests | 762 | 763 |
| trampas en HANDOFF | 35 | 38 |

## Verificado, y no

- **Jugados de punta a punta** por los agentes: todos los niveles de los 21 nodos, en
  escritorio. En el teléfono, la mayoría: los nodos de la balanza enteros, y muestras del
  resto.
- **Medido** por mí en el navegador, a 390×844: la barra, la tarjeta de concepto completo,
  "Saltar guía".
- **Todo medido y no mirado a ojo**: el panel del navegador estuvo oculto la sesión entera.

**La última pasada, en el teléfono** (`390×844`, toques táctiles, pestañas nuevas), para lo
que quedó sin probar cuando Metro se cayó:
- las fichas de «Dos habitaciones» nivel 4 no se movían con nada: jugado entero después
  del arreglo;
- «Máquinas que no vuelven» (inversa nivel 8) y «Cadenas de tres» (composición nivel 7) se
  salían de la pantalla; ahora sobran de 10 a 41 px;
- en «El libro de frutas» nivel 7, el 23 % de los sistemas sin solución dibujaba las
  paralelas a menos de 2 px; el generador ahora garantiza una separación, con test;
- la rampa, niveles 5 a 8, entra: el 8 con 8 px de sobra;
- el `Aborted()` no apareció en una pestaña nueva jugando los seis niveles de las
  habitaciones.

## Lo que queda para el dueño

- **Nodo 18, niveles 5 a 8**: la banda de la máquina mide 128 px y deja ±8 px de precisión
  al soltar. Se puede ensanchar la banda o aceptar más tolerancia.
- **Nodo 5, niveles 7 y 8**: el arrastre queda habilitado todo el nivel. Un toque sobre una
  marca que se mueva entre 15 y 26 px podría leerse como arrastre (trampa 11). Con toques
  limpios no pasó.
