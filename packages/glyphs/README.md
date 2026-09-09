# @mathy/glyphs

Contornos vectoriales de los glifos matemáticos, horneados en build time.

## Por qué existe

Mathy anima fórmulas al estilo Manim: cada término es un objeto que se mueve y
se transforma, así que hace falta el contorno del glifo, no un texto pintado.
Skia en su versión web no expone `Path.MakeFromText` ni `Paragraph.getPath`, las
dos APIs que darían ese contorno, de modo que el problema no se puede resolver
en runtime. Se resuelve antes: el horneador tipografía cada carácter con MathJax
v4 y guarda el path resultante en `src/atlas.json`.

MathJax corre sin DOM con `liteAdaptor`, y configurado con `fontCache: 'none'`
emite un `<path d="...">` explícito por glifo en vez de referencias a un `<defs>`
compartido. De ahí salen el contorno y las métricas.

## Unidades

**Todo el atlas está en em, con el eje Y hacia abajo.**

MathJax dibuja en unidades de fuente donde 1000 equivale a un em y con el eje Y
hacia arriba, que es la convención tipográfica. Skia usa el eje Y hacia abajo. La
conversión se hace al hornear, una sola vez, y no en el consumidor: el
horneador divide por 1000 y le da vuelta el signo a todas las coordenadas Y,
tanto en el `d` del path como en la caja.

En consecuencia, dibujar un glifo a un tamaño de fuente dado es multiplicar por
ese tamaño y nada más:

```ts
import { getGlyph } from "@mathy/glyphs";

const g = getGlyph("x");
if (g) {
  const path = Path.MakeFromSVGString(g.path)!;   // en em
  path.transform([fontSize, 0, penX, 0, fontSize, penY, 0, 0, 1]);
  penX += g.advance * fontSize;
}
```

Qué significa cada campo, con el eje Y hacia abajo y el origen en la línea de
base, sobre el punto de dibujo:

| campo     | significado                                                        |
| --------- | ------------------------------------------------------------------ |
| `path`    | el contorno como `d` de SVG, con comandos absolutos                  |
| `advance` | cuánto avanza el punto de dibujo después del glifo                   |
| `left`    | borde izquierdo de la tinta; positivo, es el margen del glifo        |
| `right`   | borde derecho de la tinta; nunca pasa de `advance`                   |
| `top`     | techo de la tinta; **negativo**, porque está sobre la línea de base  |
| `bottom`  | piso de la tinta; **positivo solo si el glifo tiene descendente**    |

El signo de `bottom` es la forma más rápida de verificar que la conversión de
ejes está bien: la `y` tiene descendente y da `0.205`, la `x` no lo tiene y da
`0.011`, que es apenas el rebase del trazo. Si esos signos se invirtieran, el
eje estaría al revés. El horneador chequea justamente eso antes de escribir el
JSON, y hay un test que lo repite sobre la salida.

La caja es la **caja de tinta exacta**: incluye los extremos reales de las
curvas de Bézier, no los puntos de control, que caen fuera del trazo.

## Uso

```ts
import { atlas, getGlyph, type Glyph } from "@mathy/glyphs";
```

`atlas` es un `Record<string, Glyph>` indexado por el carácter. `getGlyph`
devuelve `undefined` para lo que no está horneado. No hay dependencias de
runtime: el JSON se importa y listo.

## Juego de caracteres

Dígitos `0` a `9`; las variables `x`, `y`, `a`, `b`, `n` en itálica matemática;
los operadores `+`, `−`, `×`, `÷`, `=`; los paréntesis `(` y `)`; y el punto
decimal `.`. Son 23 glifos.

Ojo con dos claves que no son las que se escriben en TeX: el menos es `−`
(U+2212, MINUS SIGN) y no el guion `-`, y las variables se guardan bajo la letra
común (`x`) aunque el glifo sea el de itálica matemática (U+1D465).

## Hornear

```sh
npm run bake --workspace @mathy/glyphs
```

El horneado es reproducible: las claves salen ordenadas y los números
redondeados, así que dos corridas dan el mismo JSON byte a byte y el diff de un
cambio real se lee de un vistazo.

Para agregar caracteres, sumá una entrada a `CHARSET` en `tools/bake.ts`. Cada
entrada declara el carácter, la expresión TeX mínima que lo produce y el
codepoint que MathJax pone en `data-c`; si ese codepoint no coincide con lo
declarado el horneado falla, que es lo que se quiere: una actualización de
MathJax que cambie el mapeo se nota en el build y no en pantalla.
