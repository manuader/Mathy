/**
 * El marco que sostiene la actividad y las dos herramientas del jugador.
 *
 * La regla dura: abrir la chuleta o la calculadora **no saca al jugador de la
 * actividad**. El panel se abre al costado y el lienzo se achica; nunca lo tapa
 * y nunca lo reemplaza. Cerrar devuelve al mismo punto, porque la actividad
 * nunca se desmontó.
 *
 * Por eso el ancho del lienzo no puede salir de `useWindowDimensions`: sale de
 * `useActivityViewport`, que descuenta el panel abierto.
 */
import { createContext, useContext, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Calculator } from "./Calculator.tsx";
import { Cheatsheet } from "./Cheatsheet.tsx";
import { reachedNodes } from "./unlocks.ts";
import { theme } from "./theme.ts";

type Panel = "none" | "cheatsheet" | "calculator";

interface Viewport {
  readonly width: number;
  readonly height: number;
}

const ViewportContext = createContext<Viewport | null>(null);

/** El espacio que le queda a la actividad, ya descontado el panel abierto. */
export function useActivityViewport(): Viewport {
  const window = useWindowDimensions();
  const inside = useContext(ViewportContext);
  return inside ?? { width: window.width, height: window.height };
}

export function ActivityShell({
  levelsDone,
  children,
}: {
  readonly levelsDone: number;
  readonly children: React.ReactNode;
}) {
  const { width, height } = useWindowDimensions();
  const [panel, setPanel] = useState<Panel>("none");
  const reached = useMemo(() => reachedNodes(levelsDone), [levelsDone]);

  // Como máximo el 40 % del ancho, y con un piso para que la chuleta se lea.
  const panelWidth = panel === "none" ? 0 : Math.round(Math.min(Math.max(width * 0.4, 300), 420));
  const viewport = useMemo(
    () => ({ width: Math.max(width - panelWidth, 1), height }),
    [width, panelWidth, height],
  );

  const toggle = (which: Panel) => (): void => setPanel((p) => (p === which ? "none" : which));
  const close = (): void => setPanel("none");

  return (
    <View style={styles.shell}>
      <View style={styles.activity}>
        <ViewportContext.Provider value={viewport}>{children}</ViewportContext.Provider>
        <View style={styles.tools}>
          <Tool label="Chuleta" active={panel === "cheatsheet"} onPress={toggle("cheatsheet")} />
          <Tool label="Calculadora" active={panel === "calculator"} onPress={toggle("calculator")} />
        </View>
      </View>

      {panel !== "none" ? (
        <View style={[styles.panel, { width: panelWidth }]}>
          {panel === "cheatsheet" ? (
            <Cheatsheet reached={reached} onClose={close} />
          ) : (
            <Calculator ready={reached} onClose={close} />
          )}
        </View>
      ) : null}
    </View>
  );
}

/** Discreto a propósito: la herramienta está, pero no compite con la actividad. */
function Tool({
  label,
  active,
  onPress,
}: {
  readonly label: string;
  readonly active: boolean;
  readonly onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} hitSlop={theme.hitSlop} style={[styles.tool, active && styles.toolOn]}>
      <Text style={[styles.toolLabel, active && styles.toolLabelOn]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, flexDirection: "row", backgroundColor: theme.color.bg },
  activity: { flex: 1 },
  tools: { position: "absolute", top: 48, right: 20, flexDirection: "row", gap: theme.space[1] },
  tool: {
    paddingHorizontal: theme.space[2],
    paddingVertical: theme.space[0],
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.color.line,
  },
  toolOn: { borderColor: theme.color.accent },
  toolLabel: { color: theme.color.inkFaint, fontSize: 12 },
  toolLabelOn: { color: theme.color.accent },
  panel: {
    borderLeftWidth: 1,
    borderLeftColor: theme.color.line,
    backgroundColor: theme.color.surface,
  },
});
