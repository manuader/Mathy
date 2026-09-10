/**
 * El registro de actividades.
 *
 * Un nodo del grafo se juega con un componente y el mapa no necesita saber
 * cuál: pregunta acá por el id. Agregar un minijuego es escribir su módulo,
 * anotarlo en `@mathy/mechanics` y agregar una línea a esta tabla.
 */

import type { ComponentType } from "react";
import { levelByNumber, type LevelBase, type NodeSpec } from "@mathy/mechanics";
import type { Event } from "@mathy/progress";
import { OneStepGame } from "../OneStepGame.tsx";

export interface ActivityProps {
  readonly node: NodeSpec;
  readonly level: LevelBase;
  /** Cuántos niveles del nodo quedaron atrás; con eso crecen la chuleta y la calculadora. */
  readonly levelsDone: number;
  readonly onEvent: (event: Event) => void;
  readonly onLevelDone: () => void;
  readonly onExit: () => void;
}

const OneStep = ({ level, ...rest }: ActivityProps) => {
  // El registro habla en `LevelBase`; el minijuego necesita sus parámetros.
  const full = levelByNumber(level.n);
  if (!full) return null;
  return <OneStepGame {...rest} level={full} />;
};

const ACTIVITIES: Record<string, ComponentType<ActivityProps>> = {
  "alg.eq.one_step": OneStep,
};

export const activityFor = (nodeId: string): ComponentType<ActivityProps> | undefined =>
  ACTIVITIES[nodeId];
