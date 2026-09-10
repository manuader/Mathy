# HANDOFF — Mathy, estado actual

> El diseño está cerrado: 348 nodos de grafo, **51 en la espina**, validador en cero errores.
> La construcción tiene **21 nodos jugables y verificados** de los 51: los veintiún primeros
> de la espina, de contar cuántas frutas hay hasta la función inversa. **Faltan 30.** La app
> corre en navegador; en iOS y Android todavía **no se probó**.
> Antes de tocar nada, mirá `git status`: si hay cambios sin commitear que no son tuyos,
> hay agentes en vuelo.

## 0. Cómo se usa este documento

Si sos un agente que llega: leé **este archivo y el más nuevo de `handoffs/`**. Dos
documentos. Con eso sabés dónde está parado el proyecto. No leas todos los `SESSION-*`:
son archivo, se consultan cuando este documento apunta a uno.

| Dónde | Qué va | Vida |
|---|---|---|
| este general | lo que sigue siendo cierto: arquitectura, reglas, decisiones cerradas, trampas pagadas, §4 | permanente, **acumula** |
| `docs/SESSION-<fecha>-<tema>.md` | el detalle de **una** sesión y su porqué | permanente, **no se edita después** |
| `handoffs/HANDOFF-<fecha>-<tema>.md` | el estado al cerrar: qué quedó abierto | efímero, **gitignoreado** |

Cuando termines, tres cosas: (1) escribí tu `SESSION-…`, (2) dejá tu `handoffs/HANDOFF-…`,
(3) **actualizá este archivo** — entrada nueva en §4 más lo que corresponda en §5, §7 y §9.
El paso 3 es el que se saltea y el que sostiene todo el sistema.

Si encontrás algo acá que ya no es cierto, **arreglalo**. Un documento que se cree y está
equivocado es peor que ninguno: cuatro entradas de §7 estuvieron mal escritas y se
corrigieron midiendo.

Si tu trabajo es **seguir construyendo la espina con agentes**, el bucle, las plantillas de
prompt y qué mirar antes de commitear lo que traen están en
[U3](U-desarrollo/U3-prompt-de-nodo.md).

## 1. Qué es esto

Un juego que enseña matemática desde contar hasta nivel universitario avanzado, con la
regla de que **todo concepto se manipula antes de escribirse**: mundo real → intuición →
concreto → visual → simbólico → formal → abstracto → transferencia. Una sola base de
código para iOS, Android y navegador: Expo SDK 57 + React Native Skia + Reanimated, en un
monorepo de workspaces de npm. El diseño completo vive en `docs/` (secciones A a U) y es
lo que manda: el código lo implementa, no lo reinterpreta.

## 2. Reglas del repositorio

- **Español** en comentarios, mensajes y nombres de tests. Los comentarios explican *por
  qué*, nunca *cómo*, y son escasos. Sin guiones largos.
- **TypeScript estricto** con `noUncheckedIndexedAccess` y `exactOptionalPropertyTypes`,
  desde `tsconfig.base.json`. Los imports llevan extensión `.ts`/`.tsx` explícita porque
  los tests corren con el stripping de tipos de Node y no hay paso de compilación.
- **Ningún texto visible dentro de `packages/`**: solo claves. El diccionario está en
  `apps/mathy/src/i18n.ts` y una clave sin traducir devuelve la clave, a propósito.
- **Los paquetes de modelo no importan React Native.** Si algo necesita Skia va en
  `viz-skia` o más arriba.
- **Dato contra prosa**: todo lo referenciado por id desde más de un lugar es YAML.
- **Las constantes numéricas del modelo de mastery viven solo en [K](K-evaluacion.md).**
- **Las 13 mecánicas de [E0](E-mecanicas/E0-catalogo.md) son las que hay.** Si un nodo
  parece necesitar una nueva, el gesto está mal pensado.
- **Nunca inventes un id de misconception.** Si el catálogo de
  [L](L-modelo-errores/misconceptions.yaml) no tiene una entrada que apunte a tu nodo, el
  `attempt` va sin campo. Cuando la prosa del minijuego nombra un error que el catálogo no
  apunta al nodo, **gana el catálogo** y la discrepancia se reporta; cerrarla es decisión
  de diseño, y el validador avisa si el error se explica sobre una mecánica que el nodo no
  declara.
- **Un nivel cambia de capa o endurece parámetros, nunca las dos cosas.** Es la regla que
  decide todos los casos dudosos. Cuando el documento del minijuego pide las dos, gana la
  regla y el ensanchamiento se corre al nivel siguiente; si no hay nivel siguiente, ver
  la decisión 14.
- `unlocks` en el grafo y `reused_by`/`areas` en `mechanics.yaml` los **deriva el
  validador**: nunca se escriben a mano.
- **Todo `export *` de `packages/mechanics/src/index.ts` tiene que apuntar a un archivo
  que está en el mismo commit.** Un commit que no lo cumplió rompió `main` (trampa 21).
- **Nada se da por bueno sin correr.** Un paquete sin tests que pasen no está terminado y
  una pantalla que no se miró en el navegador no está verificada. Si se verificó por
  estado o por oráculo en vez de mirando, se dice.

## 3. Arquitectura

El modelo no sabe que existe Skia. Esa frontera es lo que permite testear todo en Node.

| Paquete | Qué resuelve |
|---|---|
| `math-core` | el árbol de expresión donde **cada término tiene identidad estable**, y la traza que dice qué le pasó a cada uno en un paso |
| `typeset` | compone el árbol en glifos ubicados, cada uno recordando de qué término salió |
| `viz-core` | las 15 funciones de suavizado de ManimGL portadas, y el planificador de morph. `sampleMorph` es función pura del tiempo para poder correr en un worklet |
| `glyphs` | el atlas de contornos, horneado en build time con MathJax. 31 glifos hoy |
| `viz-skia` | el adaptador de dibujo, lo único que sabe que existe Skia |
| `mechanics` | el registro de nodos, los niveles como datos y los generadores deterministas por semilla |
| `progress` | el registro de eventos y el pliegue a estado. No sabe dónde se guarda: recibe un almacén |
| `content` | chuleta y calculadora compiladas desde los YAML de `docs/`, que no se tocan |

En `apps/mathy` la navegación es la del curriculum: `NodeMap` (conceptos) → `LevelMap`
(niveles de un concepto) → la actividad. `ActivityShell` sostiene la chuleta y la
calculadora y **achica el lienzo en vez de taparlo**; por eso el ancho sale de
`useActivityViewport()` y nunca de `useWindowDimensions`. `src/progress.tsx` es el puente:
la actividad emite eventos y no persiste nada.

**Una mecánica, una escena configurable** (decisión 12). Once escenas cubren diez de las
trece mecánicas:

| Mecánica | Escena | Nació en | Qué hay que saber |
|---|---|---|---|
| `balance` | `BalanceScene` | nodo 13 | el 10 la liberó de su nodo; una balanza que **mide** no lleva broche |
| `chest_key` | `ChestScene` | nodo 4 | el 6 la ensanchó a formas estructurales; modos `nest` (9), `key` (12) y `wrap` (14). El cofre también vive dentro de `BalanceScene` |
| `gears_sequence` | `TrackScene` | nodo 3 | unificada: absorbió las de los nodos 2 y 7. No dibuja un segundo engranaje encadenado |
| `grid_stretch` | `StretchScene` | nodo 5 | `deform` contrasta lo lineal con lo que no lo es; el 16 le agregó un plano de rectas |
| `ledger` | `LedgerScene` | nodo 10 | nace sin dueño. **`BowlScene` (nodo 1) está atada a su nodo y no se reusa** |
| `machine_pipe` | `PipeScene` | nodo 9 | configurada contra los diez nodos que la usan; su cabecera lista lo que no dibuja y qué nodo lo va a pedir |
| `network_routes` | `NetworkScene` | nodo 17 | recibe puntos, flechas y un rótulo; no sabe qué es una función |
| `slope_walker` | `WalkScene` | nodo 18 | trae apagados ejes para los nodos que siguen, como la asíntota del 25 |
| `tiles` | `TilesScene` | nodo 5 | `cut`, particiones (8) y habitaciones (15) |
| `urn_dice` | `UrnScene` | nodo 8 | configurada para los tres nodos de probabilidad |

**Sin escena todavía**: `construct` (la piden 10 nodos pendientes, toda la geometría),
`sorter` (6) y `fill_accumulate` (2). Toda escena que se toca se vuelve a jugar en los
nodos que la usan.

## 4. Qué cambió, sesión por sesión

### Sesión 2026-09-10 — de 5 a 21 nodos jugables, y la espina de 44 a 51 conceptos
Se construyeron los nodos 6 a 21: la aritmética hasta fracciones, la incógnita, la
igualdad, la llave, ecuaciones de varios pasos, la distributiva, sistemas y la rama de
funciones hasta la inversa. Siete nodos del grafo subieron a la espina con diseño
completo, elegidos por cuántos nodos del grafo los necesitan (decisión 10). Nacieron seis
escenas, y la deuda más cara se pagó: `gears_sequence` estaba dibujada tres veces y quedó
en una, verificada con un oráculo A/B (decisión 13).

Cuatro entradas de §7 que yo había escrito estaban mal y se corrigieron midiendo: la 9 (la
identidad del `Gesture` no rompe nada; iba a costar refactorizar diecinueve archivos), la
4 (el arrastre sobre el lienzo a veces sí se activa), la 3 (parchear sobre `setTimeout` no
alcanza) y la 20 (`127.0.0.1` no es un almacén aparte). Y un commit mío rompió `main` una
vez (trampa 21). Detalle y porqués en
[SESSION-2026-09-10-espina-hasta-21.md](SESSION-2026-09-10-espina-hasta-21.md).

### Sesión 2026-09-09 — de una prueba vertical a cinco nodos jugables
La app dejó de ser un motor con un nivel. Se cerró el nodo de calibración
`alg.eq.one_step` con sus ocho niveles y sus capas reales (balanza con platos y pesas en
las concretas, barras en la visual, ecuación desde la simbólica), aparecieron la chuleta y
la calculadora que crecen con lo recorrido, y el progreso pasó a persistir como registro
de eventos. Después se construyó el andamiaje del curriculum —mapa de conceptos, registro
de nodos, costura de i18n— y sobre él los nodos 1 a 5 de la espina. Detalle y porqués en
[SESSION-2026-09-09-espina-jugable.md](SESSION-2026-09-09-espina-jugable.md).

## 5. Decisiones que no conviene reabrir

1. **Todo se dibuja con React Native Skia, no con ManimGL.** ManimGL es un renderer de
   escritorio en Python y **no corre en React Native ni en navegador**; no tiene API de
   streaming. Queda como especificación de referencia de la gramática visual.
2. **Los contornos de los glifos se hornean en build time.** Las dos APIs de Skia que
   darían el contorno en runtime (`Path.MakeFromText`, `Paragraph.getPath`) **no existen
   en la versión web**, y CanvasKit no tiene con qué implementarlas.
3. **La identidad del término viene de nuestro árbol, no se reconstruye después.** Es
   exactamente lo que hace frágil a `TransformMatchingParts` de Manim, que empareja
   submobjects por posición y falla cuando la estructura cambia. El nodo 9 lo cobra: el id
   de un cofre **es** el `NodeId` del término, así que tocar la fila, el cofre o el árbol
   devuelve el mismo id sin sincronizar nada.
4. **Casi nunca hace falta interpolar trazos.** Cuando `x + 5 = 12` se vuelve `x = 7`
   ningún glifo cambia de forma: se trasladan, se apagan y se encienden. Identidad más
   interpolación de transformaciones cubre la enorme mayoría de las animaciones.
5. **Modo retained, no inmediato.** El árbol de componentes se arma con la unión de los
   dos estados y no cambia durante la animación; lo que todavía no se ve está montado con
   opacidad cero. Montar y desmontar paga el cruce de frontera en cada cuadro.
6. **El estado se pliega de un registro de eventos.** Así el mastery de seis dimensiones
   se recalcula entero cuando cambien las constantes de K sin migrar nada, y sincronizar
   entre dispositivos es unir dos listas sin conflictos.
7. **No hay clips pre-renderizados.** Todo se calcula en el dispositivo. Con eso se fueron
   700 MB de assets, el CDN y el empalme entre video y escena nativa.
8. **La regla de transferencia de K es "otra área", no "otra mecánica".** Con "otra
   mecánica" los ejemplos insignia del diseño —los tres regresos de la llave, todos
   `chest_key`— serían ilegales. Las 157 aristas `transfer_to` ya cruzaban área.
9. **i18n desde el día uno.** Ninguna cadena visible dentro de un componente. Una clave
   sin traducción devuelve la clave: un texto sin traducir tiene que doler.
10. **Un nodo entra a la espina por cuántos nodos del grafo lo necesitan**, con el nivel
    como desempate. La medida intuitiva —cuántos nodos de espina dependen de él— da cero
    para los 304 candidatos, porque la espina se escribió cerrada sobre sí misma.
11. **Presupuesto de ~300 elementos animados** en Android de gama baja y **un solo
    `<Canvas>` por pantalla**, porque Android Chrome permite ocho contextos WebGL vivos y
    Skia consume uno por lienzo.
12. **Una escena toma una configuración, nunca el `Problem` de un nodo.** `gears_sequence`
    terminó dibujada tres veces porque cada escena estaba tipada contra el problema de su
    nodo, y pagarlo costó una refactorización de 2240 líneas. Hay dos caminos según el
    caso: si el tipo viejo ya cumple la forma, **ensanchar a formas estructurales** y el
    llamador no cambia una línea (`ChestScene`, `BalanceScene`); si los llamadores le dicen
    distinto a la misma cosa, **cada actividad arma su configuración** (`TrackScene`,
    `TilesScene`). El límite: si reusar exige fabricar un problema falso de otro nodo, se
    escribe aparte. Acoplarse a un tipo ajeno es peor que quince líneas repetidas.
13. **Una refactorización que no debe cambiar nada se verifica con un oráculo A/B
    determinista, no con capturas.** El de `gears_sequence` hizo 14450 comparaciones de
    layout y 14352 de órdenes de dibujo contra el build anterior y encontró un bug que la
    refactorización había introducido y que nadie habría visto mirando. Además el arnés no
    puede probar todos los arrastres (trampa 4); el oráculo sí.
14. **Cuando no hay nivel siguiente donde correr el ensanchamiento, lo nuevo entra como
    pregunta.** La pregunta arma su propio objeto y no lee `params`, así que el último nivel
    cambia de capa sin endurecer nada y la regla sigue siendo testeable sobre `params`. Seis
    nodos lo resolvieron así (9, 15, 16, 18, 19, 21). El 20 hizo lo contrario —se quedó en
    la capa anterior para no perder el ensanchamiento— y lo anotó; las dos salidas valen si
    quedan anotadas. No se rediscute nodo por nodo.

## 6. Cómo verificar

Requisitos: **Node 26** (probado con 26.8.1: los tests corren con el stripping de tipos de
Node, que las versiones viejas no tienen) y **npm 11** (11.19.0). Ningún campo `engines`
lo hace cumplir.

Desde la raíz, en este orden. En un clon nuevo, primero:

```bash
npm install
```

```bash
npm test --workspaces --if-present
```

Esperado, para distinguir "lo rompí yo" de "ya estaba rojo": `content` **15**, `glyphs`
**9**, `math-core` **9**, `mechanics` **696**, `progress` **11**, `typeset` **8**,
`viz-core` **14**. **762** en total.

```bash
npx tsc --noEmit -p apps/mathy && npx tsc --noEmit -p packages/mechanics
```

```bash
python3 tools/validate.py
```

Esperado: `sin errores · 348 nodos, 51 en la espina, 115 aviso(s)`. Los avisos son
tolerados; **los errores no**.

Antes de empujar un commit que toca `packages/mechanics/src/index.ts`, que cada módulo
exportado esté en `HEAD`. Sin salida quiere decir coherente:

```bash
for m in $(grep -o '"\./[a-z-]*\.ts"' packages/mechanics/src/index.ts | tr -d '"'); do git cat-file -e HEAD:packages/mechanics/src/${m#./} 2>/dev/null || echo "FALTA ${m#./}"; done
```

Para verlo en el navegador:

```bash
cd apps/mathy && npx expo start --web
```

La primera vez, `npx setup-skia-web public` copia el WASM de CanvasKit a
`apps/mathy/public/`. No está versionado: se regenera en cada instalación. Si el servidor
parece vivo pero no contesta, puede haber un proceso viejo tomando el puerto 8081.

**Los gestos no se prueban con clicks.** Ver trampas 3 y 4.

## 7. Trampas que ya pagamos

1. **El `.wasm` tiene que servirse con el tipo MIME `application/wasm`.** El síntoma es
   una pantalla en blanco **sin ningún error en la consola**. Varios servidores estáticos
   simples no lo hacen.
2. **`main` en `apps/mathy/package.json` es `"index"`, sin extensión**, para que Metro
   haga resolución por plataforma y tome `index.web.tsx`. Con `"index.ts"` el navegador
   nunca corre `LoadSkiaWeb` y el primer lienzo se dibuja contra un Skia que no existe.
3. **Con el panel del navegador oculto, las animaciones no avanzan y el tiempo se
   estrangula.** El panel queda en `document.visibilityState === "hidden"` y el navegador
   estrangula `requestAnimationFrame` —Reanimated se congela— y también `setTimeout`, a
   cerca de uno por segundo, así que un arrastre sintético de veinte pasos tarda veinte
   segundos. **El síntoma es cruel**: el mensaje de la actividad cambia, el estado de React
   se actualiza, y el objeto en pantalla se queda exactamente como estaba, así que parece
   un bug propio. Parchear `rAF` sobre `setTimeout` no alcanza por eso mismo: **la receta
   que destraba es parchearlo sobre un `MessageChannel`**, y usar ese mismo canal para las
   esperas entre `pointermove`. Con el panel oculto las capturas también fallan: el lienzo
   no compone cuadros. **Descartá esto antes que nada.**
4. **Los gestos se prueban con eventos de puntero, y el arnés tiene límites medidos.** La
   receta: parchear `Element.prototype.setPointerCapture` y `releasePointerCapture` con un
   try/catch —con un `pointerId` sintético tiran `NotFoundError` y **abortan el gesto en
   silencio**—; despachar `pointerdown`, doce o más `pointermove` y `pointerup`, todos con
   `pointerId: 1`, `pointerType: "mouse"`, `button: 0` y `pressure` (con `pointerId: 7` no
   se activa nada); y antes de moverse, un temblor corto sobre el punto de origen.

   Los límites. Los **toques** sobre el lienzo andan siempre. El `Pan` de un **asa** anda
   siempre. Un `Pan` que cubre el **lienzo entero** depende de cómo esté configurada su
   activación: se activó sobre las escenas de baldosas y no sobre la manivela del nodo 2,
   apuntando a su eje medido en pantalla. Y cuando se activa, **entrega de menos**:
   gesture-handler mide `translationX` desde donde el gesto se activó, no desde el apoyo,
   así que se descuenta un tramo entero — **87,5 % del recorrido con 16 movimientos**, 96 %
   con el temblor inicial. Desde el arnés, un arrastre que "casi llega" puede ser esto y no
   tu umbral.

   Si no responde, no supongas que tu código está mal. Verificá el mismo camino con un
   toque —si el toque hace lo mismo que la suelta, cubre la misma línea de código— o con un
   oráculo determinista.
5. **El arrastre del navegador automatizado mueve los gestos que leen posición absoluta y
   no los que acumulan deltas.** El evento que activa el gesto no llega a `onChange`, así
   que sumar `changeX/Y` pierde ese tramo. Los gestos leen `translationX/Y`.
6. **La primera captura después de navegar sale en blanco**: compite con el presente de
   WebGL. Sacar siempre dos.
7. **Un `<Path>` de Skia sin `color` explícito se pinta de negro** sobre un fondo casi
   negro: invisible, y compila.
8. **Un callback de gesto puede estar un render atrasado.** El worklet captura el callback
   del render en que se armó el gesto, y la adopción del gesto nuevo (trampa 9) llega en un
   efecto, después del render. Entre medio, el callback es el viejo: una fruta soltada
   borraba a la anterior, y una fila se soltaba contra una cuenta vieja. Por eso rearmar el
   gesto no alcanza y **la decisión tiene que viajar en un `SharedValue` o en una
   referencia**. No contradice a la 9: la 9 dice que el gesto no se pierde, esta dice que
   puede llegar tarde.
9. **Que el objeto del `Gesture` cambie de identidad entre renders NO rompe nada.** Esta
   entrada decía lo contrario y estaba mal. `GestureDetector` corre
   `updateAttachedGestures()` en cada render y, mientras no cambien la cantidad de gestos
   ni el `handlerName`, **adopta el objeto nuevo sobre el handler viejo**: los `gestureId`
   se rehacen cientos de veces mientras el `handlerTag` sigue siendo el original. Medido
   sobre gesture-handler 2.32, jugando con arrastres reales el caso exacto en que un asa se
   apaga a mitad de ronda y vuelve en la siguiente: respondió siempre. El argumento a
   priori dice lo mismo: casi todos los gestos de lienzo cambian de identidad en cada
   ronda, así que si esto fuera cierto el juego estaría roto desde el nodo 2.
   **Lo que sí rompe es desmontar el `GestureDetector`** (trampa 13). Un
   `if (w <= 0) return null` después de los hooks desmonta el asa, y si esa asa vuelve en
   la ronda siguiente el detector queda sin enganchar. Cuando un asa se quede muda, buscá
   por ahí y no por el `useMemo`.
10. **`onLayout` mide contra el padre, no contra la página**, y en algunos anidados de
    React Native Web devuelve `{0, 0}`. Restar la caja del lienzo solo es seguro si la
    vista es hija directa de la raíz de la actividad; si no, el punto de suelta se calcula
    desde la ranura más la traslación del gesto.
11. **`Gesture.Exclusive` con un `LongPress` deshabilitado bloquea a los gestos que vienen
    detrás.** Usar `Gesture.Race`. Y **un `Pan` habilitado siempre le gana la carrera a un
    `Tap`**: si los dos escuchan la misma superficie, el toque no llega nunca. Cada gesto
    tiene que escuchar solo donde su objeto está.
12. **Un `Pan` sobre el lienzo con `.minDistance(0)` cancela el gesto de un asa.** Se
    activa en el mismo instante del apoyo y se lleva el arrastre: la pieza se mueve y al
    soltarla no pasa nada. Sacar el `minDistance(0)` y cerrar con `onFinalize` más un
    umbral de toque; `onEnd` no llega si otro gesto le ganó la carrera. Es también el
    patrón que hace responder un toque sobre el lienzo desde el arnés, donde un
    `Gesture.Tap()` solo no se despierta.
13. **Un asa deshabilitada se come los toques del lienzo.** Tiene que quedar montada —si
    se desmonta, el detector de la ronda siguiente se queda sin enganchar— pero necesita
    `pointerEvents: "none"`, o lo que está debajo deja de contestar.
14. **Con objetos concéntricos, la tolerancia generosa de drop le roba al de afuera su
    anillo.** Buscar contención estricta primero y aplicar la holgura solo cuando el
    punto no cayó en ninguno.
15. **`e.x` y `e.y` de un gesto vienen medidos desde la vista que escucha, no desde el
    lienzo.** Con un gesto que cubre el lienzo entero la diferencia es cero y no se nota;
    con un asa chica el error es del tamaño de lo que haya arriba.
16. **El guion de ASCII no está en el atlas de glifos.** Un número negativo formateado con
    `String(-5)` deja un hueco donde va el signo y, si el número abre la expresión, la
    ecuación no se dibuja. El signo se emite como U+2212.
17. **`toText` de `math-core` es un serializador de depuración**, no notación para el
    jugador: mostraba `-448 = x * 32` en pantalla.
18. **`userSelect: "none"` es funcional, no cosmético.** Sin él, arrastrar sobre un texto
    arranca una selección del navegador que se queda con el puntero.
19. **El stripping de tipos de Node no soporta propiedades de parámetro**
    (`constructor(private readonly x: T)`). Hay que declarar el campo aparte.
20. **Dos agentes verificando a la vez es el techo.** El panel del navegador es uno solo y
    no se puede abrir otra pestaña cuando el cupo está lleno: con tres o más, cada uno le
    renavega la pestaña al otro en mitad de una secuencia. Un agente reportó **seis
    renavegaciones** y no pudo volver a jugar los nodos que comparten escena con el suyo,
    que es justamente la comprobación que evita romperlos. **La contención no se paga en
    tiempo, se paga en verificación.** Además se pisan el `localStorage`, que es por
    origen: `localhost` y la forma numérica son dos almacenes, pero **`127.0.0.1` el
    navegador lo normaliza a `[::1]`**, así que esos dos son uno solo. Hay dos, no tres.
21. **No corras `git add -A` con agentes en vuelo, ni commitees un archivo compartido sin
    mirar qué le metieron.** Arrastra archivos a medio escribir, y una vez **rompió
    `main`**: el commit se llevó el `export *` de un nodo cuyo módulo todavía estaba sin
    trackear, así que la rama quedó apuntando a un archivo inexistente. Los tests locales
    no lo ven, porque el archivo está en el disco. El comando que lo detecta está en §6.
22. **`typeset` escribe paréntesis solo cuando una suma cae dentro de un producto.** Así
    `12 ÷ (3 × 2)` y `(12 ÷ 3) × 2` se escriben igual y el jugador no puede distinguirlos.
    Un generador no puede armar esos árboles: el nodo 9 los descarta con el predicado
    `precRowSaysTheTree`, exportado y testeado. El arreglo de fondo es en `typeset` y no
    está hecho.
23. **`math-core` no tiene racionales.** Una solución fraccionaria se escribe como decimal
    y `formatNumber` corta en seis decimales, así que un tercio sale redondeado. El nodo 14
    restringió los denominadores a 2, 4 y 5 con un test que lo afirma; las fracciones de
    verdad piden un tipo nuevo en el motor.
24. **Hornear un glifo tiene procedimiento, y una sorpresa.** Se agrega a `CHARSET` en
    `packages/glyphs/tools/bake.ts`, se corre `npm run bake`, y el diff de `atlas.json`
    tiene que ser **puramente aditivo**, verificado glifo por glifo. La sorpresa: la `h`
    itálica de MathJax sale como U+210E, la constante de Planck, y no como la letra
    matemática; el horneador exige el codepoint que MathJax emite. La coma no está: el nodo
    18 la dibuja como forma en `walkPairPath`, que se borra el día que se hornee.
25. **El grafo mezcla dos formas de YAML.** Los nodos de espina están en forma de bloque y
    los otros 304 en forma de flujo, una línea `- {id: …}`. Un regex sobre `- id:` ve solo
    los primeros: devolvió cero candidatos a la espina antes de que me diera cuenta.

## 8. Qué falta

**Código:**
- **30 nodos de la espina sin construir**: 22 a 44 y los siete ascendidos (45–47, 51–54).
  La tabla de qué mecánica pide cada uno está en [U2](U-desarrollo/U2-plan-espina.md).
  **Tres mecánicas no tienen escena y son lo caro**: `construct` (10 nodos, toda la rama de
  geometría y trigonometría), `sorter` (6) y `fill_accumulate` (2). Conviene que las
  estrene un nodo que las tenga como mecánica principal, configurables desde el principio.
- **Tres nodos prioritarios sin diseñar**: `arith.pow.repeated_scaling`,
  `arith.div.remainder` y `arith.frac.equivalent`. Tienen reservados los números 48, 49 y
  50; de los diez que se pidieron se diseñaron siete.
- **Ningún nodo tiene las transiciones simbólicas como morph continuo.** Cada estado existe
  como estado de su capa; que el objeto se transforme en su símbolo con el gesto, que es lo
  que cada documento F describe paso a paso, pide trazos con la misma estructura de
  comandos desde el principio. Es la deuda transversal más grande.
- **`explain` como dos animaciones lado a lado** casi nunca está: la mayoría de los nodos
  registra el verbo sobre el movimiento real.
- **Las capas `real` e `intuition`** solo las tienen los nodos 18 a 21.
- **`chest_key` sigue dibujada dos veces** (`BalanceScene` y `ChestScene`), y
  `gears_sequence` no dibuja un segundo engranaje encadenado, que pidió el nodo 20.
- **Racionales en `math-core` y paréntesis correctos en `typeset`** (trampas 22 y 23).
- **`StepEngine`**: validar movimientos libres y la explicación de error dinámica de L,
  que hoy es un mensaje fijo por tipo de error y no un replay sobre la expresión del
  jugador.
- **Medir en dispositivo**: 60 cuadros por segundo en un Android de gama baja **en build
  de release**, y el arranque en frío del navegador.
- **Correr en iOS y Android**: necesita una build de desarrollo, porque Skia es un módulo
  nativo y no corre en Expo Go.
- **Adelgazar el WASM de web**: servir con Brotli y aliasear el build completo de
  CanvasKit al recortado, que ahorra unos 350 KB.
- **No hay capa de audio.** Varios minijuegos piden un "tic" que hoy es un destello, y las
  definiciones de la capa formal se leen en vez de narrarse.

**Decisión de diseño, no de un agente:**
- Cerrar las discrepancias entre la prosa de los minijuegos y el catálogo de errores.
  Mientras sigan, los agentes no emiten esos ids, que es lo correcto:
  - nodo 14 (`alg.eq.multi_step`): la prosa nombra `wrong_inverse_choice` e
    `inverse_applied_one_side`;
  - nodo 16 (`alg.sys.two_by_two`): `variable_as_label`, `inverse_applied_one_side` y
    `sign_flip_on_move`;
  - nodo 17 (`alg.fn.function_as_machine`): `variable_as_label` y `unwrap_order_inverted`,
    y dice que su lista está vacía cuando el catálogo le apunta
    `machine_gives_two_outputs`.

  El precedente es el nodo 21 (`97bbbba`, corregido en `e2a0387`): un nodo entra en la
  entrada de un error solo si declara la mecánica sobre la que ese error se explica, y el
  validador avisa si no.

## 9. Mapa de documentos

| Documento | Qué contesta |
|---|---|
| **este** | punto de entrada: estado, reglas, arquitectura, decisiones, trampas |
| [`SESSION-2026-09-10-espina-hasta-21.md`](SESSION-2026-09-10-espina-hasta-21.md) | por qué la espina llegó a 21 nodos con estas escenas, y qué diagnósticos resultaron falsos |
| [`SESSION-2026-09-09-espina-jugable.md`](SESSION-2026-09-09-espina-jugable.md) | por qué la app quedó como quedó al pasar de prueba vertical a cinco nodos |
| [`U-desarrollo/U3-prompt-de-nodo.md`](U-desarrollo/U3-prompt-de-nodo.md) | cómo seguir sin supervisión: el bucle de agentes, las plantillas y qué mirar antes de commitear |
| [`U-desarrollo/U2-plan-espina.md`](U-desarrollo/U2-plan-espina.md) | las olas, qué mecánica pide cada nodo pendiente y las deudas abiertas |
| [`U-desarrollo/U0-estado.md`](U-desarrollo/U0-estado.md) | el detalle del motor de M0 y M1, paquete por paquete |
| [`U-desarrollo/U1-decisiones.md`](U-desarrollo/U1-decisiones.md) | las decisiones técnicas con la evidencia que las sostiene |
| [`README.md`](README.md) | índice del diseño, secciones A a U, glosario |
| [`T-plan-implementacion.md`](T-plan-implementacion.md) | stack, hitos M0–M6, pacing, spikes |
| [`C-knowledge-graph/`](C-knowledge-graph/) | el grafo, el schema y la espina |
| [`E-mecanicas/E0-catalogo.md`](E-mecanicas/E0-catalogo.md) | las 13 mecánicas y su invariante |
| [`K-evaluacion.md`](K-evaluacion.md) | el modelo de mastery. **Única fuente de constantes numéricas** |
