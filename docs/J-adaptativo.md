# J — Aprendizaje adaptativo

Nadie empieza en el mismo lugar. Una persona de seis años, un adulto que dejó la matemática hace veinte años y alguien que cursa cálculo necesitan entrar por puertas distintas al mismo grafo. Este documento define cómo el diagnóstico ubica a cada jugador y cómo el selector decide, sesión a sesión, qué jugar. Todas las constantes numéricas que se citan viven en [K](K-evaluacion.md); acá se nombran, no se repiten.

## Principios

- **Nunca se saltan prerequisitos.** Un nodo solo se juega cuando todos sus prerequisitos directos están en `ready` o `mastered`. Es la regla dura del [grafo](C-knowledge-graph/C0-esquema.md) y no admite excepciones, ni siquiera para quien "ya lo vio en la universidad".
- **El diagnóstico coloca, no certifica.** Nada queda en `mastered` por diagnóstico y la transferencia nunca se concede. La colocación es provisional y se verifica en silencio durante el juego.
- **Los errores del diagnóstico son datos.** Cada ítem se genera con distractores derivados de las misconceptions del nodo ([L](L-modelo-errores/L0-taxonomia.md)), así que el diagnóstico también siembra el perfil de errores.
- **Sin puertas por edad.** El diagnóstico tiene una rama completa sin lectura ([Q](Q-edad-universal.md)); lo que cambia es el modo de presentar, no el contenido.

## Diagnóstico

Dura entre quince y veinte minutos, unos treinta ítems, y tiene tres partes.

### 1. Prior

Tres botones con voz: "hace mucho que no hago matemática", "terminé la secundaria", "hice matemática en la universidad". Para un perfil que declara no leer, la app ofrece una cuarta entrada implícita: empezar directamente por el nivel 0 sin búsqueda. El prior fija el índice inicial de la búsqueda en la espina: los nodos 3, 13 y 26 respectivamente (`arith.add.displacement`, `alg.eq.one_step`, `calc1.deriv.rate_as_slope_limit`).

### 2. Búsqueda binaria sobre la espina

La [espina](C-knowledge-graph/spine.yaml) tiene 44 nodos. Para la búsqueda se ordenan por `(level, n)`: los nodos 38 a 44 de geometría y trigonometría se intercalan por nivel entre los demás, de modo que la lista de búsqueda es un orden topológico por dificultad y no el orden de numeración.

Un **probe** de un nodo es un ítem `apply` más un ítem `explain`, ambos dentro de la mecánica del nodo. El probe pasa si el `apply` es correcto y el `explain` obtiene al menos crédito parcial. La búsqueda hace bisección desde el índice del prior; con 44 nodos alcanzan seis probes, y se presupuestan ocho para absorber ruido: un probe fallido seguido de uno aprobado un escalón más arriba se trata como ruido y se repite una vez. Dos fallos consecutivos en los tres primeros nodos detienen la búsqueda y colocan al jugador en el nivel 0.

Salida: la **frontera** `k`, el nodo de espina más alto aprobado.

### 3. Backfill de prerequisitos

Se prueban con un ítem `manipulate` cada uno: los seis nodos de espina inmediatamente anteriores a `k`, y todos los prerequisitos fuera de la espina de `spine[k]` y de `spine[k+1]`. Es la parte que detecta al adulto que resuelve derivadas pero suma fracciones cruzadas: el nodo de fracciones falla, queda en `in_progress`, y sus sucesores se bloquean hasta que lo repase. Un desvío de diez minutos que evita meses de errores arrastrados.

### 4. Reglas de colocación

- Los nodos de espina anteriores a `k` que pasaron el backfill, o que no se probaron, pasan a `ready` **provisional** con los valores `DIAG_*` de K (transferencia en cero, vida media de dos semanas).
- Un nodo que falla el backfill queda en `in_progress` con `A` bajo, y sus sucesores quedan `locked`.
- Nodos fuera de la espina: **inferencia sándwich**. Quedan `ready` provisional si todos sus prerequisitos están `ready` y al menos un sucesor suyo en la espina pasó; si no, siguen las reglas normales de `available` o `locked`.
- Un nodo provisional recibe un ítem de repaso silencioso la primera vez que se trabaja un sucesor; si falla, baja a `in_progress` sin ceremonia.
- Los nodos `found.lit.*` (pre-lectura) se marcan `ready` automáticamente para cualquier prior que no sea "no leo".

### Rama sin lectura

Si el jugador elige la entrada sin lectura o si el dispositivo está en un perfil marcado como tal, el diagnóstico no busca: presenta cuatro actividades cortas del nivel 0 (contar, comparar, clasificar, patrones) con instrucción por demostración y narración, y usa el resultado para decidir si el nivel 0 está `ready` o si se empieza por el nodo 1. No hay ítems con texto en esta rama.

## Selector diario

Una sesión dura alrededor de quince minutos y contiene entre cuatro y seis actividades; para perfiles con `literacy: none` la duración objetivo baja a cinco u ocho minutos ([Q](Q-edad-universal.md)). Al empezar la sesión el selector construye una lista de prioridades y llena los slots en este orden, con estos topes:

| Orden | Slot | Regla | Tope |
|---|---|---|---|
| 1 | Repasos vencidos | nodos `ready` o `mastered` con retención por debajo de `REVIEW_DUE`; los `decayed` primero | 1–2 slots, nunca más del 40 % de la sesión |
| 2 | Remediación de misconception | cualquier misconception vista dos o más veces en las últimas tres sesiones dispara su patrón de explicación más dos ítems | 1 slot |
| 3 | Frontera | el nodo `available` que minimiza `(level, no-espina, −cantidad de sucesores)`; se trabaja la dimensión más baja en el orden F → U → A → S, que coincide con el orden de capas | 2 nodos nuevos por sesión |
| 4 | Transferencia | un ítem `transfer` para un nodo `ready` con T baja, elegido para caer en un área que el jugador tocó hace poco | 1 slot |
| 5 | Desafío | si hay un desafío desbloqueado ([S](S-desafios/S0-desafios.md)) y el jugador no jugó ninguno en las últimas dos sesiones, se ofrece, nunca se impone | 1 slot |
| 6 | Juego libre | calculadora o sandbox con la operación más nueva desbloqueada; siempre último | 1 slot |

Restricciones adicionales:

- Nunca se presenta un nodo cuyo prerequisito esté `decayed` sin un ítem de verificación de ese prerequisito antes.
- Cuando hay dos o más áreas abiertas, cada sesión intercala al menos dos.
- Si el jugador falla tres ítems seguidos en el nodo de frontera, el selector baja a su prerequisito más débil (por `A_eff`) durante una actividad y después vuelve.
- La detección de fatiga (latencias crecientes, errores en cadena en ítems que antes acertaba) corta la sesión con el slot de juego libre aunque queden slots sin llenar.
- El selector explica cada slot con una frase visible ("repaso: hace nueve días que no abrís cofres"), porque la transparencia del criterio es parte de la motivación ([N](N-ux-ui.md)).

## Qué aprende el sistema del jugador

El modelo de usuario ([O](O-arquitectura-tecnica.md)) guarda un log de eventos de aprendizaje y calcula el estado con un fold determinista: los seis puntajes por nodo, el perfil de misconceptions con sus fechas, la velocidad de aprendizaje por área (cuántos ítems tardó cada nodo en llegar a `ready`), las capas alcanzadas por nodo (que alimentan la cheatsheet, [R](R-cheatsheet/R0-cheatsheet.md)), los desbloqueos de la calculadora ([M](M-calculadora/M0-progresion.md)) y los desafíos resueltos con su modo. Nada de esto requiere identidad: funciona con un perfil local sin cuenta.

## Casos que el selector debe resolver bien

- **El niño que salta de rama.** Grafos (37) solo necesita contar; el selector lo ofrece como frontera alternativa cuando aritmética se estanca, sin forzarlo.
- **El adulto con lagunas puntuales.** El backfill lo detecta; la remediación se hace con la mecánica del nodo débil, no con un "repaso de fracciones" genérico.
- **El universitario que quiere ir a lo suyo.** Puede: la colocación provisional le abre cálculo, pero la transferencia lo hará volver a la llave ([E](E-mecanicas/E0-catalogo.md)) desde el teorema fundamental, y el ítem silencioso de repaso lo bajará si la base era de cartón.
- **La persona que vuelve después de meses.** Todo está `decayed`; la sesión es casi toda repaso y el selector lo dice.

## Simulación como verificación

Antes de tocar las constantes de K se corren jugadores sintéticos con perfiles paramétricos de habilidad y de misconceptions durante mil sesiones cada uno, con semilla fija. Se verifica que nunca se viola la regla de prerequisitos, que ningún nodo queda sin repaso indefinidamente, que la cobertura del grafo crece con las sesiones y que el mastery converge. Está descrito en la estrategia de testing de [O](O-arquitectura-tecnica.md).
