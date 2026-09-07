# 07 — Negativo es la dirección contraria (`arith.int.negatives`)

> Locale `es`: "Negativo es la dirección contraria". Minijuego: [Los subsuelos](../../F-minijuegos/arith.int.negatives.md).

**Nodo:** `arith.int.negatives` · **Área:** arith · **Nivel:** 1 · **Primitiva:** `displace` · **Mecánica principal:** `gears_sequence` (secundarias `ledger` y `grid_stretch`) · **Literacy:** `none` · **Analogía:** `elevator_floors` (con `debt_ledger` para la cancelación)

## 1. Concepto

Un número negativo no es menos que nada: es la misma cantidad medida hacia el otro lado del cero. Al terminar, el jugador sigue restando cuando ya no queda nada que quitar y sabe dónde cae, ordena posiciones de los dos lados del cero, cancela un crédito contra una deuda del mismo tamaño y reconoce que dos vueltas seguidas lo dejan mirando hacia adelante. Antes sabía volver hasta el punto de partida; no sabía pasarlo de largo.

## 2. Prerequisitos

- `arith.sub.undo_add` (nodo 4): volver sobre los pasos. Se usan la manivela girada hacia atrás, la pista graduada y el hecho de que la vuelta se cuenta con el mismo número que la ida. Se usa sobre todo lo que aquel nodo dejó dibujado como imposibilidad: la orilla más allá de la cual no hay piedras, donde una vuelta más larga que la ida no tenía dónde caer.

Ese borde obliga a cambiar de piel y no de esqueleto. `walker_forward_and_back` declara `walking_past_start` como punto de ruptura y por eso está prohibido acá; el camino de piedras se levanta hasta quedar vertical y se convierte en el hueco de un ascensor, que es la misma mecánica de posición y cambio de posición con un objeto que ya tiene subsuelos. El morph es continuo y ocurre en pantalla: nadie cambia de escena, la orilla se pone de pie.

Es el único prerequisito y no incluye la multiplicación: este nodo y el 5 cuelgan de ramas distintas del nodo 3, y un jugador puede llegar acá sin haber estirado nunca una banda. Por eso el nodo se escribe sin apoyarse en la escala salvo en su última capa, y por eso el producto de signos no vive acá sino en `arith.int.mul_signed`, fuera de la espina.

Que no aparezca el orden escolar tiene una razón más fuerte. En la escuela los negativos llegan después de las fracciones y como una ampliación del repertorio de números. En [C0](../../C-knowledge-graph/C0-esquema.md) llegan inmediatamente después de la resta, porque son la respuesta a una pregunta que la resta ya dejó abierta: qué pasa si se sigue quitando cuando no queda nada. Postergarlos obliga a enseñar la resta con una restricción ("del grande se quita el chico") que después hay que desaprender.

## 3. Dificultad cognitiva real

Lo difícil no es operar con signos sino cuatro cosas.

1. **Dejar de leer los números como cantidades de cosas.** Cinco manzanas, cinco pesas y cinco baldosas se cuentan; menos cinco no se cuenta. El jugador tiene que aceptar que un número lleva dos informaciones, cuánto y hacia dónde, y que la primera sola no alcanza. Esta es la barrera real del nodo y la razón de que aquí se caigan varias analogías que venían funcionando.
2. **Que el mismo signo tenga dos oficios.** El mismo trazo dice "quitar" cuando está entre dos números y "del otro lado" cuando está pegado a uno. Nada en el símbolo distingue los dos usos; los distingue la posición, y eso hay que jugarlo antes de escribirlo.
3. **Que el orden se dé vuelta bajo el cero.** Cinco está más lejos del cero que dos, y menos cinco también, pero menos cinco está más abajo. Comparar deja de ser comparar tamaños y pasa a ser leer posiciones sobre una recta orientada.
4. **Que dos vueltas se anulen.** El caminante que se da vuelta dos veces mira hacia adelante. Esto se juega acá, en la capa de dirección, y es la semilla de la regla de signos del producto. Quien no lo juega la memoriza mal, y esa es la misconception `negative_times_negative`.

## 4. Problema intuitivo

Un edificio con subsuelos y un ascensor de puertas abiertas. En el panel, los botones van de varios pisos hacia arriba a varios hacia abajo, con la planta baja en el medio. Alguien deja un carrito en el segundo subsuelo y otro en el tercer piso.

En `real` la pregunta es de mirada y se contesta con un toque: ¿cuál de los dos carritos está más lejos de la planta baja? En `intuition` la cabina está en el segundo piso, alguien aprieta un botón que baja cinco, y la escena se congela antes de que arranque. Tres desenlaces dibujados: la cabina baja cinco y se detiene en el tercer subsuelo; baja hasta la planta baja y se queda ahí porque "no se puede bajar más"; baja dos y sube tres. El jugador elige y después ve. El segundo desenlace es la restricción del nodo 4 sobreviviendo donde ya no corresponde, y es el que la mecánica desmiente en el primer nivel.

En una segunda escena, sobre el mostrador de una tienda, hay monedas y vales de papel. Un vale y una moneda del mismo tamaño se juntan y desaparecen los dos. No se explica por qué: se ve.

## 5. Analogía del mundo real

Este es el nodo donde varias analogías del juego dejan de servir, y decirlo con precisión es parte del diseño ([G0](../../G-analogias/G0-reglas.md)).

**Lo que se rompe.** `fruit_ledger` no tiene menos que una manzana: su lectura de cantidad muere acá, aunque su esqueleto sobreviva. `balance_pans` declara `negative_weights` como punto de ruptura: una pesa no pesa menos que nada, y por eso la balanza del nodo 11 se retira en `symbolic` cuando aparecen términos negativos. `rubber_band_stretch` declara `negative_scaling_flips`: una banda no se estira hacia atrás del clavo. Y `walker_forward_and_back`, que parecería la analogía natural, declara `walking_past_start` y por eso está prohibida en este nodo: sus piedras terminan en la de partida y no hay camino más allá.

**Lo que sobrevive.** `elevator_floors` (esqueleto `slope_walker`) es la analogía del YAML y sobrevive porque el edificio ya tiene subsuelos antes de que llegue la matemática: el jugador no tiene que aceptar nada nuevo para creer que hay pisos bajo la calle. Mapa: piso → entero; planta baja → cero; subir n → sumar un positivo; bajar n → sumar un negativo; piso del subsuelo → número negativo; pisos entre dos paradas → diferencia absoluta; orden de los botones → orden de los enteros. Invariante: la distancia entre dos pisos no depende de en qué sentido se recorra, y el orden de los botones es el orden de los números. Ruptura declarada: `multiplying_floors`. No existe ninguna acción del ascensor que sea "multiplicar el piso por otro piso"; ese es el borde exacto del nodo, y es la razón de que el producto con signo se enseñe en otro nodo y de que la analogía se retire antes de llegar ahí.

`debt_ledger` (esqueleto `ledger`) aporta la cancelación. Mapa: moneda → unidad positiva; vale → unidad negativa; moneda y vale que se juntan y desaparecen → opuesto aditivo; sacar un vale → restar un negativo; montón neto → suma con signo; k vales del mismo tamaño → un negativo multiplicado por un positivo. Ruptura declarada: `multiplying_two_debts`. No hay acción física que sea "deber una deuda"; la analogía llega hasta multiplicar un negativo por un positivo y ni un paso más.

Las dos sobrevivientes se rompen en el mismo lugar, la multiplicación, y ese es el dato de diseño más importante del nodo: la sección 13 se apoya en él.

Cómo conviven en pantalla: el hueco del ascensor está dibujado al costado del mostrador, y la altura de la cabina marca el saldo del mostrador. Cada vale que se junta con una moneda hace bajar la cabina un piso; cada par que se cancela la devuelve a la planta baja. El edificio dice dónde estoy; las monedas, cuánto debo.

## 6. Mecánica de juego

Primera capa jugable: `concrete`. `gears_sequence` es la principal y provee la herramienta —la manivela que hace bajar la cabina un piso por vuelta, con el mismo paso siempre—; `ledger` provee la cancelación, que es el invariante que la altura sola no muestra; `grid_stretch` entra al final y provee el único objeto que sobrevive al punto de ruptura, la recta que se da vuelta entera ([E0](../../E-mecanicas/E0-catalogo.md)). Se encuentran en un gesto: girar la manivela hacia atrás mientras el mostrador acumula vales, y ver que la cabina y el montón neto se mueven juntos. Gestos: `scrub`, `drag` y `tap`.

1. Hueco de ascensor vertical con pisos marcados, la planta baja resaltada, y una manivela al costado. En el mostrador, monedas y vales.
2. Demostración: una mano fantasma gira la manivela hacia atrás y la cabina baja de a un piso. Al llegar a la planta baja no se detiene: sigue, y la pared del hueco continúa hacia abajo mostrando subsuelos que hasta ese momento no estaban dibujados. La mano suelta y la cabina se queda ahí.
3. El jugador gira. Cada vuelta es un piso; el panel ilumina el botón del piso donde está. Pasar la planta baja no requiere nada especial: la manivela no se traba.
4. Si el jugador intenta detener la cabina en la planta baja porque cree que no se puede seguir, la manivela sigue girando con él y la cabina sigue bajando. No hay corrección: hay un edificio que continúa.
5. Sobre el mostrador: arrastrar una moneda sobre un vale del mismo tamaño y los dos desaparecen con un destello, y la cabina sube un piso. Arrastrar un vale fuera del mostrador —sacar una deuda— también hace subir la cabina, y esa coincidencia es todo el argumento de que restar un negativo suma.
6. Comparar: dos carritos en dos pisos. El jugador arrastra la ficha de la distancia entre ambos, contada en pisos, y la respuesta no depende de por cuál empiece.
7. Ordenar: fichas de pisos desparramadas y el hueco vacío al lado. El jugador las cuelga en su piso; si pone menos cinco encima de menos dos, las dos fichas se cruzan visiblemente con el hueco y no se enganchan.
8. Darse vuelta: en el último nivel la pista se acuesta y aparece un caminante mirando hacia un lado. Una ficha lo hace darse vuelta; dos fichas seguidas lo dejan mirando como estaba, y avanza hacia adelante.

## 7. Representación visual

Capa `visual`, con `displace` dominante y `partition` de apoyo ([H](../../H-progresion-abstraccion.md)).

`displace`. El hueco del ascensor se estiliza en una recta vertical graduada con el cero resaltado y la cabina como un punto. Cada movimiento se dibuja como una flecha desde la posición anterior hasta la nueva, y las flechas se acumulan una a continuación de la otra: dos flechas opuestas del mismo largo dejan el punto donde estaba, y eso se ve sin contar. En algún momento del nivel la recta gira noventa grados y queda horizontal: es la misma recta del nodo 3, ahora con la parte izquierda dibujada. El giro es un morph continuo, con la cabina convirtiéndose en la ficha del caminante mientras rota.

`partition` (apoyo). El mostrador se estiliza en dos columnas de fichas, monedas arriba y vales abajo, enfrentadas de a pares. Cada par enfrentado se apaga; lo que queda sin pareja es el saldo, y su columna dice el signo. Es la misma imagen que después sostiene los términos semejantes.

Todavía no hay operación escrita ni resultado escrito. Lo único que se escribe es la etiqueta del piso, y desde el momento en que aparecen los subsuelos esa etiqueta lleva un trazo delante.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno disparado por un gesto.

1. **Subsuelo → etiqueta con trazo.** La primera vez que la cabina baja de la planta baja, los pisos que aparecen se numeran, y el número viene con un trazo corto delante que no estaba en los de arriba. El trazo nace ahí, como marca del lado, no como operación.
2. **Hueco → recta.** Al soltar la cabina fuera de un piso, la pared del hueco se afina hasta ser una recta graduada y la cabina se contrae en un punto. Los botones del panel se convierten en las marcas.
3. **Recta vertical → recta horizontal.** Al arrastrar la recta con dos dedos, gira hasta acostarse y se reconoce como la pista del nodo 3 con su mitad izquierda ahora dibujada. Nada aparece ni desaparece: todo rota.
4. **Par de fichas → nada.** En el mostrador, cuando una moneda y un vale se cancelan, las dos fichas se funden en una y se apagan. El hueco que dejan no se cierra de golpe: las demás se corren, y esa corrida es la que después se escribe como suma.
5. **Vuelta → ficha de signo.** Al hacer que el caminante se dé vuelta, el gesto deja una ficha con el trazo solo, sin número. Aplicada a una ficha de número le pega el trazo delante; aplicada dos veces se lo saca. El trazo se volvió un objeto que se puede arrastrar, y esa es la ficha que la calculadora va a habilitar.

## 9. Notación matemática

Queda la recta con marcas a los dos lados del cero, las fichas de número con y sin trazo delante, y la ficha de signo suelta.

El símbolo nuevo es el signo negativo, y por la regla de oro de [H](../../H-progresion-abstraccion.md) el problema que lo hizo necesario se puede nombrar con exactitud: hay que poder describir un desplazamiento hacia el otro lado **sin cambiar la operación**. Mientras solo existieron los positivos, el juego necesitaba dos acciones distintas, avanzar y volver, y dos fichas distintas para pedirlas. En cuanto los números llevan la dirección adentro, la acción vuelve a ser una sola: juntar. Ese ahorro es la razón de existir del signo y el jugador lo siente cuando el mostrador acepta monedas y vales con el mismo gesto.

De ahí sale también el doble oficio del trazo. Entre dos números es la resta que ya conocía; pegado a uno, es el lado. La convención se introduce sin ambigüedad porque las fichas ocupan lugares distintos: la ficha de operación vive entre dos fichas de número y la de signo se pega a una. Nada de esto se enuncia todavía: se ve en la disposición.

El signo de igual aparece en los renglones que el libro de cuentas anota y, como en los nodos 3 a 6, el nodo no lo introduce. Acá gana una precaución extra: en un renglón como `2 − 5 = −3` los dos trazos son el mismo glifo con oficios distintos, y el juego los dibuja con espaciado distinto —el de operación separado de los dos números, el de signo pegado al suyo— hasta que el jugador los distingue solo. El resultado primario sigue siendo la posición del punto sobre la recta.

## 10. Definición formal

Capa `formal`: texto corto con voz y la recta al lado. Tres frases, de a una: "Cada número tiene un opuesto, a la misma distancia del cero y del otro lado." "Un número y su opuesto se cancelan: juntos dan cero." "Restar un número es lo mismo que sumar su opuesto."

Condiciones y casos especiales, verificados sobre el objeto: el cero es su propio opuesto y es el único; el opuesto del opuesto es el número de partida, que es el caminante que se dio vuelta dos veces; la distancia entre dos números no depende del orden en que se los tome; y comparar dos negativos invierte la lectura de tamaños, porque el que está más lejos del cero está más abajo (`cs.arith.negative_as_opposite_direction`, `cs.arith.sub_past_zero`).

Ya jugado: las tres frases enteras, en `concrete`. Nuevo: las palabras "opuesto" y "entero", y la afirmación de que la lista de números no tiene principio, que en el edificio es una pared que sigue.

## 11. Propiedades

- **Todo número tiene un opuesto y la suma de ambos es cero.** Ligada a la moneda y el vale que se apagan juntos.
- **El opuesto del opuesto es el número original.** Ligada al caminante que se da vuelta dos veces y avanza hacia adelante. Es la propiedad que sostiene la regla de signos del producto, que este nodo no enuncia.
- **Restar es sumar el opuesto.** Ligada a la coincidencia de que sacar un vale del mostrador y agregar una moneda mueven la cabina hacia el mismo lado y la misma cantidad.
- **El orden de los enteros es el orden de las posiciones.** Ligada a colgar fichas en el hueco: las que no se pueden enganchar en el lugar equivocado.
- **La distancia entre dos posiciones no tiene signo.** Ligada a contar pisos entre dos paradas en cualquier sentido.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: el caminante en el cero y una ficha negativa; tocar la casilla donde termina, del lado izquierdo de la pista. Los distractores se generan con la casilla simétrica del lado derecho y con casillas vecinas.
- `explain`: dos animaciones. En una el caminante se da vuelta dos veces y termina mirando hacia adelante; en la otra se da vuelta dos veces y sigue mirando hacia atrás. Tocar la que se equivoca al girar dos veces. El distractor es `negative_times_negative` en su forma más temprana.
- `manipulate`: girar la manivela hacia atrás pasando por el cero, mientras la cabina baja a los subsuelos y el mostrador anota los vales. La cabina y el saldo tienen que terminar de acuerdo.
- `apply`: dos pisos, uno arriba y otro abajo del cero; arrastrar la ficha con la distancia entre ambos, contra el tiempo objetivo del nodo.
- `generalize`: la pista pierde el ascensor y quedan solo las marcas; ordenar fichas negativas y positivas de menor a mayor, con pares de opuestos mezclados.
- `transfer`: en el plano de cuatro cuadrantes de `trig.ang.quadrant_signs`, tocar el cuadrante donde un punto tiene los dos signos indicados.

Misconceptions esperadas y su patrón ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`negative_times_negative`** (`double_flip` sobre el caminante). Es la misconception propia del nodo y aparece en cuanto el jugador extrapola de dos vueltas a un producto. El juego muestra el primer giro, el segundo giro y compara los aterrizajes: el caminante en el origen mirando a la derecha se da vuelta, avanza, se da vuelta otra vez y avanza más, y termina a la derecha del origen. La respuesta del jugador queda como bandera del lado izquierdo, donde habría terminado con un solo giro. Voz: "Te diste vuelta dos veces. ¿Hacia dónde mirás ahora?". El patrón no reabre la interacción desde el estado erróneo, porque no hay estado: hay una afirmación falsa; el ítem se reinicia desde el original.

El error de detener la cabina en la planta baja —creer que no se puede bajar más— no tiene entrada en el catálogo de L y no clasifica. Se resuelve dentro del objeto: la manivela sigue girando y el edificio continúa. Es el error más frecuente del primer nivel y merecería entrada propia; ver el reporte.

## 13. Generalización

La analogía se retira en el punto de ruptura declarado, y ese punto está muy cerca. `elevator_floors` rompe en `multiplying_floors` y `debt_ledger` en `multiplying_two_debts`: las dos sobreviven a sumar y restar con signo y ninguna tiene una acción física para multiplicar. Por eso el ascensor se va en `symbolic` —en cuanto las fichas de signo se aplican sin mirar la cabina— y no se lo trae de vuelta para el producto: el nodo que lo necesita, `arith.int.mul_signed`, no usa ninguna de las dos.

Lo que queda en su lugar es la recta que se da vuelta entera. Con `grid_stretch` en una dimensión, aplicar la ficha de signo a toda la recta la refleja alrededor del cero: cada marca pasa a su opuesta de un solo movimiento, y el cero es el único punto que no se mueve. Ese objeto sí sobrevive al punto de ruptura, porque reflejar dos veces deja la recta como estaba, y es exactamente lo que el patrón `double_flip` reproduce. La transición del ascensor a la recta reflejada es el último desvanecimiento del nodo y su criterio de salida.

Variantes sin ayuda visual, en orden: sumas y restas que cruzan el cero; comparaciones entre dos negativos; distancias entre posiciones de signos distintos; pares de opuestos escondidos en una lista que hay que cancelar antes de contar; y reflejar la recta entera y decir dónde queda una marca.

Direcciones arbitrarias. El nodo termina con pares de opuestos que no son números: girar a la izquierda y a la derecha, llenar y vaciar, entrar y salir, antes y después de un momento elegido como cero. El jugador nombra el opuesto y señala cuál sería el cero en cada caso. Se evalúa que la estructura —dos sentidos, un origen convencional, la cancelación— se reconozca con cualquier objeto.

El nodo está en `abstract` cuando el jugador opera cruzando el cero sin pedir el ascensor, ordena negativos sin dibujar la recta, elige el cero de una situación que no lo trae marcado y no confunde el trazo de la operación con el trazo del lado.

## 14. Transferencia y concepto siguiente

Los tres nodos de `transfer_to`, cada uno en otra área y con una mecánica que no se usó para aprender:

- `alg.fn.graph_as_picture` (`slope_walker`, `machine_pipe`): el plano tiene dos rectas como esta, cruzadas en el cero, y un punto se ubica con un número de cada una. Los subsuelos son la mitad de abajo del gráfico.
- `linalg.vec.vector_as_displacement` (`grid_stretch`, `gears_sequence`): una flecha hacia el otro lado es la misma flecha con el signo cambiado, y sumar dos flechas opuestas devuelve al origen. La cancelación del mostrador con dirección en dos ejes. Es el único destino de transferencia del nodo cuyas dos mecánicas coinciden con las de origen; el ítem se distingue por el área y por el objeto, no por la mecánica, y conviene revisarlo (ver el reporte).
- `trig.ang.quadrant_signs` (`sorter`, `construct`): el signo de una coordenada dice de qué lado del cero está, y el cuadrante es la combinación de dos signos. Clasificar puntos por cuadrante es la misma lectura del ascensor en dos huecos perpendiculares.

Concepto siguiente: `arith.frac.parts_and_ratio` ([08](08-arith.frac.parts_and_ratio.md)). El nodo 8 tampoco depende de este —cuelga del 6, porque su pregunta es la del reparto que no cerró— así que la frase puente abre un hueco en vez de entregar una herramienta. Narrada sobre la recta con marcas a los dos lados: "El edificio sigue para abajo y para arriba. ¿Y entre dos pisos, hay algo?". La cabina se detiene entre dos marcas, el tramo entre ellas se ilumina y empieza a partirse. Lo que el nodo 8 va a poner ahí es el mismo número que el nodo 6 dejó sin nombre.

---

**Visualización:** dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md), las dos nativas sobre el estado del jugador. `gear_walk_past_zero` corre en gramática `displace`: la manivela gira, el punto avanza sobre la recta graduada de a pasos iguales, cruza el cero sin detenerse y la parte de la recta que aparece se dibuja mientras el punto la recorre; una flecha acompaña cada paso y las flechas opuestas se superponen. Parametrizada por posición de partida y paso, produce también las instancias de `apply`. `ledger_debt_tokens` corre en gramática `partition`: monedas y vales en dos columnas enfrentadas, los pares se apagan de a uno y el saldo queda con su columna; parametrizada por cantidad de créditos y de deudas, produce las animaciones de la cancelación. Ninguna lleva texto rasterizado: los dígitos y el trazo del signo los dibuja el runtime según el locale ([P](../../P-internacionalizacion.md)). La escena del caminante que se da vuelta dos veces, que el patrón `double_flip` necesita, no está en el `manim` del nodo; ver el reporte.

**Calculadora:** en `ready` se habilita `op_neg` en el primer tier ([M](../../M-calculadora/M0-progresion.md)). No es una operación más: es lo que le da a las teclas que ya existían algo nuevo con qué operar. Hasta este nodo la calculadora no tenía ficha de número negativo, y la tecla de sumar no tenía cómo sumarlos; desde acá el mismo teclado hace algo que antes no podía. Se presenta como la ficha del trazo suelto, la misma que el jugador arrastró sobre el caminante, y aplicada dos veces a un número lo devuelve como estaba. Si el nodo decae, la tecla se dibuja con óxido y sigue funcionando.

**Edad universal:** el nodo es `literacy: none` y se juega entero sin leer ([Q](../../Q-edad-universal.md)): la cabina y la manivela se manejan con `scrub` y `drag`, el mostrador con `drag` y `tap`, la instrucción es la mano fantasma que sigue bajando cuando el edificio parecía terminarse, y `explain` se resuelve entre dos animaciones de un caminante que gira. Los números de los botones son íconos de posición, no texto, y el edificio se entiende con el sonido apagado. La numeración de la planta baja cambia por región y la analogía lo declara con sus dos variantes; el `structure_map` no cambia. Un adulto llega por diagnóstico saltando `real` e `intuition`, entra donde ya hay fichas con signo y encuentra contenido nuevo en un solo lugar: los pares de opuestos que hay que cancelar antes de contar.
