# Sesión 2026-09-10 (noche) — que el juego sea muy estimulante

Continúa [SESSION-2026-09-10-rediseno-juego.md](SESSION-2026-09-10-rediseno-juego.md),
en la misma rama `rediseno-juego`. La tarde construyó la capa de juego y el arte; la
noche la llevó a todas las escenas, sumó un segundo compañero, sonido y un fondo que se
mueve.

## Qué se pidió

En palabras del dueño, en este orden:

1. "Commiteá todo, en Mathy y en el generador. Implementá los cambios de estética a los
   niveles existentes".
2. Con la imagen de un tomate con una lamparita: "agregá a este personaje al juego para
   que te dé pistas cuando no sabés qué hacer … que sea compañero del otro", y "assets en
   movimiento para el fondo, donde las cosas en movimiento estén en la periferia y no en el
   centro de la pantalla donde estamos explicando todo".
3. "Ejecutá el juego así puedo probarlo", y enseguida: "al darle a jugar el primer nivel se
   traba por completo el juego".
4. "Mejorá aún más la UI y la jugabilidad. Tiene que ser muy estimulante."
5. "Continuá con la generación."

## Lo que se construyó, y por qué con esa forma

**Una sola ficha.** Las trece actividades tenían su propia ficha plana con borde fino, que
sobre el paisaje se leía como un agujero. Ahora todas esparcen `chipFace` de `ui/Kit.tsx`
(canto oscuro abajo, luz arriba) y las que dibujan fichas en el lienzo usan `ChipBodies`,
la misma cara en Skia con un solo `SkPath` por grupo.

**Las diez escenas viejas, al estándar.** Volumen (degradado, brillo, sombra), color con
trabajo, jugo y sonido en el evento que cada nodo enseña. Lo hicieron agentes en paralelo,
cada uno dueño de sus archivos. Cuatro bugs reales salieron de ahí: la balanza que se
endereza en `prealg.eq.balance` nunca soltaba su halo (la actividad pasaba `contents` que no
cambian; ahora hay una prop aditiva `loads`); `PipeScene.tsx` tenía tres bytes NUL
literales y git lo trataba como binario; la barra sin cortar de las fracciones ya se veía en
menta ("coincide") al 35 %; la leyenda de `alg.fn.graph_as_picture` quedaba cortada abajo.

**Tomi, el compañero que da pistas** (`ui/HintBuddy.tsx`, `ui/Tomi.tsx`). Lumi enseña; Tomi
ayuda, y no se pisan: Tomi calla mientras la guía está en pantalla. Se ofrece solo después
de 18 s sin tocar el tablero o de dos intentos seguidos que no avanzaron, y se toca en
cualquier momento. Las pistas van de a una, de lo concreto a lo general: dónde mirar (el
paso "hacelo" de la guía, que la actividad señala con el mismo foco), la llave que sirve,
la idea del nivel, y que pruebe cualquier cosa. La primera versión ponía primero el
objetivo, que ya está en el cartel; y la tarjeta tapaba el tablero en pantallas chicas.
Ahora va arriba, en el lugar del cartel de Lumi. Para contar los intentos, App pasa cada
`attempt` a la lección (`attempts`), y la lección guarda `misses` y `hint`.

**Sonido físico** (`ui/sound.ts`). N §6 ya lo pedía: pocos sonidos, todos con significado
físico, sin fanfarria ni error. Nueve, sintetizados con WebAudio en el momento. El que
explica es `drop`: sube de nota al llenar una fila, así que contar se escucha. Se apaga
desde la barra. **En el teléfono todavía no suena.**

**El fondo se mueve en los bordes** (`ui/Ambient.tsx`). Cada sprite tiene un carril (el
cielo, los costados, las esquinas de abajo) y no sale de él; nada cruza el centro. Las
luciérnagas, que titilaban en cualquier lado, también pasaron a los costados. Con reducir
movimiento nada se mueve.

**El recorrido entre niveles se siente** (lo hizo un agente: `LevelComplete`, `LevelIntro`,
`LevelMap`, `NodeMap`, `Chrome`, `Coach`, más `ui/Motion.tsx` y `ui/journey.ts`). La llave
nueva vuela en arco y entra en su lugar del llavero con `keyIn`; si el nivel ya estaba
superado, no vuela y dice "Ya estaba en tu chuleta". Las piedras del sendero aparecen de a
una, las pisadas son menta y llevan su llave, la luz corre hacia la que sigue, y el mapa
muestra el llavero de cada concepto y el dúo de Lumi y Tomi.

**Arte nuevo**: Tomi en siete poses y ocho sprites, del generador (`mathy-tomi`,
`mathy-ambiente`). `tools/art/sync_art.py` ahora recorta contra el color de fondo que
traiga cada imagen (blanco, negro o transparente) y saca huecos encerrados por nombre
(`PUNCH_TOP`: el anillo de la llave de Lumi, el hueco entre las sogas del globo).

## Los diagnósticos, y lo que costaron

1. **El juego se colgaba al tocar "Empezar".** Lo introduje yo, al conectar los intentos
   con Tomi: `onEvent` pasó a ser una flecha nueva por render y un efecto de la actividad
   depende de él. Bucle de guardado sin error de React (trampa 30).
2. **Los agentes se cortaron dos veces** cuando se cerró la app; la segunda tanda no había
   guardado nada en disco. La tercera tuvo la regla "guardá seguido, por partes que
   compilen", y dos agentes retomaron diffs ajenos en vez de rehacerlos.
3. **Las nubes eran rectángulos oscuros.** La nube vino con fondo negro opaco y el recorte
   buscaba blanco. Después de arreglarlo seguía un rectángulo: era la imagen vieja en caché
   del navegador.
4. **Las esperas que no terminaban nunca.** Un `pgrep -f "generate.py --project mathy-…"`
   dentro de un bucle encuentra su propio shell, porque el patrón está en su línea de
   comando (trampa 31). Traba también a cualquier otra sesión que espere lo mismo.
5. **Las referencias dejaron de subir** a ChatGPT (timeout esperando la miniatura) después
   de cinco sprites. Los dos que faltaban salieron sin adjunto, con el estilo en texto.
   Había otra sesión usando el mismo Chrome aislado: no está probado que sea la causa.
6. **Metro dejó de responder**, al 99 % de CPU: la pestaña de un agente en
   `arith.div.undo_mul` nivel 8 le reenviaba sin parar `RuntimeError: Aborted()` de
   CanvasKit (53 000 mensajes) y Metro armaba un marco de código por cada uno (trampa 32).
   **No se pudo reproducir** en una pestaña limpia (cuatro gestos, memoria de CanvasKit
   estable en 128 MB). La hipótesis es la acumulación de recargas en caliente en una pestaña
   de horas; no está confirmada.

## Números

| | al empezar la noche | al cerrar |
|---|---:|---:|
| tests | 762 | 762 |
| escenas con el estándar | 1 de 11 | 11 de 11 |
| personajes | Lumi | Lumi y Tomi (7 poses) |
| sprites de ambiente | 0 | 8 |
| sonidos | 0 | 9 (sólo web) |

## Verificado mirando, y no

Mirado por mí en el navegador: el nodo 1 con Tomi (la oferta, la pista arriba, el foco en
el tablero), el botón de sonido, el cuelgue arreglado (un solo `sawLayer` estable), el mapa
con el ambiente y el dúo, el sendero del río con el barquito, el taller con un engranaje, la
hoja con los ocho sprites sobre el fondo del juego.

Verificado por los agentes **midiendo** (DOM, píxeles del lienzo, nodos de audio creados),
no a ojo, porque el panel del navegador estuvo oculto: la mayoría de las escenas, la
secuencia del cierre (la llave aterriza a 1780 ms y `keyIn` suena a 1790 ms), los sonidos
de cada gesto.

No mirado:
- las diez escenas a ojo, en detalle (legibilidad, superposiciones);
- los sonidos de oído: se contaron, no se escucharon;
- reducir movimiento, el teléfono, el aborto de CanvasKit;
- el arrastre de la llave de `alg.eq.one_step` y el de las filas de `arith.mul.scaling`
  nivel 2: los gestos sintéticos no los agarraron.
