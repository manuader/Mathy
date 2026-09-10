/**
 * El registro de actividades.
 *
 * Un nodo del grafo se juega con un componente y el mapa no necesita saber
 * cuál: pregunta acá por el id. Agregar un minijuego es escribir su módulo,
 * anotarlo en `@mathy/mechanics` y agregar una línea a esta tabla.
 */

import type { ComponentType } from "react";
import {
  cardinalityLevelByNumber,
  levelByNumber,
  pathLevelByNumber,
  tripLevelByNumber,
  mulLevelByNumber,
  undoLevelByNumber,
  divLevelByNumber,
  negLevelByNumber,
  fracLevelByNumber,
  precLevelByNumber,
  boxLevelByNumber,
  keyLevelByNumber,
  multiLevelByNumber,
  distLevelByNumber,
  sysLevelByNumber,
  gpLevelByNumber,
  slLevelByNumber,
  fnLevelByNumber,
  balLevelByNumber,
  type LevelBase,
  type NodeSpec,
} from "@mathy/mechanics";
import type { Event } from "@mathy/progress";
import { OneStepGame } from "../OneStepGame.tsx";
import { NumberLineGame } from "./NumberLineGame.tsx";
import { CardinalityGame } from "./CardinalityGame.tsx";
import { AddDisplacementGame } from "./AddDisplacementGame.tsx";
import { MulScalingGame } from "./MulScalingGame.tsx";
import { SubUndoAddGame } from "./SubUndoAddGame.tsx";
import { DivUndoMulGame } from "./DivUndoMulGame.tsx";
import { NegativesGame } from "./NegativesGame.tsx";
import { FractionsGame } from "./FractionsGame.tsx";
import { PrecedenceGame } from "./PrecedenceGame.tsx";
import { UnknownBoxGame } from "./UnknownBoxGame.tsx";
import { OperationKeyGame } from "./OperationKeyGame.tsx";
import { DistributiveGame } from "./DistributiveGame.tsx";
import { MultiStepGame } from "./MultiStepGame.tsx";
import { SystemsGame } from "./SystemsGame.tsx";
import { BalanceEqGame } from "./BalanceEqGame.tsx";
import { GraphPictureGame } from "./GraphPictureGame.tsx";
import { SlopeGame } from "./SlopeGame.tsx";
import { MachineGame } from "./MachineGame.tsx";

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

const NumberLine = ({ level, ...rest }: ActivityProps) => {
  const full = pathLevelByNumber(level.n);
  if (!full) return null;
  return <NumberLineGame {...rest} level={full} />;
};

const Cardinality = ({ level, ...rest }: ActivityProps) => {
  const full = cardinalityLevelByNumber(level.n);
  if (!full) return null;
  return <CardinalityGame {...rest} level={full} />;
};

const AddDisplacement = ({ level, ...rest }: ActivityProps) => {
  const full = tripLevelByNumber(level.n);
  if (!full) return null;
  return <AddDisplacementGame {...rest} level={full} />;
};

const MulScaling = ({ level, ...rest }: ActivityProps) => {
  const full = mulLevelByNumber(level.n);
  if (!full) return null;
  return <MulScalingGame {...rest} level={full} />;
};

const SubUndoAdd = ({ level, ...rest }: ActivityProps) => {
  const full = undoLevelByNumber(level.n);
  if (!full) return null;
  return <SubUndoAddGame {...rest} level={full} />;
};

const DivUndoMul = ({ level, ...rest }: ActivityProps) => {
  const full = divLevelByNumber(level.n);
  if (!full) return null;
  return <DivUndoMulGame {...rest} level={full} />;
};

const Negatives = ({ level, ...rest }: ActivityProps) => {
  const full = negLevelByNumber(level.n);
  if (!full) return null;
  return <NegativesGame {...rest} level={full} />;
};

const Fractions = ({ level, ...rest }: ActivityProps) => {
  const full = fracLevelByNumber(level.n);
  if (!full) return null;
  return <FractionsGame {...rest} level={full} />;
};

const Precedence = ({ level, ...rest }: ActivityProps) => {
  const full = precLevelByNumber(level.n);
  if (!full) return null;
  return <PrecedenceGame {...rest} level={full} />;
};

const UnknownBox = ({ level, ...rest }: ActivityProps) => {
  const full = boxLevelByNumber(level.n);
  if (!full) return null;
  return <UnknownBoxGame {...rest} level={full} />;
};

const BalanceEq = ({ level, ...rest }: ActivityProps) => {
  const full = balLevelByNumber(level.n);
  if (!full) return null;
  return <BalanceEqGame {...rest} level={full} />;
};

const OperationKey = ({ level, ...rest }: ActivityProps) => {
  const full = keyLevelByNumber(level.n);
  if (!full) return null;
  return <OperationKeyGame {...rest} level={full} />;
};

const MultiStep = ({ level, ...rest }: ActivityProps) => {
  const full = multiLevelByNumber(level.n);
  if (!full) return null;
  return <MultiStepGame {...rest} level={full} />;
};

const Distributive = ({ level, ...rest }: ActivityProps) => {
  const full = distLevelByNumber(level.n);
  if (!full) return null;
  return <DistributiveGame {...rest} level={full} />;
};

const Systems = ({ level, ...rest }: ActivityProps) => {
  const full = sysLevelByNumber(level.n);
  if (!full) return null;
  return <SystemsGame {...rest} level={full} />;
};

const GraphPicture = ({ level, ...rest }: ActivityProps) => {
  const full = gpLevelByNumber(level.n);
  if (!full) return null;
  return <GraphPictureGame {...rest} level={full} />;
};

const Slope = ({ level, ...rest }: ActivityProps) => {
  const full = slLevelByNumber(level.n);
  if (!full) return null;
  return <SlopeGame {...rest} level={full} />;
};

const Machine = ({ level, ...rest }: ActivityProps) => {
  const full = fnLevelByNumber(level.n);
  if (!full) return null;
  return <MachineGame {...rest} level={full} />;
};

const ACTIVITIES: Record<string, ComponentType<ActivityProps>> = {
  "found.count.cardinality": Cardinality,
  "alg.eq.one_step": OneStep,
  "found.count.number_line": NumberLine,
  "arith.add.displacement": AddDisplacement,
  "arith.mul.scaling": MulScaling,
  "arith.sub.undo_add": SubUndoAdd,
  "arith.div.undo_mul": DivUndoMul,
  "arith.int.negatives": Negatives,
  "arith.frac.parts_and_ratio": Fractions,
  "arith.expr.precedence_tree": Precedence,
  "prealg.var.unknown_as_box": UnknownBox,
  "prealg.inv.operation_as_key": OperationKey,
  "prealg.eq.balance": BalanceEq,
  "alg.eq.multi_step": MultiStep,
  "alg.expr.distributive_tiles": Distributive,
  "alg.sys.two_by_two": Systems,
  "alg.fn.function_as_machine": Machine,
  "alg.fn.graph_as_picture": GraphPicture,
  "alg.fn.linear_slope": Slope,
};

export const activityFor = (nodeId: string): ComponentType<ActivityProps> | undefined =>
  ACTIVITIES[nodeId];
