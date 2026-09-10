/**
 * Los cuencos de fruta: el minijuego de `found.count.cardinality`.
 *
 * Es el primer nodo del grafo y su jugador no lee. Todo lo que hay que entender
 * se ve o se toca: se arrastra una fruta a su fila y aparece un puente, se
 * llena un cuenco hasta que su tarjeta iguala a la otra, se elige entre dos
 * animaciones la que le cambia el número a un cuenco que nadie tocó. Los
 * mensajes de la pantalla son para el adulto que mira; con el sonido apagado y
 * sin leer una palabra el juego se termina igual.
 *
 * Un solo gesto de arrastre gobierna la escena entera: al empezar busca qué hay
 * bajo el dedo, al soltar decide dónde cae. No hay puntería fina en ningún
 * lado: la zona de drop de una fila es la fila entera y la de un cuenco es el
 * cuenco con su aire alrededor.
 *
 * El error nunca dice "mal". La fruta que quedó sin pareja late, la que sobra
 * se puede devolver a la canasta, y la tarjeta equivocada se desliza fuera de
 * la colección. Ninguno de esos tres tiene entrada en `misconceptions.yaml`
 * —el nodo declara `misconceptions: []`— así que los intentos se registran sin
 * error clasificado: el diseño los prevé, el catálogo todavía no.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Canvas } from "@shopify/react-native-skia";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  runOnJS,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import {
  generateCardinality,
  NODE_CARDINALITY,
  TOTAL_CARDINALITY_LEVELS,
  type CardinalityLevel,
} from "@mathy/mechanics";
import type { Event } from "@mathy/progress";
import {
  basketAt,
  bowlCenterX,
  bowlGeom,
  BowlScene,
  choiceAt,
  homeOf,
  slotAt,
  type Owner,
  type Place,
} from "../scenes/BowlScene.tsx";
import { Header, Hint } from "../ui/Chrome.tsx";
import { ActivityShell, useActivityViewport } from "../ui/ActivityShell.tsx";
import { t } from "../i18n.ts";
import { theme } from "../ui/theme.ts";

/** Cuánto tiempo queda a la vista la colección antes de taparse, en `carry`. */
const PEEK_MS = 2600;

const FUERA = -1;

export interface CardinalityGameProps {
  readonly level: CardinalityLevel;
  /** Cuántos niveles quedaron atrás; con eso crecen la chuleta y la calculadora. */
  readonly levelsDone: number;
  readonly onLevelDone: () => void;
  readonly onExit: () => void;
  /** Cada movimiento del jugador, tal como se guarda. La actividad no persiste nada. */
  readonly onEvent: (event: Event) => void;
}

export function CardinalityGame(props: CardinalityGameProps) {
  return (
    <ActivityShell levelsDone={props.levelsDone}>
      <Activity {...props} />
    </ActivityShell>
  );
}

function Activity({ level, onLevelDone, onExit, onEvent }: CardinalityGameProps) {
  // El lienzo mide lo que le deja el panel abierto, no la ventana entera: abrir
  // una herramienta achica la actividad y nunca la tapa.
  const { width, height } = useActivityViewport();
  const [round, setRound] = useState(0);
  const [seedBase] = useState(() => Math.floor(Math.random() * 100000));

  const problem = useMemo(
    () => generateCardinality(level, seedBase + round * 1000 + level.n),
    [level, round, seedBase],
  );

  const sceneH = Math.max(320, Math.min(height * 0.66, 540));
  const geom = useMemo(
    () => bowlGeom(width, sceneH, level.params.count[1]),
    [width, sceneH, level.params.count],
  );

  /** Cuántos objetos se montan por cuenco. Siempre el máximo: nada se monta después. */
  const perBowl = level.params.count[1] + 2;
  const totalObjs = perBowl * 2;

  const [slots, setSlots] = useState<readonly number[]>(() => new Array(totalObjs).fill(FUERA));
  const [cardOn, setCardOn] = useState<number>(FUERA);
  const [chosen, setChosen] = useState<number>(FUERA);
  const [covered, setCovered] = useState(false);
  const [solved, setSolved] = useState(false);
  const [snapObj, setSnapObj] = useState<number>(FUERA);
  const [snapCard, setSnapCard] = useState<number>(FUERA);
  const [message, setMessage] = useState<{ text: string; tone: "dim" | "ok" | "warn" }>(() => ({
    text: OPENING[level.mode],
    tone: "dim",
  }));

  const dragIdx = useSharedValue(FUERA);
  const dragCard = useSharedValue(FUERA);
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const pulse = useSharedValue(0);
  const glow = useSharedValue(0);
  const demo = useSharedValue(0);
  const shuffle = useSharedValue(0);

  // El latido y el reordenamiento son de la escena, no de la ronda: arrancan una
  // vez y no se apagan, así que no hay animación que empiece a mitad de camino.
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 760 }), -1, true);
    if (level.mode === "lie") {
      shuffle.value = withRepeat(withTiming(1, { duration: 1300 }), -1, true);
    }
  }, [pulse, shuffle, level.mode]);

  // La demostración es la única instrucción del juego. Se muestra al empezar el
  // nivel y no vuelve: el libro de cuentas de los nodos siguientes es este mismo.
  useEffect(() => {
    if (round !== 0) return;
    if (level.mode !== "pair" && level.mode !== "fill") return;
    demo.value = withRepeat(
      withSequence(withTiming(0, { duration: 1 }), withTiming(1, { duration: 1100 })),
      3,
      false,
    );
  }, [round, level.mode, demo]);

  // En `carry` la colección se tapa: el problema que hace falta el numeral es
  // justamente que el cuenco no está más sobre la mesa.
  useEffect(() => {
    if (level.mode !== "carry") return;
    setCovered(false);
    const id = setTimeout(() => setCovered(true), PEEK_MS);
    return () => clearTimeout(id);
  }, [level.mode, problem]);

  // El reloj arranca cuando se muestra el problema: la latencia es del jugador,
  // no del render.
  const shownAt = useRef(Date.now());
  useEffect(() => {
    shownAt.current = Date.now();
  }, [problem]);

  // La capa vista es lo que agrega entradas a la chuleta, así que se registra al
  // entrar al nivel y no al terminarlo.
  useEffect(() => {
    onEvent({ kind: "sawLayer", at: Date.now(), node: NODE_CARDINALITY, layer: level.layer });
  }, [level.layer, onEvent]);

  /**
   * Un movimiento del jugador, contado para cada verbo que el nivel ejercita.
   * Sin `misconception`: ninguno de los deslices que este nodo puede mostrar
   * está catalogado en L, y anotar uno inventado ensuciaría la remediación.
   */
  const attempt = useCallback(
    (correct: boolean) => {
      const at = Date.now();
      const latency = at - shownAt.current;
      for (const evidence of level.evidence) {
        onEvent({
          kind: "attempt",
          at,
          node: NODE_CARDINALITY,
          level: level.n,
          evidence,
          correct,
          latency,
        });
      }
    },
    [level.evidence, level.n, onEvent],
  );

  const nextRound = useCallback(() => {
    if (round + 1 >= level.rounds) {
      onEvent({ kind: "levelDone", at: Date.now(), node: NODE_CARDINALITY, level: level.n });
      onLevelDone();
      return;
    }
    setRound((r) => r + 1);
    setSlots(new Array(totalObjs).fill(FUERA));
    setCardOn(FUERA);
    setChosen(FUERA);
    setSolved(false);
    glow.value = withTiming(0, { duration: theme.motion.quick });
    setMessage({ text: OPENING[level.mode], tone: "dim" });
  }, [round, level.rounds, level.n, level.mode, onEvent, onLevelDone, totalObjs, glow]);

  const succeed = useCallback(
    (texto: string) => {
      setSolved(true);
      attempt(true);
      glow.value = withTiming(1, { duration: theme.motion.morph });
      demo.value = withTiming(0, { duration: theme.motion.quick });
      setMessage({ text: texto, tone: "ok" });
      setTimeout(nextRound, theme.motion.reveal + 400);
    },
    [attempt, glow, demo, nextRound],
  );

  const refuse = useCallback(
    (texto: string) => {
      attempt(false);
      setMessage({ text: texto, tone: "warn" });
    },
    [attempt],
  );

  // --- Dónde está cada cosa --------------------------------------------------

  const owners = useMemo<readonly Owner[]>(() => {
    const out: Owner[] = [];
    for (let i = 0; i < totalObjs; i++) {
      const bowl = i < perBowl ? 0 : 1;
      const j = i % perBowl;
      const b = problem.bowls[bowl];
      const skin = problem.bowls[0]?.skin ?? "fruit";
      out.push({
        bowl,
        kind: b?.kinds[j] ?? 0,
        size: b?.sizes[j] ?? 1,
        skin,
      });
    }
    return out;
  }, [problem, perBowl, totalObjs]);

  /** Cuántos objetos hay realmente en juego en cada cuenco. */
  const enJuego = useMemo(() => {
    if (problem.mode === "fill") return [problem.basket, 0];
    return [problem.bowls[0]?.count ?? 0, problem.bowls[1]?.count ?? 0];
  }, [problem]);

  const filled = useMemo(() => slots.filter((s) => s >= 0).length, [slots]);

  const places = useMemo<readonly Place[]>(() => {
    const out: Place[] = [];
    for (let i = 0; i < totalObjs; i++) {
      const bowl = i < perBowl ? 0 : 1;
      const j = i % perBowl;
      const vivo = j < (enJuego[bowl] ?? 0);
      const s = slots[i] ?? FUERA;

      if (problem.mode === "fill") {
        if (!vivo) {
          out.push({ ...basketAt(geom, j, Math.max(problem.basket, 1)), on: false });
          continue;
        }
        if (s >= 0) {
          const cx = bowlCenterX(geom, "fill", 0);
          out.push({ ...homeOf(geom, cx, s, Math.max(filled, 1), "pile"), on: true });
        } else {
          out.push(basketAt(geom, j, Math.max(problem.basket, 1)));
        }
        continue;
      }

      const b = problem.bowls[bowl];
      const cx = bowlCenterX(geom, problem.mode, bowl);
      const casa = homeOf(geom, cx, j, Math.max(b?.count ?? 1, 1), b?.arrangement ?? "pile");
      if (!vivo) {
        out.push({ ...casa, on: false });
        continue;
      }
      if (s >= 0) {
        out.push(slotAt(geom, bowl, s));
        continue;
      }
      // En `carry` la colección se tapa y hay que llevarle su tarjeta a otro
      // cuenco: es el problema que hace falta el numeral.
      out.push({ ...casa, on: !covered });
    }
    return out;
  }, [totalObjs, perBowl, slots, problem, geom, enJuego, filled, covered]);

  const bridges = useMemo<readonly boolean[]>(() => {
    const out = new Array<boolean>(geom.slotCount).fill(false);
    if (problem.mode !== "pair") return out;
    for (let s = 0; s < geom.slotCount; s++) {
      const arriba = slots.some((v, i) => v === s && i < perBowl);
      const abajo = slots.some((v, i) => v === s && i >= perBowl);
      out[s] = arriba && abajo;
    }
    return out;
  }, [slots, geom.slotCount, perBowl, problem.mode]);

  const lonely = useMemo<readonly boolean[]>(() => {
    const out = new Array<boolean>(totalObjs).fill(false);
    if (problem.mode !== "pair") return out;
    const faltan = slots.some((v, i) => {
      const bowl = i < perBowl ? 0 : 1;
      return v === FUERA && i % perBowl < (enJuego[bowl] ?? 0);
    });
    // Antes de terminar de emparejar nada late: la fruta sin puente todavía
    // puede conseguirlo, y un latido temprano sería ruido.
    if (faltan) return out;
    for (let i = 0; i < totalObjs; i++) {
      const s = slots[i] ?? FUERA;
      if (s >= 0 && !bridges[s]) out[i] = true;
    }
    return out;
  }, [slots, bridges, totalObjs, perBowl, enJuego, problem.mode]);

  const bowlCounts = useMemo<readonly number[]>(() => {
    if (level.card === "none") return problem.bowls.map(() => FUERA);
    if (problem.mode === "fill") return [filled];
    if (problem.mode === "pair") return problem.bowls.map((b) => b.count);
    // En `carry` y en `label` la tarjeta del cuenco es justamente lo que hay
    // que traerle: mostrarla regalaría la respuesta.
    return problem.bowls.map(() => (cardOn >= 0 ? (problem.cards[cardOn]?.value ?? FUERA) : FUERA));
  }, [level.card, problem, filled, cardOn]);

  const cardPlaces = useMemo<readonly Place[]>(
    () =>
      problem.cards.map((_, i) =>
        i === cardOn
          ? { x: bowlCenterX(geom, problem.mode, 0), y: geom.bowlCardY, on: true }
          : choiceAt(geom, i, problem.cards.length),
      ),
    [problem, geom, cardOn],
  );

  // --- Lo que pasa cuando el jugador suelta ----------------------------------

  const enFranja = useCallback(
    (y: number): boolean => y > geom.rowY[0] - geom.height * 0.13 && y < geom.rowY[1] + geom.height * 0.13,
    [geom],
  );

  const sobreCuenco = useCallback(
    (x: number, y: number, bowl: number): boolean => {
      const cx = bowlCenterX(geom, problem.mode, bowl);
      return Math.abs(x - cx) < geom.bowlR * 1.9 && Math.abs(y - geom.bowlY) < geom.bowlR * 1.7;
    },
    [geom, problem.mode],
  );

  /** Emparejar: la fruta se acomoda en el primer hueco libre de su fila. */
  const dropObject = useCallback(
    (i: number, x: number, y: number) => {
      setSnapObj(i);
      if (solved) return;
      const bowl = i < perBowl ? 0 : 1;

      if (problem.mode === "pair") {
        if (!enFranja(y)) {
          setMessage({ text: "La fruta vuelve al cuenco. Llevala a su fila.", tone: "dim" });
          return;
        }
        const usados = new Set(slots.filter((v, k) => v >= 0 && (k < perBowl) === (bowl === 0)));
        let hueco = 0;
        while (usados.has(hueco) && hueco < geom.slotCount) hueco += 1;
        if (hueco >= geom.slotCount) return;
        const next = [...slots];
        next[i] = hueco;
        setSlots(next);
        demo.value = withTiming(0, { duration: theme.motion.quick });
        // Cada cosa que llega a su fila es un paso del conteo, y ese paso es
        // exactamente lo que el nivel ejercita.
        attempt(true);
        const puestos = next.filter((v, k) => v >= 0 && k % perBowl < (enJuego[k < perBowl ? 0 : 1] ?? 0)).length;
        const total = (enJuego[0] ?? 0) + (enJuego[1] ?? 0);
        if (puestos >= total) {
          const sobran = Math.abs((enJuego[0] ?? 0) - (enJuego[1] ?? 0));
          setTimeout(
            () =>
              succeed(
                sobran === 0
                  ? "Se emparejaron sin que sobre nada: los dos cuencos tienen lo mismo."
                  : `Quedaron ${sobran} sin puente. Ese cuenco tiene más.`,
              ),
            420,
          );
        }
        return;
      }

      if (problem.mode === "fill") {
        const enCuenco = (slots[i] ?? FUERA) >= 0;
        const alCuenco = sobreCuenco(x, y, 0);
        const aLaCanasta = y > geom.basketY - 46;
        if (!enCuenco && alCuenco) {
          const next = [...slots];
          next[i] = filled;
          setSlots(next);
          demo.value = withTiming(0, { duration: theme.motion.quick });
          const ahora = filled + 1;
          if (ahora === problem.target) {
            succeed("La tarjeta del cuenco quedó igual a la otra.");
          } else if (ahora > problem.target) {
            // Una fruta de más apaga la iluminación y late: se puede devolver.
            refuse("Se pasó de la tarjeta. Esa fruta se puede devolver a la canasta.");
          } else {
            attempt(true);
            setMessage({ text: "Un punto más en la tarjeta.", tone: "dim" });
          }
          return;
        }
        if (enCuenco && aLaCanasta) {
          const next = [...slots];
          next[i] = FUERA;
          // Los que quedan se corren para que la cuenta siga siendo de a uno.
          const restantes = next
            .map((v, k) => ({ v, k }))
            .filter((e) => e.v >= 0)
            .sort((a, b) => a.v - b.v);
          restantes.forEach((e, pos) => {
            next[e.k] = pos;
          });
          setSlots(next);
          if (restantes.length === problem.target) {
            succeed("Ahora la tarjeta dice lo mismo que la otra.");
          } else {
            attempt(true);
            setMessage({ text: "Un punto menos en la tarjeta.", tone: "dim" });
          }
        }
        return;
      }
    },
    [
      solved,
      perBowl,
      problem,
      slots,
      geom,
      enFranja,
      sobreCuenco,
      filled,
      enJuego,
      attempt,
      succeed,
      refuse,
      demo,
    ],
  );

  /** Poner una tarjeta sobre una colección: la tarjeta es del cuenco, no de una fruta. */
  const dropCard = useCallback(
    (i: number, x: number, y: number) => {
      setSnapCard(i);
      if (solved) return;
      if (!sobreCuenco(x, y, 0)) return;
      const card = problem.cards[i];
      if (!card) return;
      if (card.correct) {
        setCardOn(i);
        succeed("Los puntos se contraen: ese número es el del cuenco entero.");
      } else {
        // La tarjeta equivocada no dice "mal": se desliza fuera de la colección.
        refuse("Esa tarjeta se resbala del cuenco: no tiene los puntos que hay.");
      }
    },
    [solved, sobreCuenco, problem.cards, succeed, refuse],
  );

  const onTap = useCallback(
    (x: number, y: number) => {
      if (solved) return;
      if (problem.mode === "lie") {
        const i = x < geom.cx ? 0 : 1;
        setChosen(i);
        if (i === problem.lying) {
          succeed("Esa es la que miente: reordenar no cambia cuántas hay.");
        } else {
          refuse("En esa el cuenco se reordena y la tarjeta no se mueve: dice la verdad.");
          setTimeout(() => setChosen(FUERA), 1400);
        }
        return;
      }
      if (problem.mode === "carry" && sobreCuenco(x, y, 0)) {
        // Volver a mirar siempre se puede: la memoria no es lo que el nodo mide.
        setCovered(false);
        setTimeout(() => setCovered(true), 1800);
      }
    },
    [solved, problem, geom.cx, sobreCuenco, succeed, refuse],
  );

  // --- El gesto --------------------------------------------------------------

  /** Qué se puede levantar ahora mismo, en coordenadas del lienzo. */
  const asas = useMemo(() => {
    const objetos = places.map((p, i) => ({ x: p.x, y: p.y, on: p.on && level.mode !== "lie" }));
    const tarjetas =
      level.mode === "carry" || level.mode === "label"
        ? cardPlaces.map((p, i) => ({ x: p.x, y: p.y, on: p.on && i !== cardOn }))
        : [];
    return { objetos, tarjetas };
  }, [places, cardPlaces, level.mode, cardOn]);

  const radioObjeto = Math.max(34, geom.unit * 3.4);
  const radioTarjetaX = geom.cardW / 2 + 20;
  const radioTarjetaY = geom.cardH / 2 + 20;

  const gesture = useMemo(() => {
    const objetos = asas.objetos;
    const tarjetas = asas.tarjetas;
    const pan = Gesture.Pan()
      .enabled(!solved)
      .onBegin((e) => {
        dragX.value = 0;
        dragY.value = 0;
        dragIdx.value = FUERA;
        dragCard.value = FUERA;
        // Primero las tarjetas: están sobre todo lo demás, así que si el dedo
        // cae sobre una es esa la que se levanta.
        let mejor = FUERA;
        for (let i = 0; i < tarjetas.length; i++) {
          const c = tarjetas[i];
          if (!c || !c.on) continue;
          if (Math.abs(e.x - c.x) < radioTarjetaX && Math.abs(e.y - c.y) < radioTarjetaY) mejor = i;
        }
        if (mejor >= 0) {
          dragCard.value = mejor;
          return;
        }
        let cerca = radioObjeto;
        for (let i = 0; i < objetos.length; i++) {
          const o = objetos[i];
          if (!o || !o.on) continue;
          const d = Math.hypot(e.x - o.x, e.y - o.y);
          if (d < cerca) {
            cerca = d;
            mejor = i;
          }
        }
        if (mejor >= 0) dragIdx.value = mejor;
      })
      .onChange((e) => {
        // Traslación total y no suma de deltas: el evento que activa el gesto
        // no llega a `onChange`, así que sumar deltas pierde ese tramo.
        dragX.value = e.translationX;
        dragY.value = e.translationY;
      })
      .onEnd((e) => {
        const card = dragCard.value;
        const obj = dragIdx.value;
        if (card >= 0) runOnJS(dropCard)(card, e.x, e.y);
        else if (obj >= 0) runOnJS(dropObject)(obj, e.x, e.y);
        else {
          dragX.value = 0;
          dragY.value = 0;
        }
      });

    const tap = Gesture.Tap()
      .enabled(!solved)
      .onEnd((e) => {
        runOnJS(onTap)(e.x, e.y);
      });

    return Gesture.Race(pan, tap);
  }, [
    asas,
    solved,
    dragX,
    dragY,
    dragIdx,
    dragCard,
    radioObjeto,
    radioTarjetaX,
    radioTarjetaY,
    dropCard,
    dropObject,
    onTap,
  ]);

  /**
   * Soltar el dedo. La cosa ya está dibujada en su destino nuevo —la escena
   * recibió el salto como instantáneo—, así que apagar el arrastre en este
   * momento no produce ningún brinco.
   */
  useEffect(() => {
    if (snapObj === FUERA && snapCard === FUERA) return;
    dragIdx.value = FUERA;
    dragCard.value = FUERA;
    dragX.value = 0;
    dragY.value = 0;
    setSnapObj(FUERA);
    setSnapCard(FUERA);
  }, [snapObj, snapCard, dragIdx, dragCard, dragX, dragY]);

  return (
    <View style={styles.root}>
      <Pressable onPress={onExit} style={styles.back} hitSlop={theme.hitSlop}>
        <Text style={styles.backLabel}>{t("game.back")}</Text>
      </Pressable>

      <Header
        title={`${t(`node.${NODE_CARDINALITY}.name`)} · nivel ${level.n} de ${TOTAL_CARDINALITY_LEVELS}`}
        subtitle={t(level.titleKey)}
        round={round}
        rounds={level.rounds}
      />

      <GestureDetector gesture={gesture}>
        <View testID="cuencos" style={{ width, height: sceneH }}>
          <Canvas style={{ width, height: sceneH }}>
            <BowlScene
              problem={problem}
              style={level.layer === "concrete" ? "concrete" : "visual"}
              face={level.card}
              geom={geom}
              places={places}
              owners={owners}
              lonely={lonely}
              bridges={bridges}
              cardPlaces={cardPlaces}
              bowlCounts={bowlCounts}
              round={round}
              snapObj={snapObj}
              snapCard={snapCard}
              dragIdx={dragIdx}
              dragCard={dragCard}
              dragX={dragX}
              dragY={dragY}
              pulse={pulse}
              glow={glow}
              demo={demo}
              shuffle={shuffle}
              chosen={chosen}
            />
          </Canvas>
        </View>
      </GestureDetector>

      <Hint text={message.text} tone={message.tone} />
    </View>
  );
}

/** Lo primero que se ve. Es para el adulto: el chico ya tiene la mano fantasma. */
const OPENING: Record<string, string> = {
  pair: "Llevá cada fruta a su fila y mirá qué sobra.",
  fill: "Sacá frutas de la canasta hasta que las dos tarjetas digan lo mismo.",
  lie: "Las dos reordenan el mismo cuenco. Tocá la que le cambia el número.",
  carry: "Mirá cuántas hay y llevale su tarjeta al cuenco.",
  label: "Poné sobre la colección la tarjeta que le corresponde.",
};

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
});
