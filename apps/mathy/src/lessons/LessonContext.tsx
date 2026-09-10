/**
 * En qué momento del nivel está el jugador y qué paso de la guía se ve.
 *
 * Tres momentos: la tarjeta de entrada, el juego y la tarjeta de cierre. La
 * actividad no dibuja ninguna de las dos tarjetas. Solo avisa con `signal`
 * cuando el jugador hizo un gesto que la guía esperaba, y mira `step` para no
 * cerrar una ronda mientras el jugador todavía está leyendo.
 *
 * El proveedor se monta con la misma clave que la actividad, así que la guía
 * arranca de cero en cada nivel y en cada repetición.
 */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { LevelBase, NodeSpec } from "@mathy/mechanics";
import { lessonFor } from "./index.ts";
import type { CoachStep, LevelLesson } from "./types.ts";

export type Phase = "intro" | "play" | "done";

export interface LessonNav {
  /** El nivel siguiente, o el primero del concepto siguiente si este era el último. */
  readonly next: () => void;
  readonly replay: () => void;
  readonly levels: () => void;
  readonly concepts: () => void;
  readonly play: (node: string, level: number) => void;
}

export interface LessonApi {
  readonly node: NodeSpec;
  readonly level: LevelBase;
  readonly lesson: LevelLesson | undefined;
  readonly phase: Phase;
  /** El paso de la guía a la vista. Nada si la guía terminó o no hubo. */
  readonly step: CoachStep | undefined;
  readonly stepIndex: number;
  readonly start: (withCoach: boolean) => void;
  readonly signal: (id: string) => void;
  readonly nextStep: () => void;
  readonly skipCoach: () => void;
  readonly nav: LessonNav;
  /** La llave recién ganada, hasta que el jugador abre la chuleta. */
  readonly fresh: string | null;
  readonly clearFresh: () => void;
}

const Ctx = createContext<LessonApi | null>(null);

export function LessonProvider({
  node,
  level,
  phase,
  onStart,
  nav,
  fresh,
  clearFresh,
  children,
}: {
  readonly node: NodeSpec;
  readonly level: LevelBase;
  readonly phase: Phase;
  readonly onStart: () => void;
  readonly nav: LessonNav;
  readonly fresh: string | null;
  readonly clearFresh: () => void;
  readonly children: ReactNode;
}) {
  const lesson = useMemo(() => lessonFor(node.id, level.n), [node.id, level.n]);
  const steps = lesson?.coach;
  const [stepIndex, setStepIndex] = useState(-1);

  const start = useCallback(
    (withCoach: boolean) => {
      setStepIndex(withCoach && steps && steps.length > 0 ? 0 : -1);
      onStart();
    },
    [steps, onStart],
  );

  // Una señal puede adelantar varios pasos: si el jugador hizo el gesto antes
  // de que se lo pidieran, la guía no le hace repetirlo.
  const signal = useCallback(
    (id: string) => {
      if (!steps) return;
      setStepIndex((i) => {
        if (i < 0) return i;
        for (let j = i; j < steps.length; j++) {
          const a = steps[j]?.advance;
          if (a !== undefined && a !== "tap" && a.signal === id) return j + 1 < steps.length ? j + 1 : -1;
        }
        return i;
      });
    },
    [steps],
  );

  const nextStep = useCallback(() => {
    if (!steps) return;
    setStepIndex((i) => (i >= 0 && i + 1 < steps.length ? i + 1 : -1));
  }, [steps]);

  const skipCoach = useCallback(() => setStepIndex(-1), []);

  const step = phase === "play" && stepIndex >= 0 ? steps?.[stepIndex] : undefined;

  const api = useMemo<LessonApi>(
    () => ({
      node,
      level,
      lesson,
      phase,
      step,
      stepIndex,
      start,
      signal,
      nextStep,
      skipCoach,
      nav,
      fresh,
      clearFresh,
    }),
    [node, level, lesson, phase, step, stepIndex, start, signal, nextStep, skipCoach, nav, fresh, clearFresh],
  );
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

/** Nulo fuera de un nivel: el marco de la actividad funciona igual sin lección. */
export function useLesson(): LessonApi | null {
  return useContext(Ctx);
}
