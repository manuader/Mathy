/**
 * La cadena de máquinas: el minijuego de `alg.fn.composition`.
 *
 * Dos cosas quedan fijas acá, y las dos son el nodo entero:
 *
 * 1. **El orden importa, y se ve.** No hay ningún cartel que lo diga. Desde el
 *    nivel 4 la escena se parte en dos carriles con **la misma bola** y **las
 *    mismas cajas invertidas**, los dos recorridos avanzan a la vez y las dos
 *    salidas quedan una debajo de la otra, distintas. El jugador no lee que
 *    `f∘g ≠ g∘f`: mira dos bolas de distinto tamaño que salieron de la misma.
 *    En el nivel 2 la misma comparación se hace sin números, entre lo que salió
 *    y lo que sale al dar vuelta las máquinas.
 * 2. **La cadena se vuelve un objeto.** En el nivel 6 tocar una caja contrae su
 *    regla hasta su letra, y cuando las dos tienen letra el lazo se cierra
 *    alrededor de las dos y aparece `f∘g` encima. El símbolo no se presenta: se
 *    fabrica con el dedo, y nace del problema de nombrar la cadena sin
 *    evaluarla.
 *
 * La superficie es `machine_pipe` y la dibuja `PipeScene`, la escena que el nodo
 * 9 escribió para los diez nodos que la usan. Este nodo le agregó tres cosas
 * aditivas —el lazo con su etiqueta, el valor intermedio escrito sobre el tramo,
 * y la cara de la máquina que pone la tapa— y usó por primera vez el eje que ya
 * estaba puesto para él: `lanes`, los dos carriles paralelos.
 *
 * Esta actividad no dibuja nada: elige qué mira el jugador en cada ronda, le
 * pasa su configuración y traduce el dedo en los valores que la escena anima. La
 * cuenta la hace `@mathy/mechanics`; ni la escena ni esta pantalla calculan una
 * salida, para que no haya dos fuentes de verdad.
 *
 * El único error que clasifica es `chain_rule_missing_inner`, que es el único
 * que el catálogo de L declara sobre este nodo. Creer que el orden da igual y
 * leer `f(g(x))` de izquierda a derecha están previstos y se muestran, pero no
 * se anotan: sus ids no listan este nodo.
 *
 * QUÉ QUEDÓ AFUERA: el tren de engranajes (`gears_sequence`), que el diseño pone
 * como mecánica secundaria y como escena del nivel 5. La escena de esa mecánica
 * es `TrackScene`, que hoy tiene una sola rueda atada al caminante; darle una
 * segunda rueda encadenada con su razón y su contador es una capa nueva en una
 * escena de dos mil líneas que comparten otros cuatro nodos, y volver a jugarlos
 * a todos no entraba. El nivel 5 conserva lo que el tren venía a enseñar —que
 * las razones se multiplican, y que el resultado hay que anticiparlo antes de
 * girar— sobre la tubería, con las dos máquinas que escalan y el contador
 * apagado hasta que la ficha está puesta. También quedó afuera el cofre del nodo
 * 12 al costado del nivel 6, que es una escena distinta por la misma razón.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Canvas } from "@shopify/react-native-skia";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  cancelAnimation,
  runOnJS,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import {
  COMP_MACHINE_SLOTS,
  COMP_TRAY_SLOTS,
  NODE_COMPOSITION,
  TOTAL_COMP_LEVELS,
  compEvaluatedPieces,
  compMisconceptionFor,
  compNestPieces,
  compOpPieces,
  compRingPieces,
  compRun,
  compUnequalPieces,
  generateComposition,
  type CompLevel,
  type CompMachine,
  type CompOption,
  type CompPiece,
} from "@mathy/mechanics";
import type { Event } from "@mathy/progress";
import {
  PipeScene,
  PIPE_MACHINE_SLOTS,
  PIPE_TRAY_SLOTS,
  pipeLayout,
  type PipeConfig,
  type PipeItem,
  type PipeLane,
  type PipeMachine,
  type PipeMachineKind,
  type PipeSlot,
} from "../scenes/PipeScene.tsx";
import { Header, Hint } from "../ui/Chrome.tsx";
import { ActivityShell, useActivityViewport } from "../ui/ActivityShell.tsx";
import { t } from "../i18n.ts";
import { theme } from "../ui/theme.ts";

/** Cuánto se puede mover el dedo y que el gesto siga siendo un toque. */
const TAP_SLOP = 14;

/**
 * El signo de cada operación. El menos es el U+2212 de la tipografía
 * matemática: el guion de ASCII no está en el atlas y dejaría un hueco.
 */
const SIGN: Readonly<Record<string, string>> = {
  add: "+",
  sub: "−",
  mul: "×",
  div: "÷",
};

/** Lo que hace cada máquina, en el vocabulario de la escena. */
const KIND: Readonly<Record<string, PipeMachineKind>> = {
  add: "add",
  sub: "sub",
  mul: "mul",
  div: "div",
};

/** Una expresión escrita, compuesta desde las piezas que da el modelo. */
function composeText(pieces: readonly CompPiece[]): string {
  let out = "";
  for (const p of pieces) {
    if (p.kind === "num") out += p.value < 0 ? `−${Math.abs(p.value)}` : String(p.value);
    else if (p.kind === "sym") out += p.name;
    else if (p.kind === "open") out += "(";
    else if (p.kind === "close") out += ")";
    else if (p.kind === "ring") out += "∘";
    else if (p.kind === "neq") out += " ≠ ";
    else if (p.kind === "eq") out += " = ";
    else out += ` ${SIGN[p.op] ?? "+"} `;
  }
  return out;
}

/** El mismo texto pero sin aire alrededor de los signos, para los rótulos chicos. */
const tight = (pieces: readonly CompPiece[]): string => composeText(pieces).replace(/ /g, "");

export interface CompositionGameProps {
  readonly level: CompLevel;
  readonly levelsDone: number;
  readonly onLevelDone: () => void;
  readonly onExit: () => void;
  readonly onEvent: (event: Event) => void;
}

export function CompositionGame(props: CompositionGameProps) {
  return (
    <ActivityShell levelsDone={props.levelsDone}>
      <Activity {...props} />
    </ActivityShell>
  );
}

function Activity({ level, onLevelDone, onExit, onEvent }: CompositionGameProps) {
  // El lienzo mide lo que le deja el panel abierto, no la ventana entera.
  const { width, height } = useActivityViewport();
  const [round, setRound] = useState(0);
  const [seedBase] = useState(() => Math.floor(Math.random() * 100000));
  const [solved, setSolved] = useState(false);
  /** El orden de las máquinas del caño, por id. */
  const [order, setOrder] = useState<readonly string[]>([]);
  /** Las máquinas que el jugador ya enganchó en el caño. */
  const [placed, setPlaced] = useState<readonly CompMachine[]>([]);
  /** Las cajas cuya regla ya se contrajo hasta su letra. */
  const [lettered, setLettered] = useState<readonly string[]>([]);
  /** El lazo ya se cerró alrededor de las dos. */
  const [lassoed, setLassoed] = useState(false);
  /** La bola ya salió: el contador y el valor intermedio existen. */
  const [fed, setFed] = useState(false);
  /** Las máquinas ya se dieron vuelta, en la ronda que las da vuelta. */
  const [swapped, setSwapped] = useState(false);
  /** La cadena escrita que el dedo eligió, o `null`. */
  const [chosen, setChosen] = useState<CompOption | null>(null);
  /** Qué máquina está agarrada, o -1. */
  const [picked, setPicked] = useState(-1);

  const problem = useMemo(
    () => generateComposition(level, seedBase + round * 1000 + level.n, round),
    [level, round, seedBase],
  );
  const ask = problem.ask;

  const [message, setMessage] = useState<{ text: string; tone: "dim" | "ok" | "warn" }>(() => ({
    text: t(`comp.ask.${ask}`),
    tone: "dim",
  }));

  const sceneH = Math.max(300, Math.min(height * 0.56, 460));

  // --- Lo que corre por el caño ----------------------------------------------

  /** Las máquinas que corren ahora: las puestas, las ordenadas, o las que ya venían. */
  const cadena = useMemo<readonly CompMachine[]>(() => {
    if (ask === "connect") return placed;
    if (ask === "reject") return chosen?.chain ?? [];
    if (ask === "swap") return swapped ? problem.other : problem.chain;
    if (order.length > 0) {
      const out: CompMachine[] = [];
      for (const id of order) {
        const m = problem.chain.find((x) => x.id === id);
        if (m) out.push(m);
      }
      return out;
    }
    return problem.chain;
  }, [ask, placed, chosen, swapped, order, problem.chain, problem.other]);

  const run = useMemo(() => compRun(problem.input, cadena), [problem.input, cadena]);
  const otra = useMemo(
    () => compRun(problem.input, problem.other),
    [problem.input, problem.other],
  );

  /** El segundo carril está en pantalla: la comparación de los dos órdenes. */
  const dosCarriles = ask === "which" || ask === "commutes";

  /**
   * El techo con el que se normalizan los tamaños. Sale del más grande de todo
   * lo que la ronda puede mostrar: normalizado contra el recorrido de ahora, un
   * cambio de orden no se vería.
   */
  const techo = useMemo(() => {
    const candidatos = [
      Math.abs(problem.target),
      Math.abs(problem.input),
      Math.abs(problem.otherOutput),
      Math.abs(run.output),
      ...problem.options.map((o) => Math.abs(o.value)),
      1,
    ].filter((v) => Number.isFinite(v));
    return Math.max(...candidatos, 1);
  }, [problem, run.output]);

  const item = useCallback(
    (value: number, kind: PipeItem["kind"] = "ball"): PipeItem => ({
      value: Number.isFinite(value) ? value : 0,
      size: Math.max(0.24, Math.min(1, Math.abs(value) / techo)),
      kind,
      label: "",
    }),
    [techo],
  );

  /**
   * Una máquina, en el vocabulario de la escena.
   *
   * La cara de la fábrica sigue al **nombre** y no al lugar: la que pinta es `g`
   * y la que tapa es `f`, así que al dar vuelta el caño la pintora sigue siendo
   * la pintora. Si la cara siguiera a la posición, intercambiarlas no se vería.
   */
  const machineOf = useCallback(
    (m: CompMachine): PipeMachine => ({
      id: m.id,
      kind: level.factory ? (m.name === "f" ? "lid" : "paint") : (KIND[m.op] ?? "add"),
      value: m.value,
      // La regla se contrae en la letra al tocar la caja: es el primer paso de la
      // transición simbólica, y por eso el rótulo depende de lo que el dedo hizo.
      label:
        ask === "lasso"
          ? lettered.includes(m.id)
            ? m.name
            : ""
          : level.named && (ask === "nest" || ask === "commutes")
            ? m.name
            : "",
      inverted: false,
      opaque: false,
    }),
    [level.factory, level.named, ask, lettered],
  );

  /** El valor intermedio escrito sobre el tramo, cuando ya existe. */
  const intermedio = useMemo(() => {
    if (!level.numerals || !fed || cadena.length < 2) return "";
    const primera = cadena[0] as CompMachine;
    const salida = compRun(problem.input, [primera]).output;
    if (!Number.isFinite(salida)) return "";
    return level.named
      ? tight(compNestPieces([primera], [{ kind: "num", value: problem.input }]))
      : String(salida);
  }, [level.numerals, level.named, fed, cadena, problem.input]);

  const pipeConfig = useMemo<PipeConfig>(() => {
    // La bola marcada solo se dibuja cuando el objetivo es **dado** y hay que
    // llegar a él. En las rondas que se contestan eligiendo, dibujarla sería
    // poner la respuesta en pantalla al lado de las fichas entre las que hay que
    // elegirla.
    const conObjetivo =
      ask === "connect" || ask === "which" || ask === "order" || ask === "chain3";
    const objetivo = conObjetivo ? item(problem.target) : null;

    const laneA: PipeLane = {
      id: "l0",
      machines: cadena.map((m) => machineOf(m)),
      input: item(problem.input),
      stages: run.stages.map((v) => item(v)),
      output: item(Number.isFinite(run.output) ? run.output : problem.input),
      target: objetivo,
      glow: !solved,
      branch: null,
      lasso: lassoed ? tight(compRingPieces(cadena)) : "",
      midLabel: intermedio,
      // Con qué se alimenta el caño. Desde el nivel 4 tiene que estar escrito:
      // el nivel 5 pide anticipar la salida antes de que la bola salga, y sin la
      // entrada a la vista eso no se puede pensar, solo adivinar.
      inputLabel: level.numerals ? String(problem.input) : "",
    };

    const laneB: PipeLane[] = dosCarriles
      ? [
          {
            id: "l1",
            machines: problem.other.map((m) => machineOf(m)),
            input: item(problem.input),
            stages: otra.stages.map((v) => item(v)),
            output: item(Number.isFinite(otra.output) ? otra.output : problem.input),
            target: objetivo,
            glow: false,
            branch: null,
            lasso: "",
            midLabel: "",
            // La misma bola por los dos caminos, y el número lo dice.
            inputLabel: level.numerals ? String(problem.input) : "",
          },
        ]
      : [];

    // El renglón de notación cae debajo de los dos carriles, que es donde la
    // desigualdad tiene que estar: entre las dos salidas que la prueban.
    const renglon =
      !level.named
        ? ""
        : ask === "commutes" && solved && !problem.commutes
          ? composeText(compUnequalPieces(problem.chain))
          : ask === "nest" && solved
            ? composeText(compEvaluatedPieces(problem.chain, problem.input, problem.target))
            : "";

    return {
      lanes: [laneA, ...laneB],
      // La piel del nivel, salvo cuando el gesto necesita el objeto. En
      // `function_notation` la escena ya se retiró y las máquinas dejan de tener
      // carcasa; lazarlas pide justamente rodear dos cajas, así que esa ronda se
      // juega una etapa más atrás y el resto del nivel sigue retirado.
      skin: ask === "lasso" ? "pipes" : level.skin,
      direction: "forward",
      numerals: level.numerals,
      // El contador solo dice algo cuando hay algo que decir: una cadena trabada
      // no produjo ningún número, y escribir la entrada ahí sería inventar uno.
      counter: level.numerals && fed && Number.isFinite(run.output),
      table: [],
      tray: ask === "connect" ? problem.tray.map((m) => machineOf(m)) : [],
      trayItems:
        ask === "watch" || ask === "swap" || ask === "predict"
          ? problem.options.map((o) => item(o.value))
          : [],
      slots: ask === "connect" ? problem.solution.length : 0,
      reorderable: ask === "order" || ask === "chain3",
      box: false,
      // La tubería fantasma que se pide con un toque: en `symbolic` la escena ya
      // se retiró y vuelve solo cuando el jugador la llama.
      onDemand: ask === "nest" || ask === "reject",
      formula: renglon,
    };
  }, [
    ask,
    cadena,
    dosCarriles,
    fed,
    intermedio,
    item,
    lassoed,
    level.named,
    level.numerals,
    level.skin,
    machineOf,
    otra,
    problem,
    run,
    solved,
  ]);

  const pl = useMemo(() => pipeLayout(pipeConfig, width, sceneH), [pipeConfig, width, sceneH]);

  // --- Lo que la escena anima ------------------------------------------------

  const flow = useSharedValue(0);
  const jam = useSharedValue(0);
  const hint = useSharedValue(0);
  const demo = useSharedValue(0);
  const unfold = useSharedValue(1);
  const appear = useSharedValue(0);

  const machineSlots = useSlots(PIPE_MACHINE_SLOTS);
  const traySlots = useSlots(PIPE_TRAY_SLOTS);

  const shownAt = useRef(Date.now());
  const doneRef = useRef(false);
  /**
   * La ronda ya se decidió, aunque el cartel llegue después. Entre el movimiento
   * que resuelve y el mensaje hay un segundo largo, porque el caño tiene que
   * correr para que se vea salir la bola: sin este cerrojo, los toques de esa
   * ventana se cuentan como intentos nuevos y ensucian la evidencia.
   */
  const cerrado = useRef(false);
  /**
   * Todo lo que un gesto necesita saber, en una referencia. Un worklet captura
   * el callback del render en que se armó el gesto, así que lo leído del cierre
   * sería lo de la primera ronda para siempre.
   */
  const vivo = useRef({ problem, ask, solved, placed, order, lettered });
  vivo.current = { ...vivo.current, problem, ask, solved, placed, order, lettered };
  const roundRef = useRef(round);
  roundRef.current = round;

  /**
   * Soltar la bola. `hasta` es hasta dónde llega: 1 es el pico, y menos que 1 es
   * la máquina que no la aceptó. Una cadena trabada tiene que **verse** trabarse
   * en la boca que la rechaza; si la bola llegara igual hasta el final, la
   * pantalla diría que la cadena corrió.
   */
  const correr = useCallback((hasta = 1) => {
    setFed(true);
    flow.value = 0;
    flow.value = withTiming(hasta, { duration: theme.motion.reveal * hasta });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    shownAt.current = Date.now();
    doneRef.current = false;
    cerrado.current = false;
    setSolved(false);
    setPlaced([]);
    setLettered([]);
    setLassoed(false);
    setSwapped(false);
    setChosen(null);
    setPicked(-1);
    setFed(false);
    setOrder(problem.chain.map((m) => m.id));
    setMessage({ text: t(`comp.ask.${problem.ask}`), tone: "dim" });

    flow.value = 0;
    jam.value = 0;
    unfold.value = problem.ask === "nest" || problem.ask === "reject" ? 0 : 1;
    for (const s of [...machineSlots, ...traySlots]) {
      s.dx.value = 0;
      s.dy.value = 0;
      s.alive.value = 1;
    }
    appear.value = withTiming(1, { duration: theme.motion.base });

    // Las rondas que se miran arrancan solas: en `real` el jugador todavía no
    // tiene ningún gesto, y la cinta que corre **es** el enunciado.
    if (problem.ask === "watch" || problem.ask === "swap" || problem.ask === "which" || problem.ask === "commutes") {
      setFed(true);
      flow.value = withTiming(1, { duration: theme.motion.reveal });
    }

    // El latido de la demostración no es un adorno: es la única instrucción.
    hint.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
    demo.value = withRepeat(
      withSequence(withTiming(1, { duration: 1400 }), withTiming(0, { duration: 1 })),
      -1,
      false,
    );
    return () => {
      cancelAnimation(hint);
      cancelAnimation(demo);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem]);

  /** Una ficha ya enganchada sigue en el cajón, apagada y sin escuchar. */
  const yaPuesta = useCallback(
    (i: number) => {
      const pieza = problem.tray[i];
      return pieza !== undefined && placed.some((m) => m.id === pieza.id);
    },
    [problem.tray, placed],
  );

  useEffect(() => {
    traySlots.forEach((s, i) => {
      s.alive.value = withTiming(yaPuesta(i) ? 0 : 1, { duration: theme.motion.quick });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yaPuesta]);

  // La capa vista se registra al entrar y no al terminar: es lo que hace crecer
  // la chuleta, y el jugador ya la vio.
  useEffect(() => {
    onEvent({ kind: "sawLayer", at: Date.now(), node: NODE_COMPOSITION, layer: level.layer });
  }, [level.layer, onEvent]);

  /** Un movimiento del jugador, contado para cada verbo que el nivel ejercita. */
  const attempt = useCallback(
    (correct: boolean, misconception?: string) => {
      const at = Date.now();
      const latency = at - shownAt.current;
      for (const evidence of level.evidence) {
        onEvent({
          kind: "attempt",
          at,
          node: NODE_COMPOSITION,
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

  const quiet = useCallback(() => {
    cancelAnimation(hint);
    hint.value = withTiming(0, { duration: 260 });
  }, [hint]);

  const nextRound = useCallback(() => {
    const r = roundRef.current;
    if (r + 1 >= level.rounds) {
      onEvent({ kind: "levelDone", at: Date.now(), node: NODE_COMPOSITION, level: level.n });
      onLevelDone();
      return;
    }
    setRound(r + 1);
  }, [level.rounds, level.n, onEvent, onLevelDone]);

  const succeed = useCallback(
    (key: string) => {
      if (doneRef.current) return;
      doneRef.current = true;
      setSolved(true);
      quiet();
      setMessage({ text: t(key), tone: "ok" });
      setTimeout(nextRound, 2000);
    },
    [nextRound, quiet],
  );

  /** Ganar. Cierra la ronda ya, y recién después muestra el cartel. */
  const win = useCallback(
    (key: string, delay = 0) => {
      if (cerrado.current) return;
      cerrado.current = true;
      if (delay <= 0) {
        succeed(key);
        return;
      }
      setTimeout(() => succeed(key), delay);
    },
    [succeed],
  );

  const trabar = useCallback(() => {
    jam.value = withSequence(
      withTiming(1, { duration: 90 }),
      withTiming(-1, { duration: 110 }),
      withTiming(0, { duration: 120 }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Elegir una bola del cajón ---------------------------------------------

  /**
   * Tocar una de las bolas de salida. En el nivel 1 dice cuál salió; en el 2,
   * cuál sale si las máquinas se dan vuelta; en el 5, cuánto va a marcar el
   * contador antes de que la bola salga.
   */
  const pickBall = useCallback(
    (index: number) => {
      const { problem: p, ask: a, solved: hecho } = vivo.current;
      if (hecho || cerrado.current) return;
      const opcion = p.options[index];
      if (!opcion) return;
      quiet();
      attempt(opcion.correct, compMisconceptionFor(opcion.lure));
      if (opcion.correct) {
        // Y ahora se ve. En `swap` el caño se da vuelta y la misma bola recorre
        // el otro camino: la respuesta se comprueba, no se acepta.
        if (a === "swap") setSwapped(true);
        correr();
        win(`comp.done.${a}`, theme.motion.reveal);
        return;
      }
      trabar();
      setMessage({ text: t(`comp.lure.${opcion.lure ?? "default"}`), tone: "warn" });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attempt, quiet, win, correr, trabar],
  );

  // --- Enganchar el tubo -----------------------------------------------------

  /**
   * Una máquina del cajón entró en la primera ranura vacía. El tubo solo se
   * engancha de una salida a una entrada, así que la ranura que sigue es la
   * única que acepta: soltar cualquier otra es el tubo que se resbala.
   */
  const install = useCallback(
    (index: number) => {
      const { problem: p, solved: hecho, placed: puestas } = vivo.current;
      if (hecho || cerrado.current) return;
      const pieza = p.tray[index];
      if (!pieza || puestas.some((m) => m.id === pieza.id)) return;
      quiet();
      const sirve = p.solution.some((m) => m.id === pieza.id);
      attempt(sirve);
      if (!sirve) {
        trabar();
        setMessage({ text: t("comp.hint.pipeSlips"), tone: "warn" });
        return;
      }
      const ahora = [...puestas, pieza];
      setPlaced(ahora);
      if (ahora.length >= p.solution.length) {
        correr();
        win("comp.done.connect", theme.motion.reveal);
        return;
      }
      setMessage({ text: t("comp.hint.nowTheOther"), tone: "dim" });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attempt, quiet, win, correr, trabar],
  );

  // --- Cambiar el orden ------------------------------------------------------

  /**
   * Tocar una caja la intercambia con la que sigue. Con tres máquinas, tocar dos
   * veces alcanza para llegar a cualquiera de los seis órdenes, y el orden se ve
   * cambiar antes de soltar la bola.
   */
  const rotate = useCallback(
    (slot: number) => {
      const { problem: p, solved: hecho, order: actual } = vivo.current;
      if (hecho || cerrado.current) return;
      quiet();
      const dado = [...actual];
      const j = (slot + 1) % dado.length;
      const tmp = dado[slot] as string;
      dado[slot] = dado[j] as string;
      dado[j] = tmp;
      setOrder(dado);

      const ordenadas = dado
        .map((id) => p.chain.find((m) => m.id === id))
        .filter((m): m is CompMachine => m !== undefined);
      const salida = compRun(p.input, ordenadas).output;
      setFed(true);
      flow.value = 0;
      flow.value = withTiming(1, { duration: theme.motion.reveal });
      const bien = salida === p.target;
      attempt(bien);
      if (bien) {
        win("comp.done.order", theme.motion.reveal);
        return;
      }
      setMessage({ text: t("comp.hint.otherOrder"), tone: "dim" });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attempt, quiet, win],
  );

  // --- Nombrar y lazar -------------------------------------------------------

  /**
   * Tocar una caja contrae su regla hasta su letra. Cuando las dos tienen letra
   * el lazo se cierra alrededor de las dos y encima aparece `f∘g`: el nombre de
   * la cadena entera, que hasta ese momento no hacía falta.
   */
  const letter = useCallback(
    (slot: number) => {
      const { problem: p, solved: hecho, lettered: puestas } = vivo.current;
      if (hecho || cerrado.current) return;
      const m = p.chain[slot];
      if (!m || puestas.includes(m.id)) return;
      quiet();
      const ahora = [...puestas, m.id];
      setLettered(ahora);
      attempt(true);
      if (ahora.length < p.chain.length) {
        setMessage({ text: t("comp.hint.andTheOther"), tone: "dim" });
        return;
      }
      setLassoed(true);
      correr();
      win("comp.done.lasso", theme.motion.reveal);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attempt, quiet, win, correr],
  );

  /** Tocar un carril: cuál de los dos órdenes saca la bola que se pide. */
  const pickLane = useCallback(
    (lane: number) => {
      const { problem: p, solved: hecho } = vivo.current;
      if (hecho || cerrado.current) return;
      quiet();
      const salida = lane === 0 ? compRun(p.input, p.chain).output : compRun(p.input, p.other).output;
      const bien = salida === p.target;
      attempt(bien, bien ? undefined : compMisconceptionFor("same_either_way"));
      if (bien) {
        win("comp.done.which");
        return;
      }
      setMessage({ text: t("comp.hint.thatLaneGivesAnother"), tone: "warn" });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attempt, quiet, win],
  );

  // --- Las fichas escritas ---------------------------------------------------

  const pickOption = useCallback(
    (option: CompOption) => {
      const { ask: a, solved: hecho } = vivo.current;
      if (hecho || cerrado.current) return;
      quiet();
      attempt(option.correct, compMisconceptionFor(option.lure));
      if (a === "reject") {
        // La cadena elegida se dibuja y se corre. La bola llega hasta la boca que
        // no la acepta y ahí se sacude: la cadena imposible no se explica, se ve.
        setChosen(option);
        unfold.value = withTiming(1, { duration: theme.motion.base });
        const corrida = compRun(vivo.current.problem.input, option.chain);
        const tramos = option.chain.length + 1;
        if (corrida.blockedAt >= 0) {
          correr((corrida.blockedAt + 1) / tramos);
          trabar();
        } else {
          correr();
        }
      }
      if (option.correct) {
        if (a === "nest") {
          unfold.value = withTiming(1, { duration: theme.motion.base });
          correr();
        }
        win(`comp.done.${a}`, a === "nest" || a === "reject" ? theme.motion.reveal : 0);
        return;
      }
      setMessage({ text: t(`comp.lure.${option.lure ?? "default"}`), tone: "warn" });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attempt, quiet, win, correr, trabar],
  );

  /** ¿El par da lo mismo en los dos órdenes? Con un ejemplo alcanza para decidir. */
  const pickCommutes = useCallback(
    (dijoQueSi: boolean) => {
      const { problem: p, solved: hecho } = vivo.current;
      if (hecho || cerrado.current) return;
      quiet();
      const bien = dijoQueSi === p.commutes;
      attempt(bien);
      if (bien) {
        win(p.commutes ? "comp.done.commutesYes" : "comp.done.commutesNo");
        return;
      }
      setMessage({
        text: t(p.commutes ? "comp.hint.lookAgainSame" : "comp.hint.lookAgainDiffer"),
        tone: "warn",
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attempt, quiet, win],
  );

  /**
   * La tubería, pedida con un toque. En `symbolic` la escena ya se retiró y el
   * jugador la llama cuando la quiere. Vuelve **vacía**: se ven las dos cajas y
   * en qué orden están, y no se ve la bola recorrerlas. El fantasma es la
   * estructura, no el resultado; soltar la bola sería contestar la ronda en
   * lugar del jugador. Y no cuenta como intento, porque mirar no es contestar.
   */
  const unfoldGhost = useCallback(() => {
    const { solved: hecho } = vivo.current;
    if (hecho || cerrado.current) return;
    quiet();
    unfold.value = withTiming(1, { duration: theme.motion.base });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiet]);

  /** Tocar una caja hace lo que la ronda pida: ordenar, o contraer en su letra. */
  const tapMachine = useCallback(
    (slot: number) => {
      const { ask: a } = vivo.current;
      if (a === "order" || a === "chain3") rotate(slot);
      else if (a === "lasso") letter(slot);
    },
    [rotate, letter],
  );

  // --- Gestos ----------------------------------------------------------------

  /**
   * Toda la geometría que los gestos necesitan, en un solo `SharedValue`. Los
   * `Gesture` se arman una sola vez: lo que cambia entre rondas viaja por acá,
   * porque un worklet captura el callback del render en que se armó.
   */
  const geo = useSharedValue({
    activo: 0,
    /** Qué contesta el toque: 1 las cajas, 2 los dos carriles, 3 la tubería plegada. */
    modo: 0,
    desdeX: 0,
    desdeY: 0,
    agarrada: -1,
    machines: [] as { x: number; y: number; w: number; h: number; slot: number }[],
    bandas: [] as { y0: number; y1: number }[],
  });

  useEffect(() => {
    const carcasas: { x: number; y: number; w: number; h: number; slot: number }[] = [];
    const primero = pl.lanes[0];
    if (primero) {
      primero.machines.slice(0, cadena.length).forEach((b, slot) => {
        carcasas.push({ x: b.x, y: b.y, w: b.w, h: b.h, slot });
      });
    }
    geo.value = {
      activo: solved ? 0 : 1,
      modo:
        ask === "order" || ask === "chain3" || ask === "lasso" ? 1
        : ask === "which" ? 2
        : ask === "nest" ? 3
        : 0,
      desdeX: 0,
      desdeY: 0,
      agarrada: -1,
      machines: carcasas,
      // Cada carril escucha hasta la mitad del camino al de al lado. Con el alto
      // de una máquina como radio las dos bandas se pisan, y la franja de abajo
      // del carril de arriba se comería los toques del de abajo.
      bandas: pl.lanes.map((l, i) => {
        const antes = pl.lanes[i - 1];
        const despues = pl.lanes[i + 1];
        return {
          y0: antes ? (antes.y + l.y) / 2 : l.y - pl.machineH,
          y1: despues ? (l.y + despues.y) / 2 : l.y + pl.machineH,
        };
      }),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pl, ask, solved, cadena.length]);

  /**
   * El gesto del lienzo. Sin `minDistance(0)`: con cero se activa en el mismo
   * instante en que el dedo se apoya y le gana la carrera al asa que hay encima.
   * Contesta el arrastre y el toque con el mismo objeto, porque un arrastre
   * sintético sobre el lienzo entero no siempre despierta al `Pan` en web y el
   * toque sí.
   */
  const pan = useMemo(
    () =>
      Gesture.Pan()
        .onBegin((e) => {
          const g = geo.value;
          let agarrada = -1;
          if (g.modo === 1) {
            for (let i = 0; i < g.machines.length; i++) {
              const b = g.machines[i];
              if (b && e.x > b.x && e.x < b.x + b.w && e.y > b.y && e.y < b.y + b.h) agarrada = i;
            }
          }
          geo.value = { ...g, desdeX: e.x, desdeY: e.y, agarrada };
          if (agarrada >= 0) runOnJS(setPicked)(agarrada);
        })
        .onChange((e) => {
          const g = geo.value;
          if (g.modo !== 1 || g.agarrada < 0) return;
          // La carcasa sigue al dedo. El caño no: lo que se mueve es la pieza.
          const b = g.machines[g.agarrada];
          if (!b) return;
          const slot = machineSlots[b.slot];
          if (slot) {
            slot.dx.value = e.translationX;
            slot.dy.value = e.translationY;
          }
        })
        .onFinalize((e) => {
          const g = geo.value;
          if (g.modo === 1) {
            const b = g.machines[g.agarrada];
            geo.value = { ...g, agarrada: -1 };
            runOnJS(setPicked)(-1);
            if (b) {
              const slot = machineSlots[b.slot];
              if (slot) {
                slot.dx.value = withTiming(0, { duration: theme.motion.quick });
                slot.dy.value = withTiming(0, { duration: theme.motion.quick });
              }
              // Tocar una caja y arrastrarla son el mismo movimiento: los dos
              // dicen "esta".
              if (g.activo) runOnJS(tapMachine)(b.slot);
            }
            return;
          }
          if (!g.activo) return;
          const movido = Math.hypot(e.x - g.desdeX, e.y - g.desdeY);
          if (movido > TAP_SLOP) return;
          if (g.modo === 2) {
            for (let i = 0; i < g.bandas.length; i++) {
              const b = g.bandas[i];
              if (b && e.y > b.y0 && e.y < b.y1) {
                runOnJS(pickLane)(i);
                return;
              }
            }
            return;
          }
          if (g.modo === 3) runOnJS(unfoldGhost)();
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // --- Las asas del cajón ----------------------------------------------------

  /** Dónde soltó la ficha del cajón, en coordenadas del lienzo. */
  const dropTray = useCallback(
    (index: number, x: number, y: number) => {
      const slot = traySlots[index];
      if (slot) {
        slot.dx.value = withTiming(0, { duration: theme.motion.base });
        slot.dy.value = withTiming(0, { duration: theme.motion.base });
      }
      const lane = pl.lanes[0];
      if (!lane) return;
      const { ask: a } = vivo.current;
      if (a === "connect") {
        // Todo el caño es el blanco: lo que importa no es dónde cae sino cuál se
        // soltó, porque el orden lo decide la ranura vacía que sigue.
        if (Math.abs(y - lane.y) > 130) return;
        install(index);
        return;
      }
      if (Math.hypot(x - lane.spout.x, y - lane.spout.y) > 160) return;
      pickBall(index);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [traySlots, pl.lanes, install, pickBall],
  );

  /** Tocar una ficha del cajón hace lo mismo que arrastrarla hasta el caño. */
  const tapTray = useCallback(
    (index: number) => {
      const { ask: a } = vivo.current;
      if (a === "connect") install(index);
      else pickBall(index);
    },
    [install, pickBall],
  );

  // --- Pantalla --------------------------------------------------------------

  /** `f(g(3))`: lo que la ronda escrita pregunta. */
  const prompt = useMemo(() => {
    if (ask !== "nest") return "";
    return composeText(compNestPieces(problem.chain, [{ kind: "num", value: problem.input }]));
  }, [ask, problem.chain, problem.input]);

  /** `f = ×3   g = +4`: qué hace cada letra, cuando las cajas ya no lo dicen. */
  const reglas = useMemo(() => {
    if (!level.named || (ask !== "nest" && ask !== "commutes")) return "";
    return problem.chain
      .map((m) => `${m.name} = ${composeText(compOpPieces(m)).replace(/ /g, "")}`)
      .join("     ");
  }, [level.named, ask, problem.chain]);

  const conFichas = (ask === "nest" || ask === "reject") && problem.options.length > 0;

  return (
    <View style={styles.root}>
      <Pressable onPress={onExit} style={styles.back} hitSlop={theme.hitSlop}>
        <Text style={styles.backLabel}>{t("game.back")}</Text>
      </Pressable>

      <Header
        title={`${t(`node.${NODE_COMPOSITION}.name`)} · nivel ${level.n} de ${TOTAL_COMP_LEVELS}`}
        subtitle={t(level.titleKey)}
        round={round}
        rounds={level.rounds}
      />

      {reglas !== "" ? <Text style={styles.rules}>{reglas}</Text> : null}

      <View style={{ width, height: sceneH }}>
        {/* Un solo lienzo por pantalla. */}
        <Canvas style={{ width, height: sceneH }}>
          <PipeScene
            config={pipeConfig}
            layout={pl}
            flow={flow}
            lane={-1}
            jam={jam}
            hint={hint}
            demo={demo}
            unfold={unfold}
            appear={appear}
            pieces={machineSlots}
            trayPieces={traySlots}
            picked={picked}
          />
        </Canvas>

        {/* El gesto va encima del lienzo: Skia dibuja, la vista escucha. */}
        <GestureDetector gesture={pan}>
          <Animated.View style={StyleSheet.absoluteFill} />
        </GestureDetector>

        {/* Las asas invisibles sobre las piezas dibujadas. Siempre montadas: una
            ronda que las desmonta deja al detector de la siguiente sin
            enganchar, y el arrastre se pierde sin decir nada. */}
        {Array.from({ length: PIPE_TRAY_SLOTS }, (_, i) => {
          const spot = pl.tray[i] ?? { x: 0, y: 0 };
          const viva =
            i < Math.max(pipeConfig.tray.length, (pipeConfig.trayItems ?? []).length) &&
            !yaPuesta(i);
          return (
            <Handle
              key={`t${i}`}
              index={i}
              spot={spot}
              slot={traySlots[i] as PipeSlot}
              w={pl.trayW}
              h={pl.trayH}
              enabled={viva && !solved}
              onDrop={dropTray}
              onTap={tapTray}
            />
          );
        })}
      </View>

      {prompt !== "" ? <Text style={styles.prompt}>{prompt}</Text> : null}

      <Hint text={message.text} tone={message.tone} />

      {conFichas ? (
        <View style={styles.ring}>
          {problem.options.map((option) => (
            <Pressable
              key={option.id}
              disabled={solved}
              onPress={() => pickOption(option)}
              style={[styles.chip, solved && styles.chipDim]}
            >
              <Text style={styles.chipLabel}>{composeText(option.pieces)}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {ask === "commutes" ? (
        <View style={styles.ring}>
          <Pressable
            disabled={solved}
            onPress={() => pickCommutes(true)}
            style={[styles.chip, solved && styles.chipDim]}
          >
            <Text style={styles.chipLabel}>{t("comp.answer.same")}</Text>
          </Pressable>
          <Pressable
            disabled={solved}
            onPress={() => pickCommutes(false)}
            style={[styles.chip, solved && styles.chipDim]}
          >
            <Text style={styles.chipLabel}>{t("comp.answer.different")}</Text>
          </Pressable>
        </View>
      ) : null}

      {level.definition ? <Text style={styles.definition}>{t("comp.definition")}</Text> : null}
    </View>
  );
}

/**
 * Las ranuras animadas de las piezas que el dedo puede llevar. Son siempre las
 * mismas: montar y desmontar ranuras entre rondas deja al detector de la
 * siguiente sin enganchar, y el arrastre se pierde sin decir nada.
 */
function useSlots(n: number): readonly PipeSlot[] {
  const dx0 = useSharedValue(0);
  const dy0 = useSharedValue(0);
  const a0 = useSharedValue(1);
  const dx1 = useSharedValue(0);
  const dy1 = useSharedValue(0);
  const a1 = useSharedValue(1);
  const dx2 = useSharedValue(0);
  const dy2 = useSharedValue(0);
  const a2 = useSharedValue(1);
  const dx3 = useSharedValue(0);
  const dy3 = useSharedValue(0);
  const a3 = useSharedValue(1);
  return useMemo(
    () =>
      [
        { dx: dx0, dy: dy0, alive: a0 },
        { dx: dx1, dy: dy1, alive: a1 },
        { dx: dx2, dy: dy2, alive: a2 },
        { dx: dx3, dy: dy3, alive: a3 },
      ].slice(0, n),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [n],
  );
}

/**
 * Un asa invisible sobre la pieza dibujada: el dibujo es Skia, el gesto es la
 * vista.
 *
 * El asa se queda **montada** aunque su pieza no juegue esta ronda: desmontar el
 * `GestureDetector` deja al de la ronda siguiente sin enganchar, y el arrastre
 * se pierde sin decir nada. Lo que decide si el dedo llega es `pointerEvents`,
 * que no toca el gesto.
 */
function Handle({
  index,
  slot,
  spot,
  w,
  h,
  enabled,
  onDrop,
  onTap,
}: {
  readonly index: number;
  readonly slot: PipeSlot;
  readonly spot: { x: number; y: number };
  readonly w: number;
  readonly h: number;
  readonly enabled: boolean;
  readonly onDrop: (index: number, x: number, y: number) => void;
  readonly onTap: (index: number) => void;
}) {
  const datos = useSharedValue({ x: spot.x, y: spot.y, activo: enabled ? 1 : 0 });
  useEffect(() => {
    datos.value = { x: spot.x, y: spot.y, activo: enabled ? 1 : 0 };
  }, [datos, spot.x, spot.y, enabled]);

  const vivos = useRef({ onDrop, onTap });
  vivos.current = { onDrop, onTap };
  const soltar = useCallback((i: number, x: number, y: number) => {
    vivos.current.onDrop(i, x, y);
  }, []);
  const tocar = useCallback((i: number) => {
    vivos.current.onTap(i);
  }, []);

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .onChange((e) => {
          if (!datos.value.activo) return;
          slot.dx.value = e.translationX;
          slot.dy.value = e.translationY;
        })
        // `onFinalize` y no `onEnd`: si otro gesto le gana la carrera a mitad del
        // arrastre, el asa se cancela y `onEnd` no llega nunca, así que la pieza
        // se soltaba en el aire sin que nada contestara.
        .onFinalize((e) => {
          const d = datos.value;
          if (!d.activo) return;
          const movido = Math.hypot(e.translationX, e.translationY);
          if (movido < TAP_SLOP) {
            slot.dx.value = withTiming(0, { duration: theme.motion.quick });
            slot.dy.value = withTiming(0, { duration: theme.motion.quick });
            runOnJS(tocar)(index);
            return;
          }
          // Dónde quedó la pieza, en coordenadas del lienzo. Sale de dónde
          // estaba más cuánto se movió, y no de la posición absoluta del dedo:
          // `onLayout` en web devuelve el origen del padre y dejaría el hit test
          // corrido por la altura del encabezado.
          runOnJS(soltar)(index, d.x + e.translationX, d.y + e.translationY);
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [index],
  );

  if (w <= 0 || h <= 0) return null;
  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={{
          position: "absolute",
          left: spot.x - w / 2,
          top: spot.y - h / 2,
          width: w,
          height: h,
          pointerEvents: enabled ? "auto" : "none",
        }}
      />
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.color.bg,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.space[2],
  },
  back: { position: "absolute", top: 48, left: 20, zIndex: 2 },
  backLabel: { color: theme.color.inkFaint, fontSize: 14 },
  rules: { color: theme.color.inkDim, fontSize: 15, letterSpacing: 1 },
  prompt: { color: theme.color.ink, fontSize: 26, letterSpacing: 1 },
  ring: { flexDirection: "row", gap: theme.space[3], alignItems: "center", justifyContent: "center" },
  chip: {
    minWidth: 92,
    height: 58,
    paddingHorizontal: theme.space[3],
    borderRadius: theme.radius.token,
    backgroundColor: theme.color.surfaceHigh,
    borderWidth: 1,
    borderColor: theme.color.line,
    alignItems: "center",
    justifyContent: "center",
  },
  chipDim: { opacity: 0.35 },
  chipLabel: { color: theme.color.ink, fontSize: 18 },
  definition: {
    color: theme.color.inkDim,
    fontSize: 13,
    textAlign: "center",
    maxWidth: 540,
    paddingHorizontal: theme.space[3],
  },
});
