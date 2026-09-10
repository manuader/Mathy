/**
 * La fábrica: el minijuego de `alg.fn.function_as_machine`.
 *
 * El nodo es una bisagra. No depende de ecuaciones —solo de la caja del 10 y del
 * árbol del 9— y abre toda la rama de funciones, así que lo que queda fijo acá
 * lo heredan diez nodos. Dos cosas son las que quedan fijas:
 *
 * 1. **Una máquina da una sola salida por entrada.** No se dice: se rompe a la
 *    vista, de tres maneras que son la misma. El desvío manda la misma ficha por
 *    dos ramas y la segunda cae por un tubo lateral con la luz encendida; el
 *    punto de la red al que se le cuelgan dos flechas las hace parpadear a las
 *    dos; la tabla que repite una entrada con otra salida deja de ser una
 *    función. Ningún mensaje dice "eso está mal": la luz es el mensaje.
 * 2. **`f(x)` nace de una falta.** En el nivel 4 hay dos máquinas en pantalla y
 *    la salida pedida no dice cuál se usó. El nombre resuelve "cuál" y el
 *    paréntesis resuelve "a qué". Antes del nivel 4 nunca hay dos máquinas
 *    juntas, justamente para que la falta se sienta antes que el símbolo.
 *
 * El nodo tiene dos superficies. `machine_pipe` es la principal y la dibuja
 * `PipeScene`, la escena que el nodo 9 escribió para los diez que la usan: este
 * nodo le agregó tres props aditivas —el tubo lateral con su luz, el cajón con
 * fichas de entrada en vez de máquinas y el renglón de notación— que la cabecera
 * de esa escena ya anunciaba como pendientes. `network_routes` es la secundaria
 * y la estrena `NetworkScene`, escrita para la mecánica y no para este nodo.
 *
 * Esta actividad no dibuja nada: elige qué escena mira el jugador en cada ronda,
 * le pasa su configuración y traduce el dedo en los valores que las dos animan.
 * La cuenta la hace `@mathy/mechanics`; ni la escena ni esta pantalla calculan
 * una salida, para que no haya dos fuentes de verdad.
 *
 * El único error que clasifica es `machine_gives_two_outputs`, que es el único
 * que el catálogo de L declara sobre este nodo. Equivocarse de ficha en una
 * evaluación está previsto y se muestra, pero no se anota.
 *
 * QUÉ QUEDÓ AFUERA: el clasificador (`sorter`), que el diseño pone como cierre
 * del nivel 3. Lleva el mismo invariante que la red —cada cosa va a un lugar y a
 * uno solo— desde un tercer ángulo, y es una mecánica con diecinueve nodos de
 * espina detrás. Construirle la escena como remate de una ronda de un nivel
 * habría dado una escena con la forma de este nodo, que es exactamente lo que la
 * regla del repositorio prohíbe. La va a estrenar el primer nodo que la tenga
 * como mecánica principal.
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
  NODE_FUNCTION_AS_MACHINE,
  TOTAL_FN_LEVELS,
  fnCallPieces,
  fnFormulaPieces,
  fnMisconceptionFor,
  fnNetworkIsFunction,
  fnRowsAreFunction,
  fnRulePieces,
  fnRun,
  generateMachine,
  type FnArrow,
  type FnLevel,
  type FnMachine,
  type FnOption,
  type FnPiece,
  type FnRow,
} from "@mathy/mechanics";
import type { Event } from "@mathy/progress";
import {
  PipeScene,
  PIPE_MACHINE_SLOTS,
  PIPE_TRAY_SLOTS,
  pipeLayout,
  type PipeConfig,
  type PipeItem,
  type PipeMachine,
  type PipeRow,
  type PipeSlot,
} from "../scenes/PipeScene.tsx";
import {
  NetworkScene,
  networkLayout,
  type NetworkConfig,
  type NetworkDrag,
} from "../scenes/NetworkScene.tsx";
import { Header, Hint } from "../ui/Chrome.tsx";
import { ActivityShell, useActivityViewport } from "../ui/ActivityShell.tsx";
import { t } from "../i18n.ts";
import { theme } from "../ui/theme.ts";

/** Cuánto se puede mover el dedo y que el gesto siga siendo un toque. */
const TAP_SLOP = 14;

/** Los nombres de las dos máquinas. Nacen en el nivel 4 y no antes. */
const NAMES = ["f", "g"] as const;

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
const MACHINE_KIND = {
  add: "add",
  sub: "sub",
  mul: "mul",
  div: "div",
} as const;

/** Una expresión escrita, compuesta desde las piezas que da el modelo. */
function composeText(pieces: readonly FnPiece[]): string {
  let out = "";
  for (const p of pieces) {
    if (p.kind === "num") out += p.value < 0 ? `−${Math.abs(p.value)}` : String(p.value);
    else if (p.kind === "sym") out += p.name;
    else if (p.kind === "open") out += "(";
    else if (p.kind === "close") out += ")";
    else if (p.kind === "eq") out += " = ";
    else out += ` ${SIGN[p.op] ?? "+"} `;
  }
  return out;
}

export interface MachineGameProps {
  readonly level: FnLevel;
  readonly levelsDone: number;
  readonly onLevelDone: () => void;
  readonly onExit: () => void;
  readonly onEvent: (event: Event) => void;
}

export function MachineGame(props: MachineGameProps) {
  return (
    <ActivityShell levelsDone={props.levelsDone}>
      <Activity {...props} />
    </ActivityShell>
  );
}

function Activity({ level, onLevelDone, onExit, onEvent }: MachineGameProps) {
  // El lienzo mide lo que le deja el panel abierto, no la ventana entera.
  const { width, height } = useActivityViewport();
  const [round, setRound] = useState(0);
  const [seedBase] = useState(() => Math.floor(Math.random() * 100000));
  const [solved, setSolved] = useState(false);
  /** Las máquinas que el jugador ya puso en el caño. */
  const [placed, setPlaced] = useState<readonly FnMachine[]>([]);
  /** Las filas que la tabla fue juntando, o la tabla objetivo del nivel. */
  const [rows, setRows] = useState<readonly FnRow[]>([]);
  /** Qué ficha está viajando por el caño ahora. */
  const [fed, setFed] = useState<number | null>(null);
  /** Las flechas que el jugador colgó en la red. */
  const [arrows, setArrows] = useState<readonly FnArrow[]>([]);
  /** El orden de las máquinas encadenadas, por id. */
  const [order, setOrder] = useState<readonly string[]>([]);
  /** Las máquinas ya se contrajeron hasta su letra. */
  const [named, setNamed] = useState(false);
  /** Qué red eligió el dedo, o -1. */
  const [pickedNet, setPickedNet] = useState(-1);

  const problem = useMemo(
    () => generateMachine(level, seedBase + round * 1000 + level.n, round),
    [level, round, seedBase],
  );
  const ask = problem.ask;

  const [message, setMessage] = useState<{ text: string; tone: "dim" | "ok" | "warn" }>(() => ({
    text: t(`fn.ask.${ask}`),
    tone: "dim",
  }));

  const soloFichas = ask === "sameRule";
  const sceneH = soloFichas ? 140 : Math.max(320, Math.min(height * 0.58, 500));

  // --- Lo que ve la tubería --------------------------------------------------

  /** Las máquinas que corren ahora: las puestas, o las que el nivel ya trae. */
  const cadena = useMemo<readonly FnMachine[]>(() => {
    if (ask === "build" || ask === "broken" || ask === "fromTable") return placed;
    if (ask === "chain" && order.length > 0) {
      const out: FnMachine[] = [];
      for (const id of order) {
        const m = problem.machines.find((x) => x.id === id);
        if (m) out.push(m);
      }
      return out;
    }
    return problem.machines;
  }, [ask, placed, order, problem.machines]);

  const entrada = fed ?? problem.input;
  const run = useMemo(() => fnRun(entrada, cadena), [entrada, cadena]);

  /**
   * El techo con el que se normalizan los tamaños. Sale del más grande de todo
   * lo que la ronda puede mostrar: normalizado contra el recorrido de ahora, un
   * cambio de máquina no se vería.
   */
  const techo = useMemo(() => {
    const candidatos = [
      Math.abs(problem.target),
      Math.abs(entrada),
      Math.abs(run.output),
      Math.abs(run.second ?? 0),
      ...problem.rows.map((r) => Math.abs(r.output)),
      ...problem.tokens.map((v) => Math.abs(v)),
      1,
    ].filter((v) => Number.isFinite(v));
    return Math.max(...candidatos, 1);
  }, [problem, entrada, run]);

  const item = useCallback(
    (value: number, kind: PipeItem["kind"] = "tile"): PipeItem => ({
      value,
      size: Math.max(0.24, Math.min(1, Math.abs(value) / techo)),
      kind,
      label: "",
    }),
    [techo],
  );

  /**
   * Una máquina, en el vocabulario de la escena. El rótulo queda vacío y la
   * escena arma el signo con la operación y el número: la carcasa dice lo que
   * hace. El nombre no va acá sino en el renglón de la fórmula, porque lo que se
   * nombra es la cadena entera y no una de sus piezas.
   */
  const machineOf = useCallback(
    (m: FnMachine): PipeMachine => ({
      id: m.id,
      kind: MACHINE_KIND[m.op],
      value: m.value,
      label: "",
      inverted: false,
      // La placa vacía del primer nivel: la carcasa no muestra lo que hace y la
      // regla es un secreto que se descubre probando.
      opaque: !level.plate || ask === "fromTable",
    }),
    [level.plate, ask],
  );

  const tabla = useMemo<readonly PipeRow[]>(
    () =>
      rows.map((r) => ({
        input: item(r.input),
        output: item(r.output),
        repeated: r.second !== null,
      })),
    [rows, item],
  );

  const pipeConfig = useMemo<PipeConfig>(() => {
    const stages = run.stages.map((v) => item(v));
    const laneF = {
      id: "l0",
      machines: cadena.map((m) => machineOf(m)),
      input: item(entrada),
      stages,
      output: item(Number.isNaN(run.output) ? entrada : run.output),
      target:
        ask === "guess" || ask === "build" || ask === "broken" || ask === "chain" ||
        ask === "reject" || ask === "name"
          ? item(problem.target)
          : null,
      glow: !solved,
      // El tubo lateral aparece solo cuando la regla mandó la entrada a dos
      // ramas: es la única manera en que este nodo dice "esto no es una máquina".
      branch: run.second === null ? null : item(run.second),
    };
    const laneG =
      ask === "name"
        ? [
            {
              id: "l1",
              machines: problem.other.map((m) => machineOf(m)),
              input: item(entrada),
              stages: fnRun(entrada, problem.other).stages.map((v) => item(v)),
              output: item(fnRun(entrada, problem.other).output),
              target: item(problem.target),
              glow: false,
              branch: null,
            },
          ]
        : [];

    const fichas =
      ask === "guess" || ask === "reject" || ask === "fromTable"
        ? problem.tokens.map((v) => item(v))
        : [];
    // El cajón no se acorta cuando una ficha entra al caño: la ficha puesta se
    // apaga y su ranura queda donde estaba. Si el cajón se reindexara, el asa de
    // cada ficha apuntaría a otra pieza en cuanto se pusiera la primera.
    const cajon = ask === "build" || ask === "broken" ? problem.tray.map((m) => machineOf(m)) : [];

    return {
      lanes: [laneF, ...laneG],
      skin: level.skin,
      direction: "forward",
      numerals: level.numerals,
      counter: level.numerals && fed !== null && ask !== "name",
      table: level.table && tabla.length > 0 ? tabla : [],
      tray: cajon,
      trayItems: fichas,
      slots: ask === "build" || ask === "broken" ? problem.solution.length : ask === "fromTable" ? 1 : 0,
      reorderable: ask === "chain",
      box: false,
      // La tubería plegada: en la ronda de la tabla no hay caño que mirar, y el
      // criterio se aplica sobre las filas y nada más.
      onDemand: ask === "relation",
      formula:
        level.named && (ask === "evaluate" || ask === "letters" || (ask === "name" && named))
          ? composeText(fnFormulaPieces(NAMES[0], problem.machines))
          : "",
    };
  }, [
    ask,
    cadena,
    entrada,
    fed,
    item,
    level.named,
    level.numerals,
    level.skin,
    level.table,
    machineOf,
    named,
    placed,
    problem,
    run,
    solved,
    tabla,
  ]);

  const pl = useMemo(() => pipeLayout(pipeConfig, width, sceneH), [pipeConfig, width, sceneH]);

  // --- Lo que ve la red ------------------------------------------------------

  const netConfig = useMemo<NetworkConfig>(() => {
    const grupos = problem.networks.map((red, i) => ({
      id: red.id,
      inputs: red.inputs.map((v, j) => ({ id: `i${j}`, label: String(v) })),
      outputs: red.outputs.map((v, j) => ({ id: `o${j}`, label: String(v) })),
      // En la ronda que se arma, las flechas son las que colgó el jugador; en la
      // que se juzga, las que la ronda trajo dibujadas.
      arrows: ask === "network" ? arrows : red.arrows,
      glow: ask === "network" && !solved,
    }));
    return {
      groups: grupos,
      numerals: level.numerals,
      // La regla escrita arriba: sin ella, juzgar la red sería adivinar.
      rule: composeText(fnRulePieces(problem.machines, [{ kind: "sym", name: "x" }])),
      drawable: ask === "network",
    };
  }, [problem.networks, problem.machines, ask, arrows, solved, level.numerals]);

  const nl = useMemo(() => networkLayout(netConfig, width, sceneH), [netConfig, width, sceneH]);

  // --- Lo que las escenas animan ---------------------------------------------

  const flow = useSharedValue(0);
  const jam = useSharedValue(0);
  const hint = useSharedValue(0);
  const demo = useSharedValue(0);
  const unfold = useSharedValue(1);
  const pipeAppear = useSharedValue(0);
  const netAppear = useSharedValue(0);
  const blink = useSharedValue(0);
  const drag = useSharedValue<NetworkDrag>({ group: 0, from: -1, x: 0, y: 0 });

  const machineSlots = useSlots(PIPE_MACHINE_SLOTS);
  const traySlots = useSlots(PIPE_TRAY_SLOTS);

  const shownAt = useRef(Date.now());
  const doneRef = useRef(false);
  /**
   * La ronda ya se decidió, aunque el mensaje llegue después.
   *
   * Entre el movimiento que resuelve y el cartel hay un segundo largo: el caño
   * tiene que correr para que se vea salir la ficha. Sin este cerrojo, los
   * toques de esa ventana se cuentan como intentos nuevos y ensucian la
   * evidencia de un nivel que ya estaba ganado.
   */
  const cerrado = useRef(false);
  /**
   * Todo lo que un gesto necesita saber, en una referencia. Un worklet captura
   * el callback del render en que se armó el gesto, así que lo leído del cierre
   * sería lo de la primera ronda para siempre.
   */
  const vivo = useRef({ problem, ask, solved, placed, rows, arrows, order, named });
  vivo.current = { ...vivo.current, problem, ask, solved, placed, rows, arrows, order, named };
  const roundRef = useRef(round);
  roundRef.current = round;

  useEffect(() => {
    shownAt.current = Date.now();
    doneRef.current = false;
    cerrado.current = false;
    setSolved(false);
    setPlaced([]);
    setFed(null);
    setArrows([]);
    setNamed(false);
    setPickedNet(-1);
    setOrder(problem.machines.map((m) => m.id));
    // La tabla llega llena en las rondas que se leen y vacía en las que se
    // llenan probando: la tabla de `guess` es lo que el jugador descubre.
    setRows(problem.ask === "guess" ? [] : problem.rows);
    setMessage({ text: t(`fn.ask.${problem.ask}`), tone: "dim" });

    flow.value = 0;
    jam.value = 0;
    unfold.value = problem.ask === "relation" ? 0 : 1;
    for (const s of [...machineSlots, ...traySlots]) {
      s.dx.value = 0;
      s.dy.value = 0;
      s.alive.value = 1;
    }
    drag.value = { group: 0, from: -1, x: 0, y: 0 };
    const conRed = problem.ask === "network" || problem.ask === "judge";
    const conCano = !conRed && problem.ask !== "sameRule";
    pipeAppear.value = withTiming(conCano ? 1 : 0, { duration: theme.motion.base });
    netAppear.value = withTiming(conRed ? 1 : 0, { duration: theme.motion.base });

    // El latido de la demostración no es un adorno: es la única instrucción.
    hint.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
    demo.value = withRepeat(
      withSequence(withTiming(1, { duration: 1400 }), withTiming(0, { duration: 1 })),
      -1,
      false,
    );
    blink.value = withRepeat(withTiming(1, { duration: 420 }), -1, true);
    return () => {
      cancelAnimation(hint);
      cancelAnimation(demo);
      cancelAnimation(blink);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem]);

  /** Una ficha ya puesta en el caño sigue en el cajón, apagada y sin escuchar. */
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
    onEvent({ kind: "sawLayer", at: Date.now(), node: NODE_FUNCTION_AS_MACHINE, layer: level.layer });
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
          node: NODE_FUNCTION_AS_MACHINE,
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
      onEvent({ kind: "levelDone", at: Date.now(), node: NODE_FUNCTION_AS_MACHINE, level: level.n });
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
      setTimeout(nextRound, 1800);
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

  // --- Meter una ficha en la ranura ------------------------------------------

  /**
   * Una ficha cayó en la ranura. La máquina vibra y por la salida cae otra, y
   * las dos quedan registradas como una fila. Repetir una entrada ya usada no
   * duplica la fila: la ilumina, y eso **es** el determinismo.
   */
  const feed = useCallback(
    (valor: number) => {
      const { problem: p, ask: a, solved: hecho, rows: filas } = vivo.current;
      if (hecho || cerrado.current) return;
      quiet();
      const cadenaViva = a === "fromTable" ? p.solution : p.machines;
      const corrida = fnRun(valor, cadenaViva);
      setFed(valor);
      flow.value = 0;
      flow.value = withTiming(1, { duration: theme.motion.reveal });

      if (corrida.rejectedAt >= 0 || !Number.isInteger(corrida.output)) {
        // La máquina escupe lo que no acepta. No es un error del jugador: esa
        // entrada no es del dominio, y así se ve antes de que exista la palabra.
        jam.value = withSequence(
          withTiming(1, { duration: 90 }),
          withTiming(-1, { duration: 110 }),
          withTiming(0, { duration: 120 }),
        );
        attempt(false);
        setMessage({ text: t("fn.hint.spat"), tone: "warn" });
        return;
      }

      const yaEstaba = filas.some((r) => r.input === valor);
      setRows(
        yaEstaba
          ? filas.map((r) => (r.input === valor ? { ...r, second: r.output } : { ...r, second: null }))
          : [...filas.map((r) => ({ ...r, second: null })), { input: valor, output: corrida.output, second: null }],
      );

      if (a === "fromTable") {
        setMessage({ text: t("fn.hint.extraRow"), tone: "dim" });
        return;
      }
      const bien = corrida.output === p.target;
      attempt(bien);
      if (bien) {
        win(a === "reject" ? "fn.done.reject" : "fn.done.guess", theme.motion.reveal);
        return;
      }
      setMessage({ text: t(yaEstaba ? "fn.hint.sameAgain" : "fn.hint.otherOutput"), tone: "dim" });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attempt, quiet, win],
  );

  // --- Armar la máquina ------------------------------------------------------

  /**
   * Una ficha de operación entró en la primera ranura vacía. El desvío entra
   * igual que las otras y hace lo suyo: la segunda salida cae por el tubo
   * lateral y la luz se enciende. Nadie dice que esté mal.
   */
  const install = useCallback(
    (index: number) => {
      const { problem: p, ask: a, solved: hecho, placed: puestas } = vivo.current;
      if (hecho || cerrado.current) return;
      const pieza = p.tray[index];
      if (!pieza || puestas.some((m) => m.id === pieza.id)) return;
      quiet();
      const esperada = p.solution[puestas.length];
      const esDesvio = pieza.fork !== null;
      const bien = !esDesvio && esperada !== undefined && esperada.op === pieza.op && esperada.value === pieza.value;
      attempt(bien, fnMisconceptionFor(a, esDesvio));

      if (esDesvio) {
        // Se pone, se ve salir dos, y se saca. Que haya entrado es el punto: el
        // jugador tiene que ver la segunda salida caer, no leer que no podía.
        setPlaced([...puestas, pieza]);
        setFed(p.rows[0]?.input ?? p.input);
        flow.value = 0;
        flow.value = withTiming(1, { duration: theme.motion.reveal });
        setMessage({ text: t("fn.hint.twoOutputs"), tone: "warn" });
        setTimeout(
          () => setPlaced((antes) => antes.filter((m) => m.id !== pieza.id)),
          theme.motion.reveal + 900,
        );
        return;
      }
      if (!bien) {
        jam.value = withSequence(withTiming(1, { duration: 90 }), withTiming(0, { duration: 140 }));
        setMessage({ text: t("fn.hint.wrongPiece"), tone: "warn" });
        return;
      }

      const ahora = [...puestas, pieza];
      setPlaced(ahora);
      if (ahora.length >= p.solution.length) {
        setFed(p.rows[0]?.input ?? p.input);
        flow.value = 0;
        flow.value = withTiming(1, { duration: theme.motion.reveal });
        win("fn.done.build", theme.motion.reveal);
        return;
      }
      setMessage({ text: t("fn.hint.nextPiece"), tone: "dim" });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attempt, quiet, win],
  );

  // --- La red ----------------------------------------------------------------

  /** Colgar una flecha. Dos desde el mismo punto es la ruptura, no un error. */
  const connect = useCallback(
    (from: number, to: number) => {
      const { problem: p, solved: hecho, arrows: puestas } = vivo.current;
      if (hecho || cerrado.current) return;
      const red = p.networks[0];
      if (!red) return;
      quiet();
      if (puestas.some((a) => a.from === from && a.to === to)) return;

      const yaTenia = puestas.some((a) => a.from === from);
      const entradaValor = red.inputs[from];
      const salidaValor = red.outputs[to];
      if (entradaValor === undefined || salidaValor === undefined) return;
      const correcta = fnRun(entradaValor, p.solution).output === salidaValor;

      if (yaTenia) {
        // La segunda flecha se cuelga igual y las dos parpadean. Se saca sola
        // después, pero **solo esa**: volver a un arreglo guardado se llevaría
        // por delante las flechas que el jugador colgó mientras tanto.
        setArrows((antes) => [...antes, { from, to }]);
        attempt(false, fnMisconceptionFor("network", true));
        setMessage({ text: t("fn.hint.twoArrows"), tone: "warn" });
        setTimeout(
          () => setArrows((antes) => quitarUna(antes, from, to)),
          1600,
        );
        return;
      }
      attempt(correcta);
      if (!correcta) {
        setMessage({ text: t("fn.hint.wrongArrow"), tone: "warn" });
        return;
      }
      setArrows([...puestas, { from, to }]);
      setMessage({ text: t("fn.hint.nextArrow"), tone: "dim" });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attempt, quiet, win],
  );

  /**
   * La red está lista cuando de cada punto sale exactamente una flecha.
   *
   * Se mira sobre el estado y no dentro del movimiento porque la flecha doble se
   * saca sola un rato después de colgarla: el instante en que la red queda
   * completa puede ser ese y no el del último toque, y mirarlo solo al tocar
   * dejaba la ronda abierta para siempre.
   */
  useEffect(() => {
    if (ask !== "network" || arrows.length === 0) return;
    const red = problem.networks[0];
    if (red && fnNetworkIsFunction(red.inputs.length, arrows)) win("fn.done.network");
  }, [ask, arrows, problem.networks, win]);

  /** Elegir cuál de las dos redes no es una máquina. */
  const pickNetwork = useCallback(
    (index: number) => {
      const { problem: p, solved: hecho } = vivo.current;
      if (hecho || cerrado.current) return;
      const red = p.networks[index];
      if (!red) return;
      quiet();
      setPickedNet(index);
      const bien = !red.isFunction;
      attempt(bien, fnMisconceptionFor("judge", !bien));
      if (bien) {
        win("fn.done.judge");
        return;
      }
      setMessage({ text: t("fn.hint.thatOneIsAMachine"), tone: "warn" });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attempt, quiet, win],
  );

  // --- Nombrar y encadenar ---------------------------------------------------

  /** Tocar el frente de una máquina la contrae hasta su letra. Ahí nace el nombre. */
  const pickMachine = useCallback(
    (lane: number) => {
      const { problem: p, solved: hecho } = vivo.current;
      if (hecho || cerrado.current) return;
      quiet();
      const bien = lane === 0;
      attempt(bien);
      if (bien) {
        setNamed(true);
        setFed(p.input);
        flow.value = 0;
        flow.value = withTiming(1, { duration: theme.motion.reveal });
        win("fn.done.name", theme.motion.reveal);
        return;
      }
      setMessage({ text: t("fn.hint.otherMachine"), tone: "warn" });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attempt, quiet, win],
  );

  /** Dar vuelta el caño: la misma entrada por otro camino sale distinta. */
  const swap = useCallback(() => {
    const { problem: p, solved: hecho, order: actual } = vivo.current;
    if (hecho || cerrado.current) return;
    quiet();
    const dado = [...actual].reverse();
    setOrder(dado);
    setFed(p.input);
    flow.value = 0;
    flow.value = withTiming(1, { duration: theme.motion.reveal });
    const ordenadas = dado
      .map((id) => p.machines.find((m) => m.id === id))
      .filter((m): m is FnMachine => m !== undefined);
    const bien = fnRun(p.input, ordenadas).output === p.target;
    attempt(bien);
    if (bien) {
      win("fn.done.chain", theme.motion.reveal);
      return;
    }
    setMessage({ text: t("fn.hint.otherOrder"), tone: "warn" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt, quiet, win]);

  // --- Las fichas de respuesta -----------------------------------------------

  const pickOption = useCallback(
    (option: FnOption) => {
      const { solved: hecho } = vivo.current;
      if (hecho || cerrado.current) return;
      quiet();
      attempt(option.correct);
      if (option.correct) {
        win(`fn.done.${vivo.current.ask}`);
        return;
      }
      setMessage({ text: t(`fn.lure.${option.lure ?? "default"}`), tone: "warn" });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attempt, quiet, win],
  );

  /** La tabla, ¿es una función? Decir que sí de una que no lo es es el error del catálogo. */
  const pickIsFunction = useCallback(
    (dijoQueSi: boolean) => {
      const { solved: hecho, rows: filas } = vivo.current;
      if (hecho || cerrado.current) return;
      quiet();
      const esFuncion = fnRowsAreFunction(filas);
      const bien = dijoQueSi === esFuncion;
      attempt(bien, fnMisconceptionFor("relation", dijoQueSi && !esFuncion));
      if (bien) {
        win(esFuncion ? "fn.done.relationYes" : "fn.done.relationNo");
        return;
      }
      setMessage({ text: t(esFuncion ? "fn.hint.itIsAMachine" : "fn.hint.itIsNot"), tone: "warn" });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attempt, quiet, win],
  );

  /**
   * Tocar el frente de una máquina. Encadenando da vuelta el caño; con dos
   * máquinas en pantalla dice cuál se usa, que es el gesto del que nace el
   * nombre.
   */
  const tapMachine = useCallback(
    (index: number) => {
      const { ask: a } = vivo.current;
      if (a === "chain") {
        swap();
        return;
      }
      if (a === "name") pickMachine(index === 0 ? 0 : 1);
    },
    [swap, pickMachine],
  );

  // --- Gestos ----------------------------------------------------------------

  /**
   * Toda la geometría que los gestos necesitan, en un solo `SharedValue`. Los
   * `Gesture` se arman una sola vez y no cambian de identidad entre renders:
   * gesture-handler en web pierde el gesto cuando el objeto cambia.
   */
  const geo = useSharedValue({
    activo: 0,
    /**
     * Qué contesta el toque: 1 la red que se arma, 2 las dos redes que se
     * juzgan, 3 las máquinas del caño.
     */
    modo: 0,
    desdeX: 0,
    desdeY: 0,
    pointR: 0,
    /** El punto de entrada que el dedo agarró o eligió, o -1. */
    tomado: -1,
    /** Qué máquina agarró el dedo, o -1. */
    agarrada: -1,
    inputs: [] as { x: number; y: number }[],
    outputs: [] as { x: number; y: number }[],
    boxes: [] as { x: number; y: number; w: number; h: number }[],
    /** Las carcasas de los dos carriles, con el carril al que pertenecen. */
    machines: [] as { x: number; y: number; w: number; h: number; lane: number; slot: number }[],
  });

  useEffect(() => {
    const grupo = nl.groups[0];
    const cuantas = problem.networks[0]?.inputs.length ?? 0;
    const salidas = problem.networks[0]?.outputs.length ?? 0;
    // Las carcasas que el dedo puede tocar. El toque sobre el lienzo anda
    // siempre; un asa encima de una pieza dibujada, no: la del cajón contesta y
    // la de la carcasa no, y perseguir esa diferencia no vale lo que cuesta.
    const carcasas: { x: number; y: number; w: number; h: number; lane: number; slot: number }[] = [];
    pl.lanes.forEach((l, carril) => {
      const cuantasMaq = carril === 0 ? cadena.length : problem.other.length;
      l.machines.slice(0, cuantasMaq).forEach((b, slot) => {
        carcasas.push({ x: b.x, y: b.y, w: b.w, h: b.h, lane: carril, slot });
      });
    });
    geo.value = {
      activo: solved ? 0 : 1,
      modo:
        ask === "network" ? 1
        : ask === "judge" ? 2
        : ask === "chain" || ask === "name" ? 3
        : 0,
      desdeX: 0,
      desdeY: 0,
      pointR: nl.pointR,
      tomado: -1,
      agarrada: -1,
      inputs: grupo ? grupo.inputs.slice(0, cuantas).map((s) => ({ x: s.x, y: s.y })) : [],
      outputs: grupo ? grupo.outputs.slice(0, salidas).map((s) => ({ x: s.x, y: s.y })) : [],
      boxes: nl.groups
        .slice(0, problem.networks.length)
        .map((g) => ({ x: g.box.x, y: g.box.y - 34, w: g.box.w, h: g.box.h + 44 })),
      machines: carcasas,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nl, pl, ask, solved, problem.networks, problem.other, cadena.length]);

  /**
   * El gesto del lienzo. Sin `minDistance(0)`: con cero se activa en el mismo
   * instante en que el dedo se apoya y le gana la carrera al asa que hay encima.
   *
   * Contesta el arrastre y el toque con el mismo objeto. El toque además sirve
   * de camino alterno para colgar una flecha —tocar el punto de entrada y
   * después el de salida—, porque un arrastre sintético sobre el lienzo entero
   * no siempre despierta al `Pan` en web y el toque sí.
   */
  const pan = useMemo(
    () =>
      Gesture.Pan()
        .onBegin((e) => {
          const g = geo.value;
          let tomado = g.tomado;
          if (g.modo === 1) {
            for (let i = 0; i < g.inputs.length; i++) {
              const s = g.inputs[i];
              if (s && Math.hypot(e.x - s.x, e.y - s.y) < g.pointR * 2) tomado = i;
            }
          }
          let agarrada = -1;
          if (g.modo === 3) {
            for (let i = 0; i < g.machines.length; i++) {
              const b = g.machines[i];
              if (b && e.x > b.x && e.x < b.x + b.w && e.y > b.y && e.y < b.y + b.h) agarrada = i;
            }
          }
          geo.value = { ...g, desdeX: e.x, desdeY: e.y, tomado, agarrada };
          if (tomado >= 0) drag.value = { group: 0, from: tomado, x: e.x, y: e.y };
        })
        .onChange((e) => {
          const g = geo.value;
          if (g.modo === 3) {
            // La carcasa sigue al dedo. El caño no: lo que se mueve es la pieza,
            // y por eso el orden se ve cambiar antes de soltarla.
            const b = g.machines[g.agarrada];
            if (!b || b.lane !== 0) return;
            const slot = machineSlots[b.slot];
            if (slot) {
              slot.dx.value = e.translationX;
              slot.dy.value = e.translationY;
            }
            return;
          }
          if (g.modo !== 1 || g.tomado < 0) return;
          drag.value = { group: 0, from: g.tomado, x: e.x, y: e.y };
        })
        .onFinalize((e) => {
          const g = geo.value;
          if (g.modo === 3) {
            // La carcasa que el dedo llevaba vuelve a su ranura: lo que cambia
            // de lugar es el orden, y ese lo redibuja la escena.
            const b = g.machines[g.agarrada];
            geo.value = { ...g, agarrada: -1 };
            if (b && b.lane === 0) {
              const slot = machineSlots[b.slot];
              if (slot) {
                slot.dx.value = withTiming(0, { duration: theme.motion.quick });
                slot.dy.value = withTiming(0, { duration: theme.motion.quick });
              }
            }
            // Tocar una máquina y arrastrarla son el mismo movimiento: los dos
            // dicen "usá esta".
            if (g.activo && b) runOnJS(tapMachine)(b.lane);
            return;
          }
          if (!g.activo) {
            drag.value = { group: 0, from: -1, x: 0, y: 0 };
            return;
          }
          const movido = Math.hypot(e.x - g.desdeX, e.y - g.desdeY);
          if (g.modo === 2) {
            for (let i = 0; i < g.boxes.length; i++) {
              const b = g.boxes[i];
              if (b && e.x > b.x && e.x < b.x + b.w && e.y > b.y && e.y < b.y + b.h) {
                runOnJS(pickNetwork)(i);
                return;
              }
            }
            return;
          }
          if (g.modo !== 1) return;
          let destino = -1;
          for (let i = 0; i < g.outputs.length; i++) {
            const s = g.outputs[i];
            if (s && Math.hypot(e.x - s.x, e.y - s.y) < g.pointR * 2.2) destino = i;
          }
          if (destino >= 0 && g.tomado >= 0) {
            runOnJS(connect)(g.tomado, destino);
            geo.value = { ...g, tomado: -1 };
            drag.value = { group: 0, from: -1, x: 0, y: 0 };
            return;
          }
          // El toque sobre un punto de entrada lo deja elegido y la flecha queda
          // esperando el segundo toque: dos toques hacen lo mismo que el
          // arrastre, y un toque sobre el lienzo anda siempre.
          if (movido < TAP_SLOP && g.tomado >= 0) {
            drag.value = { group: 0, from: g.tomado, x: e.x, y: e.y };
            return;
          }
          geo.value = { ...g, tomado: -1 };
          drag.value = { group: 0, from: -1, x: 0, y: 0 };
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // --- Las asas de las piezas ------------------------------------------------

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
      const { ask: a, problem: p } = vivo.current;
      if (a === "build" || a === "broken") {
        // Todo el caño es el blanco: lo que importa no es dónde cae sino cuál se
        // soltó, porque el orden lo decide la ranura vacía que sigue.
        if (Math.abs(y - lane.y) > 120) return;
        install(index);
        return;
      }
      const cerca = Math.hypot(x - lane.mouth.x, y - lane.mouth.y);
      if (cerca > 140) return;
      const valor = p.tokens[index];
      if (valor !== undefined) feed(valor);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [traySlots, pl.lanes, install, feed],
  );

  /** Tocar una ficha del cajón hace lo mismo que arrastrarla hasta la ranura. */
  const tapTray = useCallback(
    (index: number) => {
      const { ask: a, problem: p } = vivo.current;
      if (a === "build" || a === "broken") {
        install(index);
        return;
      }
      const valor = p.tokens[index];
      if (valor !== undefined) feed(valor);
    },
    [install, feed],
  );

  // --- Pantalla --------------------------------------------------------------

  const prompt = useMemo(() => {
    if (ask === "evaluate" || ask === "letters") {
      return composeText(fnCallPieces(NAMES[0], problem.argument));
    }
    if (ask === "sameRule") {
      return composeText([
        ...fnCallPieces(NAMES[0], [{ kind: "sym", name: "x" }]),
        { kind: "eq" },
        ...problem.argument,
      ]);
    }
    return "";
  }, [ask, problem.argument]);

  const conFichas = problem.options.length > 0;

  return (
    <View style={styles.root}>
      <Pressable onPress={onExit} style={styles.back} hitSlop={theme.hitSlop}>
        <Text style={styles.backLabel}>{t("game.back")}</Text>
      </Pressable>

      <Header
        title={`${t(`node.${NODE_FUNCTION_AS_MACHINE}.name`)} · nivel ${level.n} de ${TOTAL_FN_LEVELS}`}
        subtitle={t(level.titleKey)}
        round={round}
        rounds={level.rounds}
      />

      <View style={{ width, height: sceneH }}>
        {/* Un solo lienzo por pantalla: las dos escenas viven adentro y la que
            no juega esta ronda se queda en opacidad cero. */}
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
            appear={pipeAppear}
            pieces={machineSlots}
            trayPieces={traySlots}
            picked={-1}
          />
          <NetworkScene
            config={netConfig}
            layout={nl}
            blink={blink}
            drag={drag}
            appear={netAppear}
            hint={hint}
            demo={demo}
            picked={pickedNet}
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

      {ask === "relation" ? (
        <View style={styles.ring}>
          <Pressable
            disabled={solved}
            onPress={() => pickIsFunction(true)}
            style={[styles.chip, solved && styles.chipDim]}
          >
            <Text style={styles.chipLabel}>{t("fn.answer.isMachine")}</Text>
          </Pressable>
          <Pressable
            disabled={solved}
            onPress={() => pickIsFunction(false)}
            style={[styles.chip, solved && styles.chipDim]}
          >
            <Text style={styles.chipLabel}>{t("fn.answer.isNot")}</Text>
          </Pressable>
        </View>
      ) : null}

      {level.definition ? <Text style={styles.definition}>{t("fn.definition")}</Text> : null}
    </View>
  );
}

/** Saca una sola flecha de la lista, y deja las demás donde estaban. */
function quitarUna(
  arrows: readonly FnArrow[],
  from: number,
  to: number,
): readonly FnArrow[] {
  const i = arrows.findIndex((a) => a.from === from && a.to === to);
  return i < 0 ? arrows : [...arrows.slice(0, i), ...arrows.slice(i + 1)];
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
 * El objeto del `Gesture` se arma **una sola vez** y no vuelve a cambiar de
 * identidad. Gesture-handler en web pierde el gesto cuando ese objeto cambia
 * entre renders, y acá el asa se apaga y se vuelve a encender entre rondas —el
 * cajón lleva fichas en unas y no en otras—, así que rearmar el gesto con
 * `.enabled()` dejaba la ficha muda desde la primera ronda que no la usaba. Lo
 * que cambia viaja en un valor compartido y en una referencia; lo que decide si
 * el dedo llega es `pointerEvents`, que no toca el gesto.
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
          // El asa se queda montada aunque su pieza no juegue esta ronda —
          // desmontarla deja al detector de la siguiente sin enganchar— pero
          // tiene que dejar pasar el dedo: si no, se come los toques del lienzo
          // que hay debajo y la red deja de contestar.
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
  prompt: { color: theme.color.ink, fontSize: 24, letterSpacing: 1 },
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
    maxWidth: 520,
    paddingHorizontal: theme.space[3],
  },
});
