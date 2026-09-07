# 41 — Pitágoras reordenando baldosas (`geom.tri.pythagoras_as_tiles`)

> Locale `es`: "Pitágoras reordenando baldosas". Minijuego: [Los tres cuadrados](../../F-minijuegos/geom.tri.pythagoras_as_tiles.md).

**Nodo:** `geom.tri.pythagoras_as_tiles` · **Área:** geom · **Nivel:** 3 · **Primitiva:** `invariant` · **Mecánica principal:** `tiles` (secundaria `construct`) · **Literacy:** `icons` · **Analogía:** `square_garden_side`

## 1. Concepto

En un triángulo rectángulo, las baldosas de los cuadrados construidos sobre los dos lados cortos llenan exactamente el cuadrado construido sobre el lado largo. Al terminar, el jugador reacomoda esas baldosas hasta cubrir el cuadrado grande sin que sobre ni falte ninguna, calcula un lado desconocido a partir de los otros dos, y encuentra el triángulo rectángulo escondido dentro de una figura que no lo muestra. Antes sabía leer el lado de un cuadrado a partir de su área; no sabía que tres cuadrados pueden estar atados entre sí por un triángulo.

## 2. Prerequisitos

- `geom.area.rect_and_triangle` (nodo 38): el área como baldosas y, sobre todo, el invariante que las baldosas conservan al reacomodarse. Todo el nodo es ese invariante aplicado a tres cuadrados. Se usa también la mitad del rectángulo, porque las cuatro copias del triángulo que rodean el hueco se cuentan como dos rectángulos.
- `alg.fn.quadratic_and_sqrt` (nodo 22): el cuadrado de un número como área de un cuadrado y la raíz como el lado que se lee del área. Se usa el jardín entero: la parcela cuadrada, el lado, conocer el área y buscar el lado. De acá viene la notación de exponente, que en este nodo no nace sino que se aplica, y viene también `distribute_over_wrong_op`, que es la misconception del nodo.

La arista con el nodo 22 no es la del orden escolar, donde Pitágoras se enseña en geometría mucho antes que la función cuadrática. [C0](../../C-knowledge-graph/C0-esquema.md) la invierte porque `a² + b² = c²` no se puede escribir sin que el exponente signifique algo, y porque despejar el lado exige la raíz. Quien llega sin el nodo 22 memoriza tres letras; quien llega con él ve tres cuadrados.

## 3. Dificultad cognitiva real

Lo difícil no es aplicar la fórmula. Son cuatro capacidades:

1. **El teorema es sobre áreas, no sobre longitudes.** `a² + b²` no es una suma de lados: es una suma de pisos. Mientras el jugador vea números elevados al cuadrado y no cuadrados, el enunciado es arbitrario.
2. **El hueco cambia de forma y no de tamaño.** Cuatro copias del triángulo dentro de un marco cuadrado dejan un hueco; al reacomodarlas, el hueco se parte en dos y el total no cambia. Ese es el argumento entero, y es un argumento de invariante, no de cuenta.
3. **La raíz de una suma no es la suma de las raíces.** `√(a² + b²)` no es `a + b`. Falla en `distribute_over_wrong_op`, que es el error de severidad 3 del nodo y viene arrastrado desde el álgebra.
4. **Encontrar el triángulo rectángulo escondido.** Casi ningún problema real trae el triángulo dibujado. Hay que bajar una altura, unir dos puntos o prolongar un lado para que aparezca. Es la capacidad que este nodo aporta a los desafíos.

## 4. Problema intuitivo

Una escalera apoyada contra una pared, en un patio embaldosado. El pie de la escalera está a tres baldosas de la pared; la escalera llega a cuatro baldosas de alto. La pregunta, por gesto: ¿cuántas baldosas mide la escalera?

En `real` el jugador arrastra el pie de la escalera y la ve subir y bajar por la pared. En `intuition` la escena se detiene con la escalera quieta y tres desenlaces dibujados: la escalera mide 7, que es 3 más 4; mide entre 4 y 7, más cerca de 5; mide 12, que es 3 por 4. El jugador elige y después ve: la escalera se acuesta sobre el piso y se mide con baldosas. Da 5. Nadie explica por qué todavía.

## 5. Analogía del mundo real

`square_garden_side` (mecánica `tiles`), la del YAML, la misma del nodo 22 y ahora con tres parcelas en vez de una ([G0](../../G-analogias/G0-reglas.md)).

Mapa: parcela cuadrada → el cuadrado de un lado; largo del lado → el lado; conocer el área y buscar el lado → la raíz cuadrada; agregar dos tiras iguales en dos bordes → completar el cuadrado; baldosa de esquina que falta → la constante que hay que agregar; parcela que crece con el lado → crecimiento cuadrático.

En este nodo el patio tiene tres parcelas cuadradas apoyadas sobre los tres lados de un triángulo rectángulo, y una carretilla con las baldosas de las dos chicas. Invariante que conserva: la cantidad de baldosas de la carretilla no cambia mientras se las mueve, así que si llenan la parcela grande es porque eran exactamente las que hacían falta. Es `area_preserved_under_rearrangement`, el invariante de la mecánica.

Ruptura: `two_branches_of_sqrt`. Un lado negativo no cabe en una parcela, así que la raíz de las baldosas devuelve un solo valor y el jugador no ve la otra rama. La analogía se retira recién en `formal`, más tarde que en la mayoría de los nodos, porque el argumento del reacomodo sigue siendo la mejor prueba cuando la fórmula ya está escrita.

Por qué esta y no otra: es la única analogía del catálogo en la que un número elevado al cuadrado es una superficie que se puede vaciar y volver a llenar. Con cualquier otra, `a²` es una cuenta y el teorema es un dato que hay que creer.

## 6. Mecánica de juego

Primera capa jugable: `real`. `tiles` es la mecánica principal y `construct` traza lo que falta ([E0](../../E-mecanicas/E0-catalogo.md)). Gestos: `drag`, `tap` y `pinch` para las baldosas; `drag`, `tap` y `hold` para el trazo.

1. Un triángulo rectángulo en el centro, con la marca de ángulo recto. Sobre cada lado, un marco cuadrado apoyado hacia afuera. Los dos chicos vienen llenos de baldosas; el grande está vacío.
2. El jugador arrastra baldosas de los cuadrados chicos al grande. Las baldosas se pegan entre sí y al borde. Si el jugador vacía los dos chicos y el grande queda completo, el triángulo hace un chasquido y los tres marcos brillan a la vez.
3. Si el triángulo no es rectángulo, las baldosas de los chicos no alcanzan o sobran, y el hueco o el montón sobrante quedan a la vista. El jugador puede arrastrar el vértice hasta que la marca de ángulo recto aparece y las baldosas encajan.
4. Modo de las cuatro copias: un marco cuadrado grande y cuatro copias del triángulo en la bandeja. El jugador las acomoda en las esquinas. En un acomodo queda un hueco cuadrado en el centro; en el otro quedan dos huecos cuadrados en una diagonal. Las cuatro copias no se mueven de tamaño y el hueco total tampoco. Los dos acomodos se pueden ver uno al lado del otro con `tap`.
5. Recortar y pegar: mantener el dedo sobre un cuadrado chico lo parte en tiras que se pueden girar y deslizar. Es la vía para llenar el grande cuando los lados no son enteros y las baldosas sueltas no alcanzan.
6. Trazar: sobre un triángulo cualquiera, el jugador baja una altura desde un vértice. Si llega perpendicular, se fija y el triángulo queda partido en dos rectángulos donde antes no había ninguno. Cada mitad ya tiene su ángulo recto y sus tres cuadrados.
7. Verificación: tocar el cuadrado grande lleno hace que sus baldosas se levanten y vuelvan solas a los dos chicos, que quedan exactamente completos.

Nada se llama error. Un acomodo que deja huecos deja huecos; una altura torcida se desvanece; baldosas de más vuelven a la bandeja con un rebote.

## 7. Representación visual

Capa `visual`, primitiva `invariant` dominante ([H](../../H-progresion-abstraccion.md)).

`invariant`: los dos acomodos de las cuatro copias se muestran uno al lado del otro, con el hueco iluminado en los dos y el mismo contador de baldosas en los dos. Se desplazan los triángulos, se conserva el hueco. Es la visualización central del nodo y es lo que hace que el teorema no necesite ninguna cuenta para creerse.

`scale` de apoyo: los tres cuadrados se dibujan sobre una cuadrícula común, con la misma baldosa unidad. Al arrastrar un vértice del triángulo, los tres cuadrados cambian de tamaño juntos y sus contadores cambian en sincronía, siempre con los dos chicos sumando el grande.

Los lados del triángulo se dibujan llenos; la altura, cuando aparece, punteada y con la marca de ángulo recto. La hipotenusa se distingue por posición, enfrente del ángulo recto, antes de tener nombre.

Todavía no hay letras sobre los lados, ni la ecuación, ni el signo de raíz sobre la figura: hay tres contadores.

## 8. Transición a símbolos

Cinco pasos sobre el mismo objeto, cada uno disparado por un gesto. Siguen el desvanecimiento de la mecánica: baldosas sueltas, cuadrícula, lados rotulados, notación de producto.

1. **Baldosas sueltas → cuadrícula.** Al completar el cuadrado grande por primera vez en `visual`, las baldosas de los tres cuadrados pierden el borde individual y quedan las líneas. Los tres contadores siguen.
2. **Lados rotulados.** Al tocar un lado del triángulo, aparece una llave con su medida. Con los tres puestos, el cuadrado apoyado sobre cada lado muestra su medida en los dos bordes.
3. **Contador → potencia.** Al tocar un cuadrado rotulado, su contador se contrae y se transforma con un morph en el lado con el exponente arriba: `9` pasa a ser `3²` sin dejar de ser el mismo número, y el cuadrado se aclara hasta ser contorno. El exponente no es nuevo: viene del jardín del nodo 22 y acá vuelve a ser una superficie.
4. **Tres contadores → ecuación.** Al vaciar los chicos en el grande con los tres ya en forma de potencia, las tres fichas se despegan de sus marcos y se ordenan en un renglón con un más y un igual: `3² + 4² = 5²`. Los marcos quedan como contornos tenues detrás.
5. **Números → letras.** Al arrastrar un vértice y ver que la ecuación se rearma sola con otros números, las cifras se desvanecen y quedan `a`, `b` y `c` sobre los lados y en el renglón. La ecuación deja de ser un caso y pasa a ser la regla; tocar cualquier letra devuelve su cuadrado como fantasma.

## 9. Notación matemática

Queda `a² + b² = c²`, con `a` y `b` sobre los lados que forman el ángulo recto y `c` sobre el lado de enfrente, y el signo de raíz para despejar `c` o un cateto.

El símbolo nuevo es **la ecuación misma como enunciado**, no un carácter. Por la regla de oro de [H](../../H-progresion-abstraccion.md) llega con el problema que la hace necesaria, y ese problema aparece en el paso 5: mientras los tres cuadrados están dibujados, no hace falta escribir nada, porque las baldosas se cuentan. La escritura se vuelve necesaria cuando el triángulo aparece sin cuadrados, dentro de otra figura, y hay que aplicar la relación sin poder embaldosar nada. Ahí `a² + b² = c²` es lo único que sobrevive del patio.

El exponente `²` y el signo de raíz ya nacieron en el nodo 22. Los nombres cateto e hipotenusa son convención de escritura: se introducen por posición, el de enfrente del ángulo recto es la hipotenusa, y hacen falta porque en la ecuación los tres lados no son intercambiables y hay que poder decir cuál va solo del otro lado del igual.

## 10. Definición formal

Capa `formal`: tres frases cortas con voz, con los tres cuadrados al lado.

"En un triángulo rectángulo, el cuadrado del lado de enfrente del ángulo recto es igual a la suma de los cuadrados de los otros dos." "Ese lado se llama hipotenusa y es siempre el más largo." "Si los tres cuadrados cumplen esa relación, el triángulo es rectángulo."

Condiciones y casos especiales, verificados sobre el objeto: la relación vale solo con ángulo recto, y arrastrar el vértice fuera del recto la rompe en el acto. La tercera frase es la vuelta, y es la que permite usar el teorema para reconocer un ángulo recto en vez de para medir. Hay ternas de enteros que la cumplen, como 3, 4 y 5 o 5, 12 y 13; la mayoría de los triángulos rectángulos tiene por lo menos un lado que no es entero, y ahí el lado se lee como raíz. Despejar un cateto es restar en vez de sumar.

Ya jugado: las dos primeras frases enteras y las ternas. Nuevo: la vuelta del teorema y el nombre hipotenusa.

## 11. Propiedades

- **Las baldosas de los dos cuadrados chicos llenan el grande.** Ligada al gesto central de vaciar la carretilla en el marco vacío.
- **El hueco de las cuatro copias no cambia de tamaño al reacomodarlas.** Ligada a los dos acomodos vistos uno al lado del otro. Es la demostración, jugada antes de ser dicha.
- **La relación es reversible.** Con dos lados se obtiene el tercero, sumando si falta la hipotenusa y restando si falta un cateto. Ligada a vaciar el cuadrado grande en uno de los chicos.
- **Vale solo con ángulo recto.** Ligada a arrastrar el vértice y ver que las baldosas dejan de alcanzar o sobran.
- **Las ternas de enteros son raras.** Ligada a arrastrar el vértice buscando que los tres contadores queden redondos, y encontrar muy pocas.

## 12. Ejercicios como minijuegos

Las probes del locale, con los verbos de [K](../../K-evaluacion.md):

- `recognize`: varios triángulos con cuadrados dibujados sobre sus lados. Tocar aquel donde los dos cuadrados chicos llenan exactamente el grande. Los distractores son triángulos casi rectángulos, uno obtuso donde el grande sobra y uno acutángulo donde falta.
- `explain`: el jugador arrastra las cuatro copias del triángulo dentro del cuadrado grande y después elige entre animaciones: las cuatro copias que pasan de un acomodo al otro con el hueco cambiando de forma y no de tamaño; las cuatro copias que se superponen y dejan un hueco menor; los cuadrados chicos que se apilan en vez de reacomodarse. Toca la que muestra por qué el hueco no cambia de tamaño.
- `manipulate`: reacomodar las baldosas de los dos cuadrados chicos hasta cubrir el de la hipotenusa sin que sobre ni falte ninguna.
- `apply`: un triángulo rectángulo con catetos 5 y 12. Armar con fichas la longitud de la hipotenusa. Después uno con hipotenusa 10 y un cateto 6, que obliga a restar, contra el tiempo objetivo del nodo.
- `generalize`: un triángulo sin ángulo recto. Decidir dónde bajar la altura para que aparezca un triángulo rectángulo, y aplicar la relación en la mitad que corresponde.
- `transfer`: en la grilla de `linalg.vec.vector_as_displacement`, unir dos puntos con una flecha y armar su longitud con las fichas, usando el triángulo que la flecha forma con las direcciones de la grilla.

Misconception esperada y su patrón ([L0](../../L-modelo-errores/L0-taxonomia.md)):

- **`distribute_over_wrong_op`** (patrón `missing_piece_tiles`, mecánica `tiles`, que es la del nodo). Con catetos 3 y 4 el jugador responde 7, o en notación escribe la raíz de la suma como la suma de las raíces. Es el mismo error que en `(a + b)²` da `a² + b²`, dado vuelta. El juego arma el cuadrado de lado 7 que el jugador propuso, superpone el cuadrado de la hipotenusa verdadera encima y deja brillando la franja que sobra, que son justamente los dos rectángulos de `3 × 4`. Voz: "Este cuadrado tiene de más. ¿Cuántas baldosas tenían de verdad los dos chicos juntos?". Las baldosas de los dos cuadrados chicos vuelven a la carretilla y el jugador llena el grande desde ahí. Severidad 3: es la más alta del nodo y bloquea, porque quien la conserva no puede usar Pitágoras en ningún desafío.

Los acomodos que dejan huecos y las alturas torcidas no son misconceptions: son movimientos que la mecánica rechaza en el momento.

## 13. Generalización

La analogía se retira en `formal`, más tarde que en los otros nodos de geometría, porque el reacomodo sigue siendo la mejor justificación cuando la fórmula ya está escrita. Hasta ahí, tocar cualquier término de la ecuación devuelve su cuadrado como fantasma.

Variantes sin ayuda visual, en orden: hipotenusa desconocida con catetos enteros; cateto desconocido, que obliga a restar; resultados que no son enteros y quedan como raíz; el triángulo rectángulo no dibujado dentro de un rectángulo, de un trapecio o de un rombo; la vuelta del teorema, decidir si un triángulo de lados dados es rectángulo; y el triángulo rectángulo que hay que fabricar bajando una altura o uniendo dos puntos de una grilla.

El nodo está en `abstract` cuando el jugador encuentra por sí mismo el triángulo rectángulo dentro de una figura que no lo muestra, elige qué lado es la hipotenusa sin que esté señalado, y distingue cuándo hay que sumar y cuándo restar sin probar las dos.

## 14. Transferencia y concepto siguiente

Los tres nodos de `transfer_to`, en otras áreas y con otra mecánica:

- `trig.id.pythagorean_identity`: el mismo enunciado sobre el triángulo de radio 1 del círculo. Los tres cuadrados se vuelven la identidad que relaciona seno y coseno, y el cuadrado grande es siempre el mismo.
- `linalg.vec.vector_as_displacement`: la longitud de una flecha a partir de sus dos componentes. El triángulo lo arma la grilla y el jugador solo lo reconoce.
- `adv.cplx.plane_and_modulus`: el módulo de un número complejo como la distancia al origen. La misma cuenta, con la parte real y la imaginaria como catetos.

Concepto siguiente: `geom.coord.distance_as_pythagoras`. Frase puente, narrada sobre el último triángulo con la altura trazada: "Sabés medir el lado largo si conocés los dos cortos. ¿Y si en vez de un triángulo tenés dos puntos sueltos en una grilla, y ningún lado dibujado?". Los dos catetos aparecen punteados entre los dos puntos y el nodo siguiente empieza ahí.

---

**Visualización:** dos escenas del YAML, resueltas en [I](../../I-manim/I0-mapping.md). `tile_scene_pythagoras_rearrangement` tiene ruta doble, pre-renderizada y nativa: los catetos y el patrón de reacomodo son parámetros, las cuatro copias del triángulo se mueven por caminos hasta el segundo acomodo en cascada, y el hueco queda resaltado en los dos estados con una llave que lo mide; gramática `invariant`. `construction_scene_altitude_to_hypotenuse` es nativa, parametrizada por los vértices y por cuál es el ángulo recto: la altura baja punteada hasta la hipotenusa, el triángulo queda partido en dos y cada mitad se resalta con su propia marca de ángulo recto; gramática `invariant`. Las dos son `text_free`; las letras y los números los dibuja el runtime según el locale ([P](../../P-internacionalizacion.md)). La primera genera las animaciones de `explain` variando el acomodo, incluido el que se superpone.

**Calculadora:** en `ready` se habilita `op_pythagoras` ([M](../../M-calculadora/M0-progresion.md)), de nivel 1 y con caja de pruebas. Se presenta como un triángulo rectángulo con tres casilleros: al llenar dos, el tercero se completa, y antes del resultado los tres cuadrados aparecen medio segundo con sus baldosas. Tiene dos modos, hipotenusa y cateto, y el modo se elige tocando el casillero vacío, no un menú. Devuelve la raíz exacta cuando el resultado no es entero, con el decimal disponible al tocarla. El mismo `op_pythagoras` lo reusa `geom.circle.radius_bisects_chord` para la cuerda.

**Edad universal:** el nodo es `icons` y no `none` porque desde el tercer nivel los lados llevan un número escrito y la ecuación aparece con exponentes ([Q](../../Q-edad-universal.md)). La primera capa se juega sin leer: se arrastran baldosas de un marco a otro, se acomodan cuatro triángulos en un cuadrado, se baja una altura con el dedo, y `explain` es elegir entre animaciones. La instrucción es una mano fantasma que vacía un cuadrado chico dentro del grande y espera. Un adulto llega por diagnóstico salteando `real` e `intuition`, entra en el nivel de las cuatro copias, y lo que le cambia es que el nivel de los dos acomodos no se saltea: es la demostración, y quien viene con la fórmula memorizada del colegio suele ser el que nunca la vio.
