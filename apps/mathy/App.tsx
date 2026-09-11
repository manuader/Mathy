/**
 * La raíz.
 *
 * El estado del jugador no vive acá: se pliega del registro de eventos, que es
 * lo único que se guarda. `App` solo elige qué pantalla se ve y le pasa a la
 * actividad la manera de anotar lo que pasó.
 *
 * Tres pantallas y una jerarquía: los conceptos, los niveles de un concepto, y
 * la actividad. La actividad es la única que ocupa la pantalla entera, y un
 * nivel tiene tres momentos dentro de ella: la tarjeta de entrada, el juego y
 * la tarjeta de cierre. Terminar un nivel ya no devuelve a la lista: la tarjeta
 * de cierre dice qué se ganó y ofrece el siguiente con un solo botón.
 */

import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { isNodeOpen, nodeById, type LevelBase, type NodeSpec } from "@mathy/mechanics";
import type { Event } from "@mathy/progress";
import { LevelMap } from "./src/LevelMap";
import { NodeMap } from "./src/NodeMap";
import { activityFor } from "./src/activities/index.tsx";
import { lessonFor, nodeAfter } from "./src/lessons/index.ts";
import { LessonProvider, type LessonNav, type Phase } from "./src/lessons/LessonContext.tsx";
import { ProgressProvider, useProgress } from "./src/progress";
import { theme } from "./src/ui/theme.ts";

export default function App() {
  return (
    // `userSelect: none` no es cosmético: sin él, arrastrar una llave por
    // encima de un texto arranca una selección del navegador que se queda con
    // el puntero y el gesto se pierde a mitad de camino.
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="light" />
      <ProgressProvider>
        <Root />
      </ProgressProvider>
    </GestureHandlerRootView>
  );
}

function Root() {
  const { progress, ready, record } = useProgress();
  const [node, setNode] = useState<NodeSpec | null>(null);
  const [level, setLevel] = useState<LevelBase | null>(null);
  const [phase, setPhase] = useState<Phase>("play");
  // Repetir un nivel lo vuelve a montar desde cero, guía incluida.
  const [run, setRun] = useState(0);
  const [fresh, setFresh] = useState<string | null>(null);
  const clearFresh = useCallback(() => setFresh(null), []);
  const startPlay = useCallback(() => setPhase("play"), []);
  // Cada intento que la actividad anota pasa también por acá hacia Tomi, que
  // ofrece una pista después de varios que no avanzaron.
  const attempts = useRef<((correct: boolean) => void) | null>(null);
  // Estable a propósito: las actividades anotan desde efectos que dependen de
  // `onEvent` (el `sawLayer` al montar). Una función nueva por render hacía que
  // cada anotación volviera a disparar el efecto y el juego se colgaba en un bucle.
  const onEvent = useCallback(
    (event: Event) => {
      record(event);
      if (event.kind === "attempt") attempts.current?.(event.correct);
    },
    [record],
  );

  // El mapa no debe parpadear de bloqueado a abierto mientras se lee el
  // registro, así que espera. Es un disco local: se ve un cuadro, no una espera.
  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={theme.color.inkDim} />
      </View>
    );
  }

  /** Entrar a un nivel: por su tarjeta de entrada si tiene lección, directo al juego si no. */
  const open = (n: NodeSpec, l: LevelBase): void => {
    setNode(n);
    setLevel(l);
    setPhase(lessonFor(n.id, l.n) ? "intro" : "play");
    setRun((r) => r + 1);
  };

  const toConcepts = (): void => {
    setLevel(null);
    setNode(null);
  };

  if (!node) return <NodeMap levelsDone={progress.levelsDone} onPick={setNode} />;

  const done = progress.levelsDone[node.id] ?? 0;
  const Activity = level ? activityFor(node.id) : undefined;

  if (level && Activity) {
    const nav: LessonNav = {
      next: () => {
        const following = node.levels.find((l) => l.n === level.n + 1);
        if (following) {
          open(node, following);
          return;
        }
        // El registro se escribe en segundo plano: el nodo recién terminado
        // puede no figurar todavía, así que acá se lo da por terminado.
        const after = nodeAfter(node.id);
        const first = after?.levels[0];
        const levelsDone = { ...progress.levelsDone, [node.id]: node.levels.length };
        if (after && first && isNodeOpen(after.id, levelsDone)) open(after, first);
        else toConcepts();
      },
      replay: () => open(node, level),
      levels: () => setLevel(null),
      concepts: toConcepts,
      play: (id, n) => {
        const spec = nodeById(id);
        const l = spec?.levels.find((x) => x.n === n);
        if (spec && l) open(spec, l);
      },
    };
    const id = `${node.id}:${level.n}:${run}`;
    return (
      <LessonProvider
        key={id}
        node={node}
        level={level}
        phase={phase}
        onStart={startPlay}
        nav={nav}
        fresh={fresh}
        clearFresh={clearFresh}
        attempts={attempts}
      >
        <Activity
          key={id}
          node={node}
          level={level}
          levelsDone={done}
          onEvent={onEvent}
          onLevelDone={() => {
            const key = lessonFor(node.id, level.n)?.key.id;
            if (key) setFresh(key);
            setPhase("done");
          }}
          onExit={() => setLevel(null)}
        />
      </LessonProvider>
    );
  }

  return (
    <LevelMap
      node={node}
      unlocked={done + 1}
      onPick={(l) => open(node, l)}
      onExit={() => setNode(null)}
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, userSelect: "none" },
  loading: {
    flex: 1,
    backgroundColor: theme.color.bg,
    alignItems: "center",
    justifyContent: "center",
  },
});
