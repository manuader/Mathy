# HANDOFF — Mathy, estado actual

> El diseño está cerrado: 348 nodos de grafo, **51 en la espina**, validador en cero errores.
> La construcción tiene **9 nodos jugables y verificados** de los 51: la aritmética entera,
> de contar hasta fracciones, más el nodo de ecuaciones. La app corre en
> navegador; en iOS y Android todavía **no se probó**.
> Antes de tocar nada, mirá `git status`: si hay cambios sin commitear, hay agentes en vuelo.

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
equivocado es peor que ninguno.

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
  `attempt` va sin campo. Un id inventado ensucia la remediación para siempre.
- **Un nivel cambia de capa o endurece parámetros, nunca las dos cosas.** Es la regla que
  decide todos los casos dudosos, y cuando el documento del minijuego pide las dos, gana
  la regla y el ensanchamiento se corre al nivel siguiente.
- `unlocks` en el grafo y `reused_by`/`areas` en `mechanics.yaml` los **deriva el
  validador**: nunca se escriben a mano.
- **Nada se da por bueno sin correr.** Un paquete sin tests que pasen no está terminado y
  una pantalla que no se miró en el navegador no está verificada.

## 3. Arquitectura

El modelo no sabe que existe Skia. Esa frontera es lo que permite testear todo en Node.

| Paquete | Qué resuelve |
|---|---|
| `math-core` | el árbol de expresión donde **cada término tiene identidad estable**, y la traza que dice qué le pasó a cada uno en un paso |
| `typeset` | compone el árbol en glifos ubicados, cada uno recordando de qué término salió |
| `viz-core` | las 15 funciones de suavizado de ManimGL portadas, y el planificador de morph. `sampleMorph` es función pura del tiempo para poder correr en un worklet |
| `glyphs` | el atlas de contornos, horneado en build time con MathJax |
| `viz-skia` | el adaptador de dibujo, lo único que sabe que existe Skia |
| `mechanics` | el registro de nodos, los niveles como datos y los generadores deterministas por semilla |
| `progress` | el registro de eventos y el pliegue a estado. No sabe dónde se guarda: recibe un almacén |
| `content` | chuleta y calculadora compiladas desde los YAML de `docs/`, que no se tocan |

En `apps/mathy` la navegación es la del curriculum: `NodeMap` (conceptos) → `LevelMap`
(niveles de un concepto) → la actividad. `ActivityShell` sostiene la chuleta y la
calculadora y **achica el lienzo en vez de taparlo**; por eso el ancho sale de
`useActivityViewport()` y nunca de `useWindowDimensions`. `src/progress.tsx` es el puente:
la actividad emite eventos y no persiste nada.

**Una mecánica, una escena configurable.** Trece mecánicas cubren los 44 nodos, así que
una escena se construye una vez y se parametriza. Ver las deudas de duplicación abiertas
en [U2](U-desarrollo/U2-plan-espina.md).

## 4. Qué cambió, sesión por sesión

### Sesión 2026-09-09 — de una prueba vertical a cinco nodos jugables
La app dejó de ser un motor con un nivel. Se cerró el nodo de calibración
`alg.eq.one_step` con sus ocho niveles y sus capas reales (balanza con platos y pesas en
las concretas, barras en la visual, ecuación desde la simbólica), aparecieron la chuleta y
la calculadora que crecen con lo recorrido, y el progreso pasó a persistir como registro
de eventos. Después se construyó el andamiaje del curriculum —mapa de conceptos, registro
de nodos, costura de i18n— y sobre él los nodos 1 a 5 de la espina. Detalle y porqués en
[SESSION-2026-09-09-espina-jugable.md](SESSION-2026-09-09-espina-jugable.md).

### Sesión 2026-09-09 (cont.) — la aritmética queda cerrada
Nueve nodos jugables y verificados: contar, la recta, sumar, restar, multiplicar, dividir,
los negativos, las fracciones y las ecuaciones de un paso. El nodo 6 es el primero que
**no estrena escena**: reusa las tres de los nodos 4 y 5 con props aditivas y su agente
volvió a jugar esos dos nodos para probar que no los rompió. Ese es el patrón que tienen
que seguir los que faltan.

### Sesión 2026-09-09 (cont.) — la espina pasa de 44 a 51 conceptos
Siete nodos del grafo subieron a la espina con tratamiento completo: comparar cantidades,
juntar montones, filas por columnas, clasificar polígonos, giros y reflexiones, la regla
de pertenencia y la lógica de los aros. Se eligieron **por cuántos nodos del grafo los
necesitan**, porque la medida obvia no servía: ningún nodo de fuera de la espina era
prerequisito de uno de adentro, ya que la espina se había escrito cerrada sobre sí misma.

## 5. Decisiones que no conviene reabrir

1. **Todo se dibuja con React Native Skia, no con ManimGL.** ManimGL es un renderer de
   escritorio en Python y **no corre en React Native ni en navegador**; no tiene API de
   streaming. Queda como especificación de referencia de la gramática visual.
2. **Los contornos de los glifos se hornean en build time.** Las dos APIs de Skia que
   darían el contorno en runtime (`Path.MakeFromText`, `Paragraph.getPath`) **no existen
   en la versión web**, y CanvasKit no tiene con qué implementarlas.
3. **La identidad del término viene de nuestro árbol, no se reconstruye después.** Es
   exactamente lo que hace frágil a `TransformMatchingParts` de Manim, que empareja
   submobjects por posición y falla cuando la estructura cambia.
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

## 6. Cómo verificar

Desde la raíz, en este orden:

```bash
npm test --workspaces --if-present
```

Esperado, para distinguir "lo rompí yo" de "ya estaba rojo":
`content` **15**, `glyphs` **9**, `math-core` **9**, `mechanics` **169**, `progress` **11**,
`typeset` **8**, `viz-core` **14**.

```bash
npx tsc --noEmit -p apps/mathy && npx tsc --noEmit -p packages/mechanics
```

```bash
python3 tools/validate.py
```

Esperado: `sin errores · 348 nodos, 51 en la espina, 115 aviso(s)`. Los avisos son
tolerados; **los errores no**.

Para verlo en el navegador:

```bash
cd apps/mathy && npx expo start --web
```

La primera vez, `npx setup-skia-web public` copia el WASM de CanvasKit a
`apps/mathy/public/`. No está versionado: se regenera en cada instalación.

**Los gestos no se prueban con clicks.** Ver §7.

## 7. Trampas que ya pagamos

1. **El `.wasm` tiene que servirse con el tipo MIME `application/wasm`.** El síntoma es
   una pantalla en blanco **sin ningún error en la consola**. Varios servidores estáticos
   simples no lo hacen.
2. **`main` en `apps/mathy/package.json` es `"index"`, sin extensión**, para que Metro
   haga resolución por plataforma y tome `index.web.tsx`. Con `"index.ts"` el navegador
   nunca corre `LoadSkiaWeb` y el primer lienzo se dibuja contra un Skia que no existe.
3. **La implementación web de gesture-handler escucha eventos de puntero.** Un arrastre
   sintético hecho con eventos de mouse no la despierta. La receta que funciona es
   despachar `pointerdown`, doce o más `pointermove` con ~20 ms entre medio y `pointerup`,
   todos con el mismo `pointerId`. Además, `setPointerCapture` con un `pointerId`
   sintético tira `NotFoundError` y **aborta el gesto**: hay que parchear
   `Element.prototype.setPointerCapture` con un try/catch antes de probar.
4. **El arrastre del navegador automatizado mueve los gestos que leen posición absoluta y
   no los que acumulan deltas.** La balanza responde a `left_click_drag` y el arrastre
   simbólico no, porque el evento que activa el gesto no llega a `onChange`. Por eso los
   gestos leen `translationX/Y` y no suman `changeX/Y`.
5. **La primera captura después de navegar sale en blanco**: compite con el presente de
   WebGL. Sacar siempre dos.
6. **Un `<Path>` de Skia sin `color` explícito se pinta de negro** sobre un fondo casi
   negro: invisible, y compila.
7. **Un worklet captura el callback del render en que se armó el gesto.** Rearmar el
   gesto en cada cambio de estado no alcanza. La decisión tiene que viajar en un
   `SharedValue` o en una referencia.
8. **Gesture-handler en web pierde el gesto si el objeto del `Gesture` cambia de identidad
   entre renders.** Hay que memoizarlo.
9. **`onLayout` mide contra el padre, no contra la página**, y en algunos anidados de
   React Native Web devuelve `{0, 0}`. El punto de suelta se calcula desde la ranura más
   la traslación del gesto, no restando la caja del lienzo.
10. **`Gesture.Exclusive` con un `LongPress` deshabilitado bloquea a los gestos que vienen
    detrás.** Usar `Gesture.Race`. Y **un `Pan` habilitado siempre le gana la carrera a un
    `Tap`**: si los dos escuchan la misma superficie, el toque no llega nunca. Cada gesto
    tiene que escuchar solo donde su objeto está.
11. **`e.x` y `e.y` de un gesto vienen medidos desde la vista que escucha, no desde el
    lienzo.** Con un gesto que cubre el lienzo entero la diferencia es cero y no se nota;
    con un asa chica el error es del tamaño de lo que haya arriba. Es primo de la trampa
    de `onLayout`.
12. **El guion de ASCII no está en el atlas de glifos.** Un número negativo formateado con
    `String(-5)` deja un hueco donde va el signo y, si el número abre la expresión, la
    ecuación no se dibuja. El signo se emite como U+2212.
13. **`toText` de `math-core` es un serializador de depuración**, no notación para el
    jugador: mostraba `-448 = x * 32` en pantalla.
14. **`userSelect: "none"` es funcional, no cosmético.** Sin él, arrastrar sobre un texto
    arranca una selección del navegador que se queda con el puntero.
15. **El stripping de tipos de Node no soporta propiedades de parámetro**
    (`constructor(private readonly x: T)`). Hay que declarar el campo aparte.
16. **Varios agentes verificando a la vez se pisan el `localStorage`**, porque es por
    origen. `http://127.0.0.1:8081` es el mismo servidor con otro origen y por lo tanto
    otro almacén: sirve para sembrar progreso sin que otro te lo borre.
17. **No corras `git add -A` con agentes en vuelo.** Arrastra sus archivos a medio
    escribir al commit. Usá rutas explícitas.

## 8. Qué falta

**Código:**
- **44 nodos de la espina** sin construir: los 37 originales que faltaban más los 7 que se ascendieron. El plan por olas está en
  [U2](U-desarrollo/U2-plan-espina.md).
- **Unificar las escenas duplicadas**: `PathScene` y `TrackScene` son la misma mecánica, y
  `chest_key` está dos veces (`BalanceScene` y `ChestScene`).
- **`StepEngine`**: validar movimientos libres y la explicación de error dinámica de L,
  que hoy es un mensaje fijo por tipo de error y no un replay sobre la expresión del
  jugador.
- **Medir en dispositivo**: 60 cuadros por segundo en un Android de gama baja **en build
  de release**, y el arranque en frío del navegador.
- **Correr en iOS y Android**: necesita una build de desarrollo, porque Skia es un módulo
  nativo y no corre en Expo Go.
- **Adelgazar el WASM de web**: servir con Brotli y aliasear el build completo de
  CanvasKit al recortado, que ahorra unos 350 KB.
- **No hay capa de audio.** Varios minijuegos piden un "tic" que hoy es un destello.

**Bloqueado en una persona:**
- La **licencia** del repositorio, que es público y no tiene ninguna.

## 9. Mapa de documentos

| Documento | Qué contesta |
|---|---|
| **este** | punto de entrada: estado, reglas, arquitectura, decisiones, trampas |
| `SESSION-2026-09-09-espina-jugable.md` | por qué la app quedó como quedó al pasar de prueba vertical a cinco nodos |
| [`README.md`](README.md) | índice del diseño, secciones A a U, glosario |
| [`T-plan-implementacion.md`](T-plan-implementacion.md) | stack, hitos M0–M6, pacing, spikes |
| [`U-desarrollo/U0-estado.md`](U-desarrollo/U0-estado.md) | el detalle del motor de M0 y M1, paquete por paquete |
| [`U-desarrollo/U1-decisiones.md`](U-desarrollo/U1-decisiones.md) | las decisiones técnicas con la evidencia que las sostiene |
| [`U-desarrollo/U2-plan-espina.md`](U-desarrollo/U2-plan-espina.md) | las quince olas de construcción y las deudas abiertas |
| [`C-knowledge-graph/`](C-knowledge-graph/) | el grafo, el schema y la espina |
| [`E-mecanicas/E0-catalogo.md`](E-mecanicas/E0-catalogo.md) | las 13 mecánicas y su invariante |
| [`K-evaluacion.md`](K-evaluacion.md) | el modelo de mastery. **Única fuente de constantes numéricas** |
