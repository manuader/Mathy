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
 *
 * El marco también es lo que hace que los 21 minijuegos se vean del mismo juego:
 * el mundo del área detrás, la barra de arriba, y las dos tarjetas de la lección
 * (entrada y cierre). Viven acá y no en cada minijuego para que todos los nodos
 * las tengan sin tocar su actividad.
 *
 * Y los dos compañeros: Lumi en la guía (la pone cada actividad con su lección)
 * y Tomi en el rincón (`HintBuddy`), que ofrece una pista cuando el jugador
 * lleva un rato sin tocar el tablero. Por eso el marco anota cada toque sobre la
 * actividad, sin quedarse con él: la actividad lo recibe igual.
 */
import { createContext, useContext, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { unlockedEntries } from "@mathy/content";
import { t } from "../i18n.ts";
import { earnedKeys } from "../lessons/index.ts";
import { useLesson } from "../lessons/LessonContext.tsx";
import { useProgress } from "../progress.tsx";
import { Calculator } from "./Calculator.tsx";
import { Cheatsheet } from "./Cheatsheet.tsx";
import { HintBuddy } from "./HintBuddy.tsx";
import { LevelComplete } from "./LevelComplete.tsx";
import { LevelIntro } from "./LevelIntro.tsx";
import { play, setMuted, useMuted } from "./sound.ts";
import { reachedNodes } from "./unlocks.ts";
import { World } from "./World.tsx";
import { areaOf, theme } from "./theme.ts";

type Panel = "none" | "cheatsheet" | "calculator";

/**
 * Lo que ocupa la barra de arriba (su margen, su alto y un respiro). La actividad
 * empieza debajo: centrada en la pantalla entera, en el teléfono el título le
 * quedaba abajo de la barra y cortado arriba.
 */
const BAR_SPACE = 64;
/** Por debajo de este ancho las cuatro píldoras de la barra no entran enteras. */
const NARROW_BAR = 430;

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
  children,
}: {
  /** Ya no se usa: las herramientas leen el registro entero. Queda para no tocar las 21 actividades. */
  readonly levelsDone?: number;
  readonly children: React.ReactNode;
}) {
  const { width, height } = useWindowDimensions();
  const { progress } = useProgress();
  const lesson = useLesson();
  const [panel, setPanel] = useState<Panel>("none");
  const [highlight, setHighlight] = useState<string | null>(null);
  const muted = useMuted();
  // El último toque sobre el tablero: con eso Tomi sabe si el jugador está quieto.
  const lastTouch = useRef(Date.now());

  const reached = useMemo(() => reachedNodes(progress.levelsDone), [progress.levelsDone]);
  const keys = useMemo(() => earnedKeys(progress.levelsDone), [progress.levelsDone]);
  const saved = useMemo(
    () => keys.length + unlockedEntries(reached.cheatsheet).length,
    [keys, reached],
  );

  // Como máximo el 40 % del ancho, y con un piso para que la chuleta se lea.
  const panelWidth = panel === "none" ? 0 : Math.round(Math.min(Math.max(width * 0.4, 300), 420));
  const viewport = useMemo(
    () => ({ width: Math.max(width - panelWidth, 1), height: Math.max(height - BAR_SPACE, 1) }),
    [width, panelWidth, height],
  );

  const close = (): void => setPanel("none");
  const openCheatsheet = (id?: string): void => {
    // Abrir la chuleta con una llave recién ganada la señala, venga de donde venga.
    setHighlight(id ?? lesson?.fresh ?? null);
    setPanel("cheatsheet");
    lesson?.clearFresh();
  };

  return (
    <View style={styles.shell}>
      <View style={styles.activity}>
        <World area={lesson ? areaOf(lesson.node.id) : "found"} />
        <View
          style={[StyleSheet.absoluteFill, styles.below]}
          onPointerDownCapture={() => {
            lastTouch.current = Date.now();
          }}
        >
          <ViewportContext.Provider value={viewport}>{children}</ViewportContext.Provider>
        </View>

        <View style={styles.bar}>
          {lesson ? <Pill label={t("ui.bar.levels")} onPress={lesson.nav.levels} icon="‹" iconOnlyWhenNarrow /> : <View />}
          <View style={styles.tools}>
            <Pill
              label={saved > 0 ? `${t("ui.tools.cheatsheet")} · ${saved}` : t("ui.tools.cheatsheet")}
              active={panel === "cheatsheet"}
              fresh={lesson?.fresh != null}
              onPress={() => (panel === "cheatsheet" ? close() : openCheatsheet())}
            />
            <Pill
              label={muted ? t("ui.tools.soundOff") : t("ui.tools.sound")}
              onPress={() => {
                setMuted(!muted);
                if (muted) play("tap");
              }}
            />
            <Pill
              label={t("ui.tools.calculator")}
              active={panel === "calculator"}
              onPress={() => setPanel((p) => (p === "calculator" ? "none" : "calculator"))}
            />
          </View>
        </View>

        <HintBuddy lastTouch={lastTouch} onOpenKey={openCheatsheet} />

        {lesson?.phase === "intro" && lesson.lesson ? <LevelIntro onOpenKey={openCheatsheet} /> : null}
        {lesson?.phase === "done" ? <LevelComplete onOpenCheatsheet={openCheatsheet} /> : null}
      </View>

      {panel !== "none" ? (
        <View style={[styles.panel, { width: panelWidth }]}>
          {panel === "cheatsheet" ? (
            <Cheatsheet
              reached={reached.cheatsheet}
              keys={keys}
              highlight={highlight}
              onPlay={lesson ? lesson.nav.play : null}
              onClose={close}
            />
          ) : (
            <Calculator ready={reached.ready} onClose={close} />
          )}
        </View>
      ) : null}
    </View>
  );
}

/**
 * Una píldora de vidrio: presente, legible sobre el paisaje, sin competir con el
 * tablero. En un teléfono angosto las cuatro no entraban y "Calculadora" quedaba
 * cortada: ahí se achican y la de volver muestra sólo la flecha (su nombre queda
 * para el lector de pantalla).
 */
function Pill({
  label,
  onPress,
  icon,
  active = false,
  fresh = false,
  iconOnlyWhenNarrow = false,
}: {
  readonly label: string;
  readonly onPress: () => void;
  readonly icon?: string;
  readonly active?: boolean;
  readonly fresh?: boolean;
  readonly iconOnlyWhenNarrow?: boolean;
}) {
  const narrow = useWindowDimensions().width < NARROW_BAR;
  const soloIcono = narrow && iconOnlyWhenNarrow && icon !== undefined;
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.pill,
        narrow && styles.pillNarrow,
        active && styles.pillOn,
        fresh && styles.pillFresh,
        pressed && styles.pressed,
      ]}
    >
      {fresh ? <View style={styles.freshDot} /> : null}
      {icon ? <Text style={styles.pillIcon}>{icon}</Text> : null}
      {soloIcono ? null : (
        <Text style={[styles.pillLabel, narrow && styles.pillLabelNarrow, (active || fresh) && styles.pillLabelOn]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, flexDirection: "row", backgroundColor: theme.color.bgDeep },
  activity: { flex: 1, overflow: "hidden" },
  bar: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 5,
  },
  tools: { flexDirection: "row", gap: theme.space[1] },
  below: { top: BAR_SPACE },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 40,
    paddingHorizontal: theme.space[3],
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.color.glassLine,
    backgroundColor: theme.color.glass,
  },
  pillNarrow: { paddingHorizontal: theme.space[2], gap: 4 },
  pillOn: { borderColor: theme.color.accent },
  pillFresh: { borderColor: theme.color.gold },
  pressed: { opacity: 0.8, transform: [{ scale: 0.97 }] },
  freshDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.color.gold },
  pillIcon: { color: theme.color.ink, fontSize: 20, lineHeight: 22, marginTop: -2 },
  pillLabel: { color: theme.color.inkDim, fontSize: 14, fontWeight: "500" },
  pillLabelNarrow: { fontSize: 13 },
  pillLabelOn: { color: theme.color.ink },
  panel: {
    borderLeftWidth: 1,
    borderLeftColor: theme.color.glassLine,
    backgroundColor: theme.color.surface,
  },
});
