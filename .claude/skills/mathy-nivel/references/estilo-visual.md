# El estilo de juego en la escena

La escena es Skia, un solo `<Canvas>` por pantalla, presupuesto de ~300 elementos
animados (decisión 11). El ejemplo completo es `apps/mathy/src/scenes/BowlScene.tsx`.
Todo color y medida sale de `apps/mathy/src/ui/theme.ts`.

## El color tiene un trabajo

| Token | Trabajo | Ejemplo del nodo 1 |
|---|---|---|
| `accent`, `coral`, `violet` | equipo: a qué colección pertenece | las marcas de cada fila en `visual` |
| `ok` | coincide | el puente entre dos frutas; el marco de la tarjeta correcta |
| `warn` | mirá acá | el anillo de la fruta sin pareja |
| `gold` | lo aprendido / la guía | anillos y luz de la guía; chispas junto a las menta |
| el color propio del objeto | qué es, cuando distinguirlo es parte del nivel | manzana, naranja, ciruela en el cuenco |

Reglas: adentro del lienzo, como máximo tres significados de color a la vez. Un
objeto concreto que se aplana en su representación pierde su color propio y toma
el de su equipo. El tono de un área (`AREAS[area].hue`) es de la interfaz, nunca
del lienzo. Nunca rojo de error.

## Un objeto con volumen

```tsx
<Group transform={transform} opacity={ao}>
  <Path path={parts.shadow} color="rgba(0, 0, 0, 0.30)" />          {/* sombra en el piso */}
  <Path path={parts.body}>
    <RadialGradient c={vec(-r * 0.35, -r * 0.45)} r={r * 1.7}
                    colors={[look.light, look.base, look.dark]} />   {/* luz arriba a la izquierda */}
  </Path>
  <Path path={parts.shine} color="rgba(255, 255, 255, 0.5)" />       {/* brillo */}
</Group>
```

- Las partes (`body`, `shine`, `shadow`, detalles como hoja y tallo) son `SkPath`
  memorizados por forma y tamaño; nunca se rearman por cuadro.
- Una paleta por objeto: `{ light, base, dark }`. Los contenedores (cuencos,
  canastas) son de madera con `LinearGradient` vertical; las superficies sobre el
  lienzo (bandejas, tarjetas) son vidrio: `rgba(255,255,255,0.05)` de relleno y
  `rgba(255,255,255,0.12)` de borde, o `rgba(9,17,29,0.9)` debajo de una tarjeta
  para que se lea sobre cualquier fondo.
- Sin cara, nunca. Sin PNG, nunca: el objeto tiene que poder fundirse en su
  símbolo (N §4).

## Jugo: cada gesto responde

**Levantar:** el objeto crece un 30 % mientras el dedo lo lleva.

**Soltar:** viaja desde donde lo dejó el dedo, no desde su casa, y rebota una vez:

```ts
const soltado = instant && dragIdx.value === index;
if (soltado) {
  ax.value = ax.value + dragX.value;   // parte de donde está el dedo
  ay.value = ay.value + dragY.value;
  dragIdx.value = -1;                   // que el arrastre no se sume dos veces
}
ax.value = withSpring(place.x, theme.spring.settle);
ay.value = withSpring(place.y, theme.spring.settle);
if (cambio && place.on) {
  pop.value = 1;
  pop.value = withSpring(0, theme.spring.settle);   // escala 1 + 0.22 · pop
}
```

**El evento que el nivel enseña** (dos cosas quedaron pareja, la balanza se niveló,
la llave abrió): una respuesta visible en el objeto que lo causó, una sola vez. En el
nodo 1, el puente crece desde el medio (`scaleY` con resorte), brilla con un halo
(`BlurMask`) y suelta seis chispas menta y oro que se abren y se apagan en ~700 ms.
El patrón está en `Bridge` y `Spark` de `BowlScene.tsx`: un `SharedValue` `burst`
de 0 a 1, y cada chispa deriva su posición y su opacidad de él.

**Atención:** un anillo `warn` que late con el pulso compartido de la escena
alrededor de lo que hay que mirar. Nunca un sacudón, nunca un sonido de error.

Todo lo que se monta para el jugo se monta desde el principio con opacidad cero
(modo retained, decisión 5): una chispa por hueco, no una chispa por evento.

## El marco que ya está hecho (no se reimplementa)

- `ui/World.tsx`: el paisaje del área (por `areaOf(node.id)`), el velo que oscurece
  el centro y las luciérnagas.
- `ui/Chrome.tsx`: `Header` (nombre del concepto con el tono del área, título del
  nivel, marca por nivel) y `Hint` (aviso que entra con un salto; menta u ámbar).
- `ui/Coach.tsx`: `CoachBanner` con Lumi y `Spotlight`.
- `ui/Kit.tsx`: `PrimaryButton` (dorado con canto que se hunde), `GhostButton`,
  `Overlay`.
- `ui/Lumi.tsx`: Lumi por pose, con su imagen si existe y un dibujo de reemplazo si no.

Si una pieza de estas no alcanza para un nodo, se extiende con una prop aditiva y
se vuelven a jugar los nodos que la usan; no se copia.

## Lo que heredan las escenas viejas

Las diez escenas anteriores al rediseño (`TrackScene`, `ChestScene`,
`BalanceScene`…) ya toman los colores nuevos por los tokens, pero todavía dibujan
con trazos finos y sin jugo. Un agente que toca una de esas escenas para su nodo le
aplica este estándar —volumen, color con trabajo, jugo en el evento— y vuelve a
jugar los nodos que la comparten.
