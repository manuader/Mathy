# Los tres cuadrados (`geom.tri.pythagoras_as_tiles`)

Minijuego del nodo 41 de la espina, "Pitágoras reordenando baldosas". Mecánica principal `tiles`, secundaria `construct`; analogía `square_garden_side`. El análisis obligatorio de [F0](F0-principios.md) está desarrollado en [D1](../D-curriculum/D1-espina/41-geom.tri.pythagoras_as_tiles.md): un concepto, cuatro dificultades reales (el teorema como enunciado sobre áreas, el hueco que cambia de forma y no de tamaño, la raíz de una suma, el triángulo rectángulo escondido), una analogía con tres parcelas en vez de una, un gesto (vaciar los cuadrados chicos en el grande), cinco pasos de desvanecimiento, los dos acomodos lado a lado como visualización dominante, retiro en `formal`. Acá se fija cómo se juega.

## Analogía

Un patio con tres parcelas cuadradas apoyadas sobre los tres lados de un triángulo rectángulo, hacia afuera. Las dos chicas vienen embaldosadas; la grande está vacía. Al costado, una carretilla.

Mapa objeto a concepto: parcela cuadrada → el cuadrado de un lado; largo del lado → el lado; conocer el área y buscar el lado → la raíz cuadrada; agregar dos tiras iguales en dos bordes → completar el cuadrado; baldosa de esquina que falta → la constante que hay que agregar; parcela que crece con el lado → crecimiento cuadrático.

El jardín es el mismo del nodo 22 y acá aporta que un número elevado al cuadrado es una superficie que se puede vaciar y volver a llenar. Las cuatro copias del triángulo dentro de un marco aportan la demostración: el hueco cambia de forma y no de tamaño. El trazo de `construct` aporta el triángulo rectángulo que no está dibujado. Punto de ruptura del jardín: `two_branches_of_sqrt`, un lado negativo no cabe en una parcela, y por eso el jardín se retira recién en `formal`, cuando el reacomodo ya no es la única justificación disponible ([G0](../G-analogias/G0-reglas.md)).

## Mecánica central

Superficie: el triángulo en el centro con sus tres marcos cuadrados apoyados, la bandeja abajo, los tres contadores en los marcos. Gestos: `drag`, `tap` y `pinch` para las baldosas; `drag`, `tap` y `hold` para el trazo ([E0](../E-mecanicas/E0-catalogo.md)).

- **Arrastrar baldosas de un cuadrado chico al grande.** Se pegan entre sí y al borde. Los contadores de los dos marcos cambian a la vez.
- **Vaciar los dos chicos.** Si el grande queda completo, el triángulo chasquea y los tres marcos brillan. Si sobra o falta, el montón o el hueco quedan a la vista sin ningún cartel.
- **Arrastrar un vértice del triángulo.** Los tres cuadrados cambian de tamaño juntos. Cuando la marca de ángulo recto aparece, las baldosas encajan exactamente; fuera de ahí, no.
- **Acomodar cuatro copias.** En modo de cuatro copias, un marco cuadrado grande y cuatro triángulos iguales en la bandeja. En un acomodo queda un hueco cuadrado en el centro; en el otro, dos huecos en una diagonal.
- **Tocar para comparar los dos acomodos.** Se muestran uno al lado del otro, con el hueco iluminado en los dos y el mismo contador en los dos.
- **Mantener el dedo sobre un cuadrado.** Se parte en tiras que se giran y se deslizan. Es la vía cuando los lados no son enteros y las baldosas sueltas no alcanzan.
- **Bajar una altura.** Sobre un triángulo cualquiera, arrastrar de un vértice al lado opuesto. Si llega perpendicular, se fija punteada y el triángulo queda partido en dos, cada mitad con su propio ángulo recto.
- **Tocar el cuadrado grande lleno.** Sus baldosas se levantan y vuelven solas a los dos chicos, que quedan exactamente completos. Es la verificación.

En `symbolic` la superficie cambia de forma, no de reglas: los marcos quedan como contornos tenues con su potencia escrita, arrastrar una potencia al otro lado del igual es despejar, y los cuadrados se piden tocando cualquier término y aparecen como fantasmas.

## Invariante matemático

`area_preserved_under_rearrangement`: la cantidad de baldosas no cambia mientras se las mueve. De ahí sale todo el teorema: si las de los dos cuadrados chicos llenan el grande, es porque eran exactamente las que hacían falta. Se ve confirmarse en los dos acomodos de las cuatro copias, donde el hueco cambia de forma y el contador no se mueve. Se ve romperse cuando el jugador superpone dos copias del triángulo: el hueco se agranda, el contador de la bandeja no cuadra, y las piezas superpuestas parpadean.

El invariante de `construct` es el de apoyo: `construction_reveals_not_changes`. La altura no cambia el triángulo; hace aparecer dos triángulos rectángulos donde no había ninguno. Se ve confirmarse porque el contador del triángulo entero está a la vista mientras se traza y no se mueve.

Un movimiento válido pero inútil, como llenar el cuadrado grande empezando por el centro, o partir un cuadrado chico en tiras cuando las baldosas sueltas alcanzaban, no rompe ningún invariante. Recibe un empujón suave: el borde del marco late una vez.

## Representación visual

Primitiva dominante `invariant`, de apoyo `scale` ([H](../H-progresion-abstraccion.md)).

- `real` e `intuition`: la escalera apoyada en la pared sobre un patio embaldosado. Se arrastra el pie y se predice cuánto mide.
- `concrete`: triángulo con marca de ángulo recto, tres marcos, baldosas con textura, tres contadores. Nada escrito.
- `visual`: los dos acomodos de las cuatro copias uno al lado del otro, con el hueco iluminado en los dos y el mismo contador. Los tres cuadrados sobre una cuadrícula común con la misma baldosa unidad; al arrastrar un vértice, los tres contadores cambian en sincronía y los dos chicos siempre suman el grande. La hipotenusa se distingue por posición, enfrente del ángulo recto, antes de tener nombre.
- `symbolic`: contornos tenues con `3²`, `4²` y `5²`, el renglón con el más y el igual, y después las letras.
- `formal`: las tres frases con voz y los tres cuadrados al lado.

## Transición simbólica

Cinco pasos, cada uno disparado por un gesto, sobre el mismo objeto con ids estables:

1. Baldosas sueltas → cuadrícula: al completar el cuadrado grande por primera vez en `visual`, los bordes individuales se van y quedan las líneas; los tres contadores siguen.
2. Lados rotulados: al tocar un lado del triángulo aparece una llave con su medida, y el cuadrado apoyado sobre ese lado la muestra en sus dos bordes.
3. Contador → potencia: al tocar un cuadrado rotulado, su contador se contrae y se transforma con un morph en el lado con el exponente arriba; `9` pasa a ser `3²` sin dejar de ser el mismo número y el cuadrado se aclara hasta ser contorno.
4. Tres contadores → ecuación: al vaciar los chicos en el grande con los tres ya en forma de potencia, las tres fichas se despegan de sus marcos y se ordenan en el renglón `3² + 4² = 5²`, con los marcos tenues detrás.
5. Números → letras: al arrastrar un vértice y ver que la ecuación se rearma sola con otros números, las cifras se desvanecen y quedan `a`, `b` y `c` sobre los lados y en el renglón. Tocar cualquier letra devuelve su cuadrado como fantasma.

## Concepto formal

Lo que queda al final, como texto corto con voz sobre los tres cuadrados: en un triángulo rectángulo, el cuadrado del lado de enfrente del ángulo recto es igual a la suma de los cuadrados de los otros dos; ese lado se llama hipotenusa y es siempre el más largo; si los tres cuadrados cumplen esa relación, el triángulo es rectángulo. Casos: la relación vale solo con ángulo recto, y arrastrar el vértice la rompe en el acto; la tercera frase es la vuelta del teorema y permite usarlo para reconocer un ángulo recto; hay ternas de enteros como 3, 4, 5 o 5, 12, 13, pero la mayoría de los triángulos rectángulos tiene algún lado que se lee como raíz; despejar un cateto es restar en vez de sumar. Propiedades: las baldosas de los dos chicos llenan el grande, el hueco de las cuatro copias no cambia de tamaño, la relación es reversible, vale solo con ángulo recto, y las ternas de enteros son raras. Símbolo nuevo: no un carácter sino la ecuación como enunciado, necesaria desde el momento en que el triángulo aparece dentro de otra figura, sin cuadrados dibujados y sin nada que embaldosar. El exponente y la raíz ya nacieron en el nodo 22.

## Generalización

El jardín se retira en `formal`, más tarde que en los otros nodos de geometría, porque el reacomodo sigue siendo la mejor justificación cuando la fórmula ya está escrita. Hasta ahí, tocar cualquier término devuelve su cuadrado como fantasma.

Variantes sin ayuda visual: hipotenusa desconocida con catetos enteros; cateto desconocido, que obliga a restar; resultados que no son enteros y quedan como raíz; el triángulo rectángulo no dibujado dentro de un rectángulo, un trapecio o un rombo; la vuelta del teorema, decidir si un triángulo de lados dados es rectángulo; y el triángulo que hay que fabricar bajando una altura o uniendo dos puntos de una grilla. Cuando el jugador encuentra por sí mismo el triángulo rectángulo dentro de una figura que no lo muestra, elige qué lado es la hipotenusa sin que esté señalado y distingue cuándo sumar y cuándo restar sin probar las dos, la analogía se eliminó.

## Desafío

Siete niveles. Cada uno cambia la capa o endurece los parámetros, nunca las dos cosas:

1. **Vaciar la carretilla.** `real` y `concrete`, `manipulate`. Triángulos de catetos enteros chicos, baldosas justas. Solo se pasa de los chicos al grande.
2. **Mover el vértice.** `concrete`, `recognize` y `manipulate`. El vértice se arrastra y las baldosas dejan de alcanzar o sobran. Aparece la marca de ángulo recto como señal.
3. **Cuatro copias.** `concrete` y `visual`, `explain`. El modo de las cuatro copias y los dos acomodos lado a lado. Es la demostración y no se saltea nunca.
4. **Potencias.** `visual` y primera mitad de `symbolic`, `manipulate` y `apply`. Los contadores se vuelven potencias y aparece el renglón con números. Ternas enteras.
5. **Despejar el cateto.** `symbolic`, `apply`. Se da la hipotenusa y un cateto; hay que vaciar el grande en uno de los chicos. Aparece `distribute_over_wrong_op`.
6. **Sin cuadrados.** Segunda mitad de `symbolic`, `apply` y `generalize`. Los marcos se piden con un toque. Parámetros: resultados que quedan como raíz, y el triángulo rectángulo escondido dentro de un rectángulo o un trapecio.
7. **La vuelta del teorema.** `formal` y `abstract`, `generalize`. Definición corta con voz; decidir si un triángulo de lados dados es rectángulo, y fabricar el triángulo bajando una altura o uniendo dos puntos.

Qué endurece cada parámetro: el cateto desconocido rompe la lectura "siempre sumo"; el resultado irracional rompe la expectativa de número redondo y obliga a dejar la raíz escrita; el triángulo escondido rompe la idea de que el enunciado trae la figura lista; la vuelta del teorema lo convierte de herramienta de medida en herramienta de reconocimiento.

Desafíos de olimpíada ([S](../S-desafios/S0-desafios.md)), abiertos por conjunto de nodos: `ch.geom.trapezoid_hidden_height` pide bajar dos alturas y usar Pitágoras en el triángulo que aparece al costado; `ch.geom.chord_distance_from_center` combina el radio que parte la cuerda con este nodo y es el primero donde el triángulo rectángulo aparece dentro de un círculo; `ch.geom.inscribed_right_angle_area` junta el ángulo inscripto con las baldosas del nodo 38; `ch.geom.altitude_hypotenuse_three_similar` es el más completo de la rama y combina Pitágoras, semejanza y la caza de datos ocultos con un solo trazo. Más lejos, el nodo reaparece en `ch.calc.sliding_ladder_rates`, donde la escalera del problema intuitivo vuelve con velocidades, y en `ch.linalg.shadow_gives_the_height`, con proyecciones.

## Mastery

Un ejemplo por verbo de [K](../K-evaluacion.md):

- `recognize`: cuatro triángulos con cuadrados dibujados sobre sus lados. Tocar aquel donde los dos chicos llenan exactamente el grande. Los distractores son casi rectángulos, uno obtuso donde el grande sobra y uno acutángulo donde falta.
- `explain`: tres animaciones sobre el mismo marco: las cuatro copias que pasan de un acomodo al otro con el hueco cambiando de forma y no de tamaño; las cuatro copias que se superponen y dejan un hueco menor; los cuadrados chicos apilados en vez de reacomodados. Tocar la que muestra por qué el hueco no cambia de tamaño. El distractor elegido clasifica.
- `manipulate`: reacomodar las baldosas de los dos cuadrados chicos hasta cubrir el de la hipotenusa sin que sobre ni falte ninguna.
- `apply`: triángulo rectángulo de catetos 5 y 12, armar con fichas la hipotenusa; después uno con hipotenusa 10 y un cateto 6, que obliga a restar, contra el tiempo objetivo del nodo.
- `generalize`: un triángulo sin ángulo recto; decidir dónde bajar la altura para que aparezca un triángulo rectángulo y aplicar la relación en la mitad que corresponde.
- `transfer`: en la grilla de `linalg.vec.vector_as_displacement`, unir dos puntos con una flecha y armar su longitud con las fichas, usando el triángulo que la flecha forma con las direcciones de la grilla.

Misconception esperada ([L0](../L-modelo-errores/L0-taxonomia.md)):

- `distribute_over_wrong_op`, patrón `missing_piece_tiles` sobre las baldosas, que es la mecánica del nodo. Con catetos 3 y 4 el jugador responde 7, o escribe la raíz de la suma como la suma de las raíces. Es el mismo error que en `(a + b)²` da `a² + b²`, dado vuelta. El juego arma el cuadrado de lado 7 que el jugador propuso, superpone el de la hipotenusa verdadera y deja brillando la franja que sobra, que son los dos rectángulos de `3 × 4`. Voz: "Este cuadrado tiene de más. ¿Cuántas baldosas tenían de verdad los dos chicos juntos?". Las baldosas de los dos chicos vuelven a la carretilla y el jugador llena el grande desde ahí. Severidad 3: es la más alta del nodo y bloquea, porque quien la conserva no puede usar Pitágoras en ningún desafío.

Los acomodos que dejan huecos y las alturas torcidas no son misconceptions: la mecánica los rechaza en el momento. Los distractores de `explain` y las opciones de `apply` se generan desde la regla `detect` de `distribute_over_wrong_op` y las de los prerequisitos directos, entre ellas `area_uses_slant_side` y `sqrt_loses_negative_branch`.

## Implementación

**Escenas** ([I](../I-manim/I0-mapping.md)):

- `tile_scene_pythagoras_rearrangement`, ruta doble, pre-renderizada y nativa, parametrizada por los catetos y por el patrón de reacomodo. Las cuatro copias del triángulo se mueven por caminos hasta el segundo acomodo en cascada, y el hueco queda resaltado en los dos estados con una llave que lo mide; gramática `invariant`. Abre el nivel 3 y es la imagen de cheatsheet de `cs.geom.pythagoras`. En su forma nativa produce también las animaciones de `explain`, variando el acomodo, incluido el que se superpone.
- `construction_scene_altitude_to_hypotenuse`, nativa, parametrizada por los vértices y por cuál es el ángulo recto. La altura baja punteada hasta la hipotenusa, el triángulo queda partido en dos y cada mitad se resalta con su propia marca de ángulo recto; gramática `invariant`. Abre los niveles 6 y 7 y es la imagen de `cs.geom.strategy_find_right_triangle`.
- Las dos son `text_free`: las letras y los números los dibuja el runtime según el locale ([P](../P-internacionalizacion.md)).
- Reusadas: `tile_scene_rectangle_rows` del nodo 38, para contar cualquiera de los tres cuadrados, y `construction_scene_triangle_half_rectangle`, cuando las cuatro copias se cuentan como dos rectángulos.

**Generadores** (por nombre, desde el registro de [O](../O-arquitectura-tecnica.md)):

- `gen_right_triangle`: `legs` (ternas enteras en los niveles 1 a 5, catetos que dan hipotenusa irracional desde el 6); `unknown_side` en {hipotenusa, cateto}; `orientation`, el giro del triángulo, que decide si algún cateto queda horizontal; `show_squares`; `seed`.
- `gen_four_copies`: patrón de acomodo (hueco central o dos huecos en diagonal), orden en que las copias entran, y si una copia se ofrece ya colocada como pista.
- `gen_hidden_right_triangle`: figura contenedora (rectángulo, trapecio, rombo, semicírculo), qué trazo la parte, y cuál de las medidas se oculta.
- `gen_triple_check`: ternas de lados, la mitad de ellas rectangulares y la otra mitad cerca de serlo, para la vuelta del teorema del nivel 7.

**Literacy soportada:** de `icons` a `full_text`. El mínimo es `icons` y no `none` porque desde el nivel 4 los lados llevan un número y la ecuación aparece con exponentes. La primera capa se juega sin leer: se arrastran baldosas de un marco a otro, se acomodan cuatro triángulos, se baja una altura con el dedo, y `explain` es elegir entre animaciones. En `full_text` la definición corta se muestra escrita además de narrada.

**Instrucción por demostración:** la primera vez, una mano fantasma toma baldosas del cuadrado chico y las lleva al grande hasta vaciarlo, sigue con el otro y el triángulo chasquea. La escena vuelve al inicio y la carretilla late. Se repite solo si el jugador se queda quieto. La demostración de las cuatro copias es aparte y se hace una vez en el nivel 3: la mano coloca las cuatro en las esquinas y después las reacomoda sin sacarlas del marco ([Q](../Q-edad-universal.md)).

**Sin constantes propias.** Tiempo objetivo, umbrales de ítems por verbo, ventana de misconceptions y espera de la demostración viven en [K](../K-evaluacion.md).
