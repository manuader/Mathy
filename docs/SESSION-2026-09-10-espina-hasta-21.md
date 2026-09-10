# Sesión 2026-09-10 — la espina pasó de 5 a 21 nodos jugables, y de 44 a 51 conceptos

Continúa [SESSION-2026-09-09-espina-jugable.md](SESSION-2026-09-09-espina-jugable.md), que
cerró en `067235c`. Cubre `067235c..b3cbf6b`: 25 commits y 104 archivos.

## Qué se pidió

En palabras del dueño, en este orden: "continuá con los nodos que faltan hasta completar la
espina"; "continuá con la ola 2", y después con la 3; "desplegá agentes que diseñen juegos
para los nodos restantes, arrancá por los 10 más prioritarios para agregarlos a la espina
dorsal"; "documentá todo según la skill de documentación, para poder migrar el trabajo a
otro agente cuando se acabe el contexto y poder seguir desarrollando de forma autónoma";
"quiero probar lo que ya hay"; y "hacé el handoff para el siguiente agente".

Las restricciones no cambiaron: el diseño de `docs/` manda, nada se da por bueno sin
mirarlo en el navegador, y los agentes van con Opus o Sonnet según la complejidad. Todo el
trabajo de nodos fue a Opus: cada nodo es un minijuego nuevo sacado de un documento denso.

## Lo que se midió

| | al empezar (`067235c`) | al cerrar (`b3cbf6b`) |
|---|---:|---:|
| nodos jugables y verificados | 5 | 21 |
| conceptos en la espina | 44 | 51 |
| tests | 235 | 762 |
| tests de `mechanics` | 169 | 696 |
| escenas | 7 | 11 |
| glifos en el atlas | 23 | 31 |
| errores en el catálogo de L | 40 | 45 |
| entradas de cheatsheet | 527 | 535 |
| escenas de Manim en el diseño | 98 | 112 |
| desafíos | 90 | 94 |

Las escenas: se crearon seis (`UrnScene`, `LedgerScene`, `PipeScene`, `WalkScene`,
`NetworkScene` y `ElevatorScene`) y se borraron dos (`PathScene` y `ElevatorScene`, las dos
absorbidas por `TrackScene`).

Y las mediciones que decidieron algo:

| | valor |
|---|---:|
| comparaciones de layout del oráculo de `gears_sequence`, sin diferencias | 14450 |
| comparaciones de órdenes de dibujo del mismo oráculo, sin diferencias | 14352 |
| `handlerTag` de las asas medidas, estables mientras el gesto se rehacía | 12 a 19 |
| `gestureId` de esas mismas asas en el mismo momento | 368 a 375 |
| recorrido que entrega un arrastre sintético de 16 movimientos | 87,5 % |
| el mismo arrastre con un temblor inicial | 96 % |
| ritmo de `setTimeout` con el panel del navegador oculto | ~1 por segundo |
| renavegaciones que sufrió un agente con tres o más en paralelo | 6 |
| nodos de fuera de la espina que son prerequisito de uno de adentro | 0 de 304 |

## Los diagnósticos que estaban mal

Es lo que más tiempo costó y lo que más le puede ahorrar a quien sigue. Cuatro los escribí
yo en el general, y los cuatro se creyeron hasta que alguien midió.

**"Si el objeto del `Gesture` cambia de identidad entre renders, el gesto se pierde."**
Falso. Nació de un caso real: el agente del nodo 17 vio un asa quedar muda después de la
primera ronda, lo atribuyó al `useMemo` con `enabled` en las dependencias, y avisó que los
nodos 9 y 14 tenían la misma forma. Un agente dedicado lo midió con un oráculo —el
`SharedValue` que el propio gesto escribe sigue al dedo si el gesto está vivo— jugando el
caso exacto en los dos nodos, y leyó `updateHandlers.js` de gesture-handler 2.32: el
detector adopta el objeto nuevo sobre el handler viejo, y los `handlerTag` no cambian. Iba
a costar refactorizar diecinueve archivos. La causa probable del asa muda del nodo 17 es
otra: un `return null` después de los hooks, que desmonta el detector.

**"Un `Pan` sobre el lienzo entero no se puede activar desde el arnés."** Dos agentes lo
reportaron y yo lo escribí como absoluto. El agente del nodo 15 lo activó sobre las escenas
de baldosas con `pointerId: 1` y `pressure`; yo repetí su receta contra la manivela del
nodo 2, apuntando a su eje medido en pantalla, y no se activó. Las dos observaciones son
ciertas: depende de cómo esté configurada la activación del gesto.

**"Con el panel oculto se destraba parcheando `requestAnimationFrame` sobre `setTimeout`."**
Incompleto: `setTimeout` también se estrangula, a cerca de uno por segundo. Hace falta un
`MessageChannel`.

**"`127.0.0.1` y `[::1]` dan dos `localStorage` distintos."** El navegador normaliza uno al
otro: son el mismo almacén.

Y uno que no escribí yo pero que confundió a varios agentes durante horas: **con el panel
oculto, el estado de React avanza y el objeto en pantalla no**, porque Reanimated se
congela. Parecía un bug propio en cada nodo hasta que el agente del nodo 11 lo identificó.

Un error de proceso chico con consecuencias: en dos prompts de coordinación mencioné
agentes paralelos que no existían, y dos agentes lo repitieron en sus reportes. Un prompt
de coordinación tiene que listar exactamente quién está en vuelo.

## Lo que se construyó, y por qué con esa forma

**Una mecánica, una escena.** Trece mecánicas cubren los 51 nodos, así que construir 51
escenas a medida contradiría el diseño con el código. Eso no evitó que `gears_sequence`
quedara dibujada tres veces: cada escena estaba tipada contra el `Problem` de su nodo y
reusarla exigía fabricar uno falso. De ahí sale la decisión 12 del general, con sus dos
caminos. Cuando el tipo viejo ya cumple la forma, se ensancha a formas estructurales y el
llamador no cambia una línea (`ChestScene`, `BalanceScene`). Cuando los llamadores le dicen
distinto a la misma cosa —`length`/`slots`, `tiles`/`chips`, `flag`/`target`—, ese camino
no está disponible y cada actividad arma su configuración (`TrackScene`). Y el límite: el
nodo 8 no reusó `BowlScene` porque habría tenido que fabricar un problema de cardinalidad
falso, y acoplarse a un tipo ajeno es peor que quince líneas repetidas.

**Un oráculo A/B para lo que no debe cambiar.** La unificación de `gears_sequence` no se
verificó con capturas sino comparando, campo por campo y trazo por trazo, el build nuevo
contra el anterior en 21 niveles, 10 semillas y varios tamaños de lienzo. Encontró un bug
que la propia refactorización había introducido —al caminante del nodo 7 le faltaba el
segundo trazo de brazos— que nadie habría visto mirando. Los scripts viven en
`.claude/avo/2026-09-10-gears-unify/check/`, que está gitignoreado: existen solo en la
máquina donde se corrieron. Lo que queda es el método.

**La pregunta que arma su propio objeto.** Casi todos los nodos chocaron con lo mismo: el
documento del minijuego pedía, en un mismo nivel, cambiar de capa y endurecer. La regla
manda correr el ensanchamiento al nivel siguiente, pero en el último nivel no hay
siguiente. Seis nodos lo resolvieron igual: lo nuevo entra como una pregunta que arma su
objeto y no lee `params`, así que la regla sigue siendo testeable sobre `params` y el
contenido no se pierde. El nodo 20 prefirió quedarse en la capa anterior para no perder el
ensanchamiento. Quedó como decisión 14.

**Los tres regresos de la llave.** El nodo 12 dejó dos predicados: si la llave abre, y si
el objeto vuelve igual. El nodo 21 los partió en tres —`invOpens`, `invReturns`,
`invRestores`— porque el nodo 29 necesita el caso en que la llave **abre y no devuelve**:
derivar destruye la altura de arranque y la vuelta es una familia. Con el predicado
fundido, el `+ C` no se podía ni expresar. `keyUndoOrder` es lo que une los nodos 12, 20 y
21, y un test compara las dos implementaciones para que nadie la reescriba.

**La espina creció por el grafo, no por intuición.** Ninguno de los 304 nodos de fuera de
la espina es prerequisito de uno de adentro, así que "prioritario" no se podía medir por
dependencia de la espina. Se midió por cuántos nodos del grafo necesitan a cada candidato,
con el nivel como desempate. Se pidieron diez; se diseñaron siete.

**La disciplina de los errores catalogados.** Ningún agente inventó un id de misconception.
Eso destapó que la prosa de varios minijuegos nombra errores que el catálogo no apunta a
esos nodos. Cerré el del nodo 21, que era una omisión clara: los otros dos regresos de la
llave ya estaban listados. En el mismo movimiento agregué la composición a otro error, y el
validador avisó que ese nodo no declara la mecánica del error; lo revertí. Las
discrepancias de los nodos 14, 16 y 17 quedaron abiertas: cerrarlas es decisión de diseño.

## El proceso, que también costó

Llegué a tener seis agentes en paralelo. El panel del navegador es uno solo y no se puede
abrir otra pestaña cuando el cupo está lleno: con tres o más se renavegan la pestaña entre
sí, y un agente no pudo volver a jugar los nodos que comparten escena con el suyo, que es
la única comprobación que evita romperlos. El techo quedó en dos.

Corrí `git add -A` con agentes en vuelo varias veces después de haber escrito la trampa que
lo prohíbe. Una vez rompió `main`: `e47c844` se llevó el `export *` del nodo 16 sin su
módulo, y la rama quedó apuntando a un archivo inexistente. Lo detectó el agente, no los
tests: el archivo estaba en mi disco, así que todo pasaba localmente. Se arregló en
`5bbadb1`, y el comando que lo detecta quedó en el general.

Dos commits contienen más de lo que dicen, y conviene saberlo leyendo el historial:
`a16c222` (el nodo 10) trae entera la unificación de `gears_sequence`, y `c8b7077` (el
nodo 21) trae los primeros archivos del nodo 20.

## Lo que se dejó afuera, a propósito

- **Las transiciones simbólicas como morph continuo**, en todos los nodos. Cada estado
  existe como estado de su capa; que el objeto se transforme en su símbolo con el gesto
  pide trazos con la misma estructura de comandos desde el principio.
- **`explain` como dos animaciones lado a lado**, en la mayoría de los nodos: el verbo se
  registra sobre el movimiento real.
- **Los gestos de dos dedos** (nodos 5, 15, 16 y 21): no se construyeron porque no se
  pueden verificar desde el arnés, y un gesto sin verificar es peor que no tenerlo. Cada uno
  tiene una alternativa de un dedo.
- **La escena de `sorter`**: el nodo 17 la necesitaba para un cierre de nivel y prefirió no
  estrenarla ahí, porque habría nacido con la forma de su nodo.
- **Un segundo engranaje encadenado en `TrackScene`**, que pidió el nodo 20: habría obligado
  a volver a jugar cuatro nodos con el panel en disputa.
- **Los nodos 48, 49 y 50** de la tanda de diez: reservados y sin diseñar.
- **El audio**, que sigue sin existir.

## Cómo se corre

```bash
npm test --workspaces --if-present
```

```bash
npx tsc --noEmit -p apps/mathy && npx tsc --noEmit -p packages/mechanics
```

```bash
python3 tools/validate.py
```

```bash
cd apps/mathy && npx expo start --web
```

## Cómo terminó

Código en `b3cbf6b`, empujado. **762 tests en verde**, tipado estricto limpio en los dos
proyectos, y el validador en `sin errores · 348 nodos, 51 en la espina, 115 aviso(s)`. Nada
quedó rojo.

Lo que quedó **verificado por estado, por tests o por oráculo, pero no mirando**, porque el
panel del navegador estaba oculto o en disputa:

- nodo 17: el tubo lateral, la luz y la red (el lienzo no componía cuadros);
- nodo 14: los niveles 2 y 3, y las rondas de conmutar y de cofre degenerado del nivel 7;
  tampoco se volvieron a jugar los siete nodos que comparten `ChestScene` con él;
- nodo 11: la ficha de acción del nivel 7;
- nodo 15: sin capturas del estado final;
- la unificación de `gears_sequence`: ninguna ronda completa jugada en los nodos 2, 3 y 7;
- nodo 16: arrastrar una ficha sobre el cartel (el camino por toque sí);
- nodo 9: arrastrar las máquinas del nivel 4 (su gemelo por toque sí);
- nodo 2: el blanco de suelta de las fichas, con evidencia estructural a favor.
