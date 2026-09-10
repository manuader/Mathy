/**
 * Las fichas que una actividad dibuja adentro del lienzo (la bandeja de números,
 * los pares, el renglón de la ecuación) con la misma cara que `chipFace` de
 * `Kit.tsx`: canto oscuro abajo, luz arriba, borde de vidrio. Una ficha es un
 * objeto que se levanta, no un contorno que se toca, y sobre el paisaje un trazo
 * fino se perdía.
 *
 * Recibe todas las fichas de un grupo en un solo `SkPath`, así que cuesta lo
 * mismo con dos que con veinte: tres dibujos por grupo, sea cual sea la cantidad.
 */
import { useMemo } from "react";
import { Group, LinearGradient, Path, vec, type SkPath } from "@shopify/react-native-skia";
import { chipTone } from "./Kit.tsx";

/** Cuánto asoma el canto debajo de la ficha: el mismo borde inferior que `chipFace`. */
const EDGE = 3;

export function ChipBodies({ path }: { readonly path: SkPath }) {
  // Un solo degradado para todo el grupo, de arriba abajo de lo que ocupa: las
  // fichas de una bandeja están en una fila, así que cada una recibe la misma luz.
  const b = useMemo(() => path.getBounds(), [path]);
  return (
    <Group>
      <Group transform={[{ translateY: EDGE }]}>
        <Path path={path} color={chipTone.edge} />
      </Group>
      <Path path={path}>
        <LinearGradient
          start={vec(0, b.y)}
          end={vec(0, b.y + Math.max(1, b.height))}
          colors={[chipTone.top, chipTone.face, chipTone.low]}
        />
      </Path>
      <Path path={path} color={chipTone.rimTop} style="stroke" strokeWidth={1} />
    </Group>
  );
}
