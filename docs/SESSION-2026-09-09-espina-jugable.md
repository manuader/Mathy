# Sesión 2026-09-09 — la app dejó de ser un motor con un nivel

Continúa el cierre de M0 (`73e1362`), donde la prueba vertical se veía en el navegador.

## Qué se pidió

"Funciona pero solo hay una operación con un solo nivel y casi ninguna interfaz. Continuá
con el desarrollo hasta que sea una app completa." Después, dos veces: "continuá con la
ola N" y, al final, "desplegá agentes que diseñen juegos para los nodos restantes,
arrancá por los 10 más prioritarios".

La restricción de fondo no cambió en toda la sesión: el diseño de `docs/` manda, el código
lo implementa, y nada se da por bueno sin mirarlo en el navegador.

## El diagnóstico que estaba mal

La lectura inicial fue que faltaba **contenido**: más operaciones, más niveles. Era falsa.
Lo que faltaba era que **el nodo se viera como su diseño manda**. Los ocho niveles de
`alg.eq.one_step` existían, pero los ocho mostraban notación simbólica, y el diseño dice
que los dos primeros son capa `concrete`: una balanza con platos, una caja y pesas, sin
un solo símbolo. La app no tenía pocos niveles; tenía los niveles equivocados.

Eso cambió el trabajo de "agregar operaciones" a "construir las capas", que es otra cosa
y es la que el proyecto necesitaba.

## El gesto tuvo que cambiar de forma, y era inevitable

En las capas concretas el arrastre vertical **no puede distinguir "un plato" de "dos
platos"**, y esa distinción es exactamente lo que el nodo enseña. El gesto pasó a medir
*por dónde pasó* la llave: cada plato lleva su propio progreso, que solo sube, así que
soltar a mitad de camino conserva el estado y la barra queda inclinada. El error no dice
"mal": la inclinación es el mensaje.

Desde la capa simbólica el gesto vuelve a ser un arrastre hacia el `=`. Son dos gestos
porque son dos preguntas distintas, no por comodidad.

## Lo que se midió

| | valor |
|---|---:|
| tests al empezar la sesión | 52 |
| tests al escribir esto | 235 |
| nodos de la espina registrados | 7 de 44 |
| nodos jugables y verificados | 5 |
| mecánicas que cubren los 44 nodos | 13 |
| nodos del grafo fuera de la espina | 304 |
| nodos fuera de la espina que son prerequisito de un nodo de espina | **0** |
| elementos animados que usa la escena de la balanza | ~30 de 300 |

El último dato de la tabla decidió el reparto de los diez nodos nuevos: la espina se
escribió cerrada sobre sí misma, así que "prioritario" no se puede medir por cuántos
nodos de espina dependen de un candidato. Se midió por cuántos nodos del grafo lo
necesitan, con el nivel como desempate.

## Lo que se construyó, y por qué con esa forma

**El registro de nodos.** Un nodo se anota con su id del grafo, su número en la espina,
sus prerequisitos y sus niveles; la app pregunta por el registro y nunca por una lista
suelta. Agregar un minijuego es escribir su módulo y agregar una línea a la tabla de
actividades. La alternativa —un `switch` en la pantalla de mapa— obligaba a tocar la
navegación en cada nodo nuevo, cuarenta y cuatro veces.

**`isNodeOpen` mira solo los prerequisitos implementados.** Es una costura declarada, no
el motor de curriculum: exigir los prerequisitos que todavía no existen dejaría el mapa
vacío. Cuando exista el modelo de mastery de K se reemplaza esa función y nada más cambia,
porque la chuleta y la calculadora ya preguntan por un conjunto de ids y nunca por un
número de nivel.

**Una mecánica, una escena configurable.** Los 44 nodos usan 13 mecánicas, y el diseño ya
exige que ninguna aparezca en menos de tres áreas. Construir 44 escenas a medida sería
contradecir el diseño con el código. Las olas se ordenaron para que las mecánicas caras
—`tiles`, `grid_stretch`— se paguen temprano y los nodos siguientes las reusen.

**El progreso como registro de eventos.** El estado no se guarda: se pliega. Dos razones,
y ninguna es purismo. El mastery de seis dimensiones se recalcula entero cuando cambien
las constantes de K, sin migrar nada. Y sincronizar entre dispositivos es unir dos listas,
sin conflictos que resolver.

## Los bugs que solo aparecen mirando la pantalla

Los cuatro compilaban y pasaban los tests.

1. **El signo de los negativos se emitía como guion de ASCII y no como U+2212.** El atlas
   solo trae el segundo, así que la ecuación salía con un hueco donde iba el signo y, del
   nivel 6 en adelante, no salía. Tiene test.
2. **`equationToText`, el serializador de depuración de `math-core`, se estaba mostrando
   como leyenda**: el jugador leía `-448 = x * 32`.
3. **Arrastrar una llave sobre un texto arrancaba una selección del navegador** que se
   quedaba con el puntero y perdía el gesto.
4. **Los gestos acumulaban deltas y perdían el del evento que activa el gesto**, que no
   llega a `onChange`.

Los agentes que construyeron los nodos encontraron la misma clase de cosa: un
`useAnimatedReaction` que dejaba de disparar al reregistrarse, un `withRepeat` infinito
que se quedaba quieto tras la primera vuelta, un `Gesture.Exclusive` con un `LongPress`
deshabilitado que bloqueaba a los gestos de atrás, y una ronda que se cerraba desde dos
lugares a la vez. Ninguno se ve sin abrir el navegador.

## El choque recurrente entre el diseño y su propia regla

Tres nodos distintos (3, 4 y 5) llegaron al mismo conflicto: el documento del minijuego
pedía, en el mismo nivel, cambiar de capa **y** ensanchar el rango de números. La regla
del diseño dice que un nivel hace una cosa o la otra, nunca las dos. En los tres casos
ganó la regla y el ensanchamiento se corrió al nivel siguiente, que endurece sin moverse
de capa. Vale registrarlo porque va a volver a pasar en los 37 nodos que faltan.

## Lo que se dejó afuera a propósito

- **Los morphs con id estable de las transiciones simbólicas.** Cada estado existe y se
  ve, pero como estado de su capa y no como una transformación continua del mismo objeto
  disparada por el gesto. El planificador de `viz-core` sirve para glifos; hacerlo con
  cofres y bandas pide trazos con la misma estructura de comandos desde el principio.
- **Las capas `real` e `intuition`.** Los niveles jugables de los documentos arrancan en
  `concrete`.
- **El sonido.** No hay capa de audio; el "tic" se reemplaza por un destello, que es lo
  que Q pide para jugar con el sonido apagado.
- **`misconception` en los nodos 1 y 2.** El catálogo de L no tiene entradas que apunten a
  ellos. Inventar ids habría ensuciado la remediación para siempre.

## Cómo se corre

```bash
npm test --workspaces --if-present
npx tsc --noEmit -p apps/mathy && npx tsc --noEmit -p packages/mechanics
python3 tools/validate.py
cd apps/mathy && npx expo start --web
```

## Cómo terminó

`b10eb9f` en `origin/main`. **235 tests en verde** repartidos en siete paquetes
(`mechanics` 169), tipado estricto limpio en los dos proyectos, y el validador del diseño
en `sin errores · 348 nodos, 44 en la espina, 114 aviso(s)`.

Nada quedó rojo. Lo que quedó **sin verificar** es una sola cosa y está anotada en el
handoff: si el blanco de suelta del nodo 2 quedó corrido por el `onLayout` que mide contra
el padre. Dos agentes lo reportaron como sospecha; el mismo patrón funciona y está probado
en el nodo 13, así que puede ser un falso positivo. No lo doy por resuelto hasta hacerlo.
