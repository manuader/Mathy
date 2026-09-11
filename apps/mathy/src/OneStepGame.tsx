/**
 * Cofres y llaves: el minijuego de `alg.eq.one_step`.
 *
 * El nodo enseña dos cosas a la vez, y por eso hay dos superficies. En las
 * capas `concrete` y `visual` el jugador manipula objetos: pasa la llave por
 * los platos de una balanza y la barra le contesta. Desde `symbolic` la misma
 * regla se juega sobre la ecuación, que es la superficie que el objeto dejó.
 *
 * El progreso va atado al dedo, no a un temporizador: el jugador puede ir y
 * volver, y la escena lo acompaña.
 *
 * El llavero vive adentro de la vista del lienzo, en su franja de abajo. Antes
 * era una fila suelta debajo de la línea de mensajes y el gesto comparaba la
 * posición del dedo en la página con la caja del lienzo medida con `onLayout`,
 * que mide contra el padre (trampa 10): bastaba que el mensaje cambiara de alto
 * para que los platos quedaran corridos. Ahora dónde está la llave es su casa
 * más lo que se movió, en las mismas coordenadas en que se dibujan los platos,
 * y la luz de la guía puede señalar la llave y el plato con el mismo foco.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Canvas, Group } from "@shopify/react-native-skia";
import { Gesture } from "react-native-gesture-handler";
import { useSharedValue, withTiming, withSequence, runOnJS } from "react-native-reanimated";
import { applyBothSides } from "@mathy/math-core";
import { getGlyph } from "@mathy/glyphs";
import { centered, layoutEquation, type GlyphMetrics } from "@mathy/typeset";
import { planMorph, smooth } from "@mathy/viz-core";
import { MorphView } from "@mathy/viz-skia";
import { NODE, TOTAL_LEVELS, generateOneStep, type Key, type Level } from "@mathy/mechanics";
import type { Event } from "@mathy/progress";
import { BalanceScene, balanceLayout, panZones } from "./scenes/BalanceScene.tsx";
import { KeyView } from "./ui/KeyRing.tsx";
import { Header, Hint } from "./ui/Chrome.tsx";
import { ActivityShell, useActivityViewport } from "./ui/ActivityShell.tsx";
import { CoachBanner, Spotlight, type Focus, type Pt, type Rect } from "./ui/Coach.tsx";
import { useLesson } from "./lessons/LessonContext.tsx";
import { eq1Msg } from "./lessons/one-step.ts";
import { t } from "./i18n.ts";
import { theme } from "./ui/theme.ts";

const FONT_SIZE = 52;
/** Cuánto hay que arrastrar para completar el paso en la superficie simbólica. */
const DRAG_RANGE = 150;
/** Cuánto se puede mover el dedo y que el gesto siga siendo un toque. */
const TAP_SLOP = 12;
/** El lado de una llave (`KeyView` la dibuja de 72 × 72) y el aire entre dos. */
const KEY = 72;
const KEY_GAP = theme.space[3];
/** La franja del llavero, debajo del lienzo y adentro de la misma vista. */
const RING_H = KEY + theme.space[4] * 2;

const metrics = (char: string): GlyphMetrics | undefined => {
  const g = getGlyph(char);
  return g ? { advance: g.advance, top: g.top, bottom: g.bottom } : undefined;
};

const OP_CHAR: Record<string, string> = { "+": "+", "-": "−", "*": "×", "/": "÷" };

/** Qué tan cerca del plato pasó la llave, de 0 a 1. Corre en el hilo de UI. */
function nearness(x: number, y: number, cx: number, cy: number, r: number): number {
  "worklet";
  const d = Math.hypot(x - cx, y - cy);
  return Math.max(0, Math.min(1, (r - d) / (r * 0.6)));
}

export interface OneStepGameProps {
  readonly level: Level;
  /** Cuántos niveles quedaron atrás; con eso crecen la chuleta y la calculadora. */
  readonly levelsDone: number;
  readonly onLevelDone: () => void;
  readonly onExit: () => void;
  /** Cada movimiento del jugador, tal como se guarda. La actividad no persiste nada. */
  readonly onEvent: (event: Event) => void;
}

export function OneStepGame(props: OneStepGameProps) {
  return (
    <ActivityShell levelsDone={props.levelsDone}>
      <Activity {...props} />
    </ActivityShell>
  );
}

function Activity({ level, onLevelDone, onExit, onEvent }: OneStepGameProps) {
  // El lienzo mide lo que le deja el panel abierto, no la ventana entera: abrir
  // una herramienta achica la actividad y nunca la tapa.
  const { width, height } = useActivityViewport();
  const lesson = useLesson();
  // Detrás de la tarjeta de entrada la escena ya está montada, pero el nivel no
  // empezó: nada que corra contra el reloj arranca hasta `play`.
  const playing = !lesson || lesson.phase === "play";
  const step = lesson?.step;
  /** Con lección, el cartel del objetivo dice qué hacer y la línea de abajo queda para lo que pasó. */
  const conLeccion = lesson?.lesson !== undefined;
  const [round, setRound] = useState(0);
  const [seedBase] = useState(() => Math.floor(Math.random() * 100000));
  const [solved, setSolved] = useState(false);

  /** Antes de los símbolos el jugador manipula la balanza; después, la ecuación. */
  const handsOn = level.layer === "concrete" || level.layer === "visual";
  const showsEquation = !handsOn;
  const showsBalance = level.balance !== "hidden";
  const opening = conLeccion ? "" : handsOn ? OPENING_HINT : "Arrastrá la llave que abre esta cerradura.";

  const [message, setMessage] = useState<{ text: string; tone: "dim" | "ok" | "warn" }>(() => ({
    text: opening,
    tone: "dim",
  }));

  const problem = useMemo(
    () => generateOneStep(level, seedBase + round * 1000 + level.n),
    [level, round, seedBase],
  );

  const progress = useSharedValue(0);
  // Cuánto se aplicó la acción de la llave en cada plato. Son dos y no uno
  // porque la pregunta del nodo es "en cuántos platos", no "cuánto".
  const leftPan = useSharedValue(0);
  const rightPan = useSharedValue(0);
  const reached = useSharedValue(0);
  const ghost = useSharedValue(level.balance === "shown" ? 1 : 0);
  const [ghostOn, setGhostOn] = useState(level.balance === "shown");
  /** Qué platos ya recibió la llave buena en esta ronda: la guía señala el que falta. */
  const [hechos, setHechos] = useState({ l: false, r: false });

  // Un plan por llave: se calculan al cambiar de problema, no por cuadro.
  const plans = useMemo(() => {
    const before = centered(layoutEquation(problem.equation, metrics));
    const out = new Map<string, ReturnType<typeof planMorph>>();
    for (const k of problem.keys) {
      const s = applyBothSides(problem.equation, k.op, k.value, problem.unknown);
      const after = centered(layoutEquation(s.next, metrics));
      out.set(k.id, planMorph(before, after, s.trace));
    }
    return out;
  }, [problem]);

  const [shownKeyId, setShownKeyId] = useState<string>(() => problem.keys[0]!.id);
  const plan = plans.get(shownKeyId) ?? plans.get(problem.keys[0]!.id)!;

  // Con lección, el cartel de Lumi se lleva su franja de arriba y el lienzo cede.
  // En el teléfono el cartel ocupa el doble de renglones y el llavero vive en la
  // misma vista: sin achicar el lienzo, el llavero se salía de la pantalla.
  const angosta = width < 520;
  const proporcion = handsOn
    ? conLeccion
      ? angosta
        ? 0.34
        : 0.44
      : 0.54
    : conLeccion
      ? angosta
        ? 0.24
        : 0.36
      : 0.44;
  const sceneH = Math.max(handsOn ? 250 : 210, Math.min(height * proporcion, 480));
  const balanceH = handsOn ? sceneH : sceneH * 0.66;
  const equationY = handsOn ? sceneH * 0.5 : showsBalance ? sceneH * 0.86 : sceneH * 0.5;
  const zones = useMemo(() => panZones(width, balanceH), [width, balanceH]);
  const bl = useMemo(() => balanceLayout(width, balanceH), [width, balanceH]);

  /** Dónde cuelga cada llave: una fila centrada en la franja de abajo de la vista. */
  const keyY = sceneH + RING_H / 2;
  const keySpots = useMemo<readonly Pt[]>(
    () =>
      problem.keys.map((_, i) => ({
        x: width / 2 + (i - (problem.keys.length - 1) / 2) * (KEY + KEY_GAP),
        y: keyY,
      })),
    [problem.keys, width, keyY],
  );

  // El reloj arranca cuando se muestra el problema: la latencia es del jugador,
  // no del render ni de la tarjeta de entrada.
  const shownAt = useRef(Date.now());
  useEffect(() => {
    shownAt.current = Date.now();
  }, [problem, playing]);

  // La capa vista es lo que agrega entradas a la chuleta, así que se registra al
  // entrar al nivel y no al terminarlo.
  useEffect(() => {
    onEvent({ kind: "sawLayer", at: Date.now(), node: NODE, layer: level.layer });
  }, [level.layer, onEvent]);

  // La guía avanza con lo que el jugador hace; la actividad solo avisa. Por
  // referencia y no por dependencia: el callback de un gesto puede estar un
  // render atrasado (trampa 8).
  const signalRef = useRef(lesson?.signal);
  signalRef.current = lesson?.signal;
  const say = useCallback((id: string) => signalRef.current?.(id), []);
  const guiando = useRef(false);
  guiando.current = step !== undefined;

  // En los niveles de recordatorio, la pista de Tomi dice el recordatorio y
  // señala lo mismo que él: sin elegirlo, no habría ningún "mirá acá".
  const pasos = lesson?.lesson?.coach;
  const preferHint = lesson?.preferHint;
  const pistaDeRonda = useMemo(
    () => ((pasos ?? []).some((s) => s.id === "recall") ? "recall" : null),
    [pasos],
  );
  useEffect(() => {
    preferHint?.(pistaDeRonda);
  }, [preferHint, pistaDeRonda, round]);

  /**
   * Un movimiento del jugador, contado para cada verbo que el nivel ejercita.
   * No es inflar la cuenta: un nivel que pide reconocer *y* manipular da
   * evidencia de las dos cosas en el mismo gesto, y K lleva la cuenta por verbo.
   */
  const attempt = useCallback(
    (correct: boolean, misconception?: string) => {
      const at = Date.now();
      const latency = at - shownAt.current;
      for (const evidence of level.evidence) {
        onEvent({
          kind: "attempt",
          at,
          node: NODE,
          level: level.n,
          evidence,
          correct,
          latency,
          ...(misconception ? { misconception } : {}),
        });
      }
    },
    [level.evidence, level.n, onEvent],
  );

  const nextRound = useCallback(() => {
    if (round + 1 >= level.rounds) {
      onEvent({ kind: "levelDone", at: Date.now(), node: NODE, level: level.n });
      onLevelDone();
      return;
    }
    setRound((r) => r + 1);
    setSolved(false);
    setHechos({ l: false, r: false });
    progress.value = 0;
    leftPan.value = 0;
    rightPan.value = 0;
    setMessage({ text: opening, tone: "dim" });
  }, [round, level.rounds, level.n, onEvent, onLevelDone, progress, leftPan, rightPan, opening]);

  /**
   * Cerrar la ronda, salvo que la guía esté explicando lo que acaba de pasar:
   * entonces queda pendiente y se cierra cuando el jugador dice "entendido".
   */
  const holding = useRef(false);
  holding.current = step?.holds === true;
  const pendiente = useRef(false);
  const advance = useCallback(() => {
    if (holding.current) {
      pendiente.current = true;
      return;
    }
    nextRound();
  }, [nextRound]);
  useEffect(() => {
    if (step?.holds === true || !pendiente.current) return;
    pendiente.current = false;
    nextRound();
  }, [step, nextRound]);

  const succeed = useCallback(() => {
    setSolved(true);
    attempt(true);
    say("opened");
    if (showsEquation) progress.value = 1;
    setMessage({
      text: handsOn ? "La barra quedó nivelada y la caja se abrió." : "La x quedó sola.",
      tone: "ok",
    });
    setTimeout(advance, 1400);
  }, [progress, advance, handsOn, showsEquation, attempt, say]);

  /**
   * Un solo plato: la barra queda inclinada y la caja no cede. Ningún cartel
   * dice "mal"; la inclinación es el mensaje, y el estado se conserva para que
   * el jugador pase la llave por el plato que falta.
   */
  const tilted = useCallback(
    (l: boolean, r: boolean) => {
      setHechos({ l, r });
      say("onePan");
      // Aplicar la inversa de un solo lado es un error del catálogo, no un
      // descuido: se registra para que la remediación pueda pedirlo de vuelta.
      // Salvo con la guía en pantalla, que acaba de pedir exactamente esto: un
      // plato primero, y el otro después.
      if (!guiando.current) attempt(false, "inverse_applied_one_side");
      setMessage({ text: "La barra quedó inclinada. Falta el otro plato.", tone: "warn" });
    },
    [attempt, say],
  );

  const bothPans = useCallback(() => {
    setHechos({ l: true, r: true });
    say("onePan");
    succeed();
  }, [say, succeed]);

  /** La llave equivocada no dice "mal": no entra, y el juego dice por qué. */
  const refuse = useCallback(
    (key: Key) => {
      // `near_value` no está en el catálogo de L y no debería estarlo: cambiar
      // el número no es una idea equivocada sobre la inversa, es puntería.
      attempt(false, key.lure && key.lure !== "near_value" ? key.lure : undefined);
      if (showsEquation) progress.value = withTiming(0, { duration: theme.motion.base });
      const inverso: Record<string, string> = {
        "+": "restar",
        "-": "sumar",
        "*": "dividir",
        "/": "multiplicar",
      };
      setMessage({
        text:
          key.lure === "near_value"
            ? `Esa llave tiene el número cambiado. La cerradura dice ${problem.lock.value}.`
            : `Esa llave no entra. Para deshacer ${OP_CHAR[problem.lock.op]}${problem.lock.value} hay que ${inverso[problem.lock.op]}.`,
        tone: "warn",
      });
    },
    [progress, problem, showsEquation, attempt],
  );

  /** Lo que dice la línea de abajo cuando un gesto no llegó a ningún lado. */
  const avisar = useCallback((id: string) => {
    setMessage({ text: t(eq1Msg(id)), tone: "dim" });
  }, []);

  /**
   * El gesto de la balanza mide *por dónde pasó* la llave, no cuánto se
   * arrastró: el desplazamiento vertical no puede distinguir un plato de dos, y
   * esa distinción es el contenido del nodo. Cada plato tiene su progreso y
   * ninguno retrocede, así que soltar a mitad de camino conserva el estado.
   *
   * Dónde está la llave es su casa más lo que se movió: las dos cosas en
   * coordenadas del lienzo, las mismas de los platos.
   */
  const makeBalanceGesture = useCallback(
    (
      key: Key,
      home: Pt,
      dx: ReturnType<typeof useSharedValue<number>>,
      dy: ReturnType<typeof useSharedValue<number>>,
      stuck: ReturnType<typeof useSharedValue<number>>,
    ) => {
      const lx = zones.leftX;
      const rx = zones.rightX;
      const zy = zones.y;
      const r = zones.radius;
      const correct = key.correct;
      return Gesture.Pan()
        .enabled(!solved)
        .onBegin(() => {
          reached.value = 0;
          runOnJS(setShownKeyId)(key.id);
        })
        .onChange((e) => {
          // Traslación total y no suma de deltas: el evento que activa el gesto
          // no llega a `onChange`, así que sumar deltas pierde ese tramo.
          dx.value = e.translationX;
          dy.value = e.translationY;
          const x = home.x + e.translationX;
          const y = home.y + e.translationY;
          const nl = nearness(x, y, lx, zy, r);
          const nr = nearness(x, y, rx, zy, r);
          reached.value = Math.max(reached.value, nl, nr);
          if (!correct) return;
          leftPan.value = Math.max(leftPan.value, nl);
          rightPan.value = Math.max(rightPan.value, nr);
        })
        .onFinalize((e) => {
          dx.value = withTiming(0, { duration: theme.motion.base });
          dy.value = withTiming(0, { duration: theme.motion.base });
          // Un toque no activa el arrastre: la llave no se movió de su lugar.
          if (Math.hypot(e.translationX, e.translationY) < TAP_SLOP && reached.value === 0) {
            runOnJS(avisar)("tapHands");
            return;
          }
          if (!correct) {
            if (reached.value > 0.35) {
              stuck.value = withSequence(
                withTiming(1, { duration: 90 }),
                withTiming(0, { duration: 160 }),
              );
              runOnJS(refuse)(key);
            } else {
              runOnJS(avisar)("missed");
            }
            return;
          }
          const l = leftPan.value > 0.5;
          const rr = rightPan.value > 0.5;
          leftPan.value = withTiming(l ? 1 : 0, { duration: theme.motion.base });
          rightPan.value = withTiming(rr ? 1 : 0, { duration: theme.motion.base });
          if (l && rr) runOnJS(bothPans)();
          else if (l || rr) runOnJS(tilted)(l, rr);
          else runOnJS(avisar)("missed");
        });
    },
    [zones, solved, leftPan, rightPan, reached, refuse, bothPans, tilted, avisar],
  );

  /** En la superficie simbólica el gesto vuelve a ser un arrastre hacia el `=`. */
  const makeSymbolGesture = useCallback(
    (
      key: Key,
      _home: Pt,
      dx: ReturnType<typeof useSharedValue<number>>,
      dy: ReturnType<typeof useSharedValue<number>>,
      stuck: ReturnType<typeof useSharedValue<number>>,
    ) =>
      Gesture.Pan()
        .enabled(!solved)
        .onBegin(() => {
          runOnJS(setShownKeyId)(key.id);
        })
        .onChange((e) => {
          dx.value = e.translationX;
          dy.value = e.translationY;
          progress.value = Math.max(0, Math.min(1, -dy.value / DRAG_RANGE));
          // La balanza que acompaña al nivel 4 se transforma en sincronía: la
          // ficha se aplica a los dos lados de una vez.
          leftPan.value = progress.value;
          rightPan.value = progress.value;
        })
        .onFinalize((e) => {
          const llego = progress.value > 0.6;
          const movio = Math.hypot(e.translationX, e.translationY) >= TAP_SLOP;
          dx.value = withTiming(0, { duration: theme.motion.base });
          dy.value = withTiming(0, { duration: theme.motion.base });
          if (llego && key.correct) {
            progress.value = withTiming(1, { duration: theme.motion.quick });
            leftPan.value = withTiming(1, { duration: theme.motion.quick });
            rightPan.value = withTiming(1, { duration: theme.motion.quick });
            // El avance va con un temporizador y no con el callback de la
            // animación: con el panel del navegador oculto, el cuadro que lo
            // dispararía no llega nunca.
            runOnJS(succeed)();
          } else if (llego) {
            stuck.value = withSequence(
              withTiming(1, { duration: 90 }),
              withTiming(0, { duration: 160 }),
            );
            leftPan.value = withTiming(0, { duration: theme.motion.base });
            rightPan.value = withTiming(0, { duration: theme.motion.base });
            runOnJS(refuse)(key);
          } else {
            progress.value = withTiming(0, { duration: theme.motion.base });
            leftPan.value = withTiming(0, { duration: theme.motion.base });
            rightPan.value = withTiming(0, { duration: theme.motion.base });
            runOnJS(avisar)(movio ? "short" : "tapSymbol");
          }
        }),
    [solved, progress, leftPan, rightPan, refuse, succeed, avisar],
  );

  const makeGesture = handsOn ? makeBalanceGesture : makeSymbolGesture;

  const toggleGhost = useCallback(() => {
    setGhostOn((on) => {
      ghost.value = withTiming(on ? 0 : 1, { duration: theme.motion.base });
      return !on;
    });
  }, [ghost]);

  // --- Qué señala la guía ----------------------------------------------------

  /**
   * Cada paso de la guía señala algo real del tablero de esta ronda: la caja
   * con su broche, la llave, el plato que todavía no recibió la llave, la
   * ecuación. Donde elegir la llave es la pregunta (cuatro operaciones), la luz
   * señala el llavero entero y no la respuesta. La pista de Tomi reusa los
   * pasos: señala lo mismo, pero no frena la ronda.
   */
  const shown = step ?? lesson?.hint;
  const focus = useMemo<Focus | null>(() => {
    if (!shown) return null;
    const id = shown.id;
    const cajaIzq = !level.params.unknownRight;
    const panPt = (izq: boolean): Pt => ({ x: izq ? zones.leftX : zones.rightX, y: zones.y });
    const plato = (izq: boolean): Rect => {
      const p = panPt(izq);
      return { x: p.x - bl.panW / 2 - 8, y: bl.beamY + bl.hang - 70, w: bl.panW + 16, h: 90 };
    };
    const barra: Rect = { x: bl.cx - bl.span - 20, y: bl.beamY - 16, w: bl.span * 2 + 40, h: 32 };
    const llave = (i: number): Rect => {
      const s = keySpots[i] ?? { x: width / 2, y: keyY };
      return { x: s.x - KEY / 2 - 6, y: s.y - KEY / 2 - 6, w: KEY + 12, h: KEY + 12 };
    };
    const n = problem.keys.length;
    const llavero: Rect = {
      x: (keySpots[0]?.x ?? width / 2) - KEY / 2 - 8,
      y: keyY - KEY / 2 - 8,
      w: (n - 1) * (KEY + KEY_GAP) + KEY + 16,
      h: KEY + 16,
    };
    const ecuacion: Rect = { x: width / 2 - 170, y: equationY - 44, w: 340, h: 88 };
    const buena = problem.keys.findIndex((k) => k.correct);
    const solo = (rs: readonly (Rect | null)[]): Focus => ({ rings: rs.filter((r): r is Rect => r !== null) });

    if (!handsOn) {
      if (id === "look") return solo([ecuacion, ghostOn && showsBalance ? barra : null]);
      if (id === "reveal") return solo([ecuacion]);
      // Hacia arriba, desde el llavero hasta la ecuación: el gesto, sin elegir por el jugador.
      return {
        rings: [llavero, ecuacion],
        drag: { from: { x: width / 2, y: keyY }, to: { x: width / 2, y: keyY - DRAG_RANGE } },
      };
    }
    if (id === "look") return solo([plato(cajaIzq), barra]);
    if (id === "reveal") return solo([plato(cajaIzq), barra]);
    // El plato que todavía no recibió la llave. Con los dos hechos, ninguno.
    const falta = !hechos.l ? true : !hechos.r ? false : null;
    const destino = falta === null ? null : panPt(falta);
    // Con dos llaves (+ y −) la guía muestra cuál; con cuatro, elegir es el nivel.
    const muestraLlave = n <= 2 && buena >= 0;
    const desde = muestraLlave ? (keySpots[buena] ?? { x: width / 2, y: keyY }) : { x: width / 2, y: keyY };
    const aros = [muestraLlave ? llave(buena) : llavero, falta === null ? null : plato(falta)];
    if (id === "choose") return solo([plato(cajaIzq), llavero]);
    return destino ? { rings: aros.filter((r): r is Rect => r !== null), drag: { from: desde, to: destino } } : solo(aros);
  }, [shown, level.params.unknownRight, zones, bl, keySpots, keyY, width, problem.keys, equationY, handsOn, ghostOn, showsBalance, hechos]);

  return (
    <View style={styles.root}>

      <Header
        title={`${t(`node.${NODE}.name`)} · nivel ${level.n} de ${TOTAL_LEVELS}`}
        subtitle={t(level.titleKey)}
        round={round}
        rounds={level.rounds}
        showDots={!conLeccion}
      />

      <CoachBanner round={round} rounds={level.rounds} />

      <View style={{ width, height: sceneH + RING_H }}>
        <Canvas style={{ width, height: sceneH }}>
          {showsBalance ? (
            <BalanceScene
              problem={problem}
              unknownLeft={!level.params.unknownRight}
              style={level.layer === "concrete" ? "concrete" : "visual"}
              width={width}
              height={balanceH}
              left={leftPan}
              right={rightPan}
              appear={ghost}
            />
          ) : null}
          {showsEquation ? (
            <Group transform={[{ translateX: width / 2 }, { translateY: equationY }]}>
              <MorphView plan={plan} progress={progress} ease={smooth} fontSize={FONT_SIZE} />
            </Group>
          ) : null}
        </Canvas>

        {/* El llavero, en la franja de abajo de la misma vista: cada llave en
            un lugar que el gesto y la guía conocen. */}
        {problem.keys.map((k, i) => {
          const s = keySpots[i] ?? { x: width / 2, y: keyY };
          return (
            <View
              key={k.id}
              style={[styles.keySlot, { left: s.x - KEY / 2, top: s.y - KEY / 2 }]}
            >
              <KeyCell
                item={k}
                home={s}
                labeled={level.labeledKeys}
                solved={solved}
                make={makeGesture}
              />
            </View>
          );
        })}

        {/* La luz de la guía, encima de todo y sin llevarse ningún toque. */}
        <Spotlight focus={focus} />
      </View>

      {/* El interruptor de la balanza va pegado al tablero y antes de la línea
          de mensajes: al final de la columna, en el teléfono quedaba debajo del
          borde de la pantalla justo cuando el recordatorio pedía tocarlo. */}
      {level.balance === "onDemand" ? (
        <Pressable onPress={toggleGhost} style={styles.ghostBtn} hitSlop={theme.hitSlop}>
          <Text style={styles.ghostLabel}>{ghostOn ? "ocultar balanza" : "ver balanza"}</Text>
        </Pressable>
      ) : level.balance === "hidden" ? (
        // Sin balanza queda la regla, que es lo que sobrevive al andamio.
        <Text style={styles.balance}>La misma regla, sin balanza que la sostenga.</Text>
      ) : (
        <Text style={styles.balance}>
          {handsOn
            ? "Una llave, los dos platos."
            : "Lo que hagas de un lado, hacelo del otro."}
        </Text>
      )}

      <Hint text={message.text} tone={message.tone} />
    </View>
  );
}

const OPENING_HINT = "Pasá la llave por los dos platos, sin soltar.";

/** Cada llave necesita sus propios valores compartidos, así que vive en su componente. */
function KeyCell({
  item,
  home,
  labeled,
  solved,
  make,
}: {
  readonly item: Key;
  readonly home: Pt;
  readonly labeled: boolean;
  readonly solved: boolean;
  readonly make: (
    k: Key,
    home: Pt,
    dx: ReturnType<typeof useSharedValue<number>>,
    dy: ReturnType<typeof useSharedValue<number>>,
    stuck: ReturnType<typeof useSharedValue<number>>,
  ) => ReturnType<typeof Gesture.Pan>;
}) {
  const dx = useSharedValue(0);
  const dy = useSharedValue(0);
  const stuck = useSharedValue(0);
  const hx = home.x;
  const hy = home.y;
  const gesture = useMemo(
    () => make(item, { x: hx, y: hy }, dx, dy, stuck),
    [item, make, hx, hy, dx, dy, stuck],
  );
  return (
    <KeyView item={item} labeled={labeled} dx={dx} dy={dy} stuck={stuck} gesture={gesture} dimmed={solved} />
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.space[2],
  },
  keySlot: {
    position: "absolute",
    width: KEY,
    height: KEY,
    alignItems: "center",
    justifyContent: "center",
  },
  balance: { color: theme.color.inkFaint, fontSize: 12, marginTop: theme.space[1] },
  ghostBtn: { marginTop: theme.space[1] },
  ghostLabel: { color: theme.color.inkDim, fontSize: 12 },
});
