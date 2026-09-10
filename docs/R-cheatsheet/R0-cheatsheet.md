# R0. Cheatsheet incremental

La cheatsheet es la memoria escrita de Mathy. Empieza vacía, como la calculadora de
[M0](../M-calculadora/M0-progresion.md), y crece nodo a nodo a medida que el jugador
avanza por el grafo. No enseña nada nuevo: guarda lo que el juego ya mostró, para que
nadie tenga que memorizar una fórmula de memoria muscular ni buscarla afuera del juego.
Está siempre disponible, nunca se bloquea y es la misma herramienta para un chico de
seis años que empieza a contar y para un adulto que repasa cálculo en dos variables.

Este documento explica qué es una entrada, cuándo se agrega, los seis tipos que existen,
cómo se organiza y se busca, dónde aparece, cómo se relaciona con la calculadora, qué
pasa en los niveles sin lectura, cómo se traduce y cómo se escribe una entrada nueva. Los
datos completos viven en [`cheatsheet_entries.yaml`](cheatsheet_entries.yaml); los
títulos y los cuerpos narrables, en
[`locales/es/cheatsheet.yaml`](../locales/es/cheatsheet.yaml).

## 1. Qué es

La cheatsheet es un registro creciente de hechos matemáticos que el jugador ya vio
jugar: fórmulas, reglas, definiciones, teoremas, estrategias y ejemplos. Cada entrada
nace de un nodo del grafo de conocimiento y queda para siempre, salvo que el nodo que la
originó se oxide (sección 6). No es un libro de texto ni un tutorial: no explica nada que
el jugador no haya manipulado antes con sus manos. Es, literalmente, una chuleta: el
tipo de acordeón que un estudiante llevaría a un examen, pero construido en vivo por el
propio recorrido del jugador, y no copiado de ningún lado.

La diferencia con un glosario es que la cheatsheet no es una lista fija de temas del
curriculum. Es un espejo de la experiencia de cada jugador: dos personas en el mismo
nivel pueden tener cheatsheets distintas si llegaron por caminos distintos, porque el
orden de aparición sigue el orden en que cada quien jugó los nodos, no un índice
prefijado por un libro.

## 2. La regla de agregado

Una entrada se agrega la primera vez que el jugador alcanza la capa `symbolic` o
`formal` del nodo que la declara, la que llegue primero. No se agrega en `ready` ni en
`mastered`. La razón es que `ready` es un estado de dominio ([K](../K-evaluacion.md)):
mide si el jugador puede reconocer, explicar, manipular, aplicar, generalizar y
transferir el concepto con evidencia suficiente. Eso puede tardar varias sesiones y
varios repasos. La cheatsheet, en cambio, registra exposición a la notación o a la
definición, no dominio de ella. Si esperara a `ready`, un jugador que recién vio la
fórmula del área del trapecio y todavía no la domina no tendría dónde consultarla
mientras practica, que es exactamente cuando más la necesita.

Esto también explica por qué la cheatsheet no exige texto para existir. Las capas
`real`, `intuition`, `concrete` y `visual` de [H](../H-progresion-abstraccion.md) se
juegan enteramente con objetos, sin símbolos todavía. Recién en `symbolic` aparece la
notación (el signo, la fórmula, la palabra), y ahí es donde tiene sentido guardar algo
por escrito. En los nodos que además declaran una capa `formal` con una definición o una
condición de validez, la entrada se enriquece cuando el jugador llega a esa capa
(sección 8): la imagen de niveles bajos no se reemplaza, se le agrega el texto debajo.

El campo `cheatsheet` de cada nodo, en los archivos de
[`C-knowledge-graph/graph`](../C-knowledge-graph/), declara qué entradas agrega ese nodo
en particular. Un nodo puede declarar más de una entrada (una fórmula y una estrategia
que nacen del mismo aprendizaje) y una entrada puede nacer de varios nodos distintos,
cuando dos áreas del curriculum enseñan el mismo hecho por caminos diferentes: es la
misma lógica de `unlock_rule: any_ready` que usa la calculadora en
[M0](../M-calculadora/M0-progresion.md). Por ejemplo, "las potencias de la matriz de
adyacencia cuentan caminos" nace tanto en el área de grafos como en álgebra lineal, y es
una sola entrada con dos nodos en `added_by`.

## 3. Seis tipos de entrada

Cada entrada declara un `kind` entre seis valores.

**Fórmula.** Una igualdad o una expresión que se calcula. Ejemplo: el área del círculo,
`A = πr²`. El cuerpo narrable dice qué representa cada símbolo: "A es el área, r es el
radio, π es la razón entre la vuelta del círculo y su diámetro".

**Regla.** Un procedimiento corto y mecánico que no admite excepciones dentro de su
dominio. Ejemplo: "dividir por una fracción es multiplicar por su vuelta". Una regla se
aplica siempre igual, sin que el jugador tenga que decidir nada.

**Definición.** Qué es una cosa, sin ninguna condición de validez que verificar.
Ejemplo: "el dominio son las entradas, la imagen son las salidas". Una definición nombra
un objeto o una relación que el jugador ya construyó con las manos.

**Teorema.** Una afirmación general junto con la condición bajo la que vale. Ejemplo: el
teorema de Pitágoras, `a² + b² = c²`, vale únicamente cuando el ángulo entre los catetos
es recto. El cuerpo narrable de un teorema siempre incluye esa condición: sin ella, el
teorema se convertiría en una fórmula que el jugador aplicaría mal fuera de su dominio.

**Estrategia.** Una heurística: cuándo conviene probar qué. Ejemplo: "si falta un dato
de un triángulo o un trapecio, trazá la altura". Una estrategia no garantiza el
resultado como una regla; sugiere el primer movimiento cuando no es obvio por dónde
empezar, y es el tipo de entrada que más se usa en los desafíos de
[S](../S-desafios/S0-desafios.md).

**Ejemplo.** Un caso concreto que vale la pena recordar porque aparece todo el tiempo.
Ejemplo: los valores de seno y coseno en 0°, 30°, 45°, 60° y 90°, o las ternas
pitagóricas 3-4-5 y 5-12-13. Un ejemplo no generaliza nada por sí mismo; es una tabla
de referencia rápida.

De las 543 entradas que declaran los nodos del grafo, 535 quedan como entradas
canónicas y 8 se fusionan como alias de una entrada hermana, cuando dos áreas
declararon el mismo hecho exacto por caminos distintos (sección 5). Entre las
canónicas, definición es el tipo más común, seguido de fórmula y regla; estrategia y
teorema aparecen con fuerza en geometría, trigonometría y cálculo; ejemplo es el tipo
menos frecuente, reservado para tablas de valores que conviene tener a mano.

## 4. Organización

### 4.1 Árbol por tema

Las entradas se agrupan en un árbol de temas de dos niveles: un tema general (números,
ecuaciones, funciones, geometría, trigonometría, números complejos, cálculo, cálculo en
varias variables, álgebra lineal, probabilidad y estadística, matemática discreta,
matemática de la computación, matemática avanzada) y, dentro de varios de ellos, subtemas
más finos (geometría se abre en ángulos, triángulos, área, círculos, sólidos, y así
siguiendo). El árbol vive en el campo `topics` de
[`cheatsheet_entries.yaml`](cheatsheet_entries.yaml), con un `order` que fija en qué
posición aparece cada tema dentro de su padre. El árbol no es el curriculum completo de
[D](../D-curriculum/): es una reorganización pensada para que un jugador busque por
concepto matemático, no por la secuencia en la que lo jugó.

### 4.2 Orden de aparición

Además del árbol por tema, la cheatsheet ofrece un orden por aparición: las entradas
listadas en el momento exacto en que se agregaron, más recientes primero. Es la vista
que más rápido resuelve "¿qué fue eso que acabo de ver?", porque no exige saber en qué
tema clasificarlo.

### 4.3 Búsqueda

La pantalla de cheatsheet, descripta en la sección 3.7 de [N](../N-ux-ui.md), tiene un
campo de búsqueda que filtra por título mientras el jugador escribe. La búsqueda no
alcanza a los cuerpos narrables completos, solo a los títulos, para que el resultado sea
inmediato y no dependa de una coincidencia de palabra suelta en medio de una frase larga.

### 4.4 Relacionadas

Cada entrada puede declarar otras entradas relacionadas, en el campo `related`. La
relación no es fusión: dos entradas relacionadas siguen siendo dos hechos distintos, que
conviene mirar juntos porque comparten una estructura profunda. El ejemplo que atraviesa
todo el diseño es Pitágoras, la fórmula de la distancia entre dos puntos y el círculo
unitario: las tres son, en el fondo, el mismo triángulo rectángulo con la hipotenusa
distinta, pero cada una vive en su propio nodo, con su propia mecánica y su propio
momento de aparición, y fusionarlas perdería esa diferencia pedagógica. El campo
`related` es en cambio el lugar correcto para señalar el parentesco sin borrar la
distinción. Las relaciones se construyeron simétricas: si A señala a B, B también señala
a A.

### 4.5 Volver a jugar esto

Toda entrada tiene un botón "volver a jugar esto", que abre directamente el minijuego
del primer nodo que la agregó (el campo `play_again`). Es la contracara de la
consulta: la cheatsheet no solo recuerda, también ofrece el camino de vuelta a la
experiencia donde ese hecho se volvió cierto. Un jugador que mira una fórmula y no la
reconoce puede, con un toque, volver a la escena donde esa fórmula nació de manipular un
objeto, en vez de leer una explicación nueva.

## 5. Fusiones

Cuatro autores del grafo, trabajando en paralelo sobre áreas distintas, en ocho casos
declararon exactamente el mismo hecho desde nodos distintos. Cuando la coincidencia es
literal (el mismo objeto matemático, no solo un tema parecido), la entrada se fusiona:
queda una sola entrada canónica y las demás pasan a `aliases`, apuntando a ella. Los
ocho casos son: las potencias de la matriz de adyacencia (grafos y álgebra lineal), el
triángulo de Pascal (discreta y precálculo), la ecuación diferencial separable (cálculo
2 y avanzada), `i² = -1` (precálculo y avanzada), la fórmula de Euler `e^{iθ} = cos θ +
i sen θ` (trigonometría y avanzada), la longitud de un vector (precálculo y álgebra
lineal), la suma de vectores por componentes (precálculo y álgebra lineal), y la fórmula
`V − E + F = 2` (geometría de sólidos y grafos planos).

El criterio para no fusionar es igual de importante. Pitágoras, la distancia entre dos
puntos y el círculo unitario comparten estructura pero no son el mismo objeto: viven en
`related`, no en `aliases`. Lo mismo pasa con "la misma acción a los dos lados",
repetida con lenguaje propio en la balanza de ecuaciones, en las llaves de una variable
y en las congruencias modulares: son la misma idea general vestida tres veces con
objetos distintos, y cada vestidura tiene valor pedagógico propio. Fusionar de más
haría desaparecer justamente la repetición con variación que ayuda a reconocer la
estructura común.

## 6. Uso dentro del juego

La cheatsheet se abre desde el mismo ícono de la barra de herramientas en toda
actividad, junto con la calculadora y el objeto concreto a demanda
(sección 3 de [N](../N-ux-ui.md)). Se despliega en un panel lateral que ocupa como
máximo el 40 % del ancho de la pantalla en teléfono, y nunca tapa el objeto que el
jugador está manipulando: el canvas se achica, no desaparece. En tablet es una columna
permanente. Cerrar el panel devuelve exactamente al mismo punto de la actividad; abrir
la cheatsheet nunca cuenta como abandonar el ejercicio en curso.

En los desafíos de [S](../S-desafios/S0-desafios.md) la cheatsheet no espera a que el
jugador la pida: está abierta desde el principio, con las entradas pertinentes al
problema resaltadas. Es una decisión de diseño explícita, presente desde el pedido
original de estos niveles: en un desafío de olimpíada nadie tiene que recordar de
memoria la fórmula del área del trapecio, porque el desafío real es notar que falta la
altura y construirla, no repetir una fórmula. El campo `cheatsheet_refs` de cada
desafío no restringe lo que se puede ver; solo indica qué entradas conviene destacar
primero.

La cheatsheet nunca se bloquea y nunca se revoca. Una vez que una entrada existe, sigue
ahí para siempre, incluso si el nodo que la originó decae con el tiempo
([K](../K-evaluacion.md)). Lo único que cambia es la textura: una entrada cuyo nodo está
`decayed` se dibuja con óxido, la misma señal visual que usa el mapa y la calculadora. El
óxido no castiga ni esconde la información: la fórmula se sigue leyendo bien. Es una
invitación a repasar, no un candado, y basta con que el nodo vuelva a `ready` para que
desaparezca.

## 7. Relación con la calculadora

La cheatsheet y la calculadora ([M0](../M-calculadora/M0-progresion.md)) nacen del mismo
gesto de diseño: convertir el progreso del jugador en algo visible y útil, en vez de en
puntos que no sirven para nada. Crecen con los mismos nodos y se abren desde el mismo
lugar, pero hacen cosas distintas y complementarias: **la cheatsheet recuerda, la
calculadora ejecuta.**

La cheatsheet guarda la fórmula del área del trapecio y la estrategia de trazar la
altura cuando falta un dato. La calculadora, en cambio, calcula el área en cuanto el
jugador le da las medidas, sin aplicar la fórmula a mano otra vez. Muchas entradas de
fórmula tienen una tecla asociada, y el jugador pasa de una a la otra con un toque:
tocar la tecla abre la entrada que la explica, tocar la entrada sugiere la tecla que la
ejecuta. Pero la cheatsheet tiene además todo lo que ninguna tecla puede ejecutar:
teoremas con su condición de validez, definiciones, estrategias completas. Nada de eso
se aprieta; es conocimiento que se consulta antes de decidir qué operación usar.

## 8. Edad universal

La cheatsheet sigue las mismas reglas de edad universal que el resto del juego
([Q](../Q-edad-universal.md)). En los niveles 0 a 2, cuando el jugador todavía no lee o
recién empieza, una entrada nueva no es un párrafo: es una imagen fija con voz narrada,
por ejemplo la balanza con las dos pesas ya quitadas, o la baldosa que muestra que
`3 × 4` es un rectángulo de tres filas por cuatro columnas. El campo `display` de esas
entradas vale `image:<asset_id>` en vez de una fórmula o de texto. Cuando el mismo nodo
declara además una capa `formal` con una definición corta, ese texto se agrega debajo de
la imagen apenas el jugador la alcanza, nunca antes y nunca en reemplazo: la cheatsheet
de un niño y la de un adulto terminan siendo el mismo objeto, visto en dos momentos
distintos del mismo recorrido.

El campo `literacy_min` de cada entrada indica cuánta lectura hace falta para
aprovecharla sin ayuda, heredado directamente de la exigencia de lectura del nodo que la
originó. Una entrada con `literacy_min: none` se sostiene entera con la imagen y la voz;
una con `full_text` asume que el jugador ya lee definiciones completas. El selector de
[J](../J-adaptativo.md) no oculta ninguna entrada por esto, porque la cheatsheet nunca es
una actividad evaluada: solo la voz, activada al tocar y sostener en perfiles sin
lectura, adapta cómo se accede a lo mismo.

## 9. Localización

Toda entrada de fórmula, regla, teorema o ejemplo con notación se escribe en la
cheatsheet en su forma abstracta, la misma idea de `MathJSON` que usa
`calculator_ops.yaml` en [M0](../M-calculadora/M0-progresion.md). Esa forma abstracta se
viste con el `MathLocale` correspondiente al dibujarse en pantalla
([P](../P-internacionalizacion.md)): un jugador en Buenos Aires lee `sen`, `tg` y
`3,14`; uno en Boston lee `sin`, `tan` y `3.14`. El campo `locale_dependent` marca las
entradas cuyo símbolo cambia de verdad con el `MathLocale`, más allá del separador
decimal que afecta a cualquier número: las razones trigonométricas, la multiplicación y
la división, y las conversiones de unidades, entre otras. El corpus de verificación de
[P](../P-internacionalizacion.md) incluye cada una de esas entradas con su render
esperado por locale.

Los títulos y los cuerpos narrables, en cambio, son texto en un idioma concreto, y viven
en claves de locale (`cheatsheet.<id>.title`, `cheatsheet.<id>.body`) dentro de
[`locales/es/cheatsheet.yaml`](../locales/es/cheatsheet.yaml). Un locale nuevo traduce
esas claves; no toca `cheatsheet_entries.yaml`, que es el mismo para todos los idiomas.
Los nombres de los temas del árbol siguen la misma separación: la estructura
(`topic.geometry.area`) es universal, el nombre visible (`Área, perímetro y volumen`) es
una clave de locale.

## 10. Cómo se autora una entrada

Escribir una entrada nueva sigue un checklist corto:

- **Un solo hecho por entrada.** Una entrada de fórmula trae una sola igualdad, no una
  familia de fórmulas relacionadas. Si un nodo enseña dos hechos separables (la fórmula
  del área y la estrategia para encontrar la altura que falta), son dos entradas, no
  una con dos ideas mezcladas.
- **Un símbolo con historia.** Todo símbolo que aparece en el `display` de una entrada
  ya tiene que haber aparecido en el nodo que la declara, en la capa `symbolic` o antes.
  La cheatsheet no introduce notación nueva por su cuenta.
- **Enlace al nodo.** Toda entrada declara al menos un nodo en `added_by`, y el primero
  de esa lista es el destino de "volver a jugar esto". Si dos nodos enseñan el mismo
  hecho, se listan los dos, en vez de duplicar la entrada.
- **Kind correcto.** Antes de escribir el cuerpo, conviene decidir si lo que se está
  guardando es una fórmula que se calcula, una regla mecánica, una definición sin
  condiciones, un teorema con una condición de validez, una estrategia para decidir el
  primer paso, o un ejemplo memorable. El tipo elegido decide qué tiene que aparecer en
  el cuerpo narrable.
- **Cuerpo compacto y completo.** Una fórmula explica qué representa cada símbolo. Un
  teorema enuncia la afirmación y su condición de validez, nunca solo una de las dos.
  Una estrategia dice cuándo conviene usarla, con un ejemplo breve si hace falta. Todo
  en una a tres frases, escritas para narrarse en voz alta.

## 11. Lo que no es

**No es un tutorial.** No explica un concepto que el jugador no jugó antes; solo
registra lo que ya jugó. Si un nodo no está en `symbolic` ni en `formal`, su entrada
simplemente no existe todavía.

**No evalúa nada.** Consultar la cheatsheet, ni durante una actividad ni durante un
desafío, no genera evidencia de ningún verbo de [K](../K-evaluacion.md). No hay
penalidad por mirarla ni premio por no hacerlo.

**No se bloquea ni se revoca.** A diferencia del mapa, donde un nodo puede pasar de
`ready` a `decayed`, ninguna entrada desaparece ni se oculta. El óxido es la única señal
de decaimiento, y es puramente visual.

**No reemplaza a la calculadora.** No calcula nada por el jugador. Guarda la fórmula del
área; no calcula el área de un rectángulo dado.

**No sale del dispositivo.** El contenido de la cheatsheet de un perfil no se comparte
con otros perfiles del mismo dispositivo ni se sube a ningún servidor más allá de la
sincronización opcional de progreso ([Q](../Q-edad-universal.md)).

## 12. Tabla resumen por tema

Conteos sobre las 535 entradas canónicas, agrupadas por tema general. "Primer nodo"
es, dentro de cada tema, el nodo de menor nivel que agrega alguna de sus entradas.

| Tema | Entradas | Primer nodo que abre el tema |
|---|---:|---|
| Números | 60 | `arith.add.combine_groups` ("Juntar dos montones", nivel 1) |
| Ecuaciones | 22 | `prealg.var.unknown_as_box` ("La incógnita es una caja cerrada", nivel 2) |
| Funciones | 45 | `prealg.pat.rule_from_table` ("Descubrir la regla del paso", nivel 2) |
| Álgebra | 19 | `prealg.expr.like_terms` ("Solo se juntan cajas iguales", nivel 2) |
| Geometría | 50 | `geom.angle.turn_as_measure` ("El ángulo es un giro", nivel 1) |
| Trigonometría | 33 | `trig.ratio.similar_shadows` ("Razones que no cambian", nivel 3) |
| Números complejos | 9 | `precalc.cplx.plane_intro` ("i es un cuarto de giro", nivel 4) |
| Cálculo | 92 | `precalc.lim.continuity_unbroken_pen` ("Continua: sin levantar el lápiz", nivel 4) |
| Cálculo en varias variables | 26 | `mvcalc.line.conservative_path_independent` ("Campo conservativo ignora el camino", nivel 7) |
| Álgebra lineal | 45 | `precalc.vec.arrow_2d_intro` ("Flechas en la grilla", nivel 4) |
| Probabilidad y estadística | 44 | `prob.basic.union_intersection` ("Unión e intersección de eventos", nivel 6) |
| Matemática discreta | 38 | `graph.basic.graph_and_paths` ("Puntos unidos por líneas", nivel 1) |
| Matemática de la computación | 18 | `csmath.bin.place_value_binary` ("Contar con dos dedos", nivel 3) |
| Matemática avanzada | 26 | `adv.alg.group_as_reversible_actions` ("Grupo: acciones que se deshacen", nivel 7) |

El tema con más entradas es cálculo, porque agrupa límites, derivadas, integrales,
series y ecuaciones diferenciales, cuatro subtemas grandes del curriculum de nivel 4 en
adelante. El más chico es números complejos, que recién arranca en precálculo y no se
expande tanto como para necesitar más de cuatro subtemas.

## 13. Verificación

- `cheatsheet_entries.yaml` y `locales/es/cheatsheet.yaml` cargan con `yaml.safe_load`.
- Cada uno de los 543 ids declarados por los nodos del grafo aparece exactamente una vez,
  como `id` de una entrada canónica o dentro de sus `aliases`. Ningún alias aparece en
  dos entradas.
- Todo nodo en `added_by` y todo `play_again` existen en
  [`C-knowledge-graph/graph/*.yaml`](../C-knowledge-graph/). El validador del grafo no se
  modifica desde acá.
- Todo `topic` de una entrada existe en el árbol de `topics`, y todo tema con `parent`
  referencia un tema existente.
- Toda entrada canónica tiene `cheatsheet.<id>.title` (ocho palabras o menos) y
  `cheatsheet.<id>.body` en `es`.
- `kind` está en el enum de seis valores; `added_at_layer` es `symbolic` o `formal`;
  `literacy_min` está en el enum de [Q](../Q-edad-universal.md); `display` respeta el
  formato según `kind` y nivel.
- Ningún campo de `cheatsheet_entries.yaml` contiene texto visible al usuario; el test
  de [P](../P-internacionalizacion.md) lo recorre igual que a `calculator_ops.yaml`.
