# K — Evaluación y modelo de mastery

Este documento define cómo Mathy decide que una persona sabe algo. Es la **única fuente de constantes numéricas** del diseño: los demás documentos ([J](J-adaptativo.md), [M](M-calculadora/M0-progresion.md), [L](L-modelo-errores/L0-taxonomia.md), los YAML del grafo) citan estas constantes por nombre y no las repiten. Si un número cambia, cambia acá.

## Por qué no XP

Un contador de puntos mide cuánto se jugó, no cuánto se entiende. Diez ejercicios correctos seguidos son compatibles con no saber nada: se puede acertar por reconocimiento de patrón, por descarte o por azar. Mathy necesita saber si el jugador puede **reconocer** el concepto, **explicarlo**, **manipularlo**, **aplicarlo**, **generalizarlo** y **transferirlo**, porque el master prompt exige esas seis capacidades y porque el grafo de prerequisitos solo tiene sentido si "saber" significa algo estable.

## Verbos de evidencia e ítems

Toda actividad genera ítems etiquetados con uno de seis verbos. La etiqueta la pone el diseño de la actividad, no el jugador. Ningún ítem es una pregunta de opción múltiple con texto: cada uno se instancia dentro de la mecánica del nodo (ver [F](F-minijuegos/F0-principios.md) y [Q](Q-edad-universal.md)).

| Verbo | Qué demuestra | Cómo se ve dentro de una mecánica |
|---|---|---|
| `recognize` | distingue el concepto de otros | elegir entre cuatro cofres cuál se abre con una sola llave |
| `explain` | sabe por qué funciona | elegir la animación que justifica un paso, entre distractores que son misconceptions; predecir y después ver |
| `manipulate` | ejecuta la transformación | arrastrar la llave correcta, equilibrar la balanza, colocar baldosas |
| `apply` | usa el concepto en un problema | leer la situación y construir la ecuación antes de resolverla |
| `generalize` | reconoce la misma estructura con otros objetos | un cofre con cerradura "rotar 90°": nombrar la llave |
| `transfer` | usa el concepto en otra área y otra mecánica | la llave de "cifrado César +3" en `csmath` |

Los ítems `transfer` siempre provienen de los nodos listados en `transfer_to` del nodo evaluado, y siempre caen en **otra área**. Esa es la condición dura: la transferencia mide que el jugador reconozca la misma estructura donde no la aprendió, y lo que tiene que cambiar es la matemática, no necesariamente el gesto.

La mecánica puede repetirse, y con frecuencia conviene que se repita. Los tres regresos de la llave que organizan el curriculum (la resta deshace la suma, la función inversa, la matriz inversa y el teorema fundamental) ocurren en cuatro áreas distintas con la misma mecánica, y es justamente el gesto idéntico sobre un objeto nuevo lo que hace visible que la estructura es la misma ([E](E-mecanicas/E0-catalogo.md)). Exigir una mecánica ajena volvería ilegales los ejemplos de transferencia más fuertes del diseño.

Un ítem de transferencia que además cambia de mecánica es más exigente y vale como evidencia más fuerte, pero no es la norma. Lo que sí está prohibido es que un ítem `transfer` repita la actividad de origen: si no cambia ni el área ni el objeto matemático, no es transferencia sino repaso.

## Las seis dimensiones

Por cada par (jugador, nodo) se guardan seis puntajes en [0, 1], contadores de ítems y marcas de tiempo.

| Dimensión | Símbolo | Alimentada por | Estimador | `n_min` |
|---|---|---|---|---|
| Familiarity | F | `recognize`; ver la introducción del nodo cuenta una vez como 0.4 | EWMA, α = 0.35 | 3 |
| Understanding | U | `explain`; crédito parcial 0.5 cuando el distractor elegido es una misconception "cercana" (misma categoría) | EWMA, α = 0.30 | 3 |
| Application | A | `manipulate` + `apply` | EWMA, α = 0.25 | 5 |
| Speed | S | los mismos ítems que A; resultado 1 si correcto **y** tiempo ≤ `t_star` del nodo | EWMA, α = 0.25 | 5 |
| Transfer | T | `generalize` + `transfer` | EWMA, α = 0.35 | 3 |
| Mastery | M | compuesto (abajo) | calculado, nunca actualizado directamente | – |

**EWMA:** `score ← score + α · (resultado − score)`, con `resultado ∈ {0, 0.5, 1}`.

**Puerta de confianza:** el valor efectivo de cada dimensión es `score · min(1, n / n_min)`, donde `n` es la cantidad de ítems observados. Una respuesta afortunada no desbloquea nada.

**`t_star`:** valor por defecto 30 segundos; cada nodo puede sobreescribirlo en el YAML. Es el único parámetro de este documento que se permite ajustar por nodo, además de `n_min` en casos justificados.

## Decaimiento y repaso espaciado

Las habilidades se oxidan; la comprensión, mucho menos. Por eso:

- **A y S decaen.** Retención `R(Δt) = 2^(−Δt / h)`, donde `Δt` es el tiempo desde la última evidencia y `h` la vida media del nodo. `A_eff = A · R`.
- **F y U decaen con vida media 4·h.**
- **T no decae.** Se reestima cada vez que se responde un ítem de transferencia.

Vida media inicial `h₀ = 2 días`. Cada repaso exitoso respondido cuando `R < 0.9` duplica `h` (tope 180 días). Un repaso fallido divide `h` por 2 (piso 1 día). Un repaso está **vencido** cuando `R < 0.7`. Es una simplificación de SM-2 que se explica en una frase y alcanza.

## El compuesto

`M = 0.15·F + 0.30·U + 0.25·A_eff + 0.10·S + 0.20·T`

Los pesos privilegian la comprensión y la transferencia sobre la velocidad. M solo se **certifica** cuando además se cumple la condición de estabilidad del estado `mastered`.

## Estados de un nodo

| Estado | Regla |
|---|---|
| `locked` | algún prerequisito directo no está en `ready` ni `mastered`. Regla dura: nunca se saltan prerequisitos. |
| `available` | todos los prerequisitos están en `ready` o `mastered`. |
| `in_progress` | hay al menos una evidencia registrada. |
| **`ready`** | F ≥ 0.8 ∧ U ≥ 0.6 ∧ A_eff ≥ 0.7 ∧ n_A ≥ 5. Es el **único** estado que cuenta como prerequisito cumplido para los sucesores y el que habilita `calc_unlocks`. |
| **`mastered`** | M ≥ 0.85 ∧ T ≥ 0.7 ∧ S ≥ 0.6 ∧ A_eff ≥ 0.8, observado en al menos 2 sesiones separadas por al menos 3 días. |
| `decayed` | estuvo en `ready` o `mastered` y `A_eff < 0.5`. |

**Desafíos.** Un nodo que declara `challenges` en el YAML exige, además, al menos 1 desafío resuelto (sin pistas o con pistas; el modo "visto" no cuenta) para pasar a `mastered`. Los pasos intermedios de un desafío son ítems `apply` y `generalize` normales; el desafío completo resuelto sin pistas cuenta como un ítem `transfer` con resultado 1, con pistas como 0.5 ([S](S-desafios/S0-desafios.md)).

Decisiones que conviene entender:

- **`ready` no exige T ni S.** Si lo hiciera, el jugador se estancaría en ítems de transferencia antes de ver la idea siguiente, y muchos destinos de transferencia viven en áreas posteriores que todavía no puede jugar.
- **`decayed` no vuelve a bloquear a los sucesores.** Una cascada de bloqueos sería punitiva y confusa. En cambio, el selector ([J](J-adaptativo.md)) inyecta un repaso del nodo oxidado antes de cualquier actividad de un sucesor. Un repaso exitoso lo devuelve a `ready`.
- **Las operaciones de la calculadora nunca se revocan.** Si el nodo que las habilitó decae, la calculadora muestra un indicador de óxido sobre la operación, que es en sí mismo una invitación a repasar ([M](M-calculadora/M0-progresion.md)).

## Misconceptions y bloqueo

Cada misconception de [L](L-modelo-errores/misconceptions.yaml) tiene severidad 1–3. Independientemente de los puntajes, un nodo **no** puede pasar a `ready` mientras alguna de sus misconceptions haya aparecido **3 o más veces en los últimos 10 ítems** de ese nodo (`blocks_ready_after = 3`). Esta regla impide que alguien llegue a `ready` por coincidencia de patrones mientras sigue creyendo, por ejemplo, que `(a+b)² = a² + b²`.

## Diagnóstico

El diagnóstico ([J](J-adaptativo.md)) coloca nodos en `ready` **provisional** con valores fijos: F = 0.9, U = 0.7, A = 0.75, S = 0.5, **T = 0**, `h = 14 días`. La transferencia nunca se concede por diagnóstico. Nada queda en `mastered` por diagnóstico. Un nodo provisional recibe un ítem de repaso silencioso la primera vez que se trabaja un sucesor; si falla, baja a `in_progress` sin ceremonia.

## Velocidad y edad universal

La dimensión S se mide siempre pero **nunca se muestra como cuenta regresiva** en los niveles 0–2 ni en nodos con `literacy: none`. Para esos perfiles, `t_star` se multiplica por 2 para que la motricidad fina no se confunda con falta de fluidez ([Q](Q-edad-universal.md)).

## Qué ve el jugador

El perfil muestra las seis dimensiones por concepto como un pequeño radar, sin números, y el mapa ilumina el territorio en tres intensidades: `in_progress`, `ready`, `mastered`. No hay puntos, monedas, vidas ni rachas obligatorias ([N](N-ux-ui.md)).

## Tabla de constantes

| Nombre | Valor | Usada en |
|---|---|---|
| `ALPHA_F`, `ALPHA_U`, `ALPHA_A`, `ALPHA_S`, `ALPHA_T` | 0.35, 0.30, 0.25, 0.25, 0.35 | EWMA |
| `N_MIN_F`, `N_MIN_U`, `N_MIN_A`, `N_MIN_S`, `N_MIN_T` | 3, 3, 5, 5, 3 | puerta de confianza |
| `INTRO_CREDIT_F` | 0.4 | primera vista de la introducción |
| `NEAR_MISS_CREDIT_U` | 0.5 | distractor de la misma categoría |
| `T_STAR_DEFAULT` | 30 s | Speed |
| `T_STAR_LITERACY_NONE_FACTOR` | ×2 | Speed en perfiles sin lectura |
| `H0` | 2 días | vida media inicial |
| `H_MAX`, `H_MIN` | 180 días, 1 día | topes de vida media |
| `REVIEW_SUCCESS_THRESHOLD` | R < 0.9 | duplica h |
| `REVIEW_DUE` | R < 0.7 | repaso vencido |
| `FU_HALF_LIFE_FACTOR` | ×4 | decaimiento de F y U |
| `W_F`, `W_U`, `W_A`, `W_S`, `W_T` | 0.15, 0.30, 0.25, 0.10, 0.20 | compuesto M |
| `READY_F`, `READY_U`, `READY_A`, `READY_N_A` | 0.8, 0.6, 0.7, 5 | estado ready |
| `MASTERED_M`, `MASTERED_T`, `MASTERED_S`, `MASTERED_A` | 0.85, 0.7, 0.6, 0.8 | estado mastered |
| `MASTERED_SESSIONS`, `MASTERED_DAYS_APART` | 2, 3 | estabilidad |
| `DECAYED_A` | 0.5 | estado decayed |
| `MISCONCEPTION_WINDOW`, `BLOCKS_READY_AFTER` | 10 ítems, 3 | bloqueo por misconception |
| `DIAG_F`, `DIAG_U`, `DIAG_A`, `DIAG_S`, `DIAG_T`, `DIAG_H` | 0.9, 0.7, 0.75, 0.5, 0, 14 días | colocación provisional |
| `MASTERED_CHALLENGE_MIN` | 1 | nodos con `challenges` |
| `CHALLENGE_NO_HINT_CREDIT`, `CHALLENGE_HINT_CREDIT`, `CHALLENGE_SEEN_CREDIT` | 1, 0.5, 0 | desafío como ítem transfer |
