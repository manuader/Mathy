/**
 * La banda y el piso: el minijuego de `arith.mul.scaling`.
 *
 * Un chico que no lee tiene que poder jugarlo entero. Por eso no hay ninguna
 * instrucción escrita: la manivela late, una mano fantasma lleva el extremo de
 * la banda hasta la ficha objetivo, y el objeto contesta. Los mensajes de abajo
 * son para el adulto que mira.
 *
 * El nodo tiene dos caras y por eso hay dos superficies, que son dos escenas
 * distintas y reusables: el piso (`tiles`) y la banda (`grid_stretch`). Esta
 * actividad no dibuja nada: elige qué escena mira el jugador en cada ronda, le
 * pasa su configuración y traduce el dedo en los valores que las dos animan.
 *
 * Seis gestos y ninguno fino:
 *
 * - Girar la manivela con el par de engranajes. Cada vuelta mueve la ficha
 *   tantas casillas como diga el engranaje enganchado: es el puente desde el
 *   desplazamiento del nodo 3.
 * - Arrastrar filas de baldosas al marco. La fila que no mide lo que el marco
 *   pide no entra; la que sí, se funde con las que ya están.
 * - Toque sostenido sobre el piso. Lo levanta y lo gira un cuarto de vuelta:
 *   las filas se vuelven columnas y el total no cambia. Es la conmutatividad y
 *   nadie la nombra.
 * - Pellizcar o arrastrar la banda. El clavo no se mueve y todas las marcas se
 *   separan por igual. Soltar antes de llegar conserva el estado; pasarse hace
 *   vibrar la banda y nada se llama incorrecto.
 * - Tocar una marca antes de soltar. Es anticipar sin ejecutar, que es lo que
 *   separa multiplicar de contar rápido.
 * - Tocar una de dos animaciones. En una las marcas se separan por igual; en la
 *   otra solo el extremo se mueve. Así se resuelve `explain` sin leer.
 *
 * El único error que clasifica es `negative_times_negative`, que es el único
 * que el catálogo de L declara sobre este nodo. Sumar los dos factores y
 * confundir estirar con desplazar están previstos en el diseño y no tienen
 * entrada, así que se muestran y no se anotan.
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
  type SharedValue,
} from "react-native-reanimated";
import {
  MUL_OPTION_SLOTS,
  MUL_ROW_SLOTS,
  NODE_MUL_SCALING,
  TOTAL_MUL_LEVELS,
  factorValue,
  generateMulScaling,
  misconceptionFor,
  type MulLevel,
  type MulOption,
} from "@mathy/mechanics";
import type { Event } from "@mathy/progress";
import {
  TilesScene,
  tilesLayout,
  type RowSlot,
  type TilesConfig,
} from "../scenes/TilesScene.tsx";
import {
  StretchScene,
  stretchLayout,
  type BandValues,
  type StretchConfig,
} from "../scenes/StretchScene.tsx";
import { Header, Hint } from "../ui/Chrome.tsx";
import { ActivityShell, useActivityViewport } from "../ui/ActivityShell.tsx";
import { t } from "../i18n.ts";
import { theme } from "../ui/theme.ts";

/** Cuánto puede errar el extremo de la banda y seguir contando como acertado. */
const TOLERANCE = 0.45;

export interface MulScalingGameProps {
  readonly level: MulLevel;
  readonly levelsDone: number;
  readonly onLevelDone: () => void;
  readonly onExit: () => void;
  readonly onEvent: (event: Event) => void;
}

export function MulScalingGame(props: MulScalingGameProps) {
  return (
    <ActivityShell levelsDone={props.levelsDone}>
      <Activity {...props} />
    </ActivityShell>
  );
}

function Activity({ level, onLevelDone, onExit, onEvent }: MulScalingGameProps) {
  // El lienzo mide lo que le deja el panel abierto, no la ventana entera.
  const { width, height } = useActivityViewport();
  const [round, setRound] = useState(0);
  const [seedBase] = useState(() => Math.floor(Math.random() * 100000));
  const [solved, setSolved] = useState(false);
  /** Cuáles filas ya se fundieron: una fila que ya entró no se puede volver a traer. */
  const [usedRows, setUsedRows] = useState<readonly number[]>([]);
  /** La marca que el jugador anticipó, antes de ejecutar. */
  const [guess, setGuess] = useState<number | null>(null);
  /** La banda que eligió en `explain`, o -1. */
  const [picked, setPicked] = useState(-1);

  const problem = useMemo(
    () => generateMulScaling(level, seedBase + round * 1000 + level.n, round),
    [level, round, seedBase],
  );
  const ask = problem.ask;
  const [message, setMessage] = useState<{ text: string; tone: "dim" | "ok" | "warn" }>(() => ({
    text: openingHint(ask),
    tone: "dim",
  }));

  const sceneH = Math.max(340, Math.min(height * 0.66, 560));
  const usesFloor = ask === "cover" || ask === "rotate" || ask === "total";

  const tilesConfig = useMemo<TilesConfig>(
    () => ({
      rows: problem.rows,
      cols: problem.cols,
      frameRows: problem.frameRows,
      frameCols: problem.frameCols,
      skin: level.floorSkin,
      frame: usesFloor,
      loose: problem.tileRows.map((r) => ({ id: r.id, cells: r.cells })),
      cut: level.cut,
      total: level.keys ? problem.product : null,
      keys: level.keys,
      onDemand: level.floorOnDemand,
    }),
    [problem, level, usesFloor],
  );

  const bandConfig = useMemo<StretchConfig>(
    () => ({
      length: problem.length,
      flip: problem.flipped,
      rest: problem.rest,
      skin: level.bandSkin,
      numerals: level.bandSkin !== "drawings",
      // En el nivel que anticipa la ficha no puede estar puesta: eso es
      // justamente lo que hay que decir antes de estirar.
      target:
        ask === "stretch" || ask === "turn" || (ask === "predict" && guess !== null)
          ? problem.target
          : null,
      drawings: problem.drawings,
      bands: ask === "which" || ask === "match" ? 2 : 1,
      // En `explain` no se tira de ninguna banda: se mira y se elige.
      gripBand: ask === "which" ? -1 : 0,
      crank: level.gears ? { ratio: problem.rows } : null,
      marks: ask === "predict" || ask === "flip" ? problem.options.map((o) => o.value) : [],
    }),
    [problem, level, ask, guess],
  );

  const tl = useMemo(
    () => tilesLayout(tilesConfig, width, sceneH, MUL_ROW_SLOTS),
    [tilesConfig, width, sceneH],
  );
  const sl = useMemo(() => stretchLayout(bandConfig, width, sceneH), [bandConfig, width, sceneH]);

  // --- Lo que las escenas animan --------------------------------------------

  const placed = useSharedValue(0);
  const spin = useSharedValue(0);
  const split = useSharedValue(0);
  const keys = useSharedValue(0);
  const cross = useSharedValue(0);
  const token = useSharedValue(0);
  const ghost = useSharedValue(0);
  const hint = useSharedValue(0);
  const demo = useSharedValue(0);
  const tilesAppear = useSharedValue(0);
  const bandAppear = useSharedValue(0);
  const bandToken = useSharedValue(0);
  const turn = useSharedValue(0);
  const jam = useSharedValue(0);

  const rows: RowSlot[] = [
    useSlot(),
    useSlot(),
    useSlot(),
    useSlot(),
    useSlot(),
    useSlot(),
    useSlot(),
  ];
  const bands: BandValues[] = [useBand(), useBand()];

  const shownAt = useRef(Date.now());
  const doneRef = useRef(false);
  /**
   * Lo que el arrastre de una fila necesita saber, en una referencia.
   *
   * El gesto de una fila lo construye `GestureDetector`, que no siempre adopta
   * la función nueva en el mismo cuadro en que el estado cambia; con el estado
   * capturado en el cierre, la segunda fila del marco se soltaba contra una
   * cuenta vieja y no se sumaba. Acá la cuenta vive en una referencia y el gesto
   * lee siempre la de ahora.
   */
  const bag = useRef({ placed: 0, used: [] as number[] });

  useEffect(() => {
    shownAt.current = Date.now();
    doneRef.current = false;
    setUsedRows([]);
    bag.current = { placed: 0, used: [] };
    setGuess(null);
    setPicked(-1);
    setSolved(false);
    setMessage({ text: openingHint(ask), tone: "dim" });

    spin.value = 0;
    split.value = 0;
    keys.value = 0;
    cross.value = 0;
    token.value = 0;
    turn.value = 0;
    turned.value = 0;
    dragging.value = 0;
    bandToken.value = 0;
    ghost.value = level.floorOnDemand ? 0 : 1;
    // El piso fantasma llega con la expresión ya escrita: eso es lo que queda
    // cuando las baldosas se retiran, y es el nivel entero.
    if (ask === "total") {
      keys.value = 1;
      cross.value = 1;
    }
    // En `rotate` y en `total` el piso ya está armado: lo que se juega es
    // reacomodarlo o leerlo, no cubrirlo.
    placed.value = ask === "cover" ? 0 : problem.rows;
    tilesAppear.value = withTiming(usesFloor ? 1 : 0, { duration: theme.motion.base });
    bandAppear.value = withTiming(usesFloor ? 0 : 1, { duration: theme.motion.base });

    for (let i = 0; i < MUL_ROW_SLOTS; i++) {
      const slot = rows[i] as RowSlot;
      slot.dx.value = 0;
      slot.dy.value = 0;
      slot.alive.value = i < problem.tileRows.length ? 1 : 0;
    }
    for (const b of bands) {
      b.factor.value = 1;
      b.deform.value = 0;
    }
    // La banda que ya se dio vuelta una vez arranca apuntando al otro lado: lo
    // que se pregunta es adónde va a parar cuando se dé vuelta de nuevo.
    if (ask === "flip") (bands[0] as BandValues).factor.value = -factorValue(problem.factor);
    // La banda objetivo del último nivel está quieta y estirada: es el molde.
    if (ask === "match") (bands[1] as BandValues).factor.value = factorValue(problem.factor);

    // El latido de la demostración no es un adorno: es la única instrucción.
    hint.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
    demo.value = withRepeat(
      withSequence(withTiming(1, { duration: 1300 }), withTiming(0, { duration: 1 })),
      -1,
      false,
    );
    // Las dos animaciones de `explain` corren solas: en una las marcas se
    // separan por igual y en la otra solo el extremo se mueve.
    if (ask === "which") {
      const k = factorValue(problem.factor);
      (bands[problem.liar] as BandValues).deform.value = 1;
      for (const b of bands) {
        b.factor.value = withRepeat(
          withSequence(
            withTiming(k, { duration: 1500 }),
            withTiming(k, { duration: 500 }),
            withTiming(1, { duration: 900 }),
          ),
          -1,
          false,
        );
      }
    }
    return () => {
      cancelAnimation(hint);
      cancelAnimation(demo);
      for (const b of bands) cancelAnimation(b.factor);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem]);

  // La capa vista se registra al entrar y no al terminar: es lo que hace crecer
  // la chuleta, y el jugador ya la vio.
  useEffect(() => {
    onEvent({ kind: "sawLayer", at: Date.now(), node: NODE_MUL_SCALING, layer: level.layer });
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
          node: NODE_MUL_SCALING,
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
    if (round + 1 >= level.rounds) {
      onEvent({ kind: "levelDone", at: Date.now(), node: NODE_MUL_SCALING, level: level.n });
      onLevelDone();
      return;
    }
    setRound((r) => r + 1);
  }, [round, level.rounds, level.n, onEvent, onLevelDone]);

  const succeed = useCallback(
    (text: string) => {
      if (doneRef.current) return;
      doneRef.current = true;
      setSolved(true);
      quiet();
      setMessage({ text, tone: "ok" });
      setTimeout(nextRound, 1600);
    },
    [nextRound, quiet],
  );

  /**
   * El morph del nodo, disparado por el gesto que lo merece: al cubrir el marco
   * entero, las llaves con numeral crecen sobre los dos lados, entre ellas
   * aparece la cruz y el rectángulo se aplana en la ficha del total.
   */
  const revealSymbols = useCallback(() => {
    if (!level.keys) return;
    keys.value = withTiming(1, { duration: theme.motion.morph });
    cross.value = withSequence(
      withTiming(0, { duration: theme.motion.morph }),
      withTiming(1, { duration: theme.motion.morph }),
    );
    token.value = withSequence(
      withTiming(0, { duration: theme.motion.morph }),
      withTiming(1, { duration: theme.motion.base }),
    );
    // El corte queda a mano desde que hay llaves: partir el piso y volver a
    // juntarlo no cambia el total, y esa es la semilla de la distributiva. Con
    // menos de cuatro columnas no se muestra: una tira de una sola baldosa no
    // se lee como tira.
    if (level.cut > 1 && problem.frameCols >= 4) {
      split.value = withSequence(
        withTiming(1, { duration: 700 }),
        withTiming(1, { duration: 500 }),
        withTiming(0, { duration: 700 }),
      );
    }
  }, [level.keys, level.cut, problem.frameCols, keys, cross, token, split]);

  // --- Las baldosas ----------------------------------------------------------

  const dropRow = useCallback(
    (index: number, dx: number, dy: number) => {
      const row = problem.tileRows[index];
      const slot = rows[index];
      const home = tl.drawer[index];
      if (!row || !slot || !home || solved || bag.current.used.includes(index)) return;
      // El punto de suelta se mide desde la ranura de la fila y no desde la
      // página: la traslación del gesto y la geometría de la escena están en el
      // mismo sistema, y así no hace falta saber dónde empieza el lienzo.
      const x = home.x + dx;
      const y = home.y + dy;
      const dentro =
        x > tl.frame.x - tl.unit &&
        x < tl.frame.x + tl.frame.w + tl.unit &&
        y > tl.frame.y - tl.unit &&
        y < tl.frame.y + tl.frame.h + tl.unit;

      if (!dentro) {
        slot.dx.value = withTiming(0, { duration: theme.motion.base });
        slot.dy.value = withTiming(0, { duration: theme.motion.base });
        return;
      }

      quiet();
      attempt(row.fits);
      if (!row.fits) {
        // La fila que no mide lo que el marco pide no entra. Se asoma y vuelve:
        // el marco se resiste y nadie dice "mal".
        const px = (tl.center.x - home.x) * 0.7;
        const py = (tl.center.y - home.y) * 0.7;
        slot.dx.value = withSequence(
          withTiming(px, { duration: 120 }),
          withTiming(0, { duration: 340 }),
        );
        slot.dy.value = withSequence(
          withTiming(py, { duration: 120 }),
          withTiming(0, { duration: 340 }),
        );
        setMessage({
          text:
            row.cells > problem.frameCols
              ? "Esa fila es más larga que el marco. Se sale."
              : "Esa fila es más corta. Queda un borde sin cubrir.",
          tone: "warn",
        });
        return;
      }

      slot.alive.value = withTiming(0, { duration: 120 });
      bag.current.used = [...bag.current.used, index];
      bag.current.placed += 1;
      setUsedRows(bag.current.used);
      const next = bag.current.placed;
      placed.value = withTiming(next, { duration: 220 });
      if (next >= problem.frameRows) {
        revealSymbols();
        succeed(
          level.keys
            ? "El marco quedó cubierto. Dos llaves y una cruz alcanzan para volver a armarlo."
            : "El marco quedó cubierto: son un rectángulo, no filas sueltas.",
        );
      } else {
        setMessage({ text: "Se fundieron. Falta cubrir el resto.", tone: "dim" });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [problem, tl, solved, attempt, quiet, succeed, revealSymbols, level.keys],
  );

  /** El toque sostenido que gira el piso. La ficha del total no se mueve. */
  const rotateFloor = useCallback(() => {
    if (solved || ask !== "rotate") return;
    quiet();
    spin.value = withTiming(1, { duration: theme.motion.morph });
    attempt(true);
    succeed("Las mismas baldosas, dadas vuelta. El total no cambió.");
  }, [solved, ask, quiet, spin, attempt, succeed]);

  // --- La ficha del total ----------------------------------------------------

  const summonFloor = useCallback(() => {
    // Solo cuando el piso es lo que está en pantalla: en los niveles de banda no
    // hay piso que pedir, y el toque no tiene que contestar nada.
    if (!level.floorOnDemand || !usesFloor) return;
    ghost.value = withTiming(1, { duration: theme.motion.base });
    setMessage({ text: "Ahí está el piso. Contá filas, no baldosas.", tone: "dim" });
  }, [level.floorOnDemand, usesFloor, ghost]);

  const pickTotal = useCallback(
    (option: MulOption) => {
      if (solved) return;
      quiet();
      attempt(option.correct, misconceptionFor(option));
      if (option.correct) {
        token.value = withTiming(1, { duration: theme.motion.base });
        succeed("Ese es el piso entero.");
        return;
      }
      // El juego ejecuta la respuesta del jugador en vez de calificarla: con esa
      // cantidad de baldosas el marco queda con un hueco.
      ghost.value = withTiming(1, { duration: theme.motion.base });
      placed.value = withTiming(
        Math.max(0, Math.min(problem.frameRows, option.value / Math.max(problem.frameCols, 1))),
        { duration: theme.motion.morph },
        (ok) => {
          if (ok) placed.value = withTiming(problem.frameRows, { duration: theme.motion.morph });
        },
      );
      setMessage({
        text:
          option.lure === "added_factors"
            ? "Con esas baldosas el marco queda con un hueco: no alcanza con juntar los dos números."
            : "Con esas baldosas el marco no cierra.",
        tone: "warn",
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [solved, problem, attempt, quiet, succeed, token, ghost],
  );

  // --- La banda --------------------------------------------------------------

  const stretched = useCallback(
    (factor: number) => {
      if (solved) return;
      const end = problem.rest * factor;
      const objetivo = ask === "match" ? problem.rest * factorValue(problem.factor) : problem.target;
      const error = Math.abs(end - objetivo);
      quiet();
      if (error <= TOLERANCE) {
        (bands[0] as BandValues).factor.value = withTiming(objetivo / problem.rest, {
          duration: theme.motion.quick,
        });
        attempt(true);
        succeed(
          ask === "match"
            ? "Los tres dibujos cayeron encima de los otros tres: es el mismo estirado."
            : "El extremo cayó justo en la ficha. Todas las marcas se separaron igual.",
        );
        return;
      }
      if (end > objetivo) {
        // Pasarse no es un error: la banda vibra y el jugador vuelve con el
        // mismo gesto. El estado no se borra.
        jam.value = withSequence(
          withTiming(1, { duration: 80 }),
          withTiming(-1, { duration: 120 }),
          withTiming(0, { duration: 100 }),
        );
        attempt(false);
        setMessage({ text: "Se pasó. Aflojá un poco: el clavo no se movió.", tone: "warn" });
        return;
      }
      setMessage({ text: "Todavía falta. Seguí estirando desde donde quedó.", tone: "dim" });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [solved, problem, ask, attempt, quiet, succeed, jam],
  );

  /** El caminante de la manivela soltó el pie: la ficha quedó en una casilla. */
  const landed = useCallback(
    (mark: number) => {
      if (solved) return;
      quiet();
      if (mark === problem.target) {
        attempt(true);
        succeed("Cada vuelta movió lo mismo, y la ficha llegó.");
      } else if (mark > problem.target) {
        attempt(false);
        setMessage({ text: "Se pasó. Contá vueltas, no casillas.", tone: "warn" });
      } else {
        setMessage({ text: "Falta. Seguí dando vueltas.", tone: "dim" });
      }
    },
    [solved, problem.target, attempt, quiet, succeed],
  );

  /** `explain`: tocar la banda que no escala. */
  const pickBand = useCallback(
    (row: number) => {
      if (solved) return;
      quiet();
      setPicked(row);
      const ok = row === problem.liar;
      attempt(ok);
      if (ok) {
        succeed("En esa solo se mueve el extremo: las marcas del medio no se separaron.");
      } else {
        setMessage({
          text: "En esa cada marca se alejó del clavo lo mismo. Eso sí es estirar.",
          tone: "warn",
        });
      }
    },
    [solved, problem.liar, attempt, quiet, succeed],
  );

  /** Anticipar: tocar la marca donde va a caer el extremo, antes de soltar. */
  const guessMark = useCallback(
    (mark: number) => {
      if (solved) return;
      quiet();
      setGuess(mark);
      const option = problem.options.find((o) => o.value === mark);
      const ok = mark === problem.target;
      attempt(ok, option ? misconceptionFor(option) : undefined);
      const k = factorValue(problem.factor);
      if (ok) {
        (bands[0] as BandValues).factor.value = withTiming(k, { duration: theme.motion.morph });
        succeed(
          ask === "flip"
            ? "Dos vueltas y quedó mirando para el mismo lado que al principio."
            : k === 0
              ? "La banda se aplastó contra el clavo: todas las marcas cayeron en el mismo punto."
              : k === 1
                ? "Estirar por uno deja la banda igual."
                : "Ahí cayó. Lo dijiste antes de soltar.",
        );
        return;
      }
      if (option?.lure === "double_flip") {
        // El replay del catálogo: la bandera queda del lado equivocado y el
        // jugador vuelve a girar desde el estado real.
        setMessage({ text: "Te diste vuelta dos veces. ¿Hacia dónde mirás ahora?", tone: "warn" });
      } else {
        setMessage({ text: "Mirá cuánto se separa cada marca del clavo.", tone: "warn" });
      }
      (bands[0] as BandValues).factor.value = withSequence(
        withTiming(mark / Math.max(problem.rest, 1), { duration: theme.motion.morph }),
        withTiming(ask === "flip" ? -k : 1, { duration: theme.motion.morph }),
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [solved, problem, ask, attempt, quiet, succeed],
  );

  // --- Gestos ----------------------------------------------------------------

  const nailX = sl.nails[0]?.x ?? 0;
  const nailY = sl.nails[0]?.y ?? 0;
  const step = sl.step;
  const rest = Math.max(problem.rest, 1);
  const crankX = sl.crank.x;
  const crankY = sl.crank.y;
  const crankR = sl.crank.r;
  const ratio = problem.rows;
  const maxFactor = problem.length / rest;
  const minFactor = problem.flipped ? -maxFactor : 0;
  const bandYs = useMemo(() => sl.nails.map((n) => n.y), [sl]);
  const bandGap = (sl.nails[1]?.y ?? Infinity) - (sl.nails[0]?.y ?? 0);
  const grab = Math.min(sl.touchR * 1.8, bandGap * 0.45);
  const rulerY = sl.ruler.y;
  const touchR = sl.touchR;
  const markValues = useMemo(() => bandConfig.marks.map((m) => m), [bandConfig.marks]);
  const canStretch = ask === "stretch" || ask === "match" || ask === "predict";
  const canTurn = ask === "turn";
  const lastAngle = useSharedValue(0);
  const turned = useSharedValue(0);
  const dragging = useSharedValue(0);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        // En el nivel que anticipa, la banda no se deja tocar hasta que el
        // jugador dijo dónde va a caer: ejecutar primero sería contar, no anticipar.
        .enabled(!solved && ((canStretch && (ask !== "predict" || guess !== null)) || canTurn))
        .onBegin((e) => {
          if (canTurn) {
            dragging.value = Math.hypot(e.x - crankX, e.y - crankY) < crankR * 1.4 ? 1 : 0;
            lastAngle.value = Math.atan2(e.y - crankY, e.x - crankX);
            return;
          }
          // El blanco es la banda entera, no solo su manija: una mano de cinco
          // años no apunta fino. Con dos bandas el blanco se recorta a la mitad
          // de la separación, para que tirar de la de abajo no mueva la de arriba.
          dragging.value = Math.abs(e.y - nailY) < grab ? 1 : 0;
        })
        .onChange((e) => {
          if (!dragging.value) return;
          if (canTurn) {
            const a = Math.atan2(e.y - crankY, e.x - crankX);
            let d = a - lastAngle.value;
            while (d > Math.PI) d -= 2 * Math.PI;
            while (d < -Math.PI) d += 2 * Math.PI;
            turned.value += d;
            lastAngle.value = a;
            const vueltas = Math.max(0, Math.round((turned.value / (2 * Math.PI)) * 4) / 4);
            turn.value = vueltas * 2 * Math.PI;
            bandToken.value = Math.min(problem.length, Math.round(vueltas) * ratio);
            return;
          }
          // El clavo no se mueve: lo que el dedo cambia es la distancia a él.
          const f = (e.x - nailX) / (rest * step);
          (bands[0] as BandValues).factor.value = Math.max(minFactor, Math.min(maxFactor, f));
        })
        .onEnd(() => {
          if (!dragging.value) return;
          dragging.value = 0;
          if (canTurn) {
            runOnJS(landed)(bandToken.value);
            return;
          }
          runOnJS(stretched)((bands[0] as BandValues).factor.value);
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      solved,
      canStretch,
      canTurn,
      crankX,
      crankY,
      crankR,
      nailX,
      nailY,
      grab,
      rest,
      step,
      ratio,
      minFactor,
      maxFactor,
      touchR,
      landed,
      stretched,
      problem.length,
      ask,
      guess,
    ],
  );

  const tap = useMemo(
    () =>
      Gesture.Tap()
        .maxDistance(26)
        .enabled(!solved)
        .onEnd((e) => {
          if (ask === "which") {
            let row = 0;
            let best = Infinity;
            for (let i = 0; i < bandYs.length; i++) {
              const d = Math.abs(e.y - (bandYs[i] as number));
              if (d < best) {
                best = d;
                row = i;
              }
            }
            runOnJS(pickBand)(row);
            return;
          }
          if (ask === "predict" || ask === "flip") {
            let best = NaN;
            let bestD = Math.max(touchR * 1.4, 34);
            for (const m of markValues) {
              const d = Math.hypot(e.x - (nailX + m * step), e.y - rulerY);
              if (d < bestD) {
                bestD = d;
                best = m;
              }
            }
            if (!Number.isNaN(best)) runOnJS(guessMark)(best);
            return;
          }
          runOnJS(summonFloor)();
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [solved, ask, bandYs, markValues, nailX, step, rulerY, touchR, pickBand, guessMark, summonFloor],
  );

  const hold = useMemo(
    () =>
      Gesture.LongPress()
        .minDuration(420)
        .enabled(!solved && ask === "rotate")
        .onStart(() => {
          runOnJS(rotateFloor)();
        }),
    [solved, ask, rotateFloor],
  );

  // Carrera y no exclusiva: el toque sostenido gana si el dedo no se mueve, el
  // arrastre gana si se mueve y el toque gana si se levanta rápido. Encadenadas
  // en exclusiva, un gesto deshabilitado bloquea a los que vienen detrás.
  const canvasGesture = useMemo(() => Gesture.Race(hold, pan, tap), [hold, pan, tap]);

  return (
    <View style={styles.root}>
      <Pressable onPress={onExit} style={styles.back} hitSlop={theme.hitSlop}>
        <Text style={styles.backLabel}>{t("game.back")}</Text>
      </Pressable>

      <Header
        title={`${t(`node.${NODE_MUL_SCALING}.name`)} · nivel ${level.n} de ${TOTAL_MUL_LEVELS}`}
        subtitle={t(level.titleKey)}
        round={round}
        rounds={level.rounds}
      />

      <View style={{ width, height: sceneH }}>
        {/* Un solo lienzo por pantalla: las dos escenas viven adentro y la que
            no juega esta ronda se queda en opacidad cero. */}
        <Canvas style={{ width, height: sceneH }}>
          <TilesScene
            config={tilesConfig}
            layout={tl}
            placed={placed}
            spin={spin}
            split={split}
            keys={keys}
            cross={cross}
            token={token}
            ghost={ghost}
            hint={hint}
            demo={demo}
            rows={rows}
            appear={tilesAppear}
          />
          <StretchScene
            config={bandConfig}
            layout={sl}
            bands={bands}
            token={bandToken}
            turn={turn}
            jam={jam}
            hint={hint}
            demo={demo}
            picked={picked}
            guess={guess}
            appear={bandAppear}
          />
        </Canvas>

        {/* El gesto va encima del lienzo: Skia dibuja, la vista escucha. */}
        <GestureDetector gesture={canvasGesture}>
          <Animated.View style={StyleSheet.absoluteFill} />
        </GestureDetector>

        {/* Siempre las mismas asas: las que esta ronda no usa quedan sordas. */}
        {Array.from({ length: MUL_ROW_SLOTS }, (_, i) => {
          const row = problem.tileRows[i];
          const spot = tl.drawer[i] ?? { x: 0, y: 0 };
          return (
            <RowHandle
              key={i}
              index={i}
              slot={rows[i] as RowSlot}
              x={spot.x - ((row?.cells ?? 1) * tl.unit) / 2}
              y={spot.y - tl.unit / 2}
              w={(row?.cells ?? 1) * tl.unit}
              h={tl.unit}
              enabled={!!row && !solved && ask === "cover" && !usedRows.includes(i)}
              onDrop={dropRow}
            />
          );
        })}
      </View>

      <Hint text={message.text} tone={message.tone} />

      {/* El teclado de fichas del total. Fuera del nivel que lo usa, no está. */}
      {ask === "total" ? (
        <View style={styles.ring}>
          {Array.from({ length: MUL_OPTION_SLOTS }, (_, i) => {
            const option = problem.options[i];
            if (!option) return <View key={i} style={styles.chipGhost} />;
            return (
              <Pressable
                key={option.id}
                disabled={solved}
                onPress={() => pickTotal(option)}
                style={[styles.chip, solved && styles.chipDim]}
              >
                <Text style={styles.chipLabel}>{option.value}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

/** Un asa invisible sobre la fila dibujada: la baldosa es dibujo, no interfaz. */
function RowHandle({
  index,
  slot,
  x,
  y,
  w,
  h,
  enabled,
  onDrop,
}: {
  readonly index: number;
  readonly slot: RowSlot;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly enabled: boolean;
  readonly onDrop: (index: number, dx: number, dy: number) => void;
}) {
  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(enabled)
        .onChange((e) => {
          slot.dx.value = e.translationX;
          slot.dy.value = e.translationY;
        })
        .onEnd((e) => {
          runOnJS(onDrop)(index, e.translationX, e.translationY);
        }),
    [enabled, index, slot, onDrop],
  );
  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={{ position: "absolute", left: x, top: y, width: w, height: h }} />
    </GestureDetector>
  );
}

function useSlot(): RowSlot {
  return {
    dx: useSharedValue(0),
    dy: useSharedValue(0),
    alive: useSharedValue(0),
  };
}

function useBand(): BandValues {
  return { factor: useSharedValue(1), deform: useSharedValue(0) };
}

function openingHint(ask: string): string {
  switch (ask) {
    case "turn":
      return "Girá la manivela: cada vuelta mueve la ficha varias casillas.";
    case "cover":
      return "Llevá filas de baldosas al marco hasta cubrirlo.";
    case "rotate":
      return "Mantené el dedo sobre el piso: se da vuelta y entra.";
    case "which":
      return "Una de las dos no estira. Tocala.";
    case "stretch":
      return "Estirá la banda hasta que el extremo caiga en la ficha.";
    case "total":
      return "Tocá la pantalla para ver el piso, y elegí el total.";
    case "predict":
      return "Tocá la marca donde va a caer el extremo, antes de estirar.";
    case "match":
      return "Llevá los tres dibujos encima de los otros tres, de un solo tirón.";
    default:
      return "La banda ya se dio vuelta una vez. ¿Dónde cae si se da vuelta otra?";
  }
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
  ring: { flexDirection: "row", gap: theme.space[3], alignItems: "center", justifyContent: "center" },
  chip: {
    minWidth: 72,
    height: 64,
    paddingHorizontal: theme.space[2],
    borderRadius: theme.radius.token,
    backgroundColor: theme.color.surfaceHigh,
    borderWidth: 1,
    borderColor: theme.color.line,
    alignItems: "center",
    justifyContent: "center",
  },
  chipGhost: { width: 0, height: 64 },
  chipDim: { opacity: 0.35 },
  chipLabel: { color: theme.color.ink, fontSize: 24, fontVariant: ["tabular-nums"] },
});
