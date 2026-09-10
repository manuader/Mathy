/**
 * Lumi, el limón profe que guía.
 *
 * Es la única con cara en todo el juego. Las frutas, las piedras y los cofres no
 * tienen: un objeto que se cuenta no puede ser a la vez un personaje que se mira.
 * Por la misma razón, el limón nunca aparece como fruta para contar. Lumi habla
 * en la guía, aparece en las tarjetas de entrada y cierre, y reacciona a lo que
 * el jugador hizo. No premia ni castiga: acompaña.
 *
 * Si la pose no tiene imagen generada, se dibuja con vistas: el limón, su
 * birrete y su cara. El reemplazo no es un cuadrado gris; es Lumi, más simple.
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
import { lumiArt, type LumiPose } from "../art/index.ts";
import { theme } from "./theme.ts";

const OUTLINE = "#1d1830";
const LEMON = "#ffd23f";
const LEMON_DEEP = "#ff9f2e";
const CAP = "#2b2f6b";

export function Lumi({
  pose = "hero",
  size = 96,
  float = true,
}: {
  readonly pose?: LumiPose;
  readonly size?: number;
  readonly float?: boolean;
}) {
  const k = useSharedValue(0);
  useEffect(() => {
    if (!float) return;
    k.value = withRepeat(withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.sin) }), -1, true);
    return () => cancelAnimation(k);
  }, [k, float]);
  const bob = useAnimatedStyle(() => ({ transform: [{ translateY: -5 * k.value }] }));

  const art = lumiArt(pose, size <= 110 ? "small" : "large");
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

function Drawn({ pose, size: s }: { readonly pose: LumiPose; readonly size: number }) {
  const closed = pose === "sleep" || pose === "cheer" || pose === "key";
  const body = s * 0.64;
  const eye = body * 0.2;
  const bx = (s - body) / 2;
  const by = s * 0.28;

  return (
    <View style={{ width: s, height: s }}>
      {/* Patitas. */}
      {[-1, 1].map((side) => (
        <View
          key={`p${side}`}
          style={[styles.abs, styles.limb, { left: s / 2 + side * body * 0.18 - s * 0.045, top: by + body * 0.9, width: s * 0.09, height: s * 0.12 }]}
        />
      ))}
      {/* El limón: amarillo arriba, naranja abajo. */}
      <View
        style={[
          styles.abs,
          { left: bx, top: by, width: body, height: body, borderRadius: body / 2, backgroundColor: LEMON_DEEP, borderWidth: 3, borderColor: OUTLINE, overflow: "hidden" },
        ]}
      >
        <View style={{ height: body * 0.62, backgroundColor: LEMON, borderBottomLeftRadius: body, borderBottomRightRadius: body }} />
      </View>
      {/* Ojos. */}
      {[-1, 1].map((side) => (
        <View
          key={`o${side}`}
          style={[
            styles.abs,
            closed
              ? { left: s / 2 + side * body * 0.2 - eye / 2, top: by + body * 0.36, width: eye, height: eye / 2, borderTopLeftRadius: eye, borderTopRightRadius: eye, borderWidth: 2.5, borderBottomWidth: 0, borderColor: OUTLINE }
              : { left: s / 2 + side * body * 0.2 - eye / 2, top: by + body * 0.3, width: eye, height: eye * 1.15, borderRadius: eye, backgroundColor: OUTLINE },
          ]}
        >
          {closed ? null : (
            <View style={[styles.abs, { left: eye * 0.18, top: eye * 0.16, width: eye * 0.34, height: eye * 0.34, borderRadius: eye, backgroundColor: "#fff" }]} />
          )}
        </View>
      ))}
      {/* Cachetes y sonrisa. */}
      {[-1, 1].map((side) => (
        <View
          key={`c${side}`}
          style={[styles.abs, { left: s / 2 + side * body * 0.32 - eye * 0.55, top: by + body * 0.52, width: eye * 1.1, height: eye * 0.7, borderRadius: eye, backgroundColor: "rgba(255, 120, 120, 0.55)" }]}
        />
      ))}
      <View
        style={[
          styles.abs,
          { left: s / 2 - body * 0.13, top: by + body * 0.56, width: body * 0.26, height: body * 0.15, borderBottomLeftRadius: body, borderBottomRightRadius: body, backgroundColor: "#5a1a1f", borderWidth: 2, borderColor: OUTLINE },
        ]}
      />
      {/* La hoja y el birrete. */}
      <View style={[styles.abs, { left: s * 0.5, top: by - s * 0.06, width: s * 0.1, height: s * 0.06, borderRadius: s, backgroundColor: "#52d485", borderWidth: 2, borderColor: OUTLINE, transform: [{ rotate: "-20deg" }] }]} />
      <View style={[styles.abs, { left: s * 0.22, top: by - s * 0.14, width: s * 0.56, height: s * 0.1, backgroundColor: CAP, borderWidth: 2, borderColor: OUTLINE, transform: [{ skewX: "-12deg" }] }]} />
      <View style={[styles.abs, { left: s * 0.34, top: by - s * 0.06, width: s * 0.32, height: s * 0.08, backgroundColor: CAP, borderWidth: 2, borderColor: OUTLINE, borderTopWidth: 0 }]} />
      <View style={[styles.abs, { left: s * 0.25, top: by - s * 0.1, width: 2, height: s * 0.14, backgroundColor: theme.color.gold }]} />
      <View style={[styles.abs, { left: s * 0.25 - 4, top: by + s * 0.03, width: 10, height: 10, borderRadius: 5, backgroundColor: theme.color.gold }]} />
      {pose === "key" ? <KeyInHand s={s} /> : null}
    </View>
  );
}

/** La llave que Lumi levanta al cerrar un nivel: un anillo y una barra dorados. */
function KeyInHand({ s }: { readonly s: number }) {
  return (
    <View style={[styles.abs, { right: s * 0.02, top: s * 0.1, width: s * 0.3, height: s * 0.3, transform: [{ rotate: "-35deg" }] }]}>
      <View style={[styles.abs, { left: 0, top: s * 0.08, width: s * 0.13, height: s * 0.13, borderRadius: s, borderWidth: 3, borderColor: theme.color.gold }]} />
      <View style={[styles.abs, { left: s * 0.12, top: s * 0.135, width: s * 0.16, height: 3, backgroundColor: theme.color.gold }]} />
      <View style={[styles.abs, { left: s * 0.23, top: s * 0.135, width: 3, height: s * 0.05, backgroundColor: theme.color.gold }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  abs: { position: "absolute" },
  limb: { backgroundColor: LEMON, borderRadius: 6, borderWidth: 2, borderColor: OUTLINE },
});
