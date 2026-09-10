/**
 * El libro de frutas: el minijuego de `alg.sys.two_by_two`.
 *
 * El jugador viene del nodo 14 sabiendo abrir una caja y del 15 sabiendo
 * repartir un producto. Acá tiene **dos cajas que se estorban**, y por eso el
 * objeto central no es una ecuación sino un cartel con dos renglones que
 * responden a la vez.
 *
 * Las dos ideas del nodo son movimientos sobre objetos y no recetas:
 *
 * - **sustituir** es tocar una fruta cuyo valor ya se sabe y verla salir de
 *   **las dos filas al mismo tiempo**, dejando sus pesas del otro lado de la
 *   línea. Nunca se va de una sola: `sysSubstituteAll` no tiene manera de
 *   hacerlo, y esa imposibilidad es el invariante silencioso del diseño;
 * - **eliminar** es volcar un renglón sobre el otro y ver que la fruta que
 *   aparece con signos opuestos se va sola. Nadie la borra: los coeficientes se
 *   suman y queda en cero.
 *
 * Las tres escenas son las que ya estaban, con props aditivas:
 *
 * - `LedgerScene` (nodo 10) dibuja el cartel. El libro de N filas con un dueño
 *   por fila no alcanzaba para un renglón que suma dos clases y afirma un
 *   total, así que la escena recibió tramos, totales e inclinación. Una fila sin
 *   tramos sigue dibujándose exactamente como antes;
 * - `BalanceScene` (nodos 11 y 13) es el fantasma a demanda: dice que cada
 *   renglón es una balanza acostada, y es donde corre la repetición del error
 *   del catálogo, que declara `balance` como mecánica;
 * - `StretchScene` (nodo 5) dibuja el plano desde el penúltimo nivel. La banda
 *   es `grid_stretch` en una dimensión y el plano es la misma mecánica con un
 *   eje más.
 *
 * El avance no depende de que corra la animación: cada movimiento se confirma
 * con un temporizador de JavaScript y no con el callback de `withTiming`, y la
 * fila rota cambia de color además de inclinarse. Con el panel del navegador
 * oculto `requestAnimationFrame` se estrangula, y una partida atada a un cuadro
 * se congelaría sin que nada lo diga.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Canvas, Group, Path, Skia, type SkPath } from "@shopify/react-native-skia";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  cancelAnimation,
  runOnJS,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { getGlyph } from "@mathy/glyphs";
import { pathFor } from "@mathy/viz-skia";
import {
  NODE_TWO_BY_TWO,
  SYS_CHIP_SLOTS,
  SYS_FACTOR_SLOTS,
  SYS_ROW_SLOTS,
  TOTAL_SYS_LEVELS,
  generateSystems,
  sysCoef,
  sysEliminationPlan,
  sysLineOf,
  sysMisconceptionFor,
  sysPour,
  sysScale,
  sysSolved,
  sysState,
  sysSubstituteAll,
  sysTilt,
  type SysFruit,
  type SysKind,
  type SysLevel,
  type SysRow,
} from "@mathy/mechanics";
import type { Event } from "@mathy/progress";
import {
  LedgerScene,
  colorOfKind,
  ledgerLayout,
  type LedgerConfig,
  type LedgerKind,
  type LedgerSegment,
  type LedgerSpot,
} from "../scenes/LedgerScene.tsx";
import { BalanceScene, MAX_TILT, balanceLayout, boxFootprint } from "../scenes/BalanceScene.tsx";
import { StretchScene, stretchLayout, type StretchConfig } from "../scenes/StretchScene.tsx";
import { Header, Hint } from "../ui/Chrome.tsx";
import { ActivityShell, useActivityViewport } from "../ui/ActivityShell.tsx";
import { t } from "../i18n.ts";
import { theme } from "../ui/theme.ts";

/** Radio del blanco donde entra una ficha soltada sobre el cartel. */
const DROP_R = 74;
/** Las dos frutas del cartel, con la letra que cada una recibe en el morph. */
const FRUITS: readonly LedgerKind[] = [
  { shape: "apple", mark: -1, closed: false, letter: "x" },
  { shape: "pear", mark: -1, closed: false, letter: "y" },
];

const numeral = (v: number): string => (v < 0 ? `−${-v}` : String(v));

/** El color de una fruta. El mismo que le da el cartel, para que sea la misma. */
const colorDeFruta = (i: number): string => colorOfKind(FRUITS[i], i);

/** Una cadena de glifos del atlas, centrada. El mismo atlas que las ecuaciones. */
function addGlyphs(target: SkPath, text: string, cx: number, cy: number, size: number): void {
  const chars = [...text];
  let advance = 0;
  for (const c of chars) advance += getGlyph(c)?.advance ?? 0.5;
  let x = cx - (advance * size) / 2;
  const baseline = cy + size * 0.333;
  for (const c of chars) {
    const glyph = getGlyph(c);
    const src = pathFor(c);
    if (glyph && src) {
      const copy = src.copy();
      copy.transform([size, 0, x, 0, size, baseline, 0, 0, 1]);
      target.addPath(copy);
    }
    x += (glyph?.advance ?? 0.5) * size;
  }
}

export interface SystemsGameProps {
  readonly level: SysLevel;
  /** Cuántos niveles quedaron atrás; con eso crecen la chuleta y la calculadora. */
  readonly levelsDone: number;
  readonly onLevelDone: () => void;
  readonly onExit: () => void;
  /** Cada movimiento del jugador, tal como se guarda. La actividad no persiste nada. */
  readonly onEvent: (event: Event) => void;
}

export function SystemsGame(props: SystemsGameProps) {
  return (
    <ActivityShell levelsDone={props.levelsDone}>
      <Activity {...props} />
    </ActivityShell>
  );
}

function Activity({ level, onLevelDone, onExit, onEvent }: SystemsGameProps) {
  // El lienzo mide lo que le deja el panel abierto, no la ventana entera.
  const { width, height } = useActivityViewport();
  const [round, setRound] = useState(0);
  const [seedBase] = useState(() => Math.floor(Math.random() * 100000));

  const problem = useMemo(
    () => generateSystems(level, seedBase + round * 1000 + level.n, round),
    [level, round, seedBase],
  );

  /** Las filas de ahora. Volcar agrega una; sustituir reescribe las que hay. */
  const [rows, setRows] = useState<readonly SysRow[]>(problem.rows);
  /** Lo que vale cada fruta. Una sola tabla para todo el cartel, a propósito. */
  const [values, setValues] = useState<readonly (number | null)[]>([null, null]);
  const [chip, setChip] = useState(-1);
  const [factor, setFactor] = useState(-1);
  const [heldRow, setHeldRow] = useState(-1);
  /** Los pares ya encontrados en el nivel de la fila sola. */
  const [found, setFound] = useState<readonly string[]>([]);
  const [solved, setSolved] = useState(false);
  const [balanceOn, setBalanceOn] = useState(false);
  const [balanceRow, setBalanceRow] = useState(0);
  const [gridOn, setGridOn] = useState(level.asks.includes("classify"));
  const [message, setMessage] = useState<{ text: string; tone: "dim" | "ok" | "warn" }>(() => ({
    text: t(openingHint(problem.ask)),
    tone: "dim",
  }));

  // --- Medidas ---------------------------------------------------------------

  const sceneH = Math.max(380, Math.min(height * 0.64, 560));
  // La columna del costado la decide el **nivel** y no el interruptor: si el
  // ancho cambiara al pedir la balanza, el cartel y el mostrador se moverían
  // debajo del dedo en mitad de una ronda. Guardarla la apaga, no le devuelve
  // el espacio.
  const conCostado = level.balance !== "hidden" || level.grid;
  const sideW = conCostado ? Math.round(width * 0.34) : 0;
  const cartelW = Math.max(width - sideW, 200);

  // --- El cartel -------------------------------------------------------------

  const segments = useMemo<readonly (readonly LedgerSegment[])[]>(
    () =>
      rows.map((r) =>
        r.terms.map((term) => ({
          kind: term.fruit,
          count: Math.abs(term.coef),
          sign: (term.coef < 0 ? -1 : 1) as 1 | -1,
          value: values[term.fruit] ?? null,
        })),
      ),
    [rows, values],
  );

  const ledgerCfg = useMemo<LedgerConfig>(
    () => ({
      kinds: FRUITS,
      tokens: [],
      skin: level.skin,
      rows: rows.length,
      owner: [],
      counts: [],
      tree: [],
      leaf: -1,
      // El renglón del cartel es ancho: lleva los tramos, la línea y el total.
      capacity: 14,
      // La balanza la dibuja `BalanceScene` en su propia columna, así que el
      // libro no tiene que reservarle lugar adentro.
      balance: false,
      // Las fichas numéricas son de este nodo y se dibujan acá: el mostrador del
      // libro sería una segunda línea donde nunca se apoya nada.
      counter: false,
      segments,
      totals: rows.map((r) => r.total),
      tilts: rows.map((r) => sysTilt(r, values)),
      brace: level.brace,
    }),
    [level.skin, level.brace, rows, segments, values],
  );

  const ll = useMemo(
    () => ledgerLayout(ledgerCfg, cartelW, sceneH, SYS_ROW_SLOTS, 0),
    [ledgerCfg, cartelW, sceneH],
  );

  /**
   * Las frutas que el problema puso en juego. No se leen de las filas de ahora
   * porque reemplazar una la saca del cartel sin que deje de tener valor.
   */
  const enJuego = useMemo(
    () => new Set(problem.rows.flatMap((r) => r.terms.map((term) => term.fruit))),
    [problem.rows],
  );

  /** Dónde espera cada ficha del mostrador y cada ficha de factor. */
  const chipSpots = useMemo<readonly LedgerSpot[]>(() => {
    const paso = Math.min(cartelW / (SYS_CHIP_SLOTS + 1), 68);
    return Array.from({ length: SYS_CHIP_SLOTS }, (_, i) => ({
      x: cartelW / 2 + (i - (SYS_CHIP_SLOTS - 1) / 2) * paso,
      y: sceneH - 74,
    }));
  }, [cartelW, sceneH]);

  const factorSpots = useMemo<readonly LedgerSpot[]>(() => {
    const paso = Math.min(cartelW / (SYS_FACTOR_SLOTS + 1), 68);
    return Array.from({ length: SYS_FACTOR_SLOTS }, (_, i) => ({
      x: cartelW / 2 + (i - (SYS_FACTOR_SLOTS - 1) / 2) * paso,
      y: sceneH - 24,
    }));
  }, [cartelW, sceneH]);

  /** El asa de cada renglón: lo que se agarra para volcarlo o para agrandarlo. */
  const rowGrips = useMemo<readonly LedgerSpot[]>(
    () =>
      ll.rows.map((box) => ({ x: box.x + box.w + 22, y: box.y + box.h / 2 })),
    [ll.rows],
  );

  // --- Lo que la actividad dibuja por su cuenta ------------------------------

  const trayGeom = useMemo(() => {
    const cuerpo = Skia.Path.Make();
    const digitos = Skia.Path.Make();
    problem.chips.forEach((v, i) => {
      const s = chipSpots[i];
      if (!s) return;
      cuerpo.addRRect(Skia.RRectXY(Skia.XYWHRect(s.x - 22, s.y - 17, 44, 34), 6, 6));
      addGlyphs(digitos, numeral(v), s.x, s.y, 20);
    });
    return { cuerpo, digitos };
  }, [problem.chips, chipSpots]);

  const factorGeom = useMemo(() => {
    const cuerpo = Skia.Path.Make();
    const digitos = Skia.Path.Make();
    problem.factors.forEach((v, i) => {
      const s = factorSpots[i];
      if (!s) return;
      cuerpo.addCircle(s.x, s.y, 17);
      addGlyphs(digitos, `×${v}`, s.x, s.y, 16);
    });
    return { cuerpo, digitos };
  }, [problem.factors, factorSpots]);

  const gripGeom = useMemo(() => {
    const p = Skia.Path.Make();
    for (let i = 0; i < rows.length; i++) {
      const s = rowGrips[i];
      if (!s) continue;
      p.addCircle(s.x, s.y, 11);
    }
    return p;
  }, [rows.length, rowGrips]);

  /** El halo de lo que el jugador tiene en la mano: la ficha o el renglón. */
  const pickedGeom = useMemo(() => {
    const p = Skia.Path.Make();
    const s = chip >= 0 ? chipSpots[chip] : undefined;
    if (s) p.addRRect(Skia.RRectXY(Skia.XYWHRect(s.x - 26, s.y - 21, 52, 42), 8, 8));
    const f = factor >= 0 ? factorSpots[factor] : undefined;
    if (f) p.addCircle(f.x, f.y, 21);
    const g = heldRow >= 0 ? rowGrips[heldRow] : undefined;
    if (g) p.addCircle(g.x, g.y, 16);
    return p;
  }, [chip, factor, heldRow, chipSpots, factorSpots, rowGrips]);

  // --- La balanza fantasma ---------------------------------------------------

  const fila = rows[Math.min(balanceRow, Math.max(rows.length - 1, 0))];
  // Los platos sobresalen del ancho que la balanza recibe, así que la columna se
  // le da con margen y la escena se centra adentro. Sin eso el plato derecho se
  // corta contra el borde de la pantalla.
  const balanceW = Math.max(sideW * 0.82, 1);
  const balanceX = cartelW + sideW * 0.09;
  const balanceH = sceneH * 0.78;

  /**
   * La fila repartida en dos platos. Un tramo restado **cruza la línea**: la
   * fila `2🍎 − 2🍌 = 10` es la balanza `2🍎` contra `10 y 2🍌`, y dibujarla con
   * las dos frutas del mismo lado diría que se suman. Es la misma cuenta leída
   * al derecho, así que la inclinación no cambia.
   */
  const platos = useMemo(() => {
    let izquierda = 0;
    let derecha = fila?.total ?? 0;
    const abiertas: { readonly fruit: SysFruit; readonly count: number; readonly lado: 1 | -1 }[] = [];
    for (const term of fila?.terms ?? []) {
      const v = values[term.fruit];
      const lado: 1 | -1 = term.coef < 0 ? -1 : 1;
      if (v !== null && v !== undefined) {
        if (lado > 0) izquierda += term.coef * v;
        else derecha += Math.abs(term.coef) * v;
      } else {
        abiertas.push({ fruit: term.fruit, count: Math.abs(term.coef), lado });
      }
    }
    return { izquierda, derecha, abiertas };
  }, [fila, values]);

  const balanceContents = useMemo(() => {
    const izq = { boxes: 0, units: platos.izquierda };
    const der = { boxes: 0, units: platos.derecha };
    return { leftBefore: izq, rightBefore: der, leftAfter: izq, rightAfter: der, deltaSign: 0 };
  }, [platos]);

  /**
   * Las frutas sin valor, dibujadas encima del plato que les toca. Cuelgan del
   * grupo del plato, así que se inclinan con la barra sin repetir la
   * trigonometría; `boxFootprint` dice dónde termina el plato para no tener dos
   * fuentes de la misma medida.
   */
  const overlayGeom = useMemo(() => {
    const bl = balanceLayout(balanceW, balanceH);
    const pie = boxFootprint(bl, level.layer === "concrete" ? "concrete" : "visual");
    const izquierda = FRUITS.map(() => Skia.Path.Make());
    const derecha = FRUITS.map(() => Skia.Path.Make());
    let xi = -pie.w / 2;
    let xd = -pie.w / 2;
    for (const abierta of platos.abiertas) {
      const destino = abierta.lado > 0 ? izquierda : derecha;
      const p = destino[abierta.fruit];
      if (!p) continue;
      for (let i = 0; i < abierta.count; i++) {
        if (abierta.lado > 0) {
          p.addCircle(xi + 9, pie.yBase - 11, 8);
          xi += 20;
        } else {
          p.addCircle(xd + 9, pie.yBase - 11, 8);
          xd += 20;
        }
      }
    }
    return { izquierda, derecha };
  }, [platos, balanceW, balanceH, level.layer]);

  // --- El plano --------------------------------------------------------------

  const planeCfg = useMemo<StretchConfig>(() => {
    const x = problem.solution[0];
    const y = problem.solution[1];
    /**
     * Cuánto plano se ve. Sale de dónde cada recta corta los ejes y no de un
     * número fijo: con una ventana chica, dos paralelas se cruzan la esquina y
     * el jugador no ve que son dos. Se toma el corte más cercano de cada recta,
     * porque el otro puede estar lejísimos y dejaría el dibujo diminuto.
     */
    let alcance = 4;
    for (const r of problem.rows) {
      const linea = sysLineOf(r);
      const cortes: number[] = [];
      if (linea.a !== 0) cortes.push(Math.abs(linea.c / linea.a));
      if (linea.b !== 0) cortes.push(Math.abs(linea.c / linea.b));
      if (cortes.length > 0) alcance = Math.max(alcance, Math.min(...cortes));
    }
    if (x !== null) alcance = Math.max(alcance, Math.abs(x));
    if (y !== null) alcance = Math.max(alcance, Math.abs(y));
    const ventana = Math.min(16, Math.max(6, Math.ceil(alcance) + 2));
    const cruce =
      problem.kind === "unique" && x !== null && y !== null
        ? ([x, y] as const)
        : null;
    return {
      length: 1,
      flip: false,
      rest: 1,
      skin: "segment",
      numerals: false,
      target: null,
      drawings: [],
      bands: 1,
      gripBand: -1,
      crank: null,
      marks: [],
      plane: {
        window: ventana,
        // El sistema que se dibuja es el original: volcar una fila produce una
        // recta más, y el jugador está clasificando el sistema que le dieron.
        lines: problem.rows.map((r) => sysLineOf(r)),
        cross: cruce,
        // En el nivel de clasificar el cruce no se regala: se marca cuando el
        // jugador ya dijo de qué clase es.
        showCross: !level.definition || solved,
      },
    };
  }, [problem.rows, problem.solution, problem.kind, level.definition, solved]);

  const pl = useMemo(
    () => stretchLayout(planeCfg, Math.max(sideW, 1), sceneH),
    [planeCfg, sideW, sceneH],
  );

  // --- Lo que se anima -------------------------------------------------------

  const pulse = useSharedValue(0);
  const demo = useSharedValue(0);
  const appear = useSharedValue(1);
  const balanceAppear = useSharedValue(0);
  const gridAppear = useSharedValue(0);
  const balanceTilt = useSharedValue(0);
  const replay = useSharedValue(0);
  /**
   * Un cero compartido. Las escenas reusadas piden agujas que este nodo no
   * mueve, y una sola apagada las cubre a todas sin montar diez valores
   * muertos. Nunca cambia de valor.
   */
  const quieto = useSharedValue(0);
  const dragIdx = useSharedValue(-1);
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);

  const shownAt = useRef(Date.now());
  const doneRef = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  /** Un temporizador que se cancela solo al cambiar de ronda o de pantalla. */
  const luego = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  useEffect(() => {
    shownAt.current = Date.now();
    doneRef.current = false;
    setRows(problem.rows);
    setValues([null, null]);
    setChip(-1);
    setFactor(-1);
    setHeldRow(-1);
    setFound([]);
    setSolved(false);
    setBalanceOn(false);
    setBalanceRow(0);
    setGridOn(level.asks.includes("classify"));
    setMessage({ text: t(openingHint(problem.ask)), tone: "dim" });
    balanceAppear.value = 0;
    gridAppear.value = level.asks.includes("classify") ? 1 : 0;
    balanceTilt.value = 0;
    replay.value = 0;
    dragIdx.value = -1;
    // El latido de la demostración: la mano fantasma lleva una ficha bajo la
    // primera fruta y las dos filas responden a la vez.
    pulse.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
    demo.value = withRepeat(
      withSequence(withTiming(1, { duration: 1500 }), withTiming(0, { duration: 1 })),
      -1,
      false,
    );
    return () => {
      cancelAnimation(pulse);
      cancelAnimation(demo);
      for (const id of timers.current) clearTimeout(id);
      timers.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem]);

  // La capa vista se registra al entrar y no al terminar: es lo que hace crecer
  // la chuleta, y el jugador ya la vio.
  useEffect(() => {
    onEvent({ kind: "sawLayer", at: Date.now(), node: NODE_TWO_BY_TWO, layer: level.layer });
  }, [level.layer, onEvent]);

  // --- Movimientos -----------------------------------------------------------

  /**
   * Un movimiento del jugador, contado para cada verbo que el nivel ejercita.
   * El campo `misconception` solo viaja cuando el catálogo de L tiene una
   * entrada que apunta a este nodo: el modelo ya lo resolvió y acá no se
   * inventa ninguno.
   */
  const attempt = useCallback(
    (correct: boolean, misconception?: string) => {
      const at = Date.now();
      const latency = at - shownAt.current;
      for (const evidence of level.evidence) {
        onEvent({
          kind: "attempt",
          at,
          node: NODE_TWO_BY_TWO,
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
    cancelAnimation(demo);
    demo.value = withTiming(0, { duration: 260 });
  }, [demo]);

  const nextRound = useCallback(() => {
    if (round + 1 >= level.rounds) {
      onEvent({ kind: "levelDone", at: Date.now(), node: NODE_TWO_BY_TWO, level: level.n });
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
      luego(nextRound, 2100);
    },
    [nextRound, quiet, luego],
  );

  /**
   * La verificación del diseño: los valores vuelven a las filas originales y
   * las dos siguen derechas. Cuesta una línea porque el modelo nunca perdió las
   * filas de origen. Sin nada que deshacer no se anuncia: en el nivel de la
   * fila sola no se transformó nada y el cartel ya está como empezó.
   */
  const verificar = useCallback(
    (transformadas: boolean) => {
      if (!transformadas) return;
      setRows(problem.rows);
      setMessage({ text: t("sys.hint.verified"), tone: "ok" });
    },
    [problem.rows],
  );

  /**
   * Lo que pasa después de cada movimiento sobre las filas: se mira cómo
   * quedaron las dos y de ahí sale todo, el veredicto, el mensaje y el error del
   * catálogo. Es una condición sobre el estado y no una lista de movimientos
   * prohibidos.
   */
  const revisar = useCallback(
    (proximas: readonly SysRow[], proximos: readonly (number | null)[], okText?: string) => {
      const mal = sysMisconceptionFor(level, proximas, proximos);
      const inclinadas = proximas.filter((r) => sysState(r, proximos) === "tilted").length;
      attempt(inclinadas === 0, mal);

      // El éxito pide las dos condiciones: todas las filas derechas y todas las
      // frutas del problema mostrando su valor. Una fila que se vació al
      // reemplazar está derecha y no dice cuánto vale nada.
      const todasDichas = [...enJuego].every((f) => proximos[f] !== null && proximos[f] !== undefined);
      if (sysSolved(proximas, proximos) && todasDichas) {
        const unaFila = problem.rows.length === 1;
        succeed(t(unaFila ? "sys.hint.solvedOne" : "sys.hint.solved"));
        const transformadas =
          proximas.length !== problem.rows.length ||
          proximas.some((r, i) => r !== problem.rows[i]);
        luego(() => verificar(transformadas), 1100);
        return;
      }
      if (mal) {
        // La repetición del error corre sobre la balanza, que es la mecánica
        // que el catálogo declara: la fila que se rompió se abre al costado y
        // se ve inclinarse, sin un cartel que lo explique.
        const cual = proximas.findIndex((r) => sysState(r, proximos) === "tilted");
        if (level.balance !== "hidden") {
          setBalanceRow(Math.max(0, cual));
          setBalanceOn(true);
          balanceAppear.value = withTiming(1, { duration: theme.motion.base });
          balanceTilt.value = withSequence(
            withTiming(sysTilt(proximas[cual] as SysRow, proximos) * MAX_TILT, { duration: 300 }),
            withTiming(sysTilt(proximas[cual] as SysRow, proximos) * MAX_TILT, { duration: 900 }),
          );
        }
        setMessage({ text: t("sys.hint.tilted"), tone: "warn" });
        return;
      }
      if (inclinadas > 0) {
        const unaFila = proximas.length === 1;
        setMessage({
          text: t(unaFila ? "sys.hint.tiltedOne" : "sys.hint.bothTilted"),
          tone: "warn",
        });
        return;
      }
      const seguir = proximas.length === 1 ? "sys.hint.keepGoingOne" : "sys.hint.keepGoing";
      setMessage({ text: okText ?? t(seguir), tone: okText ? "ok" : "dim" });
    },
    [level, enJuego, problem.rows, attempt, succeed, luego, verificar, balanceAppear, balanceTilt],
  );

  /**
   * Soltar una ficha bajo una fruta. Las dos filas responden a la vez, porque
   * el valor entra en una sola tabla y las dos lo leen de ahí.
   *
   * Qué ficha se suelta viaja como argumento y no sale del estado: al arrastrar,
   * la ficha se elige y se suelta en el mismo cuadro y el estado todavía no la
   * tiene.
   */
  const placeChip = useCallback(
    (fruit: SysFruit, which: number) => {
      if (solved) return;
      quiet();
      if (which < 0) {
        setMessage({ text: t("sys.hint.pickChip"), tone: "dim" });
        return;
      }
      const v = problem.chips[which];
      if (v === undefined) return;
      const proximos = values.map((old, i) => (i === fruit ? v : old));
      setValues(proximos);
      setChip(-1);

      // La fila sola: cada par que la deja derecha cuenta, y ninguno es "la"
      // respuesta. Es la dificultad principal del nodo, hecha gesto.
      if (problem.ask === "pairs") {
        const clave = proximos.join(",");
        const derecha = sysState(rows[0] as SysRow, proximos) === "straight";
        attempt(derecha || proximos.some((p) => p === null));
        if (!derecha) {
          setMessage({
            text: t(proximos.some((p) => p === null) ? "sys.hint.keepGoing" : "sys.hint.bothTilted"),
            tone: proximos.some((p) => p === null) ? "dim" : "warn",
          });
          return;
        }
        if (found.includes(clave)) {
          setMessage({ text: t("sys.hint.pairAgain"), tone: "dim" });
          return;
        }
        const proximosPares = [...found, clave];
        setFound(proximosPares);
        if (proximosPares.length >= problem.picks) {
          succeed(t("sys.hint.pairsDone"));
          return;
        }
        setMessage({ text: t("sys.hint.pairsMore"), tone: "ok" });
        // El par encontrado se despeja para que el siguiente se busque entero.
        luego(() => setValues([null, null]), 900);
        return;
      }

      revisar(rows, proximos);
    },
    [solved, quiet, problem, values, rows, found, attempt, succeed, luego, revisar],
  );

  /**
   * Tocar una fruta que ya mostró su valor la cambia por sus pesas en **las dos
   * filas**. El reemplazo nunca ocurre en una sola: `sysSubstituteAll` no tiene
   * cómo hacerlo.
   */
  const substitute = useCallback(
    (fruit: SysFruit) => {
      if (solved) return;
      quiet();
      const v = values[fruit];
      if (v === null || v === undefined) {
        setMessage({ text: t("sys.hint.needValue"), tone: "dim" });
        return;
      }
      if (!rows.some((r) => sysCoef(r, fruit) !== 0)) {
        setMessage({ text: t("sys.hint.alreadyGone"), tone: "dim" });
        return;
      }
      const proximas = sysSubstituteAll(rows, fruit, v);
      setRows(proximas);
      // La fruta ya cedió su lugar al nombre: desde `symbolic` lo que se va es
      // la incógnita, y llamarla fruta contradiría el morph que acaba de pasar.
      revisar(proximas, values, t(level.letters ? "sys.hint.substitutedLetter" : "sys.hint.substituted"));
    },
    [solved, quiet, values, rows, revisar, level.letters],
  );

  /** Volcar un renglón sobre otro: los dos lados se juntan en una fila nueva. */
  const pour = useCallback(
    (from: number, onto: number) => {
      if (solved) return;
      quiet();
      const a = rows[from];
      const b = rows[onto];
      if (!a || !b || from === onto) return;
      if (rows.length >= SYS_ROW_SLOTS) {
        setMessage({ text: t("sys.hint.noRoom"), tone: "dim" });
        return;
      }
      const plan = sysEliminationPlan(a, b);
      const signo: 1 | -1 = plan?.sign ?? 1;
      const nueva = sysPour(a, b, signo, `r${rows.length}`);
      const cancelo = nueva.terms.length < 2;
      const proximas = [...rows, nueva];
      setRows(proximas);
      setHeldRow(-1);
      // Volcar sin que se cancele nada es válido y no sirve: empujón suave, no
      // explicación. Ninguna entrada del catálogo apunta a este nodo para ese
      // movimiento, así que el `attempt` va sin campo.
      attempt(cancelo);
      setMessage({
        text: t(cancelo ? "sys.hint.poured" : "sys.hint.pouredNothing"),
        tone: cancelo ? "ok" : "dim",
      });
    },
    [solved, quiet, rows, attempt],
  );

  /** Agrandar una fila entera: todos sus términos crecen juntos, y el total. */
  const scale = useCallback(
    (index: number) => {
      if (solved) return;
      quiet();
      const k = problem.factors[factor];
      const fila0 = rows[index];
      if (k === undefined || !fila0) return;
      const proximas = rows.map((r, i) => (i === index ? sysScale(r, k) : r));
      setRows(proximas);
      setFactor(-1);
      // El factor sirve si acerca la eliminación: o las dos filas ya se pueden
      // volcar sin escalar más, o el plan que queda es más barato que el de
      // antes. Con `both_rows` la primera fila escalada todavía no cancela nada
      // y sin embargo es el paso correcto.
      const antes = rows[0] && rows[1] ? sysEliminationPlan(rows[0], rows[1]) : null;
      const a = proximas[0];
      const b = proximas[1];
      const plan = a && b ? sysEliminationPlan(a, b) : null;
      const listo = !!plan && plan.factors[0] === 1 && plan.factors[1] === 1;
      const masBarato =
        !!plan && !!antes && plan.factors[0] + plan.factors[1] < antes.factors[0] + antes.factors[1];
      const sirve = listo || masBarato;
      attempt(sirve);
      setMessage({
        text: t(sirve ? "sys.hint.scaled" : "sys.hint.wrongFactor"),
        tone: sirve ? "ok" : "warn",
      });
    },
    [solved, quiet, problem.factors, factor, rows, attempt],
  );

  /** Decir de qué clase es el sistema, con las rectas a la vista. */
  const classify = useCallback(
    (kind: SysKind) => {
      if (solved) return;
      quiet();
      const ok = kind === problem.kind;
      // Ninguna de las dos respuestas equivocadas está en el catálogo apuntando
      // a este nodo, así que el movimiento va sin campo.
      attempt(ok);
      if (ok) {
        succeed(t(`sys.hint.class.${problem.kind}`));
        return;
      }
      setMessage({ text: t("sys.hint.wrongClass"), tone: "warn" });
    },
    [solved, quiet, problem.kind, attempt, succeed],
  );

  // --- Tocar el cartel -------------------------------------------------------

  /**
   * Tocar un tramo. Con una ficha en la mano, la suelta bajo esa fruta; sin
   * ficha, cambia la fruta por sus pesas. Es un solo blanco porque es un solo
   * objeto: la fruta de esa fila.
   */
  const touchCell = useCallback(
    (index: number) => {
      const fila0 = rows[Math.floor(index / 2)];
      const term = fila0?.terms[index % 2];
      if (!term) return;
      if (chip >= 0) placeChip(term.fruit, chip);
      else substitute(term.fruit);
    },
    [rows, chip, placeChip, substitute],
  );

  /**
   * Tocar el asa de un renglón. Con un factor en la mano lo agranda; si no,
   * agarra el renglón y el segundo toque lo vuelca sobre el otro.
   */
  const touchGrip = useCallback(
    (index: number) => {
      if (solved) return;
      if (factor >= 0) {
        scale(index);
        return;
      }
      if (heldRow < 0) {
        setHeldRow(index);
        setMessage({ text: t("sys.hint.rowHeld"), tone: "dim" });
        return;
      }
      if (heldRow === index) {
        setHeldRow(-1);
        setMessage({ text: t(openingHint(problem.ask)), tone: "dim" });
        return;
      }
      pour(heldRow, index);
    },
    [solved, factor, scale, heldRow, pour, problem.ask],
  );

  const touchChip = useCallback(
    (index: number) => {
      if (solved) return;
      setFactor(-1);
      setChip((c) => (c === index ? -1 : index));
      setMessage({ text: t("sys.hint.chipHeld"), tone: "dim" });
    },
    [solved],
  );

  const touchFactor = useCallback(
    (index: number) => {
      if (solved) return;
      setChip(-1);
      setFactor((f) => (f === index ? -1 : index));
      setMessage({ text: t("sys.hint.factorHeld"), tone: "dim" });
    },
    [solved],
  );

  /**
   * Soltar una ficha arrastrada sobre el cartel: entra en el tramo más cercano.
   * Lo que decide es la ranura más la traslación del gesto y nunca la posición
   * absoluta del dedo, porque la caja del lienzo no se puede medir.
   */
  const dropChip = useCallback(
    (index: number, x: number, y: number) => {
      let mejor = -1;
      let dist = DROP_R;
      ll.cells.forEach((fila0, i) => {
        fila0.forEach((spot, j) => {
          if (i >= rows.length || j >= (rows[i]?.terms.length ?? 0)) return;
          const d = Math.hypot(x - spot.x, y - spot.y);
          if (d < dist) {
            dist = d;
            mejor = i * 2 + j;
          }
        });
      });
      if (mejor < 0) return;
      const term = rows[Math.floor(mejor / 2)]?.terms[mejor % 2];
      if (term) placeChip(term.fruit, index);
    },
    [ll.cells, rows, placeChip],
  );

  /**
   * Lo que el gesto llama viaja en una referencia estable: si el objeto del
   * `Gesture` cambiara de identidad entre renders, el detector tendría que
   * reengancharlo y el arrastre se perdería a mitad de camino.
   */
  const acciones = useRef({ touchCell, touchGrip, touchChip, touchFactor, dropChip });
  acciones.current = { touchCell, touchGrip, touchChip, touchFactor, dropChip };

  const alTocarCelda = useCallback((i: number) => acciones.current.touchCell(i), []);
  const alTocarAsa = useCallback((i: number) => acciones.current.touchGrip(i), []);
  const alTocarFicha = useCallback((i: number) => acciones.current.touchChip(i), []);
  const alTocarFactor = useCallback((i: number) => acciones.current.touchFactor(i), []);
  const alSoltarFicha = useCallback(
    (i: number, x: number, y: number) => acciones.current.dropChip(i, x, y),
    [],
  );

  // --- Los paneles a demanda -------------------------------------------------

  const toggleBalance = useCallback(() => {
    setBalanceOn((on) => {
      balanceAppear.value = withTiming(on ? 0 : 1, { duration: theme.motion.base });
      return !on;
    });
  }, [balanceAppear]);

  const toggleGrid = useCallback(() => {
    setGridOn((on) => {
      gridAppear.value = withTiming(on ? 0 : 1, { duration: theme.motion.base });
      return !on;
    });
  }, [gridAppear]);

  const preguntaClase = problem.ask === "classify" && !solved;
  const conFichas = problem.chips.length > 0;
  const conFactores = problem.factors.length > 0;

  return (
    <View style={styles.root}>
      <Pressable onPress={onExit} style={styles.back} hitSlop={theme.hitSlop}>
        <Text style={styles.backLabel}>{t("game.back")}</Text>
      </Pressable>

      <Header
        title={`${t(`node.${NODE_TWO_BY_TWO}.name`)} · nivel ${level.n} de ${TOTAL_SYS_LEVELS}`}
        subtitle={t(level.titleKey)}
        round={round}
        rounds={level.rounds}
      />

      <View style={{ width, height: sceneH }}>
        {/* Un solo lienzo por pantalla: el cartel, la balanza y el plano viven
            adentro del mismo. */}
        <Canvas style={{ width, height: sceneH }}>
          <LedgerScene
            config={ledgerCfg}
            layout={ll}
            places={[]}
            round={round}
            snap={-1}
            dragIdx={dragIdx}
            dragX={dragX}
            dragY={dragY}
            pulse={pulse}
            demo={demo}
            replay={replay}
            replayRows={[-1, -1]}
            bounced={-1}
            appear={appear}
          />

          {/* El mostrador de fichas y la bandeja de factores. */}
          <Path path={pickedGeom} color={theme.color.accent} style="stroke" strokeWidth={2} />
          <Path path={trayGeom.cuerpo} color={theme.color.line} style="stroke" strokeWidth={1.5} />
          <Path path={trayGeom.digitos} color={theme.color.ink} />
          <Path path={factorGeom.cuerpo} color={theme.color.line} style="stroke" strokeWidth={1.5} />
          <Path path={factorGeom.digitos} color={theme.color.inkDim} />
          <Path path={gripGeom} color={theme.color.inkFaint} style="stroke" strokeWidth={2} />

          {/* La balanza fantasma: la fila dicha como balanza acostada. */}
          {level.balance !== "hidden" ? (
            <Group transform={[{ translateX: balanceX }]}>
              <BalanceScene
                problem={{ solution: 0 }}
                unknownLeft
                style={level.layer === "concrete" ? "concrete" : "visual"}
                width={balanceW}
                height={balanceH}
                left={quieto}
                right={quieto}
                appear={balanceAppear}
                contents={balanceContents}
                tilt={balanceTilt}
                openness={quieto}
                brooch={false}
                overlayLeft={
                  <>
                    {overlayGeom.izquierda.map((path, k) => (
                      <Path key={`fi${k}`} path={path} color={colorDeFruta(k)} />
                    ))}
                  </>
                }
                overlayRight={
                  <>
                    {overlayGeom.derecha.map((path, k) => (
                      <Path key={`fd${k}`} path={path} color={colorDeFruta(k)} />
                    ))}
                  </>
                }
              />
            </Group>
          ) : null}

          {/* El plano, desde el penúltimo nivel. */}
          {level.grid ? (
            <Group transform={[{ translateX: cartelW }]}>
              <StretchScene
                config={planeCfg}
                layout={pl}
                bands={[{ factor: quieto, deform: quieto }]}
                token={quieto}
                turn={quieto}
                jam={quieto}
                hint={quieto}
                demo={quieto}
                picked={-1}
                guess={null}
                appear={gridAppear}
              />
            </Group>
          ) : null}
        </Canvas>

        {/* Las asas invisibles: el dibujo es Skia y el gesto es la vista.
            Siempre las mismas, y las que esta ronda no usa quedan sordas: un
            asa deshabilitada tiene que quedar montada, y sin recibir toques, o
            se come los del lienzo. */}
        {Array.from({ length: SYS_ROW_SLOTS * 2 }, (_, i) => {
          const fila0 = Math.floor(i / 2);
          const spot = ll.cells[fila0]?.[i % 2] ?? { x: 0, y: 0 };
          const vivo = fila0 < rows.length && (i % 2) < (rows[fila0]?.terms.length ?? 0);
          return (
            <Handle
              key={`c${i}`}
              index={i}
              x={spot.x - ll.cellW * 0.42}
              y={spot.y - 26}
              w={ll.cellW * 0.84}
              h={56}
              enabled={vivo && !solved && !preguntaClase}
              onTap={alTocarCelda}
            />
          );
        })}

        {Array.from({ length: SYS_ROW_SLOTS }, (_, i) => {
          const spot = rowGrips[i] ?? { x: 0, y: 0 };
          return (
            <Handle
              key={`g${i}`}
              index={i}
              x={spot.x - 18}
              y={spot.y - 18}
              w={36}
              h={36}
              enabled={i < rows.length && !solved && !preguntaClase}
              onTap={alTocarAsa}
            />
          );
        })}

        {conFichas
          ? Array.from({ length: SYS_CHIP_SLOTS }, (_, i) => {
              const spot = chipSpots[i] ?? { x: 0, y: 0 };
              return (
                <Handle
                  key={`h${i}`}
                  index={i}
                  x={spot.x - 24}
                  y={spot.y - 19}
                  w={48}
                  h={38}
                  enabled={i < problem.chips.length && !solved}
                  onTap={alTocarFicha}
                  onDrop={alSoltarFicha}
                  spot={spot}
                  dragIdx={dragIdx}
                  dragX={dragX}
                  dragY={dragY}
                />
              );
            })
          : null}

        {conFactores
          ? Array.from({ length: SYS_FACTOR_SLOTS }, (_, i) => {
              const spot = factorSpots[i] ?? { x: 0, y: 0 };
              return (
                <Handle
                  key={`x${i}`}
                  index={i}
                  x={spot.x - 19}
                  y={spot.y - 19}
                  w={38}
                  h={38}
                  enabled={i < problem.factors.length && !solved}
                  onTap={alTocarFactor}
                />
              );
            })
          : null}
      </View>

      <Hint text={message.text} tone={message.tone} />

      {/* Las tres clases de sistema: no son un movimiento, son un veredicto. */}
      {preguntaClase ? (
        <View style={styles.answers}>
          <Choice label={t("sys.answer.unique")} onPress={() => classify("unique")} />
          <Choice label={t("sys.answer.none")} onPress={() => classify("none")} />
          <Choice label={t("sys.answer.infinite")} onPress={() => classify("infinite")} />
        </View>
      ) : null}

      <View style={styles.tools}>
        {level.balance === "onDemand" ? (
          <Toggle label={t(balanceOn ? "multi.balance.hide" : "multi.balance.show")} onPress={toggleBalance} />
        ) : null}
        {level.balance === "onDemand" && balanceOn && rows.length > 1 ? (
          <Toggle
            label={t("sys.balance.other")}
            onPress={() => setBalanceRow((r) => (r + 1) % rows.length)}
          />
        ) : null}
        {level.grid ? (
          <Toggle label={t(gridOn ? "sys.grid.hide" : "sys.grid.show")} onPress={toggleGrid} />
        ) : null}
      </View>

      {level.definition ? <Text style={styles.definition}>{t("sys.definition")}</Text> : null}
    </View>
  );
}

function openingHint(ask: string): string {
  if (ask === "share") return "sys.hint.share";
  if (ask === "pairs") return "sys.hint.pairs";
  if (ask === "substitute") return "sys.hint.substitute";
  if (ask === "pour") return "sys.hint.pour";
  if (ask === "classify") return "sys.hint.classify";
  return "sys.hint.choose";
}

/**
 * Un asa invisible sobre lo que Skia dibuja. El toque siempre está; el arrastre
 * solo donde hay algo que llevar, y los dos corren en carrera porque un `Pan`
 * habilitado le gana siempre a un `Tap` que escuche la misma superficie.
 */
function Handle({
  index,
  x,
  y,
  w,
  h,
  enabled,
  onTap,
  onDrop,
  spot,
  dragIdx,
  dragX,
  dragY,
}: {
  readonly index: number;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly enabled: boolean;
  readonly onTap: (index: number) => void;
  readonly onDrop?: (index: number, x: number, y: number) => void;
  readonly spot?: { readonly x: number; readonly y: number };
  readonly dragIdx?: { value: number };
  readonly dragX?: { value: number };
  readonly dragY?: { value: number };
}) {
  const gesture = useMemo(() => {
    const tap = Gesture.Tap()
      .maxDistance(20)
      .enabled(enabled)
      .onEnd(() => {
        runOnJS(onTap)(index);
      });
    if (!onDrop || !spot || !dragIdx || !dragX || !dragY) return tap;
    const pan = Gesture.Pan()
      .enabled(enabled)
      .onBegin(() => {
        dragIdx.value = index;
      })
      // Los gestos leen `translationX/Y` y no acumulan `changeX/Y`: el evento
      // que activa el gesto no llega a `onChange`, y con deltas el arrastre del
      // navegador automatizado se pierde entero.
      .onChange((e) => {
        dragX.value = e.translationX;
        dragY.value = e.translationY;
      })
      .onEnd((e) => {
        // Dónde quedó la ficha, en coordenadas del lienzo: de dónde estaba más
        // cuánto se movió, y nunca de la posición absoluta del dedo, porque la
        // caja del lienzo no se puede medir con `onLayout`.
        runOnJS(onDrop)(index, spot.x + e.translationX, spot.y + e.translationY);
      })
      .onFinalize(() => {
        dragIdx.value = -1;
        dragX.value = 0;
        dragY.value = 0;
      });
    return Gesture.Race(pan, tap);
  }, [enabled, index, onTap, onDrop, spot?.x, spot?.y, spot, dragIdx, dragX, dragY]);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: w,
          height: h,
          // Un asa deshabilitada se come los toques de lo que hay debajo, y
          // desmontarla dejaría al detector de la ronda siguiente sin enganchar.
          pointerEvents: enabled ? "auto" : "none",
        }}
      />
    </GestureDetector>
  );
}

function Toggle({ label, onPress }: { readonly label: string; readonly onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={theme.hitSlop} style={styles.toggle}>
      <Text style={styles.toggleLabel}>{label}</Text>
    </Pressable>
  );
}

function Choice({ label, onPress }: { readonly label: string; readonly onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={theme.hitSlop} style={styles.choice}>
      <Text style={styles.choiceLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.color.bg,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.space[1],
  },
  back: { position: "absolute", top: 48, left: 20, zIndex: 2 },
  backLabel: { color: theme.color.inkFaint, fontSize: 14 },
  answers: { flexDirection: "row", gap: theme.space[2] },
  choice: {
    paddingHorizontal: theme.space[3],
    paddingVertical: theme.space[1],
    borderRadius: theme.radius.token,
    borderWidth: 1,
    borderColor: theme.color.line,
    backgroundColor: theme.color.surfaceHigh,
  },
  choiceLabel: { color: theme.color.ink, fontSize: 14 },
  tools: { flexDirection: "row", gap: theme.space[2] },
  toggle: {
    paddingHorizontal: theme.space[2],
    paddingVertical: theme.space[0],
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.color.line,
  },
  toggleLabel: { color: theme.color.inkDim, fontSize: 12 },
  definition: {
    color: theme.color.inkDim,
    fontSize: 13,
    textAlign: "center",
    maxWidth: 560,
    paddingHorizontal: theme.space[3],
  },
});
