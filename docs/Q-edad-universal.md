# Q — Edad universal

Mathy se puede jugar desde los cinco o seis años hasta la universidad. Este documento explica cómo un mismo juego, con un solo grafo y un solo catálogo de mecánicas, sirve a un niño que todavía no lee y a un adulto que quiere recuperar el cálculo. No es una sección sobre niños. Es una sección sobre qué cambia y qué no cambia cuando cambia la edad del jugador.

Las reglas que se enuncian acá se aplican en otros documentos: el campo `literacy` del schema ([C](C-knowledge-graph/schema/node.schema.yaml)), las capas de [H](H-progresion-abstraccion.md), las mecánicas de [E](E-mecanicas/E0-catalogo.md), los patrones de explicación de [L](L-modelo-errores/L0-taxonomia.md), las analogías de [G](G-analogias/G0-reglas.md), el selector de [J](J-adaptativo.md), las constantes de [K](K-evaluacion.md), el sistema visual de [N](N-ux-ui.md) y la voz por locale de [P](P-internacionalizacion.md). Acá se argumenta una vez el porqué y se fija lo que cada uno de esos documentos tiene que cumplir.

## 1. Principio: un solo juego

Un jugador de seis años y un adulto recorren el **mismo grafo** con las **mismas mecánicas** y el **mismo contenido matemático**. Lo que cambia es la modalidad de presentación e input. Nunca cambia la matemática.

Esto descarta tres soluciones habituales:

- **No hay "modo niños".** Un modo infantil sería un segundo producto con un segundo curriculum, siempre más pobre. En Mathy hay capas ([H](H-progresion-abstraccion.md)) y prerequisitos ([C](C-knowledge-graph/C0-esquema.md)). Un niño juega `real`, `intuition`, `concrete`, `visual` y buena parte de `symbolic` con las manos y los ojos. Un adulto juega las mismas capas más rápido, o las salta por diagnóstico.
- **No hay puertas por edad.** Ningún nodo pregunta cuántos años tiene el jugador. La única puerta es el estado `ready` de los prerequisitos ([K](K-evaluacion.md)). La lectura es un prerequisito más, modelado como nodos del grafo (sección 2), no como un dato del perfil.
- **No hay versión "fácil" de un concepto.** La balanza de `prealg.eq.balance` es la misma para todos. Un niño y un adulto hacen lo mismo con ella: quitar pesas iguales de los dos platos.

La consecuencia fuerte es la promesa del diseño: **un niño de seis años que se comprometa con el juego puede aprender todo el curriculum**, hasta `adv.*`, y aplicarlo en ejercicios que son minijuegos. Llega más tarde que un adulto, porque la lectura y la motricidad se desarrollan en el camino. Pero el camino existe, está dentro del juego y no exige nada externo: ni un docente, ni un libro, ni saber leer antes de empezar. Toda decisión que dependa de la edad se reescribe como una decisión que depende de `literacy`, de la motricidad o de un prerequisito del grafo.

## 2. Pre-lectura como prerequisito implícito

### 2.1 El campo `literacy`

Todo nodo declara `literacy` con uno de cuatro valores del enum de [`node.schema.yaml`](C-knowledge-graph/schema/node.schema.yaml):

| Valor | Qué exige del jugador | Cómo se juega |
|---|---|---|
| `none` | nada | demostración, iconos, voz opcional |
| `icons` | reconocer etiquetas de una palabra sobre un ícono | iconos con etiqueta; voz opcional |
| `short_text` | leer frases de doce palabras o menos | siempre con voz |
| `full_text` | leer definiciones y enunciados | solo desde nivel 3 |

Dos reglas del validador lo hacen cumplir: **nivel 0 implica `none`**, y **`full_text` implica nivel 3 o superior**. Entre ambas queda un espacio deliberado: los niveles 1 y 2 pueden declarar `icons` o `short_text`, y muchos nodos de nivel 1 declaran `none` porque los dígitos y los signos de operación no son texto sino íconos con historia ([H](H-progresion-abstraccion.md), sección 3).

`literacy` describe lo que el nodo exige, no lo que el jugador sabe. Lo que el jugador sabe lo dicen los nodos `found.lit.*` (abajo). El selector de [J](J-adaptativo.md) nunca propone un nodo cuyo `literacy` supere el del jugador.

### 2.2 Los nodos `found.lit.*`

La lectura se modela como cualquier otro prerequisito. El área `found` reserva dos o tres nodos para eso, dentro de su presupuesto de doce ([D0](D-curriculum/D0-mapa.md)):

- **reconocer símbolos:** distinguir un signo de otro y asociarlo a su acción (el `+` con juntar, el `=` con la balanza quieta);
- **seguir una instrucción corta:** ejecutar una frase de una línea narrada y escrita, del tipo "poné tres en el plato".

Todo nodo con `literacy: short_text` o `full_text` los tiene como prerequisito transitivo. El diagnóstico los prueba primero en cualquier jugador, con un único ítem cada uno. Un adulto los "salta" en el sentido de que no los ve como actividad: quedan en `ready` provisional tras el primer ítem leído correctamente. Un niño los recorre como nodos normales, con demostración y voz, y los alcanza cuando los alcanza. Así el grafo sabe cuándo un nodo necesita leer de verdad; nadie lo ajusta a mano.

### 2.3 Instrucción por demostración

En un nodo con `literacy: none` no hay tutorial escrito. La instrucción es una demostración, y el patrón es siempre el mismo:

1. **Fantasma de la mano.** Una mano semitransparente ejecuta el gesto completo sobre la escena real: arrastra la pesa, toca el cofre, dobla la figura. Dura lo que dura el gesto, sin texto y sin pausa.
2. **Devolución del control.** La escena vuelve al estado inicial y la mano desaparece. El objeto que hay que tocar late una vez.
3. **Repetición a demanda.** Si el jugador no interactúa en un lapso corto, la mano repite el gesto. Si toca otra cosa, el juego no lo corrige: deja que explore, y repite recién cuando vuelve a quedarse quieto. La constante de espera vive en [K](K-evaluacion.md).
4. **Éxito silencioso.** Cuando el jugador imita el gesto, no hay cartel de "muy bien". El objeto responde: la balanza se nivela, el cofre se abre. Esa respuesta es la confirmación. Un sonido breve acompaña, y se puede apagar.

La demostración se muestra la primera vez que aparece una mecánica y la primera vez que aparece un gesto nuevo dentro de ella. No se repite en cada nodo: la balanza de `found.cmp.same_amount` es la misma balanza en `prealg.eq.balance`. [E](E-mecanicas/E0-catalogo.md) exige que la primera etapa de `fade_steps` de toda mecánica sea de objetos concretos, para que la demostración se entienda sin leer.

### 2.4 Iconografía consistente

Un ícono tiene un solo significado en todo el juego. La llave siempre es la llave. La caja cerrada siempre es la incógnita. La balanza nivelada siempre es la igualdad. Es lo que permite que un niño que no lee reconozca en `alg.eq.one_step` los objetos que vio en `prealg.inv.operation_as_key`. [N](N-ux-ui.md) mantiene el inventario de íconos y prohíbe reusar una forma con otro significado.

### 2.5 Narración por voz

La voz es opcional y depende del locale ([P](P-internacionalizacion.md)). El juego funciona con el sonido apagado en todo nodo con `literacy: none` o `icons`. En nodos con `short_text` la voz acompaña siempre al texto; si el locale no tiene voz, el nodo se juega con el texto visible y el selector lo prioriza menos para perfiles con lectura baja.

La voz nunca explica el concepto. Presenta la situación ([G](G-analogias/G0-reglas.md)), narra el prompt de una explicación de error ([L](L-modelo-errores/L0-taxonomia.md)) y lee las definiciones cortas de la capa `formal`. Todo texto narrado está escrito para escucharse, con placeholders ICU para plurales, y tiene subtítulo (sección 10).

### 2.6 La rama del diagnóstico sin lectura

El diagnóstico de [J](J-adaptativo.md) empieza sin asumir que el jugador lee. El prior de tres botones es de íconos. Los probes son ítems dentro de la mecánica, y todo probe de un nodo con `literacy: none` o `icons` se resuelve manipulando o eligiendo entre animaciones. Recién cuando los nodos `found.lit.*` quedan en `ready` el diagnóstico habilita probes con texto. Un adulto pasa por esa puerta en el primer minuto. Un niño que no lee recorre una rama completa sin encontrar una sola frase, y sale colocado en el nivel 0 o 1 con la misma precisión que cualquier otro jugador.

## 3. Input por motricidad

Una mano de cinco años ejecuta gestos con precisión baja. El diseño lo absorbe con reglas de input, no con contenido distinto.

- **Targets de 44 pt o más.** Todo objeto tocable mide al menos 44 pt en su lado menor, en todos los niveles. Los tokens de tamaño viven en [N](N-ux-ui.md).
- **Tolerancia de drop generosa.** La zona de aceptación es mayor que el objeto dibujado. Cuando hay dos destinos posibles cerca, el juego los separa en pantalla en lugar de exigir puntería.
- **Sin escritura en niveles 0 a 2.** Ningún nodo de esos niveles muestra un teclado de texto. Ninguno pide dibujar un dígito ni una letra.
- **Cinco gestos, ninguno fino.** `drag`, `tap`, `pinch`, `scrub` y `hold` son los únicos gestos del catálogo de [E](E-mecanicas/E0-catalogo.md). `pinch` tiene siempre una alternativa de arrastre por manija.

### 3.1 Teclado de fichas antes que teclado de texto

Cuando el jugador tiene que producir una operación, por ejemplo elegir qué llave aplicar a `x + 5 = 12`, lo hace con un **teclado de fichas**: tokens arrastrables con el operador y el número ya dibujados. En el nivel 7 del ejemplo de cofres de [H](H-progresion-abstraccion.md) el jugador construye la llave combinando una ficha de operador con una ficha de número. Sigue siendo arrastrar, no escribir. El juego valida la ficha compuesta antes de aplicarla.

El teclado de fichas es la forma en que un niño que no escribe opera con símbolos. También es la forma en que un adulto opera en casi todo el juego: es más rápido que tipear y no admite errores de sintaxis.

El **teclado de texto libre** aparece en dos lugares únicamente: el sandbox de la calculadora ([M](M-calculadora/M0-progresion.md)) y las capas `formal` y `abstract` de nodos con `literacy: full_text`, donde a veces hay que enunciar una expresión que no cabe en fichas. Nunca es la única forma de responder un ítem de evidencia.

### 3.2 Gestos por mecánica y por rango de literacy

La lista autoritativa de gestos por mecánica es el campo `input` de [`mechanics.yaml`](E-mecanicas/mechanics.yaml). Esta tabla resume cómo cambia la interacción con el nivel de lectura del nodo.

| Mecánica | Gesto base (`none`) | `icons` agrega | `short_text` / `full_text` agrega |
|---|---|---|---|
| `balance` | drag de pesas, tap para quitar | fichas con número | fichas de operación, texto de la ecuación al lado |
| `chest_key` | drag de la llave al cofre | llaves con etiqueta (`+3`, `×5`) | teclado de fichas para armar la llave |
| `machine_pipe` | drag de objetos a la entrada, tap para accionar | etiqueta de la máquina | notación `f(x)` sobre la máquina |
| `ledger` | drag de frutas a la columna | contadores con dígito | tabla con símbolos |
| `tiles` | drag y pinch de baldosas (o manijas) | dimensiones con dígito | expresión del área al lado |
| `slope_walker` | drag del caminante, scrub del tiempo | marcas de escalón con número | cociente y notación de derivada |
| `fill_accumulate` | hold para llenar, scrub para recorrer | escala con dígitos | notación de integral |
| `grid_stretch` | drag y pinch de la malla (o manijas) | coordenadas con dígito | matriz al lado |
| `network_routes` | tap en nodos, drag para unir | etiquetas de una palabra | pesos y notación |
| `urn_dice` | tap para sacar, hold para repetir | contadores con dígito | fracciones y notación `P(A)` |
| `gears_sequence` | drag de engranajes, tap para girar | número de dientes | fórmula del término general |
| `sorter` | drag a la caja | cajas con etiqueta | tarjeta de regla (`rule_card`) con voz |
| `construct` | drag entre puntos, hold para levantar una copia | marcas con letra | enunciado del dato descubierto |

La regla de lectura es la misma en toda la tabla: el gesto no cambia con `literacy`; cambia lo que hay dibujado alrededor del gesto.

## 4. Todo ejercicio es un minijuego

Mathy no tiene pantallas de drill. No existe una pantalla con una pregunta arriba y cuatro opciones abajo. Los seis verbos de evidencia de [K](K-evaluacion.md) (`recognize`, `explain`, `manipulate`, `apply`, `generalize`, `transfer`) se instancian **dentro de la mecánica** del nodo, y el campo *Challenge* de cada minijuego en [F](F-minijuegos/F0-principios.md) describe cómo.

El verbo más delicado es `explain`, porque en un formato escolar se responde con palabras. En Mathy, para quien no lee, **`explain` es elegir entre animaciones**. El juego muestra dos o tres animaciones cortas de la misma situación; una es la manipulación correcta y las otras encarnan misconceptions de [L](L-modelo-errores/misconceptions.yaml). El distractor elegido clasifica el error con la misma precisión que una frase y alimenta Understanding igual. Un adulto ve el mismo ítem con las animaciones etiquetadas, y en `formal` además la definición que justifica la elección.

### 4.1 Tres nodos, seis verbos

**Nivel 0: `found.cmp.same_amount`** (mecánica `balance`, `literacy: none`). Dos platos con piedras.

- `recognize`: entre cuatro balanzas, tocar la que está quieta.
- `explain`: dos animaciones: en una se agrega una piedra a un solo plato, en otra a los dos. Tocar la que deja la balanza quieta.
- `manipulate`: la balanza está inclinada; arrastrar piedras hasta nivelarla.
- `apply`: aparece un plato con piedras tapadas por una hoja; arrastrar al otro plato la cantidad que hace falta, y después levantar la hoja para ver.
- `generalize`: la misma balanza con vasos de agua en vez de piedras; nivelarla.
- `transfer`: en `graph.basic.graph_and_paths`, dos caminos con la misma cantidad de pasos; tocar el par que "pesa igual".

**Nivel 2: `prealg.eq.balance`** (mecánica `balance`, `literacy: icons`). La caja cerrada en un plato, pesas con dígito.

- `recognize`: entre cuatro balanzas, tocar la que tiene la caja sola en un plato.
- `explain`: dos animaciones: quitar `3` de un solo plato, quitar `3` de los dos. Tocar la que mantiene la balanza nivelada. El distractor es `inverse_applied_one_side`.
- `manipulate`: arrastrar pesas iguales fuera de ambos platos hasta dejar la caja sola.
- `apply`: una situación dibujada (una bolsa cerrada y tres frutas sueltas pesan lo mismo que ocho frutas); armar la balanza y resolverla.
- `generalize`: la balanza ahora tiene dos cajas iguales en un plato; descubrir qué pesa cada una.
- `transfer`: en `disc.mod.clock_equivalence`, una balanza que solo mira el resto; comprobar que quitar lo mismo de ambos lados conserva la igualdad.

**Nivel 5: `calc1.deriv.rate_as_slope_limit`** (mecánica `slope_walker`, `literacy: short_text`). Un caminante sobre una colina.

- `recognize`: entre cuatro colinas, tocar aquella donde el caminante sube más rápido en el punto marcado.
- `explain`: dos animaciones de escalones cada vez más chicos sobre la misma curva; en una la pendiente de los escalones se acerca a un valor, en otra salta. Tocar la que representa la derivada. El distractor es `slope_as_average_over_interval`.
- `manipulate`: scrub del tamaño del escalón hasta que el triángulo de subida y avance se pegue a la curva; leer la pendiente.
- `apply`: dada una curva de distancia contra tiempo, arrastrar el caminante al instante donde la velocidad es cero.
- `generalize`: la misma curva, ahora en un tanque que se llena; señalar dónde el caudal es máximo.
- `transfer`: en `csmath.cplx.big_o_as_slope`, comparar dos algoritmos por la pendiente de su costo.

En los tres casos las frases son voz y subtítulo, y ninguno de los ítems de nivel 0 y 2 depende de leer.

### 4.2 Desafíos sin leer

Los desafíos de [S](S-desafios/S0-desafios.md) existen también en niveles 0 a 2. Son rompecabezas de área con baldosas y datos ocultos: una figura compuesta cubierta parcialmente, donde hay que descubrir cuántas baldosas faltan usando las que se ven; un rectángulo con una esquina tapada, donde el jugador tiene que decidir qué línea revela la parte escondida. La cheatsheet está abierta y en esos niveles es una imagen con voz (sección 5). Las pistas graduadas son animaciones, no frases. Nada de esto requiere leer, y cuenta en [K](K-evaluacion.md) igual que cualquier desafío.

## 5. Formalización progresiva sin muro de lectura

Las capas `formal` y `abstract` de [H](H-progresion-abstraccion.md) son las primeras que necesitan texto. El diseño es estricto para que no se conviertan en un muro:

- **Texto corto, voz y objeto al lado.** Una definición ocupa una frase. Se narra siempre. El objeto visual sobre el que se define está en pantalla y responde al toque. La definición aparece después de que el jugador manipuló el objeto, nunca antes.
- **Nunca una pantalla de texto que bloquee.** No hay lectura obligatoria antes de poder hacer algo. Lo que el jugador hace en `formal` es verificar casos sobre el objeto, no responder preguntas sobre el texto.
- **`short_text` con voz obligatoria hasta el nivel 3.** Como el validador prohíbe `full_text` antes del nivel 3, la capa `formal` de niveles bajos es siempre texto corto con voz.

La **cheatsheet** ([R](R-cheatsheet/R0-cheatsheet.md)) sigue la misma lógica. Una entrada se agrega cuando el jugador alcanza por primera vez la capa `symbolic` o `formal` del nodo. En niveles 0 a 2 la entrada es una imagen con voz: la balanza con dos pesas quitadas, la baldosa que muestra que `3 × 4` es un rectángulo. El texto llega con la capa `formal`, cuando el nodo lo declara. Una entrada nunca se reemplaza: cuando llega el texto, se agrega debajo de la imagen. Así la cheatsheet de un niño y la de un adulto son el mismo objeto en distintos momentos.

El niño llega a `formal` con la intuición completa del objeto sobre el que va a leer. Llega más tarde que un adulto, pero cada paso está dentro del juego: los nodos `found.lit.*` son parte del grafo, con demostración, voz y mecánicas propias, y la lectura que exigen es la mínima necesaria para el nodo siguiente.

## 6. Ritmo y sesiones

El selector de [J](J-adaptativo.md) usa una **duración objetivo de sesión adaptativa**. Hay un valor por defecto y uno más corto para perfiles con `literacy: none`; ambos son constantes con nombre que [K](K-evaluacion.md) registra y J aplica. Este documento no repite los valores. La duración objetivo no es un límite: es lo que el selector usa para decidir cuántas actividades planificar.

**Detección de fatiga.** Dentro de una sesión el selector observa dos señales: latencia creciente entre ítems del mismo tipo y errores en cadena que no corresponden a una misconception identificable. Cuando ambas aparecen, la sesión no se corta: el selector deja de proponer nodos nuevos y **cierra con juego libre**, que es el último slot de toda sesión de todos modos (calculadora, sandbox de una mecánica ya conocida, el mapa). Los umbrales viven en K.

**Sin timers punitivos.** Ninguna actividad tiene cuenta regresiva visible en niveles 0 a 2. La dimensión Speed de [K](K-evaluacion.md) se mide siempre, pero en esos niveles y en nodos con `literacy: none` el tiempo objetivo se multiplica por `T_STAR_LITERACY_NONE_FACTOR`, para que la motricidad fina no se confunda con falta de fluidez. Para el resto de los jugadores tampoco hay reloj en pantalla: Speed es una dimensión del radar del perfil, no presión durante el ítem.

**Sesiones cortas no son sesiones pobres.** Las capas `real` e `intuition` pueden ocupar toda una sesión de un perfil sin lectura. El selector no intenta avanzar de capa en cada sesión: intenta que cada una termine con algo que el jugador hizo bien y algo que le dejó curiosidad.

## 7. Motivación sin gamification superficial

Mathy no tiene monedas, vidas, rachas obligatorias ni cofres de recompensa aleatoria. Esas mecánicas funcionan igual a los seis y a los cuarenta años, y por eso mismo enseñan a jugar el sistema en vez de la matemática. Lo que sí hay:

- **Territorio del mapa que se ilumina.** El grafo es una constelación ([N](N-ux-ui.md)). Cada nodo se enciende en tres intensidades: `in_progress`, `ready`, `mastered`. Un niño ve crecer su parte del cielo. No hay badges ni porcentajes.
- **Herramientas que se desbloquean.** La calculadora ([M](M-calculadora/M0-progresion.md)) gana operaciones cuando un nodo llega a `ready`. La cheatsheet ([R](R-cheatsheet/R0-cheatsheet.md)) gana entradas cuando el jugador ve una fórmula por primera vez. Son recompensas que además sirven, y nunca se revocan: si el nodo decae, la herramienta muestra óxido y eso es una invitación a repasar.
- **Feedback de error constructivo.** El juego nunca dice "incorrecto". Muestra qué pasó: la balanza que se inclina, la llave que no gira ([L](L-modelo-errores/L0-taxonomia.md)). La animación es la explicación, y después pregunta qué hacemos ahora.
- **Curiosidad estructural.** La motivación más fuerte del diseño es reconocer la misma forma en otro lado. Cuando el jugador llega a `alg.fn.inverse_function`, el juego le muestra que la llave es la que usó en `arith.sub.undo_add`: "esto ya lo hiciste con +5". En `calc1.ftc.integral_undoes_derivative` la llave vuelve por tercera vez. Ese reconocimiento no se decora con confeti: se muestra con un morph del objeto viejo al nuevo.
- **Juego libre garantizado.** Toda sesión termina con un slot libre en el que nada se mide. No es un premio: explorar sin evaluación es donde se forman las anticipaciones de la capa `intuition`.

## 8. Estética age-neutral

Hay un solo sistema visual, definido en [N](N-ux-ui.md): premium, minimalista, dark-first, con referencias como Monument Valley y Alto's Odyssey. No hay una versión con colores saturados y personajes sonrientes para los chicos. Un niño de seis años no necesita que el juego parezca infantil; necesita que sea claro, que responda al toque y que los objetos se comporten de forma consistente.

- **Objetos concretos y símbolos comparten lenguaje.** Frutas, cofres, llaves y baldosas se dibujan con las mismas formas, el mismo grosor de trazo y la misma paleta que los dígitos y los signos. Eso hace posible que 🍎 + 🍎 se convierta en `x + x` y después en `2x` con un morph del mismo objeto, no con un reemplazo de pantalla ([H](H-progresion-abstraccion.md), sección 6).
- **Animación expresiva, no caricaturesca.** Los objetos tienen peso y respuesta: una pesa que cae inclina la balanza con inercia; una llave que no entra rebota. No tienen cara ni voz propia. Las rate functions son las del catálogo de [I](I-manim/I0-mapping.md), las mismas de los clips explicativos.
- **Nada compite con el objeto matemático.** Sin decorados, sin personajes guía, sin mascota. La voz narradora es una voz, no un personaje.

Los objetos concretos son assets propios, no emojis de plataforma, para que sean idénticos en iOS, Android y todos los locales ([P](P-internacionalizacion.md)); el emoji de frutas es solo taquigrafía de los documentos.

## 9. Privacidad y cuentas infantiles

Un juego jugable desde los cinco años es, legalmente, un servicio dirigido a menores en toda jurisdicción relevante. El diseño parte de ahí. La arquitectura vive en [O](O-arquitectura-tecnica.md); las reglas son estas.

**Jugable sin cuenta.** El perfil por defecto es local: event log, modelo de mastery y preferencias viven en el dispositivo. No hace falta email, nombre ni fecha de nacimiento para jugar el curriculum completo. La cuenta es opcional y sirve solo para sincronizar entre dispositivos.

**Si hay cuenta, COPPA y GDPR-K por defecto.** Como el juego no pregunta la edad, toda cuenta se trata como si pudiera ser de un menor:

- consentimiento parental verificable antes de crear cualquier cuenta que sincronice datos, con los métodos aceptados por la regulación de la región del dispositivo;
- minimización de datos: la cuenta se identifica por un id opaco y un contacto del adulto responsable; no se pide ni se guarda el nombre real del jugador;
- sin publicidad, sin SDKs de analítica de terceros, sin tracking entre apps, sin compartir datos con nadie;
- sin chat, sin comentarios, sin contenido generado por usuarios, sin ranking público, sin nada que permita el contacto entre jugadores;
- borrado completo a pedido del adulto responsable, incluidos los eventos sincronizados.

**Perfiles múltiples por dispositivo.** Un teléfono de familia puede tener varios perfiles. Cada uno tiene su propio event log, su propio modelo de mastery y su propia cheatsheet. Cambiar de perfil no exige contraseña, porque el juego no guarda nada que valga la pena proteger de un hermano, pero cada perfil es un modelo de usuario separado: el selector de uno nunca lee el de otro.

**Qué se guarda y por qué.** El dato fundamental de Mathy es el **evento de aprendizaje**: qué nodo, qué ítem, qué verbo de evidencia, qué resultado, cuánto tardó, qué misconception se detectó. Todo el modelo de mastery es un fold determinista sobre esos eventos ([K](K-evaluacion.md), [O](O-arquitectura-tecnica.md)). No se guarda identidad, ubicación, contactos ni grabaciones. La voz es TTS del dispositivo o assets pre-grabados: el micrófono no se usa. Ningún evento contiene texto libre del jugador; lo que se tipea en el sandbox de la calculadora no sale del dispositivo.

**Modo padres y docentes.** Un adulto puede ver el progreso de un perfil: el mapa iluminado, el radar de seis dimensiones por concepto, las misconceptions activas y la frecuencia de sesiones. Es de solo lectura. No puede asignar tareas, ajustar umbrales ni desbloquear nodos, porque eso rompería el modelo de prerequisitos. Sí puede exportar el progreso en un formato legible y borrar el perfil.

## 10. Accesibilidad

Gran parte de lo que hace jugable el juego a los seis años es lo mismo que lo hace jugable con una discapacidad. Reglas que [N](N-ux-ui.md) implementa y este documento exige:

- **VoiceOver y TalkBack en toda la UI.** Cada objeto matemático tocable tiene una etiqueta accesible generada desde el `MathTree` o desde el estado de la mecánica ("balanza inclinada a la izquierda, tres pesas en el plato derecho"). Las etiquetas pasan por el sistema de locales.
- **Contraste AA.** Todo texto y todo objeto interactivo cumple el contraste mínimo AA sobre el fondo del tema, en modo oscuro y claro.
- **Reducir movimiento.** Cuando el sistema lo pide, las animaciones expresivas se acortan y los morphs se reemplazan por fundidos. Las animaciones que son la explicación de un error no se eliminan, porque sin ellas no hay explicación; se ejecutan sin easing y más lentas.
- **Daltonismo.** El color nunca es el único portador de significado. El color de un cofre va acompañado de una forma en la cerradura y en la llave. Los estados del mapa se distinguen por intensidad y textura, no solo por tono. La paleta se verifica contra los tres tipos comunes de deficiencia.
- **Texto dinámico.** Todo texto respeta el tamaño de fuente del sistema. El layout tolera la misma expansión que [P](P-internacionalizacion.md) exige para la localización. La notación matemática escala con el mismo factor.
- **Subtítulos de la narración.** Toda voz tiene su texto visible, activable en preferencias. Para un perfil sin lectura están apagados por defecto; un adulto puede encenderlos para acompañar.
- **Input alternativo.** `pinch` y `hold` tienen alternativa por arrastre o por tap sostenido en un botón.

## 11. Playtest y criterios de aceptación

El diseño se acepta cuando dos poblaciones muy distintas juegan el mismo juego sin ayuda. El playtest usa los eventos de aprendizaje del producto; no introduce constantes nuevas.

**Niños de 5 a 7 años en los nodos 1 a 3** (`found.count.cardinality`, `found.count.number_line`, `arith.add.displacement`), con el sonido encendido y después apagado. Qué se observa:

- si imita el gesto de la demostración sin que un adulto intervenga, y tras cuántas repeticiones del fantasma;
- si reconoce la mecánica cuando vuelve a aparecer en el nodo siguiente sin nueva demostración;
- si resuelve los ítems `explain` eligiendo entre animaciones, o toca al azar;
- si algún target o zona de drop provoca intentos fallidos repetidos;
- si pide leer o pide ayuda con un texto (no debería haber ninguno).

Qué se mide: latencia por ítem contra `t_star` multiplicado por `T_STAR_LITERACY_NONE_FACTOR`, tasa de éxito por verbo, distribución de distractores elegidos en `explain`, repeticiones de la demostración, y si la sesión cierra por fatiga antes o después de la duración objetivo de su perfil.

**Adultos en el nodo 13** (`alg.eq.one_step`), el ejemplo de calibración del template de [D1](D-curriculum/D1-espina/_plantilla.md) y del primer minijuego. Qué se observa:

- si acepta la balanza y el cofre como explicación, o los siente como un rodeo infantil (la señal de que la estética falló);
- si el teclado de fichas resulta más rápido que tipear, o frustra;
- si la definición corta de `formal` se lee o se salta, y si la voz molesta;
- si al llegar a `alg.fn.inverse_function` reconoce la llave sin que el juego lo diga.

Qué se mide: latencia contra `t_star` sin factor, tasa de `wrong_inverse` y `sign` en el nivel 6 del ejemplo de cofres, y si el diagnóstico saltó correctamente los nodos `found.lit.*`.

**Criterio de aceptación.** El template de 14 pasos y el minijuego se aprueban cuando ambas poblaciones completan sus nodos sin intervención externa y sin que ningún ítem dependa de una modalidad que el jugador no tenía. Si un niño necesita leer o un adulto necesita que le expliquen la analogía con palabras, el nodo vuelve a diseño.

## 12. Verificación

Lo que se puede comprobar con herramientas se comprueba en CI; el resto es revisión de diseño.

- **Validador del grafo.** Todo nodo declara `literacy`; nivel 0 implica `none`; `full_text` implica nivel 3 o superior. Toda misconception asignada a un nodo tiene un patrón de explicación cuyo `literacy_min` no supera el `literacy` del nodo ([L](L-modelo-errores/L0-taxonomia.md)). Toda analogía de un nodo con `literacy: none` declara `literacy_min: none` ([G](G-analogias/G0-reglas.md)).
- **Minijuegos.** Cada archivo de [F](F-minijuegos/F0-principios.md) declara el rango de `literacy` que soporta y describe la instrucción por demostración (qué gesto ejecuta el fantasma, sobre qué objeto). Un minijuego que soporta `none` no puede depender de ningún texto en su primera etapa de `fade_steps`.
- **Ítems `explain`.** Ningún ítem `explain` de un nodo de nivel 0 a 2 depende de texto: sus opciones son animaciones o manipulaciones. Se verifica en la revisión de F y en el DSL de actividades ([O](O-arquitectura-tecnica.md)), que rechaza opciones de tipo texto en nodos con `literacy: none` o `icons`.
- **Diagnóstico.** [J](J-adaptativo.md) documenta la ruta completa sin lectura: prior con íconos, probes sin texto hasta que `found.lit.*` esté en `ready`, colocación provisional idéntica a la de la ruta con lectura.
- **Constantes.** Este documento no define valores numéricos. `T_STAR_LITERACY_NONE_FACTOR`, la duración objetivo por perfil y los umbrales de fatiga viven en [K](K-evaluacion.md). El único número con unidad de este archivo es el piso de 44 pt, que es un token de [N](N-ux-ui.md).
- **Privacidad.** [O](O-arquitectura-tecnica.md) lista los SDKs incluidos en la app; ninguno es de publicidad ni de analítica de terceros. El esquema del event log no contiene campos de identidad.
- **Accesibilidad.** Auditoría de contraste sobre `theme.json`, prueba con VoiceOver y TalkBack en mapa, sesión y actividad, y simulación de daltonismo sobre las capturas por locale que [P](P-internacionalizacion.md) ya produce.
- **Playtest.** Los dos protocolos de la sección 11 son condición de aceptación del template de 14 pasos antes de escribir los lotes masivos de D1 y F.
