/**
 * La llave que encoge: el minijuego de `arith.div.undo_mul`.
 *
 * Un chico que no lee tiene que poder jugarlo entero. Por eso no hay ninguna
 * instrucción escrita: el llavero late, una mano fantasma lleva la llave hasta
 * la cerradura y gira, y el cofre contesta. Los mensajes de abajo son para el
 * adulto que mira.
 *
 * El nodo tiene tres mecánicas y ninguna se construye acá: el cofre y el
 * llavero son `ChestScene`, la banda es `StretchScene` y el piso es
 * `TilesScene`, las mismas que ya usan los nodos 4 y 5. Esta actividad no
 * dibuja nada: elige qué escena mira el jugador en cada ronda, le pasa su
 * configuración y traduce el dedo en los valores que las tres animan.
 *
 * Cinco gestos y ninguno fino:
 *
 * - Arrastrar una llave a la cerradura. Si es la de encoger, entra; si es la de
 *   recortar o la de estirar, hace lo suyo a la vista y la banda vuelve sola.
 * - Girar con el mismo dedo. El dial sube y la banda se encoge en vivo. Soltar
 *   antes de tiempo conserva el estado: la banda se queda donde está.
 * - Tocar una de dos animaciones. En una las marcas vuelven a caer sobre la
 *   testigo; en la otra el largo coincide y las marcas no. Así se resuelve
 *   `explain` sin leer.
 * - Tocar la ficha del lado que la pared tapa, sin desarmar el rectángulo.
 * - Tocar la acción que deshace una cerradura que no es aritmética, o la ficha
 *   de cofre sin llave cuando ninguna la deshace.
 *
 * Los dos errores que se registran son los únicos del catálogo de L cuya regla
 * `detect` apunta a este nodo: elegir una acción que no es la inversa
 * (`wrong_inverse_choice`, que es la llave de recortar, la de estirar y restar
 * el lado en vez de dividirlo) y encoger por el total (`division_order_swapped`).
 * Sumar el sobrante al resultado está previsto en el diseño y no tiene entrada,
 * así que se ejecuta a la vista y no se anota.
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
  DIV_OPTION_SLOTS,
  MIS_DIV_INVERSE,
  NODE_DIV_UNDO_MUL,
  TOTAL_DIV_LEVELS,
  generateDivUndoMul,
  misconceptionForDial,
  type DivLevel,
  type DivOption,
} from "@mathy/mechanics";
import type { Event } from "@mathy/progress";
import {
  ChestScene,
  KEY_SLOTS,
  chestLayout,
  type ChestLevel,
  type ChestProblem,
  type Slot,
} from "../scenes/ChestScene.tsx";
import {
  StretchScene,
  stretchLayout,
  type BandValues,
  type StretchConfig,
} from "../scenes/StretchScene.tsx";
import { TilesScene, tilesLayout, type RowSlot, type TilesConfig } from "../scenes/TilesScene.tsx";
import { Header, Hint } from "../ui/Chrome.tsx";
import { ActivityShell, useActivityViewport } from "../ui/ActivityShell.tsx";
import { t } from "../i18n.ts";
import { theme } from "../ui/theme.ts";

/** Cuánto gira la llave por unidad de dial. Ocho muescas por vuelta se sienten. */
const NOTCH = (2 * Math.PI) / 8;
/** Las tres bandas del nivel que compara: dos candidatas y la testigo. */
const BAND_SLOTS = 3;

export interface DivUndoMulGameProps {
  readonly level: DivLevel;
  readonly levelsDone: number;
  readonly onLevelDone: () => void;
  readonly onExit: () => void;
  readonly onEvent: (event: Event) => void;
}

export function DivUndoMulGame(props: DivUndoMulGameProps) {
  return (
    <ActivityShell levelsDone={props.levelsDone}>
      <Activity {...props} />
    </ActivityShell>
  );
}

function Activity({ level, onLevelDone, onExit, onEvent }: DivUndoMulGameProps) {
  // El lienzo mide lo que le deja el panel abierto, no la ventana entera.
  const { width, height } = useActivityViewport();
  const [round, setRound] = useState(0);
  const [seedBase] = useState(() => Math.floor(Math.random() * 100000));
  const [solved, setSolved] = useState(false);
  /** La llave que entró en la cerradura, o -1. */
  const [mounted, setMounted] = useState(-1);
  /** La banda que el jugador eligió en `explain`, o -1. */
  const [picked, setPicked] = useState(-1);

  const problem = useMemo(
    () => generateDivUndoMul(level, seedBase + round * 1000 + level.n, round),
    [level, round, seedBase],
  );
  const ask = problem.ask;
  const [message, setMessage] = useState<{ text: string; tone: "dim" | "ok" | "warn" }>(() => ({
    text: openingHint(ask),
    tone: "dim",
  }));

  const sceneH = Math.max(340, Math.min(height * 0.66, 560));
  const conBanda = ask === "shrink" || ask === "which" || ask === "ghost";
  const conPiso = ask === "wall" || ask === "leftover";
  const conCofre = ask === "shrink" || ask === "undo";
  // Los numerales llegan con la etiqueta de la llave: hasta entonces el dial se
  // lee por la posición y la regla, contando marcas.
  const conNumerales = level.labeledKeys;

  // --- Lo que cada escena necesita saber -------------------------------------

  /**
   * El cofre y el llavero. La cerradura tiene la forma del estirado, igual que
   * en el nodo 4 tenía la forma del tramo: sus dientes son el factor.
   */
  const chestProblem = useMemo<ChestProblem>(
    () => ({
      track: 2,
      home: 0,
      step: ask === "undo" ? 0 : problem.factor,
      landing: 0,
      keys: ask === "undo" ? [] : problem.keys.map((k) => ({ teeth: k.dial, kind: k.kind })),
      returns: [],
      liar: 0,
      marks: null,
      // El renglón no se usa acá, pero la escena mide su hueco de todos modos:
      // los tres números del nodo alcanzan para que la cuenta cierre.
      row: {
        minuend: problem.total,
        subtrahend: problem.factor,
        result: problem.rest,
        hidden: "result",
      },
      tiles: [],
      lock: { kind: problem.lock.kind, value: problem.lock.dial },
      actions: problem.actions.map((a) => ({ kind: a.kind, value: a.dial })),
    }),
    [problem, ask],
  );

  const chestLevel = useMemo<ChestLevel>(
    () => ({
      mode: ask === "undo" ? "unlock" : "shrink",
      layer: level.layer,
      labeled: level.labeledKeys,
      // Este nodo no tiene pista: el cofre está suelto y la banda va debajo.
      skin: "hidden",
      ruler: false,
      keyboard: false,
      numerals: conNumerales,
    }),
    [ask, level.layer, level.labeledKeys, conNumerales],
  );

  /**
   * La banda. En reposo mide lo que medía antes del estirado, y la que el
   * jugador encoge arranca estirada por el factor: encogerla es llevar su
   * factor de vuelta al uno, que es donde sus marcas caen sobre las de la
   * testigo. Ese "caen sobre" no lo comprueba el código, es la geometría.
   */
  const bandConfig = useMemo<StretchConfig>(
    () => ({
      length: problem.length,
      flip: false,
      rest: problem.rest,
      skin: level.bandSkin,
      numerals: conNumerales,
      target: null,
      drawings: [],
      bands: ask === "which" ? BAND_SLOTS : level.witness ? 2 : 1,
      // No hay manija: de la banda no se tira, se la encoge con la llave.
      gripBand: -1,
      crank: null,
      marks: [],
      expr: level.expr ? `${problem.total}÷${problem.factor}` : null,
      arrows: level.arrows && ask !== "which",
    }),
    [problem, level, ask, conNumerales],
  );

  const tilesConfig = useMemo<TilesConfig>(
    () => ({
      rows: problem.rows,
      cols: problem.cols,
      frameRows: problem.rows,
      frameCols: problem.cols,
      skin: level.floorSkin,
      frame: false,
      loose: [],
      cut: level.cut,
      total: null,
      keys: true,
      onDemand: false,
      // La pared tapa un lado: su llave queda hueca y es lo que hay que leer.
      hollow: ask === "wall" ? problem.hidden : "rows",
      leftover: problem.leftover,
    }),
    [problem, level, ask],
  );

  const cl = useMemo(
    () => chestLayout(chestProblem, chestLevel, width, sceneH),
    [chestProblem, chestLevel, width, sceneH],
  );
  const sl = useMemo(() => stretchLayout(bandConfig, width, sceneH), [bandConfig, width, sceneH]);
  const tl = useMemo(() => tilesLayout(tilesConfig, width, sceneH, 0), [tilesConfig, width, sceneH]);

  // --- Lo que las escenas animan ---------------------------------------------

  const pos = useSharedValue(0);
  const open = useSharedValue(0);
  const outArrow = useSharedValue(0);
  const backArrow = useSharedValue(0);
  const leftoverArrow = useSharedValue(0);
  const jam = useSharedValue(0);
  const hint = useSharedValue(0);
  const demo = useSharedValue(0);
  const clock = useSharedValue(0);
  const rulerV = useSharedValue(0);
  const lineV = useSharedValue(0);
  const chestAppear = useSharedValue(0);
  const bandAppear = useSharedValue(0);
  const tilesAppear = useSharedValue(0);

  const placed = useSharedValue(0);
  const spin = useSharedValue(0);
  const split = useSharedValue(0);
  const keysV = useSharedValue(0);
  const cross = useSharedValue(0);
  const token = useSharedValue(0);
  const ghost = useSharedValue(0);
  const bandToken = useSharedValue(0);
  const turn = useSharedValue(0);

  const keys: Slot[] = [useSlot(), useSlot(), useSlot(), useSlot()];
  // El cajón de fichas del nodo 4 no se usa acá, pero la escena lo monta igual:
  // el modo retained pide que el árbol no cambie, así que las ranuras existen
  // y se quedan en opacidad cero, fuera del lienzo.
  const chestTiles: Slot[] = [useSlot(), useSlot(), useSlot(), useSlot(), useSlot()];
  const bands: BandValues[] = [useBand(), useBand(), useBand()];
  // Las agujas del giro de cada llave, en un arreglo estable: el worklet las
  // indexa por la llave montada, que viaja en un valor compartido y no en la
  // clausura del render en que se armó el gesto.
  const spins = useMemo(() => keys.map((k) => k.spin as SharedValue<number>), keys.map((k) => k.spin));

  const shownAt = useRef(Date.now());
  const doneRef = useRef(false);

  useEffect(() => {
    shownAt.current = Date.now();
    doneRef.current = false;
    setSolved(false);
    setMounted(-1);
    setPicked(-1);
    setMessage({ text: openingHint(ask), tone: "dim" });

    open.value = 0;
    spin.value = 0;
    split.value = 0;
    cross.value = 0;
    token.value = 0;
    placed.value = problem.rows;
    keysV.value = conPiso ? 1 : 0;
    ghost.value = 1;
    dial.value = problem.dialStart;
    montada.value = -1;
    factorSV.value = problem.factor;
    dialMax.value = problem.total;
    turned.value = 0;

    chestAppear.value = withTiming(conCofre ? 1 : 0, { duration: theme.motion.base });
    tilesAppear.value = withTiming(conPiso ? 1 : 0, { duration: theme.motion.base });
    // La banda del nivel fantasma se pide con un toque: hasta entonces solo
    // está la expresión, que es lo que ese nivel enseña.
    bandAppear.value = withTiming(conBanda && !level.bandOnDemand ? 1 : 0, {
      duration: theme.motion.base,
    });

    for (let i = 0; i < KEY_SLOTS; i++) {
      const s = keys[i] as Slot;
      s.dx.value = 0;
      s.dy.value = 0;
      (s.spin as SharedValue<number>).value = 0;
      s.alive.value =
        ask === "undo" ? (i < problem.actions.length ? 1 : 0)
        : ask === "shrink" ? (i < problem.keys.length ? 1 : 0)
        : 0;
    }
    for (const b of bands) {
      b.factor.value = 1;
      b.deform.value = 0;
      (b.cut as SharedValue<number>).value = 0;
    }
    // La banda de arriba ya está estirada: nadie vio cuánto, y eso es el nodo.
    if (conBanda) (bands[0] as BandValues).factor.value = problem.factor;

    // El latido de la demostración no es un adorno: es la única instrucción.
    hint.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
    demo.value =
      ask === "shrink"
        ? withRepeat(
            withSequence(withTiming(1, { duration: 1400 }), withTiming(0, { duration: 1 })),
            -1,
            false,
          )
        : 0;

    // Las dos animaciones de `explain` corren solas: en una las marcas vuelven a
    // caer sobre la testigo, y en la otra el extremo se corta y no vuelve nada.
    if (ask === "which") {
      const k = problem.factor;
      (bands[0] as BandValues).factor.value = k;
      (bands[1] as BandValues).factor.value = k;
      // La testigo, quieta y sin tocar: es el estado que hay que recuperar.
      (bands[2] as BandValues).factor.value = 1;
      const honesta = bands[problem.liar === 0 ? 1 : 0] as BandValues;
      const mentirosa = bands[problem.liar] as BandValues;
      honesta.factor.value = withRepeat(
        withSequence(
          withTiming(k, { duration: 500 }),
          withTiming(1, { duration: 1400 }),
          withTiming(1, { duration: 700 }),
          withTiming(k, { duration: 1 }),
        ),
        -1,
        false,
      );
      (mentirosa.cut as SharedValue<number>).value = withRepeat(
        withSequence(
          withTiming(0, { duration: 500 }),
          withTiming(1, { duration: 1400 }),
          withTiming(1, { duration: 700 }),
          withTiming(0, { duration: 1 }),
        ),
        -1,
        false,
      );
    }
    return () => {
      cancelAnimation(hint);
      cancelAnimation(demo);
      for (const b of bands) {
        cancelAnimation(b.factor);
        cancelAnimation(b.cut as SharedValue<number>);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem]);

  // La capa vista se registra al entrar y no al terminar: es lo que hace crecer
  // la chuleta, y el jugador ya la vio.
  useEffect(() => {
    onEvent({ kind: "sawLayer", at: Date.now(), node: NODE_DIV_UNDO_MUL, layer: level.layer });
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
          node: NODE_DIV_UNDO_MUL,
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
      onEvent({ kind: "levelDone", at: Date.now(), node: NODE_DIV_UNDO_MUL, level: level.n });
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
      cancelAnimation(clock);
      setMessage({ text, tone: "ok" });
      setTimeout(nextRound, 1700);
    },
    [nextRound, quiet, clock],
  );

  // --- La banda y la llave ---------------------------------------------------

  /**
   * Lo que el worklet necesita saber viaja en valores compartidos y no en la
   * clausura: un worklet captura el callback del render en que se armó el
   * gesto, así que la llave montada y el dial no pueden vivir en el estado.
   */
  const dial = useSharedValue(1);
  const montada = useSharedValue(-1);
  const factorSV = useSharedValue(2);
  const dialMax = useSharedValue(2);
  const turned = useSharedValue(0);
  const anchorDial = useSharedValue(1);
  const lastAngle = useSharedValue(0);
  const sujeto = useSharedValue(0);

  /** El cofre se abre solo, sin cartel. */
  const abrir = useCallback(() => {
    open.value = withTiming(1, { duration: theme.motion.base });
    (bands[0] as BandValues).factor.value = withTiming(1, { duration: theme.motion.quick });
    attempt(true);
    succeed("Las marcas cayeron justo sobre las de la testigo. El cofre se abrió.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt, succeed, open]);

  /** El jugador soltó la llave. El veredicto lo da la banda, no un cartel. */
  const released = useCallback(
    (value: number) => {
      if (solved) return;
      quiet();
      if (value === problem.factor) {
        abrir();
        return;
      }
      const mal = misconceptionForDial(problem.total, value);
      attempt(false, mal);
      if (mal) {
        // Encoger por el total aplasta todas las marcas contra el clavo: la
        // llave se traba y el jugador vuelve con el mismo gesto.
        jam.value = withSequence(
          withTiming(1, { duration: 80 }),
          withTiming(-1, { duration: 120 }),
          withTiming(0, { duration: 100 }),
        );
        setMessage({
          text: "Esa llave encoge mucho más de lo que se estiró. ¿Cuánto se estiró?",
          tone: "warn",
        });
        return;
      }
      setMessage({
        text:
          value > problem.factor
            ? "Se pasó: las marcas quedaron más juntas que las de la testigo. Aflojá."
            : "Todavía falta. Seguí girando desde donde quedó.",
        tone: "warn",
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [solved, problem.factor, problem.total, quiet, abrir, attempt, jam],
  );

  /**
   * Soltar una llave sobre la cerradura. La de encoger entra y queda para
   * girar; las otras dos hacen lo suyo a la vista y la banda vuelve sola,
   * porque el juego ejecuta la respuesta del jugador en vez de calificarla.
   */
  const dropKey = useCallback(
    (index: number, x: number, y: number) => {
      const key = problem.keys[index];
      const slot = keys[index];
      const home = cl.keys[index];
      if (!key || !slot || !home || solved) return;
      // El blanco de la cerradura, con tolerancia: la mano de un chico de cinco
      // no apunta fino, y el diseño pide blancos grandes y drop generoso.
      const cerca = Math.hypot(x - cl.crank.x, y - cl.crank.y) < cl.crank.r * 1.8;
      const volver = (): void => {
        slot.dx.value = withTiming(0, { duration: theme.motion.base });
        slot.dy.value = withTiming(0, { duration: theme.motion.base });
        (slot.spin as SharedValue<number>).value = withTiming(0, { duration: theme.motion.base });
      };
      if (!cerca) {
        volver();
        return;
      }
      quiet();

      if (key.kind === "cut") {
        // Recortar deja el largo bien y las marcas separadas. La testigo al lado
        // es el mensaje: nadie dice "mal".
        attempt(false, MIS_DIV_INVERSE);
        const cut = (bands[0] as BandValues).cut as SharedValue<number>;
        cut.value = withSequence(
          withTiming(1, { duration: theme.motion.morph }),
          withTiming(1, { duration: 900 }),
          withTiming(0, { duration: theme.motion.morph }),
        );
        volver();
        setMessage({ text: "El largo quedó bien. ¿Y las marcas del medio?", tone: "warn" });
        return;
      }
      if (key.kind === "stretch") {
        attempt(false, MIS_DIV_INVERSE);
        (bands[0] as BandValues).factor.value = withSequence(
          withTiming(Math.min(problem.factor * 2, problem.length / problem.rest), {
            duration: theme.motion.morph,
          }),
          withTiming(problem.factor, { duration: theme.motion.morph }),
        );
        volver();
        setMessage({ text: "Esa estira todavía más. La banda ya estaba estirada.", tone: "warn" });
        return;
      }

      // La llave de encoger entra. El dial arranca donde el nivel lo dejó.
      slot.dx.value = withTiming(cl.crank.x - home.x, { duration: theme.motion.quick });
      slot.dy.value = withTiming(cl.crank.y - home.y, { duration: theme.motion.quick });
      dial.value = problem.dialStart;
      montada.value = index;
      turned.value = 0;
      (bands[0] as BandValues).factor.value = withTiming(problem.factor / problem.dialStart, {
        duration: theme.motion.base,
      });
      setMounted(index);
      setMessage({ text: "La llave entró. Ahora girá hasta que las marcas coincidan.", tone: "dim" });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [problem, cl, solved, quiet, attempt],
  );

  // --- Las dos animaciones ---------------------------------------------------

  const pickBand = useCallback(
    (row: number) => {
      if (solved) return;
      quiet();
      setPicked(row);
      const ok = row === problem.liar;
      attempt(ok);
      if (ok) {
        succeed("Esa cortó el extremo: el largo coincide y las marcas del medio no.");
      } else {
        setMessage({
          text: "En esa las marcas volvieron a caer sobre la testigo. Esa sí devuelve.",
          tone: "warn",
        });
      }
    },
    [solved, problem.liar, attempt, quiet, succeed],
  );

  // --- El piso y las fichas --------------------------------------------------

  const summonBand = useCallback(() => {
    if (!level.bandOnDemand) return;
    bandAppear.value = withTiming(1, { duration: theme.motion.base });
    setMessage({ text: "Ahí está la banda. La expresión dice lo mismo.", tone: "dim" });
  }, [level.bandOnDemand, bandAppear]);

  const pickOption = useCallback(
    (option: DivOption) => {
      if (solved) return;
      quiet();
      attempt(option.correct, option.misconception);
      if (option.correct) {
        token.value = withTiming(1, { duration: theme.motion.base });
        keysV.value = withTiming(1, { duration: theme.motion.morph });
        succeed(
          ask === "leftover"
            ? "Esas son las filas enteras. Lo que sobró quedó afuera, sin manera de anotarlo."
            : ask === "ghost"
              ? "Ese es el resultado: el factor que estira el segundo hasta el primero."
              : "Ese es el lado que la pared tapaba, y no hizo falta desarmar nada.",
        );
        return;
      }
      // El juego ejecuta la respuesta del jugador: con esa cantidad de filas el
      // rectángulo no cierra, y se ve.
      placed.value = withTiming(Math.max(0, Math.min(problem.rows, option.value)), {
        duration: theme.motion.morph,
      }, (ok) => {
        if (ok) placed.value = withTiming(problem.rows, { duration: theme.motion.morph });
      });
      setMessage({
        text:
          option.lure === "subtracted"
            ? "Restar no deshace un estirado. ¿Cuántas filas de ese lado entran?"
            : option.lure === "with_leftover"
              ? "Esa fila quedó más larga. ¿Todas las filas tienen que medir lo mismo?"
              : ask === "ghost"
                ? "Con ese factor la banda no vuelve al largo de la testigo."
                : "Con ese número el rectángulo no cierra.",
        tone: "warn",
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [solved, ask, problem.rows, attempt, quiet, succeed, token, keysV, placed],
  );

  // --- Las vueltas arbitrarias -----------------------------------------------

  const pickAction = useCallback(
    (index: number) => {
      const a = problem.actions[index];
      const slot = keys[index];
      if (!a || solved) return;
      quiet();
      attempt(a.correct);
      if (a.correct) {
        open.value = withTiming(1, { duration: theme.motion.base });
        succeed(
          a.uninvertible
            ? "Ese cofre no tiene llave: la acción borró lo que había y no hay vuelta."
            : "Esa es la que deshace, y con el parámetro justo: el cofre se abrió.",
        );
        return;
      }
      if (slot) {
        slot.dx.value = withSequence(
          withTiming(-7, { duration: 70 }),
          withTiming(7, { duration: 110 }),
          withTiming(0, { duration: 90 }),
        );
      }
      setMessage({
        text: a.uninvertible
          ? "Esta cerradura sí tiene vuelta. Buscá la acción que la deshace."
          : "Esa no devuelve el cofre a como estaba. Mirá cuánto se movió.",
        tone: "warn",
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [problem.actions, solved, quiet, attempt, open, succeed],
  );

  // --- Gestos ----------------------------------------------------------------

  /**
   * Las acciones en una referencia estable. El objeto del `Gesture` no puede
   * cambiar de identidad entre renders: gesture-handler en web pierde el gesto
   * si cambia, y el giro se corta a mitad de camino.
   */
  const acciones = useRef({ released, pickBand, summonBand, dropKey, pickAction });
  acciones.current = { released, pickBand, summonBand, dropKey, pickAction };
  const alSoltar = useCallback((v: number) => acciones.current.released(v), []);
  const alElegirBanda = useCallback((r: number) => acciones.current.pickBand(r), []);
  const alPedirBanda = useCallback(() => acciones.current.summonBand(), []);
  const alSoltarLlave = useCallback((i: number, x: number, y: number) => {
    acciones.current.dropKey(i, x, y);
  }, []);
  const alElegirAccion = useCallback((i: number) => acciones.current.pickAction(i), []);

  const lockX = cl.crank.x;
  const lockY = cl.crank.y;
  const bandYs = useMemo(() => sl.nails.slice(0, 2).map((n) => n.y), [sl]);
  const esWhich = ask === "which";
  const esShrink = ask === "shrink";
  const pedirBanda = level.bandOnDemand;

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .onBegin((e) => {
          // Sin llave puesta no hay nada que girar, y el dedo no agarra nada.
          if (esShrink && montada.value >= 0) {
            sujeto.value = 1;
            anchorDial.value = dial.value;
            turned.value = 0;
            lastAngle.value = Math.atan2(e.y - lockY, e.x - lockX);
            return;
          }
          sujeto.value = 0;
        })
        .onChange((e) => {
          if (sujeto.value !== 1) return;
          const a = Math.atan2(e.y - lockY, e.x - lockX);
          let d = a - lastAngle.value;
          while (d > Math.PI) d -= 2 * Math.PI;
          while (d < -Math.PI) d += 2 * Math.PI;
          turned.value += d;
          lastAngle.value = a;
          // La llave sigue al dedo, y el dial cae en muescas: redondear acá es
          // lo que hace imposible el medio giro.
          const sv = spins[montada.value];
          if (sv) sv.value = turned.value;
          const crudo = anchorDial.value + Math.round(turned.value / NOTCH);
          const d2 = Math.max(1, Math.min(dialMax.value, crudo));
          if (d2 === dial.value) return;
          dial.value = d2;
          (bands[0] as BandValues).factor.value = withTiming(factorSV.value / d2, {
            duration: 170,
          });
        })
        .onEnd(() => {
          if (sujeto.value !== 1) return;
          sujeto.value = 0;
          runOnJS(alSoltar)(dial.value);
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [esShrink, lockX, lockY, spins, alSoltar],
  );

  const tap = useMemo(
    () =>
      Gesture.Tap()
        .maxDistance(26)
        .onEnd((e) => {
          if (esWhich) {
            let row = 0;
            let best = Infinity;
            for (let i = 0; i < bandYs.length; i++) {
              const d = Math.abs(e.y - (bandYs[i] as number));
              if (d < best) {
                best = d;
                row = i;
              }
            }
            runOnJS(alElegirBanda)(row);
            return;
          }
          if (pedirBanda) runOnJS(alPedirBanda)();
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [esWhich, pedirBanda, bandYs, alElegirBanda, alPedirBanda],
  );

  // Carrera y no exclusiva: el arrastre gana si el dedo se mueve y el toque gana
  // si se levanta rápido. Encadenados en exclusiva, un gesto deshabilitado
  // bloquea a los que vienen detrás.
  const canvasGesture = useMemo(() => Gesture.Race(pan, tap), [pan, tap]);

  const conLlaves = ask === "shrink" || ask === "undo";
  const conFichas = problem.options.length > 0;

  return (
    <View style={styles.root}>
      <Pressable onPress={onExit} style={styles.back} hitSlop={theme.hitSlop}>
        <Text style={styles.backLabel}>{t("game.back")}</Text>
      </Pressable>

      <Header
        title={`${t(`node.${NODE_DIV_UNDO_MUL}.name`)} · nivel ${level.n} de ${TOTAL_DIV_LEVELS}`}
        subtitle={t(level.titleKey)}
        round={round}
        rounds={level.rounds}
      />

      <View style={{ width, height: sceneH }}>
        {/* Un solo lienzo por pantalla: las tres escenas viven adentro y las que
            no juegan esta ronda se quedan en opacidad cero. */}
        <Canvas style={{ width, height: sceneH }}>
          <TilesScene
            config={tilesConfig}
            layout={tl}
            placed={placed}
            spin={spin}
            split={split}
            keys={keysV}
            cross={cross}
            token={token}
            ghost={ghost}
            hint={hint}
            demo={demo}
            rows={[] as readonly RowSlot[]}
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
            guess={null}
            appear={bandAppear}
          />
          <ChestScene
            problem={chestProblem}
            level={chestLevel}
            layout={cl}
            pos={pos}
            open={open}
            outArrow={outArrow}
            backArrow={backArrow}
            leftover={leftoverArrow}
            jam={jam}
            hint={hint}
            demo={demo}
            clock={clock}
            ruler={rulerV}
            line={lineV}
            appear={chestAppear}
            mounted={mounted}
            at={0}
            picked={-1}
            composed={null}
            placed={null}
            keys={keys}
            tiles={chestTiles}
          />
        </Canvas>

        {/* El gesto va encima del lienzo: Skia dibuja, la vista escucha. */}
        <GestureDetector gesture={canvasGesture}>
          <Animated.View style={StyleSheet.absoluteFill} />
        </GestureDetector>

        {/* Las asas invisibles sobre las llaves dibujadas. Siempre montadas: una
            ronda que las desmonta deja al detector de la siguiente sin
            enganchar, y el arrastre se pierde sin decir nada. */}
        {Array.from({ length: KEY_SLOTS }, (_, i) => {
          const viva = ask === "undo" ? i < problem.actions.length : i < problem.keys.length;
          return (
            <Handle
              key={`k${i}`}
              index={i}
              spot={cl.keys[i] ?? { x: 0, y: 0 }}
              slot={keys[i] as Slot}
              w={cl.keyW}
              h={cl.keyH}
              enabled={conLlaves && viva && !solved}
              drag={ask === "shrink"}
              onDrop={alSoltarLlave}
              onTap={ask === "undo" ? alElegirAccion : noop}
            />
          );
        })}
      </View>

      <Hint text={message.text} tone={message.tone} />

      {/* Las fichas de las rondas de piso y de expresión. */}
      {conFichas ? (
        <View style={styles.ring}>
          {Array.from({ length: DIV_OPTION_SLOTS }, (_, i) => {
            const option = problem.options[i];
            if (!option) return <View key={i} style={styles.chipGhost} />;
            return (
              <Pressable
                key={option.id}
                disabled={solved}
                onPress={() => pickOption(option)}
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

const noop = (): void => {};

/** Un asa invisible sobre la pieza dibujada: el dibujo es Skia, el gesto es la vista. */
function Handle({
  index,
  slot,
  spot,
  w,
  h,
  enabled,
  drag,
  onDrop,
  onTap,
}: {
  readonly index: number;
  readonly slot: Slot;
  readonly spot: { x: number; y: number };
  readonly w: number;
  readonly h: number;
  readonly enabled: boolean;
  readonly drag: boolean;
  readonly onDrop: (index: number, absX: number, absY: number) => void;
  readonly onTap: (index: number) => void;
}) {
  const gesture = useMemo(() => {
    const pan = Gesture.Pan()
      .enabled(enabled && drag)
      .onChange((e) => {
        slot.dx.value = e.translationX;
        slot.dy.value = e.translationY;
      })
      .onEnd((e) => {
        // Dónde quedó la pieza, en coordenadas del lienzo. Sale de dónde estaba
        // más cuánto se movió, y no de la posición absoluta del dedo: `onLayout`
        // en web devuelve el origen del padre y dejaría el hit test corrido por
        // la altura del encabezado.
        runOnJS(onDrop)(index, spot.x + e.translationX, spot.y + e.translationY);
      });
    const tap = Gesture.Tap()
      .maxDistance(20)
      .enabled(enabled)
      .onEnd(() => {
        runOnJS(onTap)(index);
      });
    return Gesture.Race(pan, tap);
  }, [enabled, drag, index, slot, spot.x, spot.y, onDrop, onTap]);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={{ position: "absolute", left: spot.x - w / 2, top: spot.y - h / 2, width: w, height: h }}
      />
    </GestureDetector>
  );
}

/**
 * Las agujas de una pieza, en un objeto que no cambia de identidad. Si cambiara,
 * el gesto de su asa se volvería a crear en cada render y el detector tendría
 * que reengancharlo, que es como se pierde un arrastre a mitad de camino.
 */
function useSlot(): Slot {
  const dx = useSharedValue(0);
  const dy = useSharedValue(0);
  const alive = useSharedValue(0);
  const spin = useSharedValue(0);
  return useMemo(() => ({ dx, dy, alive, spin }), [dx, dy, alive, spin]);
}

function useBand(): BandValues {
  const factor = useSharedValue(1);
  const deform = useSharedValue(0);
  const cut = useSharedValue(0);
  return useMemo(() => ({ factor, deform, cut }), [factor, deform, cut]);
}

function openingHint(ask: string): string {
  switch (ask) {
    case "shrink":
      return "Llevá una llave a la cerradura y girala hasta que las marcas coincidan.";
    case "which":
      return "Una de las dos no devuelve la banda. Tocala.";
    case "wall":
      return "La pared tapa un lado. Tocá la ficha que dice cuánto mide.";
    case "ghost":
      return "Tocá la pantalla para ver la banda, y elegí el resultado.";
    case "leftover":
      return "Tocá cuántas filas enteras salieron. Lo que sobra queda a la vista.";
    default:
      return "Dividir es encontrar el factor que estira uno hasta el otro, y también partir en partes iguales. Hay acciones que no tienen vuelta: tocá la que deshace, o la ficha del cofre sin llave.";
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
