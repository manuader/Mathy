import { useCallback, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import type { Level } from "@mathy/mechanics";
import { LevelMap } from "./src/LevelMap";
import { OneStepGame } from "./src/OneStepGame";

export default function App() {
  // Cuántos niveles se recorrieron. Todavía sin persistencia: eso es del motor
  // de curriculum, que llega en un hito posterior.
  const [unlocked, setUnlocked] = useState(1);
  const [playing, setPlaying] = useState<Level | null>(null);

  const finish = useCallback(() => {
    if (playing) setUnlocked((u) => Math.max(u, playing.n + 1));
    setPlaying(null);
  }, [playing]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      {playing ? (
        <OneStepGame
          key={playing.n}
          level={playing}
          onLevelDone={finish}
          onExit={() => setPlaying(null)}
        />
      ) : (
        <LevelMap unlocked={unlocked} onPick={setPlaying} />
      )}
    </GestureHandlerRootView>
  );
}
