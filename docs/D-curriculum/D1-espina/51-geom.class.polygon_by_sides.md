# 51 — Figuras por cantidad de lados (`geom.class.polygon_by_sides`)

> Locale `es`: "Figuras por cantidad de lados". Minijuego: [El taller de cajones](../../F-minijuegos/geom.class.polygon_by_sides.md).

**Nodo:** `geom.class.polygon_by_sides` · **Área:** geom · **Nivel:** 1 · **Primitiva:** `partition` · **Mecánica principal:** `sorter` (secundaria `construct`) · **Literacy:** `none` · **Analogía:** `sorting_bins`

## 1. Concepto

El nombre de una figura sale de un solo número: cuántos segmentos rectos cierran su borde. Al terminar, el jugador recorre el borde de una figura cualquiera una vez, sin repetir ni saltear, dice cuántos lados tiene y la manda a su cajón; sabe que girarla, agrandarla o achatarla no la cambia de cajón; y reconoce las figuras que no van a ningún cajón porque su borde no cierra, se cruza o tiene un pedazo curvo. Antes sabía contar cosas sueltas en un cuenco; no sabía contar las partes de una sola cosa.

## 2. Prerequisitos

- `found.count.cardinality` (nodo 01): el emparejamiento uno a uno, el último número dicho como respuesta a "cuántos" y la invariancia del conteo al reordenar. Se usa entero, pero con un cambio de objeto que es toda la dificultad del nodo: lo que se empareja ya no son cosas sueltas que se pueden apartar a un costado a medida que se cuentan, sino los lados de una figura que no se mueve. En un cuenco, el montón ya contado y el que falta se separan solos. En un borde cerrado no hay montón, no hay primero y no hay último: hay que fabricar la marca de arranque y volver a ella.

La arista no es la del orden escolar. La escuela define primero qué es un polígono, con una definición que hay que leer, y recién después nombra los casos. Acá el orden se invierte a propósito, por la razón que fija [C0](../../C-knowledge-graph/C0-esquema.md) para toda la rama: el nombre *es* el conteo, así que contar es lo primero y la definición aparece al final, cuando ya no hace más que poner en palabras algo que el jugador viene haciendo con el dedo. Por eso el nodo puede ser de nivel 1 y jugarse sin leer una sola palabra: no depende de ningún nodo de geometría, solo del primero de todos.

La mecánica, en cambio, no es nueva: `found.sort.by_attribute` ya puso al jugador a repartir objetos en cajones por color y por forma, en nivel 0. Ese nodo no se declara como prerequisito porque no aporta nada que este nodo necesite: los cajones se entienden viéndolos. Lo que cambia acá es de dónde sale el atributo. Antes el color estaba a la vista; ahora la cantidad de lados hay que producirla.

## 3. Dificultad cognitiva real

Lo difícil no es saberse los nombres. Son cuatro capacidades:

1. **Contar las partes de un objeto y no objetos de un montón.** Todo el riesgo está en repetir o saltear, y en un borde cerrado el riesgo es máximo porque el recorrido vuelve al principio. La única defensa es marcar dónde se arrancó, que es el emparejamiento uno a uno del nodo 01 aplicado a un ciclo.
2. **El conteo es del objeto, no del dibujo.** La misma figura girada, agrandada o achatada tiene los mismos lados. Es lo contrario de lo que la vista sugiere: un cuadrado apoyado sobre un vértice se ve como otra cosa, y muchos jugadores lo mandan a otro cajón. Esta capacidad es la puerta del nodo 52.
3. **El nombre es una decisión encima de un conteo.** "Pentágono" no agrega información a "cinco lados": la abrevia. Hasta que el jugador vea nacer el nombre del número, el nombre es una palabra que hay que memorizar.
4. **Qué queda afuera.** El invariante del cajón exige que todo objeto caiga en exactamente un cajón, así que las figuras con borde abierto, con borde que se cruza o con un pedazo curvo obligan a que exista el cajón de las que no son polígonos. Decidir que algo no entra en ninguna clase es tan parte de clasificar como elegir la clase.

Ninguna de las cuatro tiene misconception catalogada todavía (sección 12).

## 4. Problema intuitivo

Un taller donde llegan piedras de piso cortadas de muchas formas, mezcladas en una carretilla. Contra la pared hay cajones abiertos; el frente de cada cajón tiene puntos pintados: tres, cuatro, cinco, seis. Al costado, una batea sin puntos. La pregunta, por gesto: ¿dónde va cada piedra?

En `real` el jugador empuja una piedra con el dedo y la mete en un cajón. El cajón se cierra o no se cierra; nadie dice nada.

En `intuition` la escena se detiene con dos piedras muy distintas a la vista: una larga y flaca, casi una tira, y otra ancha y despareja. Tres desenlaces dibujados: van a cajones distintos porque no se parecen en nada; van al mismo cajón porque las dos tienen cuatro lados; la ancha va a la batea porque no parece una figura "de las de siempre". El jugador elige y después ve: los dos bordes se encienden lado a lado, cada uno se recorre solo y las dos cuentas terminan en cuatro.

## 5. Analogía del mundo real

`sorting_bins`, la del YAML, sobre la mecánica `sorter` ([G0](../../G-analogias/G0-reglas.md)).

Mapa del catálogo, leído en este nodo: caja → clase de figuras; objeto → figura; poner el objeto en la caja → el test de clasificación; número en la etiqueta → cantidad de lados; reordenar dentro de la caja → la clase no depende de dónde ni cómo está puesta la figura.

Invariante que conserva: `every_object_exactly_one_bin`. Cada piedra entra en un cajón y en uno solo, y por eso la batea de las que no son polígonos no es un descarte sino un cajón más. La partición tiene que ser completa o el invariante se rompe.

Ruptura: `infinite_collections`, la que declara el catálogo, queda lejos de acá. La ruptura que este nodo sí toca es otra y más chica: los cajones son finitos y están dibujados de antemano, y siempre puede llegar una piedra con más lados que cajones hay. Cuando eso pasa, la piedra no tiene dónde ir aunque sea un polígono perfecto, y el taller tiene que fabricar el cajón. Es la primera vez que el jugador ve que la lista de nombres no se termina.

Se retira en `visual`, la capa más temprana del catálogo, y eso acá es una ventaja: en cuanto el conteo es una cifra pegada al contorno, los cajones sobran y estorban.

Por qué esta y no otra: cualquier analogía que midiera (una regla, una cinta, una cuerda) metería la longitud en un nodo donde la longitud no participa. El cajón decide por un conteo y por nada más, y es el mismo objeto que ya decidía por color en nivel 0, así que el jugador no aprende una interfaz nueva: aprende que ahora el atributo hay que producirlo.

## 6. Mecánica de juego

Primera capa jugable: `real`, sin leer nada. `sorter` es la principal y `construct` la herramienta que hace honesto el conteo, porque recorrer el borde es un trazo sobre una figura que no se mueve ([E0](../../E-mecanicas/E0-catalogo.md)). Gestos: `drag`, `tap` y `hold`.

1. Las piedras en el centro, los cajones abajo con el frente de puntos, la batea al costado.
2. Demostración: una mano fantasma toca una esquina de una piedra y esa esquina queda encendida; arrastra el dedo por el borde y cada lado se enciende al pasar y suelta un tic en una tira al costado; el dedo vuelve a la esquina encendida y la tira se cierra. Después la mano lleva la piedra al cajón que tiene esa cantidad de puntos y el cajón se cierra.
3. El jugador puede llevar una piedra directo a un cajón sin contar. Si acierta, el cajón se cierra igual. Si no, el cajón no cierra y devuelve la piedra a la mesa de recorrido con la esquina de arranque ya encendida. El error no se anuncia: se convierte en el gesto que faltaba.
4. Pasar dos veces por el mismo lado no suma otro tic: el lado ya está encendido. Saltear un lado lo deja apagado, y cuando el dedo vuelve al arranque la tira no cierra porque quedó un tramo oscuro. El jugador ve exactamente cuál se le escapó.
5. Contar las esquinas en vez de los lados también funciona: tocar una esquina tras otra suelta tics igual, y la tira cierra con el mismo número. Las dos cuentas conviven en pantalla.
6. Piedras con un pedazo curvo o con el borde abierto: el dedo resbala en la curva y la tira no cierra; en el borde abierto el dedo llega al final y no hay adónde seguir. Esas van a la batea, que se cierra como cualquier cajón.
7. Con un toque sostenido el jugador levanta una copia de la piedra y la gira. Al soltarla sobre la original, la copia calza y el cajón sigue siendo el mismo. Este gesto no se explica acá: se deja pasar, y es el que abre el nodo 52.

Un movimiento válido pero inútil, como recorrer el borde dos vueltas enteras, no rompe nada: la tira ya está cerrada y el segundo giro no agrega tics. Empujón suave, sin explicación.

## 7. Representación visual

Capa `visual`, primitiva `partition` dominante ([H](../../H-progresion-abstraccion.md)).

`partition`: lo que se parte no es la figura sino el conjunto de figuras. Los cajones se estilizan en cajas con una cifra al frente y las piedras pierden textura hasta quedar en contorno. Nada se desplaza y nada se escala: el único movimiento es el de cada figura yendo a su caja, y el mensaje entero de la primitiva es que después de repartir no quedó ninguna afuera ni ninguna en dos lugares.

`invariant` de apoyo, por `construct`: al recorrer el borde, el antes y el después se muestran con el contorno iluminado idéntico en los dos y solo la tira de tics distinta. El recorrido revela; no cambia. Y cuando el jugador levanta la copia y la gira, la copia y la original se resaltan juntas con la misma cifra.

Los lados se encienden de a uno y las esquinas se marcan con puntos. Que las dos cuentas den lo mismo se ve sin que nadie lo diga: las dos tiras quedan una encima de la otra y tienen el mismo largo.

Todavía no hay nombres escritos sobre las figuras, ni letras en los vértices, ni ninguna suma de ángulos: hay contornos, puntos y tiras de tics.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno disparado por un gesto del jugador.

1. **Piedra → contorno.** La primera vez que un cajón se cierra bien en `visual`, la piedra pierde la textura y queda su borde, con las esquinas como puntos. Es la misma piedra afinada, no otra figura.
2. **Recorrido → tira de tics.** Al soltar el dedo en la esquina de arranque, los lados encendidos sueltan sus tics y la tira queda al costado del contorno.
3. **Tira → cifra.** Al tocar la tira, los tics se juntan y se contraen en una cifra que queda pegada al contorno. Es la tarjeta con el número del nodo 01, que vuelve exactamente igual y por eso no hay que explicarla.
4. **Cifra → nombre.** Cuando un cajón se llenó varias veces, la cifra de su frente hace crecer al lado una palabra, narrada por voz. La cifra no desaparece: el nombre sale de ella y queda unido por un hilo fino. El jugador que no lee sigue leyendo la cifra; el que lee gana una palabra.
5. **Nombre → etiqueta que viaja.** El par cifra y nombre se despega del cajón y se pega a la figura, y desde acá viaja con ella. En los nodos siguientes una figura se puede nombrar sin volver a recorrerla.

## 9. Notación matemática

Queda el contorno con los vértices marcados como puntos, la cifra de lados pegada a la figura y el nombre al lado de la cifra.

El nodo no introduce ningún símbolo nuevo: la cifra nació en el nodo 01 y no hay operadores. Por la convención 3 de la [plantilla](_plantilla.md), lo que aporta es una **convención de escritura**, y hay que decir qué problema la hace necesaria. La convención es el nombre de la clase, y el problema aparece en cuanto hay que hablar de muchas figuras a la vez. Decir "las que tienen cuatro lados" una vez no cuesta nada; decirlo cuatro veces en la misma frase, como pide cualquier enunciado con dos o tres figuras, vuelve la frase ilegible. El nombre es lo más corto que se puede decir sin dejar de decir el conteo, y por eso convive con la cifra en vez de reemplazarla.

Dos cosas que deliberadamente **no** aparecen. No aparece ninguna letra para "cantidad de lados": nombrar con una letra una cantidad que varía es el nodo 10, que no es prerequisito de este, y meterla acá obligaría a explicar dos cosas nuevas en el mismo paso. Y no aparece ninguna medida: ningún lado lleva un número de largo, porque en este nodo el largo no decide nada.

## 10. Definición formal

Capa `formal`: texto corto con voz y el contorno al lado. Tres frases, de a una. "Un polígono es una figura cerrada cuyo borde son segmentos rectos." "Se clasifica por cuántos segmentos tiene el borde." "Tiene tantas esquinas como lados."

Condiciones de validez, verificadas sobre el objeto: el borde tiene que cerrar, los tramos tienen que ser rectos y el borde no se puede cruzar a sí mismo. Casos especiales, todos jugados antes de nombrarse: una figura despareja o hundida hacia adentro está en el mismo cajón que una pareja del mismo conteo, y la punta de flecha de cuatro lados es el ejemplo que más cuesta; una esquina donde el borde sigue derecho no es esquina, y los dos tramos cuentan como un lado, porque el dedo no cambió de dirección al pasar; tres es el conteo más chico posible, porque con dos tramos el borde no cierra; y la estrella de cinco puntas, que todo el mundo llama de cinco, tiene diez lados y además se cruza, así que no entra en el cajón de cinco ni en ninguno.

Ya jugado: las tres frases enteras, en capa concreta. Nuevo: la palabra polígono para toda la familia, y la exigencia de decidir que algo no es ninguna.

## 11. Propiedades

- **Todo polígono tiene tantas esquinas como lados.** Ligada a las dos tiras de tics que quedan del mismo largo cuando el jugador cuenta primero los lados y después las esquinas.
- **El conteo no cambia si la figura se gira, se agranda o se achata.** Ligada al toque sostenido que levanta la copia, la gira y la deja calzando sobre la original. Es la propiedad que el nodo 52 convierte en su tema.
- **El conteo no depende de dónde se arranca ni para qué lado se recorre.** Ligada a arrancar el recorrido en otra esquina y llegar al mismo número. Es la invariancia del conteo del nodo 01, dicha sobre un ciclo.
- **Tres es el conteo más chico.** Ligada al intento de cerrar un borde con dos tramos rectos, que deja siempre un hueco.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: cuatro figuras en fila y un solo cajón abierto, con cinco puntos al frente. Tocar la que entra. Los distractores son una estrella de cinco puntas, un hexágono y una figura de cinco bultos redondeados: el primero separa "cinco puntas" de "cinco lados", el segundo obliga a contar y no a mirar, el tercero pide decidir que no es polígono.
- `explain`: el jugador recorre el borde de una figura y después elige entre animaciones sobre esa misma figura: una la recorre arrancando en otra esquina y llega al mismo número; otra la recorre salteando un lado y la tira cierra con un tramo oscuro; otra cuenta las esquinas en vez de los lados y llega al mismo número. Tocar las que muestran por qué el conteo no depende de dónde se arranca.
- `manipulate`: recorrer el borde de una figura hundida de siete lados y mandarla a su cajón.
- `apply`: cinco figuras seguidas, un cajón cada una, contra el tiempo objetivo del nodo. Las figuras vienen giradas a ángulos raros y dibujadas a tamaños muy distintos.
- `generalize`: una figura de doce lados, demasiados para sostener en la cabeza; los tics se dejan agrupar de a tres o de a cuatro y el conteo sale de las tiras agrupadas. Después, una figura con una esquina donde el borde sigue derecho: decidir si es un lado o dos.
- `transfer`: en la red de `graph.basic.graph_and_paths`, un recorrido que sale de un lugar, pasa por otros cuatro y vuelve; contar los tramos del viaje y decir a qué cajón iría el recorrido si fuera una figura.

Misconceptions esperadas ([L0](../../L-modelo-errores/L0-taxonomia.md)):

El YAML declara `misconceptions: []`, y no es un olvido. Los dos errores frecuentes del nodo todavía no tienen entrada porque su regla `detect` no se pudo escribir sobre una expresión: los dos ocurren sobre una figura y un recorrido, no sobre una fórmula. Mientras tanto se tratan así, con el mecanismo de minería de estados erróneos de L0, que registra el evento con el estado previo y el nodo para que el grupo se pueda escribir después con su regla y su patrón:

- **Clasificar por el aspecto y no por el conteo.** El jugador manda el cuadrado apoyado sobre un vértice al cajón equivocado, o separa la figura larga y flaca de la ancha. El juego ejecuta el movimiento, el cajón no cierra y devuelve la figura a la mesa de recorrido con la esquina de arranque encendida; al lado aparece la otra figura del mismo cajón, ya contada. Voz: "Estas dos están en el mismo cajón. ¿Cuántos lados tiene cada una?".
- **Repetir o saltear un lado al recorrer.** El juego deja la tira sin cerrar y el tramo salteado oscuro, y el dedo del jugador vuelve solo al arranque. Voz: "Volviste al principio y quedó un tramo apagado. ¿Por dónde no pasaste?".

## 13. Generalización

Los cajones se retiran en `visual`, apenas la figura queda en contorno con su cifra: ahí el conteo ya es un número pegado al objeto y el cajón no agrega nada. La caja vuelve a demanda, atenuada, hasta `formal`.

Variantes sin ayuda visual, en orden: figuras giradas y a escalas muy distintas; figuras hundidas hacia adentro; figuras de diez a doce lados, donde hay que agrupar los tics; figuras con una esquina derecha, donde el conteo depende de decidir si esa esquina existe; y figuras que no son polígonos, donde la respuesta es que no hay cajón.

El nodo está en `abstract` cuando el jugador, con el número solo y sin ninguna figura en pantalla, dice cómo se llama la figura y cuántas esquinas tiene, y explica por qué no existe un polígono de dos lados. La forma completa de esa capa es `geom.class.quadrilateral_hierarchy`, donde los cajones se meten unos dentro de otros, y más adelante `disc.set.membership_rule`, donde el frente del cajón deja de ser un dibujo y pasa a ser una regla.

## 14. Transferencia y concepto siguiente

Los tres nodos de `transfer_to`, cada uno en otra área y con la partición vestida de otra cosa:

- `disc.set.membership_rule` (`sorter`): el mismo cajón, ahora con una regla escrita en el frente en vez de puntos pintados. El jugador que reconoce que "tiene cuatro lados" es la regla de pertenencia de un conjunto ya entendió que clasificar es partir.
- `disc.count.sum_rule` (`ledger`): contar casos repartidos en cajones que no se pisan es sumar los conteos de los cajones. Es el invariante `every_object_exactly_one_bin` usado para contar en vez de para clasificar.
- `graph.basic.graph_and_paths` (`network_routes`): un recorrido cerrado que pasa por cinco lugares tiene cinco tramos, y el conteo de tramos es el mismo conteo de lados hecho sobre una red donde la posición de los puntos no importa.

Concepto siguiente: `geom.class.quadrilateral_hierarchy`. Frase puente, narrada sobre el cajón de cuatro puntos lleno: "Todas estas tienen cuatro lados y están en el mismo cajón. Pero algunas se parecen entre sí más que otras. ¿Y si adentro del cajón hubiera más cajones?". El frente del cajón se abre y adentro aparecen tres cajones más chicos, y el nodo siguiente empieza ahí.

---

**Visualización:** dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md). `sorter_scene_sides_into_bins` es nativa, parametrizada por los conteos de las figuras y por qué cajones están a la vista: las figuras viajan al cajón de su cifra, el cajón cuenta lo que recibe y la batea recoge las que no son polígonos; gramática `partition`. Renderizada sobre el estado del jugador, produce también las opciones de `apply`. `construction_scene_walk_the_boundary` es nativa, parametrizada por los vértices de la figura y por en qué esquina arranca el recorrido: la esquina de arranque se enciende, los lados se encienden de a uno, los tics caen en la tira y el cierre se resalta; gramática `invariant`, con el contorno idéntico en el antes y el después. Genera las animaciones de `explain` variando la esquina de arranque y salteando un lado. Las dos son `text_free`: la cifra y el nombre los dibuja el runtime según el locale ([P](../../P-internacionalizacion.md)).

**Calculadora:** el nodo no habilita ninguna operación ([M](../../M-calculadora/M0-progresion.md)), y es deliberado: no hay nada que calcular. La correspondencia entre el conteo y el nombre es una consulta, no una operación, y su lugar es la cheatsheet, donde entra como `cs.geom.polygons_by_sides` junto con `cs.geom.polygon_sides_equal_vertices` y `cs.geom.what_is_not_a_polygon` ([R0](../../R-cheatsheet/R0-cheatsheet.md)). Las operaciones de geometría llegan con los nodos que miden: `op_perimeter` y `op_area` con el área, `op_angle` con el giro.

**Edad universal:** el nodo es `literacy: none` y se juega entero sin leer ([Q](../../Q-edad-universal.md)). Se cuenta con el dedo, se arrastra al cajón, se levanta la copia con un toque sostenido, y `explain` es elegir entre animaciones. El único texto del nodo es el nombre de la figura, que aparece en el paso 4 del desvanecimiento narrado por voz y siempre pegado a la cifra: quien no lee sigue el número y no pierde nada, y quien lee gana la palabra. Un adulto llega por diagnóstico salteando `real` e `intuition`, entra con las figuras ya en contorno, y el recorrido del borde se le ofrece una sola vez como confirmación en vez de ser un nivel entero; lo que sí conserva es la batea, porque decidir que una figura no es polígono cuesta a cualquier edad.
