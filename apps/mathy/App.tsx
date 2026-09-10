/**
 * La raíz.
 *
 * El estado del jugador no vive acá: se pliega del registro de eventos, que es
 * lo único que se guarda. `App` solo elige qué pantalla se ve y le pasa a la
 * actividad la manera de anotar lo que pasó.
 *
 * Tres pantallas y una jerarquía: los conceptos, los niveles de un concepto, y
 * la actividad. La actividad es la única que ocupa la pantalla entera.
 */

import { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import type { LevelBase, NodeSpec } from "@mathy/mechanics";
import { LevelMap } from "./src/LevelMap";
import { NodeMap } from "./src/NodeMap";
import { activityFor } from "./src/activities/index.tsx";
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

  // El mapa no debe parpadear de bloqueado a abierto mientras se lee el
  // registro, así que espera. Es un disco local: se ve un cuadro, no una espera.
  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={theme.color.inkDim} />
      </View>
    );
  }

  if (!node) return <NodeMap levelsDone={progress.levelsDone} onPick={setNode} />;

  const done = progress.levelsDone[node.id] ?? 0;
  const Activity = level ? activityFor(node.id) : undefined;

  if (level && Activity) {
    return (
      <Activity
        key={`${node.id}:${level.n}`}
        node={node}
        level={level}
        levelsDone={done}
        onEvent={record}
        onLevelDone={() => setLevel(null)}
        onExit={() => setLevel(null)}
      />
    );
  }

  return (
    <LevelMap
      node={node}
      unlocked={done + 1}
      onPick={setLevel}
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
