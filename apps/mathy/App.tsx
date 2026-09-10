/**
 * La raíz.
 *
 * El estado del jugador no vive acá: se pliega del registro de eventos, que es
 * lo único que se guarda. `App` solo elige qué pantalla se ve y le pasa a la
 * actividad la manera de anotar lo que pasó.
 */

import { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { NODE, type Level } from "@mathy/mechanics";
import { unlockedLevel } from "@mathy/progress";
import { LevelMap } from "./src/LevelMap";
import { OneStepGame } from "./src/OneStepGame";
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
  const [playing, setPlaying] = useState<Level | null>(null);

  // El mapa no debe parpadear de bloqueado a abierto mientras se lee el
  // registro, así que espera. Es un disco local: se ve un cuadro, no una espera.
  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={theme.color.inkDim} />
      </View>
    );
  }

  const unlocked = unlockedLevel(progress, NODE);
  const levelsDone = progress.levelsDone[NODE] ?? 0;

  return playing ? (
    <OneStepGame
      key={playing.n}
      level={playing}
      levelsDone={levelsDone}
      onEvent={record}
      onLevelDone={() => setPlaying(null)}
      onExit={() => setPlaying(null)}
    />
  ) : (
    <LevelMap unlocked={unlocked} onPick={setPlaying} />
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
