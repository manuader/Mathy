/**
 * El adaptador de dibujo. Es lo único del proyecto que sabe que existe Skia.
 *
 * Dos reglas gobiernan este archivo, y las dos vienen de medir, no de opinar:
 *
 * 1. Modo retained. El árbol de componentes se arma una vez con la unión de los
 *    glifos de los dos estados y no cambia durante la animación. Un glifo que
 *    todavía no se ve está montado con opacidad cero. Montar y desmontar
 *    empujaría al modo inmediato, donde cada cuadro paga el cruce de frontera.
 *
 * 2. Un componente por glifo, cada uno con su propio valor derivado. Es lo que
 *    permite que la lista sea estable y que Reanimated actualice cada glifo en
 *    el hilo de UI sin pasar por JavaScript en cada cuadro.
 */

import { Group, Path, Skia } from "@shopify/react-native-skia";
import { getGlyph } from "@mathy/glyphs";
import { sampleMorph, type MorphPlan, type RateFunc } from "@mathy/viz-core";
import { useDerivedValue, type SharedValue } from "react-native-reanimated";
import { useMemo } from "react";

/** Los trazos del atlas se parsean una sola vez por carácter y se reusan. */
const pathCache = new Map<string, ReturnType<typeof Skia.Path.MakeFromSVGString>>();

function pathFor(char: string) {
  const hit = pathCache.get(char);
  if (hit !== undefined) return hit;
  const glyph = getGlyph(char);
  const path = glyph ? Skia.Path.MakeFromSVGString(glyph.path) : null;
  pathCache.set(char, path);
  return path;
}

interface GlyphViewProps {
  readonly index: number;
  readonly char: string;
  readonly plan: MorphPlan;
  readonly progress: SharedValue<number>;
  readonly ease: RateFunc;
  readonly fontSize: number;
  readonly color: string;
}

/**
 * Un glifo. Su transformación y su opacidad se derivan del progreso, así que
 * cuando el dedo se mueve nada de esto vuelve al hilo de JavaScript.
 */
function GlyphView({ index, char, plan, progress, ease, fontSize, color }: GlyphViewProps) {
  const path = useMemo(() => pathFor(char), [char]);

  const transform = useDerivedValue(() => {
    const f = sampleMorph(plan, progress.value, ease)[index];
    if (!f) return [{ translateX: 0 }, { translateY: 0 }, { scale: fontSize }];
    return [{ translateX: f.x * fontSize }, { translateY: f.y * fontSize }, { scale: fontSize }];
  }, [plan, index, fontSize]);

  const opacity = useDerivedValue(() => {
    const f = sampleMorph(plan, progress.value, ease)[index];
    return f ? f.opacity : 0;
  }, [plan, index]);

  if (!path) return null;
  return (
    <Group transform={transform} opacity={opacity}>
      <Path path={path} color={color} />
    </Group>
  );
}

export interface MorphViewProps {
  readonly plan: MorphPlan;
  readonly progress: SharedValue<number>;
  readonly ease: RateFunc;
  /** Tamaño de fuente en puntos. El atlas está en unidades de em. */
  readonly fontSize: number;
  /** Sin color explícito Skia pinta con su pincel por defecto, que es negro. */
  readonly color?: string;
}

/**
 * Dibuja un plan de morph. La lista de glifos sale del plan y no cambia, que es
 * la condición del modo retained.
 */
export function MorphView({ plan, progress, ease, fontSize, color = "#e8eaed" }: MorphViewProps) {
  return (
    <>
      {plan.steps.map((step, i) => (
        <GlyphView
          key={step.key}
          index={i}
          char={step.char}
          plan={plan}
          progress={progress}
          ease={ease}
          fontSize={fontSize}
          color={color}
        />
      ))}
    </>
  );
}

export { pathFor };
