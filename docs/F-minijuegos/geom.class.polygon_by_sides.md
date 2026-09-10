# El taller de cajones (`geom.class.polygon_by_sides`)

Minijuego del nodo 51 de la espina, "Figuras por cantidad de lados". Mecánica principal `sorter`, secundaria `construct`; analogía `sorting_bins`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/51-geom.class.polygon_by_sides.md): un concepto, cuatro dificultades reales (contar las partes de un objeto, el conteo como propiedad del objeto y no del dibujo, el nombre como abreviatura del conteo, y decidir que algo no entra en ningún cajón), una analogía que ya se usó en nivel 0 con el atributo a la vista, un gesto (recorrer el borde una vuelta), cinco pasos de desvanecimiento, la partición como visualización dominante, retiro en `visual`. Acá se fija cómo se juega.

## Analogía

Un taller de piso donde llegan piedras cortadas de muchas formas. Contra la pared, cajones abiertos con el frente pintado de puntos: tres, cuatro, cinco, seis. Al costado, una batea sin puntos.

Mapa objeto a concepto: cajón → clase de figuras; piedra → figura; meter la piedra en el cajón → el test de clasificación; puntos del frente → cantidad de lados; batea → las que no son polígonos; mover las piedras dentro del cajón → la clase no depende de cómo esté puesta la figura; cajón que hay que fabricar → la lista de nombres no se termina.

El cajón aporta que la clase se decide por un conteo y por nada más. El trazo de `construct` aporta el conteo honesto: recorrer el borde encendiendo un lado por vez, sobre una figura que no se puede mover. Invariante de la analogía: `every_object_exactly_one_bin`, y por eso la batea no es un descarte sino un cajón más. Punto de ruptura del catálogo, `infinite_collections`, lejos de acá; la ruptura que este nodo sí toca es que los cajones dibujados son finitos y siempre puede llegar una piedra con más lados que cajones hay ([G0](../G-analogias/G0-reglas.md)). Se retira en `visual`, la más temprana del catálogo, en cuanto el conteo es una cifra pegada al contorno.

## Mecánica central

Superficie: las piedras en el centro, la fila de cajones abajo, la batea al costado, la mesa de recorrido debajo de la piedra que se está trabajando. Gestos: `drag`, `tap` y `hold` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Arrastrar una piedra a un cajón.** Si el cajón es el suyo, se cierra. Si no, no cierra y devuelve la piedra a la mesa de recorrido con la esquina de arranque ya encendida. El error no se anuncia: se convierte en el gesto que faltaba.
- **Tocar una esquina.** Queda encendida y es la marca de arranque del recorrido.
- **Recorrer el borde con el dedo.** Cada lado se enciende al pasar y suelta un tic en la tira del costado. Al volver a la esquina encendida, la tira se cierra.
- **Pasar dos veces por el mismo lado.** No suma otro tic: el lado ya está encendido.
- **Saltear un lado.** La tira no cierra y el tramo queda oscuro. El jugador ve exactamente cuál se le escapó.
- **Tocar las esquinas de a una.** Es la otra cuenta. Suelta tics igual y la tira cierra con el mismo número; las dos tiras quedan una sobre otra, del mismo largo.
- **Recorrer una figura curva o de borde abierto.** El dedo resbala en la curva; en el borde abierto llega al final y no hay adónde seguir. Esas van a la batea.
- **Toque sostenido sobre una piedra.** Levanta una copia que se puede girar. Al soltarla sobre la original, calza, y el cajón sigue siendo el mismo. El gesto no se explica acá: es el que abre el nodo 52.

En `visual` la superficie cambia de forma, no de reglas: las piedras quedan en contorno, la tira se contrae en una cifra pegada al contorno y el frente de los cajones cambia los puntos por la cifra. En `symbolic` el nombre crece al lado de la cifra y la etiqueta viaja con la figura; los cajones se piden con un toque y aparecen como fantasma.

## Invariante matemático

`every_object_exactly_one_bin`: toda figura entra en un cajón y en uno solo. Se ve confirmarse cuando dos figuras que no se parecen en nada terminan en el mismo cajón porque tienen la misma cuenta. Se ve romperse de dos maneras, y las dos importan: cuando el jugador manda a la batea una figura que sí es polígono, la batea no cierra y la devuelve; cuando aparece una figura de más lados que cajones hay, ningún cajón cierra y hay que fabricar uno, que es la partición reclamando estar completa.

El invariante de `construct` es el de apoyo: `construction_reveals_not_changes`. El recorrido no toca la figura. El contorno queda idéntico antes y después y lo único que aparece es la tira de tics; y cuando el jugador levanta la copia y la gira, la cuenta no se mueve.

Un movimiento válido pero inútil, como recorrer el borde dos vueltas enteras o contar primero los lados y después las esquinas de la misma figura, no rompe ningún invariante: la segunda vuelta no agrega tics y las dos cuentas coinciden. Empujón suave, sin explicación.

## Representación visual

Primitiva dominante `partition`, de apoyo `invariant` ([H](../H-progresion-abstraccion.md)).

- `real` e `intuition`: el taller, la carretilla de piedras, los cajones con puntos. Se empuja y se predice.
- `concrete`: piedras con textura, cajones con puntos, mesa de recorrido, tira de tics. Nada escrito.
- `visual`: las piedras quedan en contorno con las esquinas como puntos; los cajones se estilizan en cajas con una cifra al frente. Lo que se parte es el conjunto de figuras, no la figura: nada se desplaza y nada se escala, y el mensaje es que después de repartir no quedó ninguna afuera ni ninguna en dos lugares.
- `symbolic`: contorno con la cifra y el nombre pegados, sin cajones a la vista.
- `formal`: las tres frases con voz y el contorno al lado.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables:

1. Piedra → contorno: al cerrarse bien el primer cajón en `visual`, la piedra pierde la textura y quedan su borde y sus esquinas como puntos.
2. Recorrido → tira de tics: al soltar el dedo en la esquina de arranque, los lados encendidos sueltan sus tics y la tira queda al costado.
3. Tira → cifra: al tocar la tira, los tics se juntan y se contraen en una cifra pegada al contorno. Es la tarjeta con el número del nodo 01, sin cambios.
4. Cifra → nombre: cuando un cajón se llenó varias veces, la cifra de su frente hace crecer al lado una palabra narrada por voz. La cifra no desaparece; el nombre sale de ella y queda unido por un hilo fino.
5. Nombre → etiqueta que viaja: el par cifra y nombre se despega del cajón y se pega a la figura, y desde acá viaja con ella.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre el contorno: un polígono es una figura cerrada cuyo borde son segmentos rectos; se clasifica por cuántos segmentos tiene el borde; tiene tantas esquinas como lados. Condiciones: el borde tiene que cerrar, los tramos tienen que ser rectos y el borde no se cruza a sí mismo. Casos especiales: una figura hundida hacia adentro está en el mismo cajón que una pareja del mismo conteo; una esquina donde el borde sigue derecho no es esquina y los dos tramos son un lado; tres es el conteo más chico, porque con dos tramos el borde no cierra; la estrella de cinco puntas tiene diez lados y además se cruza, así que no entra en ningún cajón. Propiedades: tantas esquinas como lados, el conteo no cambia al girar ni al agrandar, el conteo no depende de dónde se arranca, y no hay polígono de dos lados. Sin símbolos nuevos: la cifra nació en el nodo 01 y no hay operadores; lo que aporta el nodo es el nombre como abreviatura del conteo, necesario en cuanto hay que hablar de varias figuras en la misma frase.

## Generalización

Los cajones se retiran en `visual`, apenas la figura queda en contorno con su cifra. La caja vuelve a demanda, atenuada, hasta `formal`.

Variantes sin ayuda visual: figuras giradas y a escalas muy distintas; figuras hundidas hacia adentro; figuras de diez a doce lados, donde hay que agrupar los tics; figuras con una esquina donde el borde sigue derecho; y figuras que no son polígonos, donde la respuesta es que no hay cajón. Cuando el jugador, con el número solo y sin figura en pantalla, dice cómo se llama y cuántas esquinas tiene, y explica por qué no existe un polígono de dos lados, la analogía se eliminó.

## Desafío

Ocho niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Piedras a los cajones.** `real` y `concrete`, `manipulate`. Tres cajones con puntos, figuras parejas y del mismo tamaño, apoyadas sobre un lado. Sin batea.
2. **Recorrer el borde.** `concrete`, `manipulate` y `recognize`. Aparecen la mesa de recorrido y la tira de tics. Las mismas figuras.
3. **La batea.** `concrete`, `recognize` y `explain`. Parámetros: entran figuras curvas, de borde abierto y de borde cruzado, y aparece la batea.
4. **Contornos y cifra.** `visual`, `explain` y `manipulate`. Las piedras quedan en contorno, la tira se contrae en cifra y los cajones cambian los puntos por la cifra.
5. **Giradas y desparejas.** `visual`, `apply`. Parámetros: figuras giradas a ángulos raros, escalas muy distintas y figuras hundidas hacia adentro.
6. **La cifra y el nombre.** `symbolic`, `apply`. El nombre crece al lado de la cifra y la etiqueta viaja con la figura; los cajones se piden a demanda.
7. **Demasiados para la cabeza.** `symbolic`, `apply` y `generalize`. Parámetros: figuras de diez a doce lados con los tics agrupados de a tres o de a cuatro, y figuras con una esquina donde el borde sigue derecho.
8. **Sin figura.** `formal` y `abstract`, `generalize`. Definición corta con voz; se da el número y no hay figura en pantalla, y aparece el conteo para el que todavía no hay cajón.

Qué endurece cada parámetro: las figuras que no son polígonos obligan a decidir que algo no entra en ninguna clase, que es lo que completa la partición; el giro y la escala separan el conteo del aspecto y son el ensayo del nodo 52; las figuras hundidas rompen la idea de que un cuadrilátero se parece a un cuadrado; los diez a doce lados obligan a agrupar, porque el conteo de uno en uno deja de caber en la cabeza; la esquina derecha obliga a decidir qué cuenta como esquina antes de contar.

Desafíos de olimpíada ([S](../S-desafios/S0-desafios.md)): el nodo requiere `ch.geom.cut_a_polygon_in_two`, donde un corte recto parte una figura en dos y hay que decir cuántos lados tiene cada pedazo, y el dato oculto es si el corte cae sobre una esquina o en el medio de un lado; y `ch.geom.symmetries_reveal_the_shape`, que comparte con el nodo 52 y donde la figura está tapada y solo se puede preguntar por sus simetrías. Los dos se juegan sin leer.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: cuatro figuras en fila y un cajón abierto con cinco puntos. Tocar la que entra. Los distractores son una estrella de cinco puntas, un hexágono y una figura de cinco bultos redondeados.
- `explain`: tres animaciones sobre la misma figura: recorrerla arrancando en otra esquina y llegar al mismo número; recorrerla salteando un lado y ver la tira sin cerrar con un tramo oscuro; contar las esquinas en vez de los lados y llegar al mismo número. Tocar las que muestran por qué el conteo no depende de dónde se arranca.
- `manipulate`: recorrer el borde de una figura hundida de siete lados y mandarla a su cajón.
- `apply`: cinco figuras seguidas, un cajón cada una, contra el tiempo objetivo del nodo, giradas a ángulos raros y a tamaños muy distintos.
- `generalize`: una figura de doce lados con los tics agrupados de a tres, y una figura con una esquina donde el borde sigue derecho, donde hay que decidir si es un lado o dos.
- `transfer`: en la red de `graph.basic.graph_and_paths`, un recorrido cerrado que pasa por cinco lugares; contar los tramos y decir a qué cajón iría si fuera una figura.

Misconceptions ([L0](../L-modelo-errores/L0-taxonomia.md)): el YAML declara `misconceptions: []`. Los dos errores frecuentes del nodo, clasificar por el aspecto en vez de por el conteo y repetir o saltear un lado al recorrer, todavía no tienen entrada porque su regla `detect` no se pudo escribir sobre una expresión: los dos ocurren sobre una figura y un recorrido, no sobre una fórmula. Mientras tanto el juego ejecuta el movimiento. Con el primero, el cajón no cierra, devuelve la figura a la mesa de recorrido con el arranque encendido y trae al lado la otra figura del mismo cajón, ya contada; voz: "Estas dos están en el mismo cajón. ¿Cuántos lados tiene cada una?". Con el segundo, la tira queda sin cerrar y el tramo salteado oscuro; voz: "Volviste al principio y quedó un tramo apagado. ¿Por dónde no pasaste?". El evento se registra con el estado previo y el nodo, que es el mecanismo de minería de estados erróneos de L0; si el grupo crece, la entrada se escribe con su regla y su patrón.

Los distractores de `explain` y las opciones de `apply` salen de esos dos grupos ya minados y de las reglas `detect` del prerequisito de conteo.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `sorter_scene_sides_into_bins`, nativa, parametrizada por los conteos de las figuras, por qué cajones están a la vista y por si entra la batea. Las figuras viajan al cajón de su cifra, el cajón cuenta lo que recibe y la batea recoge las que no son polígonos; gramática `partition`. Renderizada sobre el estado del jugador, produce también las opciones de `apply`.
- `construction_scene_walk_the_boundary`, nativa, parametrizada por los vértices de la figura y por en qué esquina arranca el recorrido. La esquina de arranque se enciende, los lados se encienden de a uno, los tics caen en la tira y el cierre se resalta; gramática `invariant`, con el contorno idéntico en el antes y el después. Genera las animaciones de `explain` variando la esquina de arranque y salteando un lado, y es la imagen de cheatsheet de `cs.geom.polygon_sides_equal_vertices`.
- Las dos son `text_free`: la cifra y el nombre los dibuja el runtime según el locale ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_polygon_batch`: `side_counts` (qué conteos aparecen, 3 a 6 en los niveles 1 a 6, hasta 12 en el 7); `convex` (falso habilita las figuras hundidas, desde el nivel 5); `rotation` (apoyadas sobre un lado hasta el nivel 4, a ángulos raros desde el 5); `scale_spread` (cuánto varían los tamaños dentro de una tanda); `include_non_polygons` en {curva, borde abierto, borde cruzado}, desde el nivel 3; `straight_vertex` (habilita la esquina donde el borde sigue derecho, nivel 7); `seed`.
- `gen_bin_row`: `bins` (qué cajones están a la vista); `front` en {puntos, cifra, cifra y nombre}; `include_scrap_tray`; `missing_bin` (habilita el conteo para el que no hay cajón, nivel 8); `seed`.
- `gen_boundary_walk`: `start_vertex`; `direction`; `skip_side` (habilita el recorrido con un lado salteado, que alimenta los distractores de `explain`); `count_corners_instead`; `group_ticks` (de a cuánto se agrupan los tics, desde el nivel 7); `seed`.

**Literacy soportada:** de `none` a `full_text`. El nodo entero se juega sin leer y por eso el mínimo es `none`: se cuenta con el dedo, se arrastra al cajón y `explain` es elegir entre animaciones. El único texto es el nombre de la figura, que aparece en el nivel 6 narrado por voz y siempre pegado a la cifra, así que quien no lee sigue el número y no pierde nada. En `full_text` la definición corta se muestra escrita además de narrada.

**Instrucción por demostración:** la primera vez, una mano fantasma toca una esquina, la deja encendida, recorre el borde soltando tics, vuelve al arranque y lleva la piedra al cajón, que se cierra. La escena vuelve al inicio y la primera esquina late. Se repite solo si el jugador se queda quieto. La demostración de la batea es aparte y se hace una vez en el nivel 3: la mano intenta recorrer una figura curva y el dedo resbala ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
