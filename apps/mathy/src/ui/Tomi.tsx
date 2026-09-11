/**
 * Tomi, el tomate que da pistas.
 *
 * Es el compañero de Lumi y la otra cara del juego. Los dos tienen trabajos
 * distintos y no se pisan: Lumi enseña (la guía, las tarjetas, las llaves) y Tomi
 * aparece cuando el jugador no sabe qué hacer. Por eso Tomi calla mientras la
 * guía de Lumi está en pantalla: dos voces a la vez son ninguna. Su lamparita
 * dice en qué está: apagada cuando espera, encendida cuando tiene una pista.
 *
 * Igual que el limón, el tomate nunca aparece como fruta para contar: un objeto
 * que se cuenta no puede ser a la vez un personaje que se mira.
 *
 * Si la pose no tiene imagen generada, se dibuja con vistas: el reemplazo es
 * Tomi, más simple, no un cuadrado gris.
 */
import { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { tomiArt, type TomiPose } from "../art/index.ts";
import { theme } from "./theme.ts";

const OUTLINE = "#2a1416";
const RED = "#e8432e";
const RED_DEEP = "#b92a1e";
const LEAF = "#3fa34d";
const BULB_OFF = "#c9ced8";

export function Tomi({
  pose = "hero",
  size = 96,
  float = true,
}: {
  readonly pose?: TomiPose;
  readonly size?: number;
  readonly float?: boolean;
}) {
  const k = useSharedValue(0);
  useEffect(() => {
    if (!float) return;
    // Un poco más rápido que Lumi: el que ayuda está atento.
    k.value = withRepeat(withTiming(1, { duration: 1900, easing: Easing.inOut(Easing.sin) }), -1, true);
    return () => cancelAnimation(k);
  }, [k, float]);
  const bob = useAnimatedStyle(() => ({ transform: [{ translateY: -4 * k.value }] }));

  const art = tomiArt(pose, size <= 110 ? "small" : "large");
  return (
    <Animated.View style={[{ width: size, height: size }, bob]}>
      {art !== undefined ? (
        <Image source={art} resizeMode="contain" style={{ width: size, height: size }} />
      ) : (
        <Drawn pose={pose} size={size} />
      )}
    </Animated.View>
  );
}

function Drawn({ pose, size: s }: { readonly pose: TomiPose; readonly size: number }) {
  const icon = pose === "icon";
  const body = s * (icon ? 0.78 : 0.62);
  const bx = (s - body) / 2;
  const by = icon ? s * 0.16 : s * 0.3;
  const eye = body * 0.19;
  const closed = pose === "cheer";

  return (
    <View style={{ width: s, height: s }}>
      {icon
        ? null
        : [-1, 1].map((side) => (
            <View
              key={`p${side}`}
              style={[styles.abs, styles.limb, { left: s / 2 + side * body * 0.2 - s * 0.045, top: by + body * 0.88, width: s * 0.09, height: s * 0.11 }]}
            />
          ))}
      {/* El tomate: rojo, más profundo abajo, con un brillo arriba a la izquierda. */}
      <View
        style={[
          styles.abs,
          { left: bx, top: by, width: body, height: body * 0.92, borderRadius: body / 2, backgroundColor: RED_DEEP, borderWidth: 3, borderColor: OUTLINE, overflow: "hidden" },
        ]}
      >
        <View style={{ height: body * 0.6, backgroundColor: RED, borderBottomLeftRadius: body, borderBottomRightRadius: body }} />
        <View style={[styles.abs, { left: body * 0.16, top: body * 0.12, width: body * 0.22, height: body * 0.12, borderRadius: body, backgroundColor: "rgba(255, 220, 210, 0.7)" }]} />
      </View>
      {/* Ojos. */}
      {[-1, 1].map((side) => (
        <View
          key={`o${side}`}
          style={[
            styles.abs,
            closed
              ? { left: s / 2 + side * body * 0.19 - eye / 2, top: by + body * 0.34, width: eye, height: eye / 2, borderTopLeftRadius: eye, borderTopRightRadius: eye, borderWidth: 2.5, borderBottomWidth: 0, borderColor: OUTLINE }
              : { left: s / 2 + side * body * 0.19 - eye / 2, top: by + body * 0.28, width: eye, height: eye * 1.15, borderRadius: eye, backgroundColor: OUTLINE },
          ]}
        >
          {closed ? null : (
            <View style={[styles.abs, { left: eye * 0.18, top: eye * 0.16, width: eye * 0.34, height: eye * 0.34, borderRadius: eye, backgroundColor: "#fff" }]} />
          )}
        </View>
      ))}
      {/* Cachetes y la sonrisa abierta. */}
      {[-1, 1].map((side) => (
        <View
          key={`c${side}`}
          style={[styles.abs, { left: s / 2 + side * body * 0.31 - eye * 0.55, top: by + body * 0.5, width: eye * 1.1, height: eye * 0.7, borderRadius: eye, backgroundColor: "rgba(255, 170, 170, 0.6)" }]}
        />
      ))}
      <View
        style={[
          styles.abs,
          { left: s / 2 - body * 0.14, top: by + body * 0.54, width: body * 0.28, height: body * 0.17, borderBottomLeftRadius: body, borderBottomRightRadius: body, backgroundColor: "#5a1418", borderWidth: 2, borderColor: OUTLINE, overflow: "hidden" },
        ]}
      >
        <View style={{ marginTop: body * 0.07, height: body * 0.1, backgroundColor: "#ff8a95" }} />
      </View>
      {/* La corona de hojitas en estrella y el tallo. */}
      {[-60, -25, 5, 35, 65].map((deg, i) => (
        <View
          key={`h${i}`}
          style={[
            styles.abs,
            { left: s / 2 - s * 0.05, top: by - s * 0.02, width: s * 0.1, height: s * 0.045, borderRadius: s, backgroundColor: LEAF, borderWidth: 1.5, borderColor: OUTLINE, transform: [{ rotate: `${deg}deg` }, { translateX: (i - 2) * s * 0.035 }] },
          ]}
        />
      ))}
      <View style={[styles.abs, { left: s / 2 - 2, top: by - s * 0.07, width: 4, height: s * 0.06, borderRadius: 2, backgroundColor: LEAF }]} />
      {icon ? null : <Bulb s={s} lit={pose !== "think"} />}
    </View>
  );
}

/** La lamparita: encendida cuando hay una pista, apagada cuando Tomi espera. */
function Bulb({ s, lit }: { readonly s: number; readonly lit: boolean }) {
  const d = s * 0.18;
  return (
    <View style={[styles.abs, { right: s * 0.08, top: s * 0.04, width: d, height: d * 1.4, alignItems: "center" }]}>
      <View style={{ width: d, height: d, borderRadius: d, backgroundColor: lit ? theme.color.gold : BULB_OFF, borderWidth: 2, borderColor: OUTLINE }} />
      <View style={{ width: d * 0.46, height: d * 0.3, marginTop: -2, borderRadius: 2, backgroundColor: "#8a93a3", borderWidth: 2, borderColor: OUTLINE }} />
    </View>
  );
}

const styles = StyleSheet.create({
  abs: { position: "absolute" },
  limb: { backgroundColor: RED, borderRadius: 6, borderWidth: 2, borderColor: OUTLINE },
});
