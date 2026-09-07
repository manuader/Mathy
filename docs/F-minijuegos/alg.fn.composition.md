# La cadena de máquinas (`alg.fn.composition`)

Minijuego del nodo 20 de la espina, "Encadenar máquinas es componer". Mecánica principal `machine_pipe`, secundaria `gears_sequence`; analogía `machine_chain`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/20-alg.fn.composition.md): un concepto, tres dificultades reales (leer de adentro hacia afuera, aceptar que el orden no se intercambia, ver la cadena como un objeto), una analogía, un gesto (enganchar el tubo y soltar la bola), cinco pasos de desvanecimiento, la tubería con el valor intermedio visible como visualización dominante, retiro en `symbolic`. Acá se fija cómo se juega.

## Analogía

Dos máquinas sobre una mesa, cada una con su boca de entrada y su boca de salida, y un tubo que va de la salida de una a la entrada de la otra. Lo que entra pasa por las dos, en orden.

Mapa objeto → concepto: tubo de una salida a una entrada → composición; orden de las máquinas → orden de composición; la cadena entera dentro de una caja → función compuesta; intercambiar las máquinas → no conmutatividad; factor de estiramiento de cada máquina → factor que aparece después en la regla de la cadena; bola congelada dentro del tubo → valor intermedio.

La analogía conserva `same_input_same_output` para la cadena completa: la misma bola, con las mismas máquinas en el mismo orden, da siempre la misma salida. Punto de ruptura: `machines_with_two_inputs`. Una máquina que mezcla dos entradas no se encadena con un solo tubo, y el juego la muestra al final del nodo con una boca vacía ([G0](../G-analogias/G0-reglas.md)).

`gears_sequence` acompaña con la versión numérica: dos ruedas encadenadas cuya razón total es el producto. La tubería dice "en qué orden"; el tren dice "cuánto queda al final".

## Mecánica central

Superficie: las dos máquinas en el centro con el tubo entre ellas, la canasta de bolas a la izquierda, la bandeja de salida a la derecha, el tren de engranajes abajo desde la capa `visual`. Gestos: `drag` y `tap` ([E0](../E-mecanicas/E0-catalogo.md)).

- **Enganchar el tubo.** Solo se engancha de una salida a una entrada. Si el jugador intenta unir dos salidas, el tubo se resbala y cae.
- **Soltar una bola en la primera boca.** Avanza despacio, atraviesa la primera máquina, se detiene un instante dentro del tubo mostrando el valor intermedio, entra en la segunda y sale distinta.
- **Tocar la bola en el tubo.** La congela para mirar el valor intermedio todo el tiempo que haga falta.
- **Intercambiar las máquinas de lugar.** La escena guarda la salida anterior y suelta la misma bola por el nuevo orden. Las dos salidas quedan una al lado de la otra, con la bola original arriba.
- **Lazar las dos máquinas.** Un trazo alrededor de las dos las mete en una caja nueva con un solo tubo de entrada y uno de salida.
- **Girar la manivela del tren.** Las dos ruedas giran encadenadas y el contador de la última muestra el resultado del tren.

En `symbolic` la superficie cambia de forma, no de reglas: soltar la bola es evaluar de adentro hacia afuera, lazar es escribir la etiqueta de la cadena, e intercambiar es escribir la desigualdad entre las dos etiquetas. La tubería se pide con un toque y aparece como fantasma.

## Invariante matemático

`same_input_same_output`, heredado de `machine_pipe` y aplicado a la cadena entera. La cadena es una función porque cada eslabón lo es.

Se ve romperse de dos maneras. Si el jugador saltea la primera máquina y suelta la bola directamente en la segunda, la bola sale distinta de la pedida y queda en la bandeja al lado de la que se buscaba, para comparar. Si el tubo está mal enganchado, se cae y la bola no llega a la segunda máquina.

El invariante del tren, `same_step_every_turn`, sostiene la lectura numérica: cada vuelta de la manivela produce siempre el mismo avance en la última rueda. Se ve romperse cuando el jugador cambia una rueda a mitad de giro y el contador salta.

Un movimiento válido pero inútil, como componer con la máquina que no hace nada o soltar dos veces la misma bola, no rompe nada. Recibe un empujón suave, no una explicación.

## Representación visual

Primitiva dominante `compose`, de apoyo `displace` ([H](../H-progresion-abstraccion.md)).

- `real` e `intuition`: la cinta de la fábrica con la máquina que pinta y la que pone la tapa. Solo se mira y se predice.
- `concrete`: dos máquinas con sus bocas, un tubo suelto, bolas numeradas, canasta y bandeja.
- `visual`: las máquinas se estilizan en dos rectángulos y el tubo en una flecha; el efecto de cada máquina se ve como una barra que cambia de largo al pasar la bola. Comparar órdenes parte la escena en dos carriles sincronizados. Abajo, el tren con sus dos discos y sus razones.
- `symbolic`: letras `f` y `g` sobre las cajas, `g(x)` en el tubo, `f(g(x))` en la salida, `f∘g` sobre la caja lazada, `f∘g ≠ g∘f` entre los dos carriles.
- `formal`: la definición corta con voz; la caja doble al lado y las tres máquinas lazadas de dos maneras para la asociatividad.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables:

1. Máquina → nombre: al tocar una caja, la regla dibujada encima se contrae en su letra, con la notación del nodo 17.
2. Bola en el tubo → valor intermedio escrito: al congelar la bola, aparece junto a ella `g(x)`, lo que produjo la primera máquina.
3. Cadena → aplicación anidada: al dejar llegar la bola al final, la etiqueta del tubo se envuelve en la letra de la segunda y queda `f(g(x))`. Los paréntesis crecen de afuera hacia adentro, en sentido contrario al de la bola, y el contraste se hace notar a propósito.
4. Cadena → una sola caja: al lazar las dos máquinas, la caja nueva pide un nombre y aparece `f∘g` sobre ella, con las letras heredando su color.
5. Intercambio → desigualdad escrita: al comparar los dos carriles con salidas distintas, entre las dos etiquetas se dibuja el signo de distinto y queda `f∘g ≠ g∘f` para ese par, con las dos salidas debajo como prueba.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre la caja doble: componer dos funciones es aplicar una y después la otra; en `f∘g` actúa primero `g`, la que está pegada a la entrada; el orden importa, y cambiarlo suele dar otra función.

Propiedades: la compuesta es una función; la composición no es conmutativa; es asociativa; componer con la máquina que no hace nada no cambia nada; en un tren de engranajes las razones se multiplican. Casos: la cadena existe solo si lo que sale de la primera sirve como entrada de la segunda; hay pares que sí conmutan, y encontrarlos no invalida la regla general.

Símbolo nuevo: `f∘g`, nacido del problema de hablar de la cadena sin evaluarla. Con una bola concreta `f(g(3))` alcanza; cuando la cadena se vuelve una caja que hay que comparar o meter en otra cadena, hace falta un nombre para el objeto y no para su resultado.

## Generalización

La tubería se retira en `symbolic`, con un disparador concreto: con tres máquinas y tres tubos la mesa se llena y conviene escribir. El tren de engranajes se queda como fantasma a demanda hasta `formal`, porque sostiene la lectura numérica.

Variantes sin ayuda visual: cadenas de dos con resta y división, donde el orden cambia mucho; cadenas de tres; cadenas con la máquina que no hace nada; pares que conmutan, para que el jugador no concluya que nunca conmutan; máquinas cuya salida no sirve como entrada de la siguiente, que hay que descartar antes de evaluar. La analogía se eliminó cuando el jugador evalúa `f(g(x))` sin dibujar tubos, arma la cadena pedida a partir de la salida, decide si un par conmuta con un solo ejemplo y explica la asociatividad sin lazar cajas.

## Desafío

Correspondencia con el ejemplo de cofres de [H](../H-progresion-abstraccion.md): el cofre dentro del cofre, que allí es el nivel 3, es la misma estructura de anidamiento que acá se juega con dos máquinas, pero con el sentido invertido. En los cofres se abre de afuera hacia adentro; acá se evalúa de adentro hacia afuera. El minijuego usa esa oposición a propósito en el nivel 6, donde el cofre del nodo 12 aparece al lado de la cadena.

Siete niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Pintar y tapar.** `real`, `recognize`. La cinta corre sola y el jugador mira.
2. **¿Y si las damos vuelta?** `intuition`, `explain`. La escena se detiene y hay que elegir entre tres finales.
3. **Enganchar el tubo.** `concrete`, `manipulate`. Dos máquinas de sumar y restar, bolas de un dígito, un solo objetivo por instancia.
4. **El orden importa.** `concrete`, `explain` y `manipulate`. Parámetros: una máquina de sumar y una de multiplicar, que es el par donde el intercambio se nota más. Aparecen los dos carriles.
5. **El tren de engranajes.** `visual`, `manipulate` y `apply`. Misma dificultad numérica; el resultado se lee en el contador y hay que anticiparlo antes de girar.
6. **Nombres y paréntesis.** `symbolic` primera mitad, `manipulate` y `apply`. Aparecen las letras, el valor intermedio escrito y la caja lazada. El cofre del nodo 12 aparece al costado para contrastar el sentido de lectura.
7. **Cadenas de tres.** `symbolic` segunda mitad, `formal` y `abstract`, `apply` y `generalize`. Parámetros: tres máquinas, resta y división entre ellas, pares que conmutan mezclados con pares que no, y máquinas cuya salida no entra en la siguiente.

Qué endurece cada parámetro: la mezcla de sumar y multiplicar hace visible la no conmutatividad; la resta y la división rompen la simetría que quedaba; la tercera máquina obliga a escribir porque la mesa no alcanza; los pares que sí conmutan impiden memorizar "nunca da igual"; las máquinas incompatibles obligan a mirar antes de evaluar.

Desafíos de olimpíada: el nodo no aparece todavía en ningún `requires` de [S](../S-desafios/S0-desafios.md), así que no exige desafío para `mastered`. Cuando existan los desafíos de funciones, la cadena entrará como estructura oculta de problemas donde un dato pasa por dos reglas seguidas.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: dos máquinas conectadas por una tubería y la entrada 4; tocar la salida final entre cuatro bolas de resultado.
- `explain`: dos animaciones. En una la salida de la primera máquina entra en la segunda; en la otra se saltea la primera y se aplica solo la segunda. Tocar la que olvida la máquina interior. El distractor elegido clasifica.
- `manipulate`: una salida objetivo y dos máquinas sueltas; conectarlas en el orden que la produce, y después invertirlas para ver que cambia.
- `apply`: un tren de engranajes con dos razones; arrastrar la ficha con la razón total, contra el tiempo objetivo del nodo.
- `generalize`: sin tubos, tres cadenas escritas con nombres; evaluarlas y ordenarlas de menor a mayor salida para la misma entrada.
- `transfer`: en la grilla de `linalg.map.compose_as_multiply`, aplicar dos deformaciones seguidas y tocar la grilla que resulta.

Misconceptions esperadas ([L0](../L-modelo-errores/L0-taxonomia.md)):

- `chain_rule_missing_inner`, declarada por el nodo, patrón `tree_unwrap` sobre `gears_sequence`, mecánica del nodo, así que corre sin traducción. Acá aparece antes de la derivada: el jugador evalúa aplicando solo la máquina de afuera, o arma el tren mirando una sola rueda. Se arma el árbol de anidamiento con la rueda interior adentro de la exterior, se reproduce el orden del jugador, la capa sin girar queda a la vista y la rueda de adentro se resalta, todavía quieta. Voz: "El engranaje de adentro también gira. ¿Cuánto por cada vuelta?". Es la de mayor severidad del nodo.
- `matrix_multiplication_commutes`, anticipada desde `linalg.map.compose_as_multiply`. Su mecánica declarada es `grid_stretch`, que este nodo no tiene, así que se aplica la regla de L0: el patrón `two_paths_diverge` es compatible con `machine_pipe` y la explicación corre sobre la tubería, que el jugador ya conoce. Se parte el estado inicial en dos carriles, se juega cada orden y se comparan las salidas. Voz: "Pintar y después tapar no termina donde tapar y después pintar. ¿Cuál pide el objetivo?".
- `unwrap_order_inverted`, heredada de `arith.expr.precedence_tree`. Aparece al leer `f(g(x))` de izquierda a derecha y aplicar `f` primero. Su mecánica es `chest_key`, que este nodo no declara; como el jugador ya la conoce del nodo 12, la explicación corre en los cofres y se presenta como un regreso, con `tree_unwrap`. Voz: "La capa de afuera es la máquina que está más lejos de la entrada. ¿Cuál abrimos primero?". Si el nodo 12 no está en `ready`, el mismo patrón corre sobre la tubería con las cajas anidadas.

Los distractores de `explain` y las opciones de `apply` se generan desde estas reglas y desde las del prerequisito directo.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `pipe_chain_two_machines`, nativa. Las dos cajas del jugador, la bola que las atraviesa y se detiene en el tubo con el valor intermedio visible, y el intercambio de orden con las dos salidas comparadas; gramática `compose`. Parametrizada por las dos funciones y la entrada, produce también las dos animaciones de `explain` y los dos carriles.
- `gear_train_composed_ratio`, nativa. Dos ruedas encadenadas, una manivela y el contador de la última, con las razones de cada rueda a la vista. Abre el nivel 5 y es la imagen de cheatsheet de `cs.alg.compose_inner_first`.
- Reusada: `pipe_machine_named_f` (nodo 17), para volver de la cadena a la máquina suelta al abrir el nivel 3.
- Ninguna lleva texto rasterizado: las letras y los números los dibuja el runtime según el locale ([P](../P-internacionalizacion.md)).

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_machine_chain`: `length` (2 en los niveles 3 a 6, 3 en el 7); `ops` (subconjunto de sumar, restar, multiplicar, dividir, con resta y división desde el nivel 7); `operand_range`; `input_range`; `commuting_pair` (booleano, para mezclar pares que sí conmutan desde el nivel 7); `include_identity`; `seed`.
- `gen_gear_train`: `ratio_a` y `ratio_b` como razones simples; `turns`; `show_counter` (falso cuando el jugador tiene que anticipar).
- `gen_incompatible_chain`: cadenas donde la salida de la primera no sirve como entrada de la segunda, con una sola incompatibilidad por instancia y su motivo declarado.

**Literacy soportada:** de `icons` a `full_text`. Los niveles 1 a 3 se juegan sin leer, pero desde el nivel 4 las bolas llevan números y desde el 6 las cajas llevan letras, y por eso el mínimo es `icons`. En `full_text` la definición corta se muestra escrita además de narrada.

**Instrucción por demostración:** la primera vez, una mano fantasma toma el tubo, lo engancha de la salida de una máquina a la entrada de la otra y suelta una bola. La escena vuelve al inicio y el tubo late. Se repite solo si el jugador se queda quieto. La demostración de lazar las dos máquinas es aparte y se hace una vez, al entrar en el nivel 6 ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
