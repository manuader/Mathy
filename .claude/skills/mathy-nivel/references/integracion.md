# La guía dentro de la actividad

La actividad no dibuja las tarjetas ni la barra: eso es del marco. Hace cuatro
cosas: sabe si el nivel está en juego, avisa los gestos que la guía espera, frena
la ronda cuando el paso lo pide, y le dice a la guía qué señalar. El ejemplo
completo es `apps/mathy/src/activities/CardinalityGame.tsx`.

## 1. El estado de la lección

```ts
import { useLesson } from "../lessons/LessonContext.tsx";
import { CoachBanner, Spotlight, type Focus, type Pt, type Rect } from "../ui/Coach.tsx";

const lesson = useLesson();
// Detrás de la tarjeta de entrada la escena ya está montada, pero el nivel no
// empezó: nada que corra contra el reloj arranca hasta `play`.
const playing = !lesson || lesson.phase === "play";
const step = lesson?.step;
const guided = (lesson?.lesson?.coach.length ?? 0) > 0;
/** Con lección, el cartel dice qué hacer y la línea de abajo queda para lo que pasó. */
const opening = lesson?.lesson ? "" : OPENING_DEL_NIVEL;
```

- Timers, tapados y demostraciones dependen de `playing` (y, si hace falta, de
  `step?.id`: en el nodo 1 el cuenco no se tapa mientras el paso es `look`).
- La latencia se mide desde que empieza el juego: `useEffect(() => { shownAt.current = Date.now(); }, [problem, playing]);`
- Si el nodo tenía una mano fantasma propia, con guía se apaga (`if (guided) return;`):
  dos manos a la vez señalarían dos cosas distintas.

## 2. Las señales

```ts
// La guía avanza con lo que el jugador hace; la actividad solo avisa.
const signalRef = useRef(lesson?.signal);
signalRef.current = lesson?.signal;
const say = useCallback((id: string) => signalRef.current?.(id), []);
```

Se llama `say("<evento>")` en el mismo lugar donde la actividad registra el
movimiento, no en un efecto aparte. Por referencia y no por dependencia, por la
trampa 8 de HANDOFF: el callback de un gesto puede estar un render atrasado.

## 3. La ronda que espera al `reveal`

```ts
const holding = useRef(false);
holding.current = step?.holds === true;
const pending = useRef(false);
const advance = useCallback(() => {
  if (holding.current) {
    pending.current = true;
    return;
  }
  nextRound();
}, [nextRound]);
useEffect(() => {
  if (step?.holds === true || !pending.current) return;
  pending.current = false;
  nextRound();
}, [step, nextRound]);
```

Todo `setTimeout(nextRound, …)` de la actividad pasa a `setTimeout(advance, …)`.

## 4. El foco

```ts
// La pista de Tomi reusa los pasos de la guía: señala lo mismo, pero no frena la ronda.
const shown = step ?? lesson?.hint;
const focus = useMemo<Focus | null>(() => {
  if (!shown) return null;
  // Rectángulos y puntos en coordenadas del LIENZO, calculados de la geometría
  // de la escena y del estado de ESTA ronda: la fruta que conviene levantar, el
  // hueco de enfrente, las tarjetas.
  switch (shown.id) {
    case "look":
      return { rings: [rectDe(lo que hay que mirar)] };
    case "<hacer>":
      return { rings: [destino], drag: { from: origen, to: destino } };
    default:
      return { rings: [lo que explica el reveal] };
  }
}, [shown, geom, /* el estado que cambia el foco */]);
```

- `rings` son rectángulos que laten en dorado; `drag` dibuja una luz que recorre
  el gesto una y otra vez hasta que el jugador lo hace.
- Se recalcula con cada movimiento, así la luz siempre apunta a un gesto que falta.
- Si la geometría viene de la escena, se usa la misma función que la escena
  (`slotAt`, `bowlCenterX`…), no números copiados.

## 5. El render

```tsx
const sceneH = Math.max(300, Math.min(height * (lesson?.lesson ? 0.56 : 0.66), 540));

<View style={styles.root /* sin backgroundColor: detrás está el mundo del área */}>
  <Header title={…} subtitle={t(level.titleKey)} round={round} rounds={level.rounds}
          showDots={!lesson?.lesson} />
  <CoachBanner round={round} rounds={level.rounds} />
  <GestureDetector gesture={gesture}>
    <View style={{ width, height: sceneH }}>
      <Canvas style={{ width, height: sceneH }}>…</Canvas>
      <Spotlight focus={focus} />
    </View>
  </GestureDetector>
  <Hint text={message.text} tone={message.tone} />
</View>
```

- Sin botón "‹ Niveles" propio: lo pone la barra del marco.
- `Spotlight` va adentro de la vista del lienzo, después del `Canvas`: sus
  coordenadas son las del lienzo y no se lleva ningún toque (`pointerEvents: none`).

## 6. Tomi y el sonido

**Tomi no se programa en la actividad**: vive en el marco (`ui/HintBuddy.tsx`). La
actividad le da dos cosas, sin saberlo:

- **Los intentos.** Cada movimiento que se evalúa se anota con
  `onEvent({ kind: "attempt", …, correct })`. App los cuenta, y dos seguidos con
  `correct: false` hacen que Tomi ofrezca una pista. Una actividad que no anota
  intentos deja a Tomi sin saber que el jugador está trabado.
- **El foco.** La pista "Mirá acá" pone en `lesson.hint` el paso de la guía que
  espera un gesto; la actividad lo señala con el mismo `focus` de la guía (sección 4).
- **Qué paso vale en esta ronda.** En un nivel que alterna preguntas, la actividad
  llama `lesson?.preferHint("<id del paso>")` al empezar cada ronda; sin eso, la
  pista toma el primer paso del nivel y en las rondas de la otra pregunta habla
  del gesto equivocado. `preferHint("")` dice que esta ronda no tiene gesto que
  mostrar (Tomi salta el "Mirá acá"); `preferHint(null)` vuelve al de siempre.

`onEvent` es estable y así tiene que seguir: un efecto de la actividad depende de
él (el `sawLayer` al montar), y una función nueva por render colgó el juego en un
bucle (trampa 30 de HANDOFF).

**El sonido** se llama en el mismo lugar donde la actividad registra el movimiento:

```ts
import { play } from "../ui/sound.ts";
play("drop", { pitch: hueco * 2 }); // la fila se llena y la nota sube
play("join");                        // dos cosas coinciden
// desde un worklet: runOnJS(play)("lift")
```

Un sonido por evento, con significado físico (N §6). Nunca un sonido para lo que
no avanzó.

## Verificar en el navegador

Servidor: `cd apps/mathy && npx expo start --web` (puerto 8081). Perfil limpio en
`http://[::1]:8081`; para sembrar prerequisitos, eventos `levelDone` bajo
`mathy.events.v1`.

**Si `document.visibilityState` es `hidden`** (el panel del navegador oculto),
Reanimated se congela y las tarjetas quedan con opacidad cero (trampa 3). Antes de
nada, en la página:

```js
(() => { if (window.__raf) return; window.__raf = true; const ch = new MessageChannel(); let q = [], posted = false, last = 0, id = 1;
  ch.port1.onmessage = () => { posted = false; const now = performance.now(); if (now - last < 16) { posted = true; ch.port2.postMessage(0); return; } last = now; const cbs = q; q = []; for (const [, cb] of cbs) { try { cb(now); } catch (e) { console.error(e); } } };
  window.requestAnimationFrame = (cb) => { const i = id++; q.push([i, cb]); if (!posted) { posted = true; ch.port2.postMessage(0); } return i; };
  window.cancelAnimationFrame = (i) => { q = q.filter(([j]) => j !== i); }; })()
```

Leer lo que dibuja la escena: el `Canvas` está en el árbol de React de la página y
las escenas son sus hijos; las fibras se recorren desde
`container[<clave __reactContainer…>].stateNode.current` (desde el contenedor solo,
las props son viejas). Con la pestaña oculta más de 5 minutos Chrome también frena
los `setTimeout` encadenados. Los toques (`Gesture.Tap`) necesitan una pausa real
entre `pointerdown` y `pointerup` (esperar con la herramienta, no con timers).

Arrastres sintéticos: parchear `setPointerCapture`/`releasePointerCapture` con
try/catch, `pointerdown` + temblor + 18 `pointermove` + `pointerup`, todos con
`pointerId: 1`, `pointerType: "mouse"`, `pressure` (trampa 4). Los clics sobre
tarjetas y botones se hacen por `find` + `ref`; con el panel oculto, el scroll con
el mouse no anda.

Qué mirar, en orden: la tarjeta de entrada; cada paso de la guía avanza con el
gesto real (no sólo con "Siguiente"); el `reveal` frena la ronda (esperar 3 s y
ver que no cambió); las rondas siguientes sin guía; la tarjeta de cierre; la llave
en la chuleta con "Nueva"; "Siguiente nivel". Con el nivel ya superado, la tarjeta
de entrada ofrece "Jugar con la guía otra vez".

## Trampas que ya costaron

Tres de los gestos que en web hacían imposible terminar un nivel (los encontró el
agente de la pista, 2026-09-11). Buscalos en toda actividad que toques:

- **Un gesto nacido con `.enabled(false)` no despierta nunca en web**, aunque
  después se habilite: las fichas que no existían en la primera ronda quedaban
  muertas en la segunda. Que el gesto nazca habilitado y un `SharedValue` decida
  si responde.
- **Un gesto rearmado en cada ronda se queda con la anterior**: `runOnJS` captura
  la función de cuando se armó. Se arma una vez por nivel y lee la geometría de
  `SharedValue` y las funciones de una referencia estable.
- **Un asa ubicada con `useAnimatedStyle` no sigue a la pieza en web**: ubicala
  con estilo común desde el estado.
- **El alto del lienzo, medido**: una zona `flex: 1` con `onLayout` y la línea de
  abajo con alto fijo (como `CardinalityGame`). Como fracción de la ventana, en un
  teléfono con el cartel de la guía la línea de abajo quedaba fuera de pantalla.
- **`onLayout` en web avisa tamaño, no posición**: el cartel de la guía baja el
  lienzo sin cambiarle el tamaño, y una caja medida para comparar contra
  `absoluteX/Y` queda vieja (en la balanza ninguna pesa caía en su plato). Lo que
  se arrastra vive dentro de la vista del lienzo y se suelta en su lugar más
  `translationX/Y`.
- **Con el panel del navegador oculto, no pruebes con `computer`**: cada clic o
  captura espera a que la página se dibuje y se cuelga (un agente quedó trabado
  diez minutos). Toques sintéticos con `javascript_tool`, estado con fibras o
  `get_page_text`. Y después de guardar un archivo, recargá: Fast Refresh reinicia
  el tablero abierto a mitad de ronda.

- **Un índice que comparte valor con "nada agarrado"** (el nodo 1 usaba `-1` en las
  tarjetas fijas y `-1` como "ninguna tarjeta levantada"): arrastrar una fruta
  arrastraba todas las tarjetas. Toda comparación con el índice agarrado exige
  `index >= 0`.
- **Una imagen de `react-native` en web toma su tamaño natural** si no se le pisa
  `width`/`height`: un paisaje de 1024 px dejaba media pantalla sin mundo.
- **Un `if (…) return null` después de los hooks desmonta el detector de gestos**
  (trampa 9): un asa que no aplica se deja montada con `pointerEvents: "none"`.
