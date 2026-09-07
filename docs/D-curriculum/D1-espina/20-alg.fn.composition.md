# 20 — Encadenar máquinas (`alg.fn.composition`)

> Locale `es`: "Encadenar máquinas es componer". Minijuego: [La cadena de máquinas](../../F-minijuegos/alg.fn.composition.md).

**Nodo:** `alg.fn.composition` · **Área:** alg · **Nivel:** 3 · **Primitiva:** `compose` · **Mecánica principal:** `machine_pipe` (secundaria `gears_sequence`) · **Literacy:** `icons` · **Analogía:** `machine_chain`

## 1. Concepto

Dos máquinas conectadas por un tubo son una máquina sola. Lo que entra pasa por las dos, en orden, y el orden cambia el resultado. Al terminar, el jugador arma la cadena que produce una salida pedida, evalúa una cadena de adentro hacia afuera, y muestra con un ejemplo por qué invertir el orden da otra cosa. Antes sabía usar una máquina; no sabía que una cadena de máquinas es también una máquina, con su propio nombre.

## 2. Prerequisitos

- `alg.fn.function_as_machine` (nodo [17](17-alg.fn.function_as_machine.md)): la máquina con sus dos tuberías, la regla que le da una sola salida a cada entrada, y `f(x)`. Es el único prerequisito directo, y se usa entero: la caja, la tubería, el nombre y el invariante `same_input_same_output`, que la cadena hereda sin discusión porque cada eslabón lo cumple.

Que el único prerequisito sea el nodo 17 no es un descuido. Componer no necesita coordenadas ni pendiente: alcanza con que exista la máquina y que su salida entre en otra boca. Este nodo va después del 19 en la espina por conveniencia narrativa, no por dependencia, y quien llega por diagnóstico puede jugarlo sin haber pasado por la rampa.

## 3. Dificultad cognitiva real

Lo difícil no es hacer dos cuentas seguidas sino tres capacidades:

1. **Leer de adentro hacia afuera.** Lo escrito más cerca de la entrada actúa primero, aunque se lea al final: la escritura va en un sentido y el flujo en el otro.
2. **Aceptar que el orden no se puede intercambiar.** Sumar y después duplicar no es duplicar y después sumar. El jugador viene de la suma y la multiplicación, donde el orden no importaba, y acá esa costumbre falla.
3. **Ver la cadena entera como un objeto.** Dos máquinas en una caja son una máquina. Ese cierre permite después componer tres y hablar de la inversa de una cadena en el nodo 21.

Las tres se trabajan sobre la misma tubería. La segunda produce la mayoría de los errores y arma la evidencia de `explain`.

## 4. Problema intuitivo

Una fábrica con dos máquinas en una cinta. La primera pinta la caja; la segunda le pone una tapa. Sale un producto.

En `intuition` la escena se detiene con la caja entre las dos máquinas y pregunta, por voz o por gesto: si damos vuelta las máquinas de lugar, ¿sale lo mismo? Tres finales dibujados: sale igual; sale la tapa pintada y la caja sin pintar; la máquina de la tapa se atasca porque le llega algo que no es una caja. El jugador elige y después ve.

## 5. Analogía del mundo real

`machine_chain`, sobre `machine_pipe` ([G0](../../G-analogias/G0-reglas.md)). Mapa: tubo de una salida a una entrada → composición; orden de las máquinas → orden de composición; la cadena entera dentro de una caja → función compuesta; intercambiar las máquinas → no conmutatividad; factor de estiramiento de cada máquina → factor que después aparece en la regla de la cadena.

Invariante: `same_input_same_output` para la cadena completa. La misma entrada, con las mismas máquinas en el mismo orden, da siempre la misma salida final.

Por qué esta y no otra. Una receta conserva el orden pero esconde el valor intermedio: batir y hornear no deja ver qué había entre los dos pasos. Una fila que se pasa un mensaje conserva el orden pero mete ruido, y el ruido rompe el invariante. La tubería conserva el orden, deja el paso intermedio a la vista y no pierde nada.

Punto de ruptura: `machines_with_two_inputs`. Una máquina que mezcla dos entradas no se puede encadenar con un solo tubo. El juego lo usa como el último caso del nodo: aparece una máquina con dos bocas y el jugador descubre que le falta un tubo.

`gears_sequence` acompaña con la versión donde el resultado es un número: dos engranajes con razones distintas, cuya razón total es el producto. La cadena de máquinas dice "en qué orden"; el tren de engranajes dice "cuánto queda al final".

## 6. Mecánica de juego

Primera capa jugable: `concrete`. `machine_pipe` es la principal y da el gesto; `gears_sequence` da la lectura numérica del resultado acumulado ([E0](../../E-mecanicas/E0-catalogo.md)). Gestos: `drag` y `tap`.

1. Dos máquinas separadas sobre la mesa, cada una con su boca de entrada y su boca de salida. Un tubo suelto. Una canasta de bolas numeradas.
2. Demostración: la mano fantasma toma el tubo, lo engancha de la salida de una máquina a la entrada de la otra, y suelta una bola en la primera boca. La bola atraviesa la primera máquina, cambia dentro del tubo a la vista, entra en la segunda y sale distinta.
3. El jugador arma la cadena. El tubo solo se engancha de una salida a una entrada; si intenta unir dos salidas, el tubo se resbala y cae.
4. El jugador suelta una bola. Avanza despacio y se detiene un instante dentro del tubo, mostrando el valor intermedio; tocarla la congela.
5. El jugador intercambia las máquinas y suelta la misma bola. Las dos salidas quedan una al lado de la otra, con la bola original arriba.
6. Aparece un objetivo como bola marcada en el extremo: hay que armar la cadena que lo produce.
7. Al costado, el tren de engranajes: dos ruedas encadenadas con su razón cada una, y el contador de la última.

Nada se llama "incorrecto". La bola que sale distinta de la pedida se queda en la bandeja de salida al lado de la que se buscaba, para comparar; el tubo mal enganchado se cae; la máquina de dos bocas queda con una boca vacía y no arranca.

## 7. Representación visual

Capa `visual`, primitiva `compose` dominante ([H](../../H-progresion-abstraccion.md)).

Las máquinas se estilizan en dos rectángulos y el tubo en una flecha. Se desplaza la bola, siempre en el mismo sentido; se escala el efecto de cada máquina, como una barra que cambia de largo al pasar; se conserva el sentido del recorrido y el hecho de que la salida de una es exactamente la entrada de la otra.

Al comparar los dos órdenes, la escena se parte en dos carriles con la misma bola y las mismas cajas invertidas, y los dos recorridos avanzan sincronizados hasta que las salidas se separan.

`gears_sequence` entra en el nivel numérico: el tren son dos discos con sus razones y una manivela, y el contador de salida es el producto. Todavía no hay `f∘g` escrito, ni paréntesis anidados, ni tres máquinas.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno disparado por un gesto.

1. **Máquina → nombre.** Al tocar una caja, la regla que tenía dibujada encima se contrae en su letra, `f` o `g`, con la notación del nodo 17. Cada caja queda con su letra.
2. **Bola en el tubo → valor intermedio escrito.** Al congelar la bola dentro del tubo, aparece junto a ella lo que la primera máquina produjo, escrito con el nombre de esa máquina aplicado a la entrada: `g(x)`.
3. **Cadena → aplicación anidada.** Al soltar la bola y dejarla llegar hasta el final, la etiqueta del tubo se envuelve en la letra de la segunda máquina y queda `f(g(x))`. Los paréntesis crecen desde afuera hacia adentro, en el sentido inverso al de la bola, y ese contraste se hace notar a propósito.
4. **Cadena → una sola caja.** Al arrastrar un lazo alrededor de las dos máquinas, las dos se meten en una caja nueva con un solo tubo de entrada y uno de salida. La caja pide un nombre y el jugador la toca: la etiqueta `f∘g` aparece sobre ella, con las dos letras heredando su color.
5. **Intercambio → desigualdad escrita.** Al comparar los dos carriles con salidas distintas, entre las dos etiquetas se dibuja el signo de distinto y queda `f∘g ≠ g∘f` para ese par concreto, con las dos salidas debajo como prueba.

## 9. Notación matemática

Queda `f(g(x))` para evaluar y `f∘g` para nombrar la cadena, con `f∘g ≠ g∘f` como advertencia que el jugador ya comprobó.

Símbolo nuevo: **`f∘g`**, en la capa `symbolic` ([H](../../H-progresion-abstraccion.md)). El problema que lo hizo necesario es hablar de la cadena sin evaluarla. Con una bola concreta, `f(g(3))` alcanza; cuando la cadena se vuelve una caja que hay que comparar con otra o meter en una cadena más larga, hace falta un nombre para el objeto y no para su resultado. Sale de la caja que envuelve a las dos máquinas conectadas.

La convención de que la máquina de la derecha actúa primero es la que más cuesta, y el juego la ancla en lo único indiscutible: el orden en que la bola atraviesa las cajas. El círculo se dibuja del tamaño del tubo que quedó adentro.

## 10. Definición formal

Capa `formal`: texto corto con voz y la caja doble al lado. Tres frases, de a una: "Componer dos funciones es aplicar una y después la otra." "En `f∘g` actúa primero `g`, la que está pegada a la entrada." "El orden importa: cambiarlo suele dar otra función."

Condiciones y casos, verificados sobre el objeto: la cadena existe solo si lo que sale de la primera sirve como entrada de la segunda, y el caso contrario se ve cuando la bola no entra por la boca; la composición es asociativa, comprobable lazando tres máquinas de dos maneras; componer con la máquina que no hace nada devuelve la original; hay pares que sí conmutan, y encontrarlos no invalida la regla general.

Ya jugado: las tres frases enteras. Nuevo: la palabra "compuesta", el nombre de la asociatividad y la máquina que no hace nada como objeto con derecho propio.

## 11. Propiedades

- **La compuesta es una función.** Ligada a meter las dos máquinas en una sola caja con un tubo de entrada y uno de salida.
- **La composición no es conmutativa.** Ligada a los dos carriles con la misma bola y salidas distintas.
- **La composición es asociativa.** Ligada a lazar tres máquinas de dos maneras y obtener la misma bola de salida.
- **Componer con la máquina que no hace nada no cambia nada.** Ligada a enganchar un tubo vacío en la cadena.
- **En un tren de engranajes las razones se multiplican.** Ligada a leer el contador del tren y compararlo con el producto de los dos números de las ruedas.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: dos máquinas conectadas por una tubería; tocar la salida final para la entrada mostrada, entre cuatro bolas de resultado.
- `explain`: dos animaciones. En una, la salida de la primera máquina entra en la segunda; en la otra se saltea la primera y se aplica solo la segunda. Tocar la que olvida la máquina interior.
- `manipulate`: conectar las máquinas en el orden que produce la salida objetivo, y después invertirlas para ver que cambia.
- `apply`: un tren de engranajes con dos razones; arrastrar la ficha con la razón total del tren, contra el tiempo objetivo del nodo.
- `generalize`: las tuberías se convierten en la ficha de composición; evaluar y ordenar máquinas escritas con nombres, sin dibujo.
- `transfer`: en la grilla de `linalg.map.compose_as_multiply`, aplicar dos deformaciones seguidas y tocar la grilla que resulta.

Misconceptions y su patrón ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`chain_rule_missing_inner`**, declarada por el nodo. Acá aparece antes de que exista la derivada: el jugador evalúa la cadena aplicando solo la máquina de afuera y olvidando la de adentro, o arma el tren mirando una sola rueda. Patrón `tree_unwrap` sobre `gears_sequence`, mecánica del nodo, así que corre sin traducción: se arma el árbol de anidamiento con la rueda interior adentro de la exterior, se reproduce el orden que usó el jugador, se muestra la capa que quedó sin girar y se resalta la rueda de adentro, todavía quieta. Voz: "El engranaje de adentro también gira. ¿Cuánto por cada vuelta?". Es la de mayor severidad del nodo y su regla `detect` se completa en `calc1.deriv.rules_as_structure`.
- **`matrix_multiplication_commutes`**, anticipada desde `linalg.map.compose_as_multiply`. Aparece cuando el jugador da por sentado que el orden de las dos máquinas da igual y arma la cadena al revés. Su mecánica declarada es `grid_stretch`, que este nodo no tiene, así que se aplica la regla de L0: el patrón `two_paths_diverge` es compatible con `machine_pipe`, y la explicación corre sobre la tubería, que el jugador ya conoce. Se parte el estado inicial en dos carriles, se juega cada orden y se comparan las dos bolas de salida. Voz: "Pintar y después tapar no termina donde tapar y después pintar. ¿Cuál pide el objetivo?". Cuando el jugador llegue a la grilla, la misma explicación vuelve en su mecánica de origen.
- **`unwrap_order_inverted`**, heredada de `arith.expr.precedence_tree`. Aparece al leer `f(g(x))` de izquierda a derecha y aplicar `f` primero. Su mecánica es `chest_key`, que este nodo no declara; como el jugador ya la conoce del nodo 12, la explicación corre en los cofres y se presenta como un regreso, con `tree_unwrap`: la bola queda envuelta en dos cofres, se abre el de adentro primero como hizo el jugador y el de afuera sigue cerrado. Voz: "La capa de afuera es la máquina que está más lejos de la entrada. ¿Cuál abrimos primero?". Si el jugador no tiene el nodo 12 en `ready`, el mismo patrón corre sobre la tubería con las cajas anidadas.

## 13. Generalización

La analogía se retira en `symbolic`, como declara `machine_chain`. El disparador es la cadena de tres: con tres tubos la mesa se llena y conviene escribir. Ahí las cajas se desvanecen y quedan las letras con sus paréntesis; el tren de engranajes se queda como fantasma a demanda hasta `formal`, porque es el que sostiene la lectura numérica.

Variantes sin ayuda visual, en orden: cadenas de dos con máquinas de resta y división, donde el orden cambia mucho; cadenas de tres; cadenas donde una de las máquinas es la que no hace nada; pares que conmutan, para que el jugador no concluya que nunca conmutan; máquinas cuya salida no sirve como entrada de la siguiente, que hay que descartar antes de evaluar.

El nodo está en `abstract` cuando el jugador evalúa `f(g(x))` sin dibujar tubos, arma la cadena pedida a partir de la salida, decide si un par conmuta con un solo ejemplo, y explica la asociatividad sin lazar cajas.

## 14. Transferencia y concepto siguiente

Los cuatro nodos de `transfer_to`, en otra área y con otra mecánica de llegada:

- `calc1.deriv.rules_as_structure`: la cadena reaparece con engranajes que giran a la vez, y el factor de cada máquina se multiplica con el de la otra. Es donde `chain_rule_missing_inner` termina de definirse.
- `linalg.map.compose_as_multiply`: dos deformaciones seguidas de la grilla son una sola deformación, y el orden vuelve a importar, ahora con matrices.
- `csmath.inv.loop_invariant`: un paso de bucle aplicado muchas veces es la misma máquina encadenada consigo misma, y lo que sobrevive a la cadena es el invariante.
- `disc.rel.relation_as_arrows`: componer dos relaciones es seguir dos flechas seguidas en un diagrama, y la cadena se lee sobre el dibujo en vez de sobre la tubería.

Concepto siguiente: `alg.fn.inverse_function` ([21](21-alg.fn.inverse_function.md)). Frase puente, narrada sobre la caja doble: "Ya sabés poner una máquina detrás de otra. ¿Habrá una máquina que, puesta detrás, deje la bola como estaba?". Un tubo de retorno aparece del extremo hacia el principio y el nodo 21 empieza ahí.

---

**Visualización:** las dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md). `pipe_chain_two_machines` es nativa: las dos cajas del jugador con la bola que atraviesa y se detiene en el tubo, con el valor intermedio visible; parametrizada por las dos funciones y la entrada, produce también las dos animaciones de `explain` y los dos carriles del intercambio. `gear_train_composed_ratio` es nativa: dos ruedas encadenadas, una manivela y el contador de la última, con las razones de cada rueda a la vista; es la imagen de cheatsheet de `cs.alg.compose_inner_first`. Ninguna lleva texto rasterizado ([P](../../P-internacionalizacion.md)). Se reúsa `pipe_machine_named_f` (nodo 17) para volver de la cadena a la máquina suelta.

**Calculadora:** en `ready` se habilita `op_compose` ([M](../../M-calculadora/M0-progresion.md)), que se presenta como un tubo corto entre dos funciones ya definidas. Es una operación de función con caja de arena: devuelve una función nueva, no un número, y esa función queda disponible para volver a componer o para graficar con `op_plot`. Antes de devolver la etiqueta muestra un instante la cadena armada con la bola atravesándola, para que el orden quede a la vista.

**Edad universal:** el nodo es `icons` porque desde el segundo nivel las bolas llevan números y las cajas llevan letras. Los primeros niveles se juegan sin leer: el tubo se engancha, la bola se suelta, la comparación de órdenes es entre dos animaciones y los prompts van por voz ([Q](../../Q-edad-universal.md)). Un adulto llega por diagnóstico salteando `real` e `intuition`, entra en el nivel de nombres y usa el teclado de fichas para armar cadenas escritas en vez de enganchar tubos.
