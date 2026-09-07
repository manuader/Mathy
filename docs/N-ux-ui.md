# N. UX/UI

Este documento define cómo se ve y cómo se toca Mathy. Fija los principios visuales, el sistema de diseño (tokens compartidos con el pipeline de Manim), cada pantalla con su wireframe, la regla del morph, el modelo de input, la voz, la accesibilidad, el layout responsivo y el microcopy. Lo que el jugador aprende está en [H](H-progresion-abstraccion.md) y [E0](E-mecanicas/E0-catalogo.md); cómo se decide que aprendió, en [K](K-evaluacion.md); cómo se adapta a la edad, en [Q](Q-edad-universal.md); cómo se traduce, en [P](P-internacionalizacion.md); cómo se implementa, en [O](O-arquitectura-tecnica.md).

Una idea resume todo: **Mathy no parece una app escolar ni un juguete.** Parece un instrumento. Un niño de cinco años y una persona de cincuenta ven exactamente la misma interfaz, y ninguno de los dos siente que fue hecha para otro.

---

## 1. Principios

**Premium.** Cada pantalla se juzga como se juzgaría un objeto físico bien hecho: pocos elementos, materiales consistentes, nada que sobre. Si un elemento no ayuda a entender o a operar, se quita.

**Minimalista.** El canvas es el protagonista. La interfaz alrededor existe para sostener la actividad, no para competir con ella. Una pantalla de actividad tiene, como máximo, tres regiones: canvas, teclado de fichas y una barra discreta de herramientas.

**Precisa.** Un objeto matemático se dibuja con exactitud geométrica. Las barras miden lo que dicen medir, las cuadrículas son cuadrículas, las tangentes son tangentes. La precisión es parte del contenido, no un acabado.

**Científica.** La referencia visual es la ilustración científica y las animaciones de 3Blue1Brown: fondo oscuro, trazos limpios, color con significado. No hay decoración que no informe.

**Moderna.** Formas planas, sin sombras dramáticas ni relieves. La profundidad se comunica con luminancia y con movimiento, no con biseles.

**Altamente interactiva.** Todo lo que está en pantalla y representa un objeto matemático se puede tocar, arrastrar o ajustar. Si algo parece manipulable y no lo es, es un error de diseño.

Lo que se evita, y por qué:

| Se evita | Porque |
|---|---|
| Estética infantil (mascotas, caras en los objetos, tipografías redondeadas) | Excluye al adulto y subestima al niño. |
| Exceso de color | Diluye el color que sí significa algo: la primitiva de la gramática visual. |
| Gamification superficial (puntos, monedas, confeti, cofres de recompensa) | Mide cuánto se jugó, no cuánto se entiende ([K](K-evaluacion.md)). |
| Badges y medallas | Convierten el mapa en una vitrina; el progreso ya se ve como territorio iluminado. |
| UI saturada (barras de progreso múltiples, notificaciones, chips) | Compite con el canvas, que es lo único que enseña. |
| Apariencia de app escolar (pizarras, cuadernos, tildes rojas y verdes) | Trae consigo la ansiedad del examen, que Mathy quiere eliminar. |

Las referencias de tono son Monument Valley y Alto's Odyssey: juegos que un niño juega con placer y un adulto no esconde. Ambos tienen paletas contenidas, geometría limpia, movimiento expresivo pero sereno, y ninguna interfaz que grite. Ese es el registro. Un solo sistema visual para los 5 y los 50 años; la única diferencia entre perfiles es la modalidad de instrucción e input ([Q](Q-edad-universal.md)), nunca el estilo.

---

## 2. Sistema de diseño

### 2.1 Un solo `theme.json`

Todos los tokens viven en un único archivo `theme.json` dentro del paquete de tema del monorepo ([O](O-arquitectura-tecnica.md)). De ahí se generan dos artefactos: el módulo TypeScript que consumen la app y el mini-Manim nativo, y `manim/theme.py`, que consume el pipeline de pre-render. Un clip pre-renderizado y la escena nativa que lo continúa usan el mismo azul, la misma tipografía y la misma curva de movimiento porque leen el mismo archivo. Ningún color, tamaño ni duración se escribe a mano fuera de `theme.json`.

### 2.2 Color

Mathy es **dark-first**. El fondo oscuro es el del laboratorio y el de las animaciones de referencia; hace que la tinta y los objetos matemáticos tengan contraste sin esfuerzo y evita el aspecto de documento. Existe un tema claro, derivado de los mismos tokens, para quien lo prefiera o lo necesite por accesibilidad.

La paleta es contenida y semántica. Hay tres familias:

**Superficies y tinta.**

| Token | Uso | Valor (oscuro) |
|---|---|---|
| `bg.base` | fondo del canvas y del mapa | `#0B0F14` |
| `bg.surface` | paneles, teclado de fichas, tarjetas | `#141A22` |
| `bg.elevated` | panel lateral, hojas modales | `#1C2430` |
| `ink.primary` | notación, texto principal | `#E8EDF2` |
| `ink.secondary` | etiquetas, texto de apoyo | `#9AA6B2` |
| `ink.muted` | cuadrículas, guías, elementos inactivos | `#5C6975` |

**Acento por primitiva.** El color con significado es el de las doce primitivas de la gramática visual de [H](H-progresion-abstraccion.md). Cada primitiva tiene un tono y una **forma**: un glifo pequeño y un patrón de trazo que la identifican aunque el color no se distinga. La regla de daltonismo es simple: ningún significado se codifica solo con color. Doce tonos son demasiados para verlos a la vez; por eso se agrupan en seis tonos y cada par se distingue por forma y por trazo (continuo o punteado).

| Primitiva | Tono | Glifo | Trazo |
|---|---|---|---|
| `displace` | cian | flecha simple | continuo |
| `scale` | cian | flecha de dos puntas | punteado |
| `compose` | violeta | dos eslabones | continuo |
| `invert` | violeta | llave | punteado |
| `rate` | verde | tangente sobre curva | continuo |
| `accumulate` | verde | recipiente relleno | punteado |
| `nonlinear` | magenta | curva que se dobla | continuo |
| `deform` | magenta | cuadrícula inclinada | punteado |
| `partition` | ámbar | círculo partido | continuo |
| `random` | ámbar | tres puntos dispersos | punteado |
| `relate` | índigo | dos puntos unidos | continuo |
| `invariant` | índigo | dos barras iguales | punteado |

En una pantalla nunca hay más de tres acentos al mismo tiempo: la primitiva dominante del nodo, una de soporte y el color de estado. Todo lo demás es tinta.

**Estado y feedback.** Un solo tono cálido, `state.attention` (ámbar apagado), sirve para "algo pide atención": la balanza inclinada, el óxido de una operación, un repaso vencido. No existe un rojo de error, porque no existe el error como categoría de interfaz ([L0](L-modelo-errores/L0-taxonomia.md)). Los tres estados del mapa (`in_progress`, `ready`, `mastered`) no son tres colores sino **tres intensidades** del mismo acento del área, de tenue a pleno.

### 2.3 Tipografía

Dos familias y ninguna más.

**Notación matemática.** Una fuente math OTF con tabla `MATH`: Latin Modern Math por defecto, STIX Two Math como alternativa si la licencia o la cobertura lo exigen ([O](O-arquitectura-tecnica.md) lista el riesgo). Los glifos se dibujan como paths en Skia desde el motor de layout propio; la fuente no se usa como texto de sistema. Esto es lo que permite que un `x` se estire, gire y se funda con otro `x` sin cambiar de aspecto.

**Interfaz.** Una sans neutra con cobertura amplia de scripts: latín extendido, cirílico y griego en el bundle base; CJK, árabe, devanagari y tailandés como variantes por script que se cargan bajo demanda según locale ([P](P-internacionalizacion.md)). Se elige una familia con métricas homogéneas entre scripts para que la interfaz no cambie de ritmo al cambiar de idioma. Ni la tipografía de interfaz ni la de notación tienen versión "infantil".

Escala tipográfica en puntos, con tamaño dinámico del sistema aplicado encima: `caption 12`, `body 15`, `label 17`, `title 22`, `display 28`. La notación no sigue la escala de interfaz: su tamaño base es `math.base 24` en el canvas y `math.inline 17` en la cheatsheet, y escala con el tamaño dinámico hasta un tope de 1.6× para no romper el layout de expresiones largas.

### 2.4 Espaciado y radios

Espaciado en una escala de 4: `4, 8, 12, 16, 24, 32, 48, 64`. Los radios son pocos y grandes para que todo se sienta de la misma familia: `radius.token 12` (fichas y llaves), `radius.panel 20` (paneles), `radius.full` (nodos del mapa, botones circulares). Los objetos matemáticos no tienen radio: un rectángulo de baldosas tiene esquinas exactas.

### 2.5 Movimiento

Toda animación de la app, tanto de interfaz como de objeto matemático, usa las **rate functions de ManimGL** portadas sin cambios al mini-Manim ([O](O-arquitectura-tecnica.md)): `smooth` para transiciones de estado, `rush_into` y `rush_from` para entradas y salidas, `there_and_back` para llamar la atención sin cambiar nada, `linear` para scrub controlado por el dedo, `lingering` para revelar un resultado. Un morph entre expresiones usa siempre `smooth`.

Duraciones como tokens: `motion.quick 180 ms` (respuesta a un gesto), `motion.base 320 ms` (transición de estado), `motion.morph 700 ms` (cambio de capa), `motion.reveal 1200 ms` (resultado de una predicción). Nada dura más de 1.5 s salvo un clip pre-renderizado, y todo clip se puede saltar.

**Reducir movimiento.** Cuando el sistema lo pide, los morphs se reemplazan por un fundido cruzado de `motion.quick`, las animaciones ambientales del mapa se detienen y el scrub sigue funcionando porque lo controla el dedo. La información nunca depende de una animación que reducir movimiento elimina: cada morph deja al final un estado estático que lo cuenta por sí solo.

---

## 3. Pantallas

Todas las pantallas comparten el mismo fondo, la misma tipografía y la misma barra inferior mínima. Los wireframes están en proporción de teléfono; la sección 8 explica cómo se reorganizan en tablet.

### 3.1 Mapa

El mapa es el grafo de conocimiento dibujado como una constelación. Cada nodo es un punto; cada arista de prerequisito, un trazo tenue. Las áreas son regiones del cielo con el tono de su acento. No hay badges, tildes ni porcentajes: lo que hay es **luz**. Un nodo `locked` casi no se ve; `available` es un punto de tinta; `in_progress`, `ready` y `mastered` son tres intensidades crecientes del acento del área. Un nodo `decayed` conserva su luz y muestra el mismo óxido que la calculadora, una textura de trazo fino que invita a repasar sin castigar ([K](K-evaluacion.md)).

El jugador navega con pan y pinch. Tocar un nodo abre una tarjeta corta: nombre, mecánica principal con su ícono, y el botón de jugar. No se elige el nodo para la sesión desde aquí (eso lo hace el selector de [J](J-adaptativo.md)); el mapa es para ver dónde se está y, en juego libre, para volver a cualquier lugar.

```
┌──────────────────────────────┐
│  ·        ·      ·           │
│      ●━━━●         ·         │
│     ╱     ╲    ·             │
│   ◉        ●━━━◎             │
│  ╱  ╲       ╲                │
│ ◉    ◉━━━◉   ●       ·       │
│        ╲                     │
│    ·    ○ · · · ○            │
│                              │
│  ◉ mastered  ◎ ready  ● in_p │
│  ○ available · locked        │
├──────────────────────────────┤
│ ┌──────────────────────────┐ │
│ │ La balanza               │ │
│ │ △ balance      ▸ jugar    │ │
│ └──────────────────────────┘ │
│        mapa  hoy  ⌂  perfil  │
└──────────────────────────────┘
```

La leyenda existe solo la primera vez y en accesibilidad; después la intensidad se lee sola. Las animaciones ambientales (un pulso lento en la frontera) se apagan con reducir movimiento.

### 3.2 Sesión

La pantalla "hoy" muestra los 4 a 6 slots que el selector armó para la sesión ([J](J-adaptativo.md)). Cada slot dice qué es y para qué sirve, con un ícono de propósito y una línea: repaso vencido, remediación, concepto nuevo, transferencia, juego libre. El jugador ve la sesión completa antes de empezar y puede reordenarla o saltar un slot, salvo la remediación de una misconception activa, que se juega primero. No hay duración en minutos ni cuenta regresiva; la sesión termina cuando los slots terminan o cuando el selector detecta fatiga y cierra con juego libre.

```
┌──────────────────────────────┐
│  Hoy                         │
│                              │
│  ┌─ ↻ repaso ───────────────┐│
│  │ Restar deshace sumar     ││
│  └──────────────────────────┘│
│  ┌─ ✦ nuevo ────────────────┐│
│  │ La balanza               ││
│  └──────────────────────────┘│
│  ┌─ ✦ nuevo ────────────────┐│
│  │ La llave                 ││
│  └──────────────────────────┘│
│  ┌─ ⇄ transferencia ────────┐│
│  │ Islas y puentes          ││
│  └──────────────────────────┘│
│  ┌─ ◌ libre ────────────────┐│
│  │ Calculadora              ││
│  └──────────────────────────┘│
│                              │
│         [ empezar ]          │
│        mapa  hoy  ⌂  perfil  │
└──────────────────────────────┘
```

En perfiles `literacy: none` cada slot es solo el ícono de propósito y el ícono de la mecánica, con voz al tocarlo.

### 3.3 Actividad

Es la pantalla donde ocurre todo. Tres regiones:

1. **Canvas a pantalla completa.** Skia, con el objeto de la mecánica en el centro. No tiene marco ni fondo distinto del de la app: el canvas *es* la pantalla.
2. **Teclado de fichas.** Una banda inferior con las fichas disponibles para esta capa: objetos concretos, llaves, operaciones, números. En `concrete` puede no existir, porque los objetos están en el canvas. Aparece en `visual` y `symbolic` y se retira de a poco en `formal`.
3. **Barra de herramientas.** Una fila de íconos discretos arriba: salir, pedir el objeto concreto a demanda (el "fantasma" de [H](H-progresion-abstraccion.md)), cheatsheet, calculadora, voz.

La cheatsheet y la calculadora se abren en un **panel lateral** que se desliza sobre el borde derecho (izquierdo en RTL) y ocupa como máximo el 40 % del ancho en teléfono. El canvas se reduce, nunca se tapa; el objeto que el jugador estaba manipulando sigue visible y manipulable. En tablet el panel es una columna permanente.

```
┌──────────────────────────────┐
│ ‹        ◌   ▤   ⌗   ◁)      │
│                              │
│                              │
│         ┌───┐   ┌───┐        │
│         │ x │ + │ 5 │ = 12   │
│         └───┘   └───┘        │
│        ╲___________╱         │
│         ‾‾‾‾‾‾‾‾‾‾‾          │
│                              │
│                              │
│                              │
├──────────────────────────────┤
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐    │
│  │−5│ │+5│ │×5│ │÷5│ │−3│    │
│  └──┘ └──┘ └──┘ └──┘ └──┘    │
└──────────────────────────────┘
```

Los íconos de la barra son, en orden: salir, objeto a demanda, cheatsheet, calculadora, voz. No hay contador de aciertos, barra de progreso de la actividad ni temporizador visible. El progreso dentro de una actividad se ve en el objeto mismo: el cofre que se abre, la balanza que queda derecha.

### 3.4 Explicación de error

Cuando el jugador hace un movimiento que no avanza, no aparece un mensaje. Aparece un **replay en el mismo canvas**: la expresión rebobina a la capa donde el error se ve, el gesto del jugador se reproduce con una mano fantasma, y el objeto muestra lo que pasó (la balanza se inclina, la llave no entra). Es el patrón `replay_on_mechanic` y sus variantes de [L0](L-modelo-errores/L0-taxonomia.md). Al final, una pregunta corta narrada por voz, tomada de `misconceptions.<id>.prompt`, y el control devuelto al jugador sobre la misma expresión, no sobre una nueva.

```
┌──────────────────────────────┐
│ ‹                       »|   │
│                              │
│       ┌───┐   ┌───┐          │
│       │ x │ + │ 5 │ = 12     │
│       └───┘   └───┘          │
│      ╲          ╱            │
│       ╲________╱   ← △ se     │
│         ‾‾‾‾‾      inclina   │
│            ☞ −5 (solo aquí)  │
│                              │
│  ▸ ¿Qué le hacemos al otro   │
│    lado para nivelarla?      │
├──────────────────────────────┤
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐         │
│  │−5│ │+5│ │×5│ │÷5│         │
│  └──┘ └──┘ └──┘ └──┘         │
└──────────────────────────────┘
```

La pregunta se muestra como texto solo si el nodo lo permite (`literacy`); siempre se narra. El replay se puede saltar con el ícono de la esquina, pero no se puede desactivar: es el único momento en que la app "habla", y lo hace mostrando.

### 3.5 Desafío

Un desafío ([S0](S-desafios/S0-desafios.md)) usa la pantalla de actividad con tres diferencias: la figura ocupa el canvas, el teclado de fichas se reemplaza por las **herramientas de construcción** de la mecánica `construct` (trazar, prolongar, marcar ángulos iguales, proyectar, rotar copia), y la cheatsheet está **abierta** en el panel lateral desde el inicio. Un botón discreto de pista abre las pistas graduadas de a una: primero "¿qué dato falta?", después "¿qué línea revelaría ese dato?", al final la animación de la construcción. Cada pista se marca en el estado del desafío: sin pistas, con pistas o visto. El estado se muestra con tres intensidades de la misma luz, igual que en el mapa; nunca con estrellas.

```
┌──────────────────────────────┐
│ ‹   entrenamiento    (?) (0) │
│                  ┌───────────┤
│      B           │ ▤ cheat.  │
│     ╱╲           │ Pitágoras │
│    ╱  ╲ 13       │ a²+b²=c²  │
│   ╱    ╲         │ ───────── │
│  A──────C        │ Área △    │
│     ?   D        │ b·h/2     │
│  ╱               │ ───────── │
│ ╱ 5              │ ⚑ si falta│
│E                 │ un dato,  │
│                  │ trazá la  │
│                  │ altura    │
├──────────────────┴───────────┤
│  ╱ trazar  ⟶ prolongar       │
│  ∠ marcar  ⊥ proyectar  ↻    │
└──────────────────────────────┘
```

Cada construcción que el jugador hace sobre la figura se valida al soltar: si revela un dato, el dato aparece junto a la figura con un morph desde la línea que lo reveló. El cierre muestra la solución paso a paso como replay, en el modo visto o si el jugador lo pide después de resolver.

### 3.6 Calculadora evolutiva

La calculadora ([M0](M-calculadora/M0-progresion.md)) muestra solo las operaciones que el jugador desbloqueó al llevar nodos a `ready`. No hay teclas grises "todavía no": el espacio que ocuparán se ve como una silueta tenue que sugiere que la herramienta crece. Una operación cuyo nodo decayó se dibuja con **óxido**, la misma textura del mapa; tocarla la ejecuta igual y ofrece repasar el nodo. La pantalla tiene dos modos: **operar** (una expresión, un resultado, con la expresión como objeto tocable) y **sandbox**, donde el jugador escribe libremente con el teclado de fichas completo y, en capas `formal` y `abstract`, con teclado de texto. El sandbox valida "equivalente a algún target aceptado", no pasos, y lo muestra con el mismo morph de expresiones.

```
┌──────────────────────────────┐
│ ‹  calculadora      operar ▾ │
│                              │
│      2x + 5 = 17             │
│      ───────────             │
│      x = 6                   │
│                              │
├──────────────────────────────┤
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐         │
│  │ +│ │ −│ │ ×│ │ ÷│         │
│  └──┘ └──┘ └──┘ └──┘         │
│  ┌──┐ ┌──┐ ┌╌╌┐ ┌╌╌┐         │
│  │x²│ │√ │ ╎  ╎ ╎  ╎         │
│  └──┘ └▒▒┘ └╌╌┘ └╌╌┘         │
│  ┌╌╌┐ ┌╌╌┐ ┌╌╌┐ ┌╌╌┐         │
│  ╎  ╎ ╎  ╎ ╎  ╎ ╎  ╎         │
│  └╌╌┘ └╌╌┘ └╌╌┘ └╌╌┘         │
│  7 8 9   4 5 6   1 2 3   0 . │
└──────────────────────────────┘
```

La tecla `√` con textura es una operación oxidada; las siluetas punteadas son el espacio de las operaciones futuras.

### 3.7 Cheatsheet

La cheatsheet ([R0](R-cheatsheet/R0-cheatsheet.md)) es un árbol por tema (área, cluster, entrada) que empieza vacío y crece con cada capa `symbolic` o `formal` alcanzada. Tiene búsqueda, orden por tema y orden por aparición. Cada entrada muestra su forma de display (una expresión como objeto, un enunciado corto, una figura), las entradas relacionadas y un enlace **"volver a jugar esto"** que abre el minijuego donde se aprendió. Las entradas de nodos decaídos muestran óxido. En niveles 0 a 2 una entrada es una imagen con voz y el texto llega con la capa `formal`.

```
┌──────────────────────────────┐
│ ‹  cheatsheet     ⌕   tema ▾ │
│                              │
│  ▾ Álgebra                   │
│    ▾ Ecuaciones              │
│      ┌────────────────────┐  │
│      │ regla              │  │
│      │ lo que hacés a un  │  │
│      │ lado, hacelo al    │  │
│      │ otro               │  │
│      │  x + 5 = 12        │  │
│      │  x = 12 − 5        │  │
│      │ ver: balanza, llave│  │
│      │ ▸ volver a jugar   │  │
│      └────────────────────┘  │
│      · la llave de ×a es ÷a  │
│    ▸ Funciones               │
│  ▾ Geometría        ▒ óxido  │
│    ▸ Áreas                   │
└──────────────────────────────┘
```

Cuando se abre desde una actividad, la cheatsheet es el panel lateral de la sección 3.3 y conserva el árbol abierto donde estaba.

### 3.8 Perfil

El perfil muestra, por concepto, las seis dimensiones de [K](K-evaluacion.md) como un **radar pequeño sin números**. Seis ejes con nombre corto (familiar, entiendo, aplico, rápido, transfiero, dominio), un polígono relleno con el acento del área, y nada más. No hay porcentajes ni rankings; el polígono crece y se redondea, y eso es toda la información. Una vista de área agrega los radares de sus nodos en uno solo. Las misconceptions activas aparecen como una lista corta con su nombre y el minijuego que las remedia.

El dispositivo admite **perfiles múltiples** (familia). El cambio de perfil está en esta pantalla, con un avatar geométrico generado (nunca una foto ni un personaje) y un nombre. Cada perfil tiene su modelo de usuario separado; nada se comparte entre perfiles ([O](O-arquitectura-tecnica.md)).

```
┌──────────────────────────────┐
│  ◆ Ana          cambiar ▾    │
│                              │
│  Álgebra                     │
│        familiar              │
│   dominio ╱╲ entiendo        │
│      ╱  ╱  ╲  ╲              │
│     ╱  ╱▒▒▒▒╲  ╲             │
│  transfiero ▒▒ aplico        │
│         ╲▒▒▒▒╱               │
│          rápido              │
│                              │
│  ▸ Ecuaciones     ◇◇◇◇◇◇     │
│  ▸ Funciones      ◇◇◇◇◇◇     │
│                              │
│  Para revisar                │
│  · Pasar de lado sin cambiar │
│    el signo        ▸ jugar   │
│        mapa  hoy  ⌂  perfil  │
└──────────────────────────────┘
```

### 3.9 Diagnóstico

El diagnóstico ([J](J-adaptativo.md)) se juega en la pantalla de actividad, sin señal de que es una evaluación: no hay barra de progreso de preguntas, y la única diferencia visible es que las actividades cambian de mecánica más seguido. Tiene una **rama sin lectura**: ítems solo visuales con narración, donde `explain` se responde eligiendo entre animaciones. La entrada a esa rama no la elige el jugador; la decide el prior de tres botones del onboarding y, si hace falta, un primer ítem de `found.lit.*`.

```
┌──────────────────────────────┐
│                          ◁)  │
│                              │
│   ¿cuál queda derecha?       │
│                              │
│  ┌───────────┐ ┌───────────┐ │
│  │  △ ▸       │ │  △ ▸       │ │
│  │ ╲___╱     │ │ ╲___╱     │ │
│  │  ‾‾‾      │ │   ‾‾‾     │ │
│  └───────────┘ └───────────┘ │
│                              │
│  ┌───────────┐               │
│  │  △ ▸       │               │
│  │ ╲___╱     │               │
│  │  ‾‾‾      │               │
│  └───────────┘               │
│                              │
└──────────────────────────────┘
```

La pregunta se narra; el texto aparece solo si el prior indica lectura. Cada tarjeta es una animación corta que se reproduce al tocarla, y se elige con un segundo toque.

### 3.10 Onboarding

No hay muro de texto ni carrusel de pantallas. El onboarding es **una demostración**: al abrir la app por primera vez, el canvas muestra una balanza con dos manzanas; una mano fantasma arrastra una, la balanza se inclina, y el control pasa al jugador con la narración "ahora vos". Cuando el jugador la equilibra, aparece la única pregunta del onboarding, con **tres botones de prior** que alimentan el diagnóstico: "empiezo de cero", "sé contar y sumar", "ya hice álgebra". Los tres son íconos con voz; el texto es opcional. Después empieza el diagnóstico sin transición de pantalla.

```
┌──────────────────────────────┐
│                          ◁)  │
│                              │
│                              │
│        🍎         🍎         │
│       ╲___________╱          │
│        ‾‾‾‾‾‾‾‾‾‾‾           │
│              ☞               │
│                              │
│   ▸ ahora vos                │
│                              │
├──────────────────────────────┤
│  ┌────────┐┌────────┐┌──────┐│
│  │  ○     ││  ○○○   ││  x   ││
│  │ de cero││ cuento ││álgebra││
│  └────────┘└────────┘└──────┘│
└──────────────────────────────┘
```

La elección de idioma y de voz la hace el sistema (`expo-localization`, [P](P-internacionalizacion.md)); el jugador la puede cambiar desde el perfil. No se pide cuenta, nombre ni edad.

---

## 4. La regla del morph

[H](H-progresion-abstraccion.md) fija el principio: 🍎 + 🍎 se vuelve `x + x` se vuelve `2x` como **una transformación continua del mismo objeto**, nunca como un reemplazo de pantalla. Esta sección dice qué le exige eso a la interfaz.

**Mismo lenguaje para objetos y símbolos.** Una manzana y una `x` deben poder fundirse. Eso solo es posible si la manzana está dibujada como path vectorial con el mismo grosor de trazo, la misma paleta y el mismo estilo plano que el glifo. Por eso los **objetos concretos son assets propios**, dibujados en el sistema visual de Mathy, y nunca emojis de plataforma: un emoji cambia entre iOS y Android, tiene relieve y brillo que ningún glifo tiene, y no se puede interpolar a un path. Frutas, cofres, llaves, baldosas, caminantes y recipientes tienen versión vectorial propia, con variantes por `cultural_scope` cuando la analogía lo declara ([G0](G-analogias/G0-reglas.md)).

**Identidad estable.** Cada elemento visible del canvas tiene un id que sobrevive a los cambios de capa ([O](O-arquitectura-tecnica.md)). La interfaz nunca desmonta el canvas entre capas de un mismo nodo: la capa cambia dentro del canvas, con un morph de `motion.morph`. Cambiar de pantalla dentro de un nodo es un error de diseño.

**El diagrama se desplaza, no desaparece.** Al entrar en `symbolic`, el diagrama se corre a un costado y queda sincronizado: tocar un símbolo ilumina su parte del diagrama y viceversa. El layout de la pantalla de actividad reserva ese costado desde el principio para que el desplazamiento no reorganice nada más.

**Una sola ruptura visible.** El único morph diseñado como corte es `formal` a `abstract`, donde la piel se retira. Ahí la interfaz sí muestra un fundido, y es intencional: el jugador debe notar que ya no hay manzanas.

**Objetos que se retiran.** Cuando una analogía se desvanece ([G0](G-analogias/G0-reglas.md)), el objeto concreto pasa de estar siempre visible a aparecer a demanda (el ícono de "objeto" de la barra) y de ahí a aparecer solo tras un error. Los tres estados usan el mismo asset; lo que cambia es cuándo se dibuja.

---

## 5. Input

**Targets.** Todo elemento tocable mide al menos **44 × 44 pt**, incluidas las fichas del teclado, los nodos del mapa y las manijas de las mecánicas. Las fichas del teclado miden 56 pt en niveles 0 a 2 y 48 pt después.

**Tolerancia de drop.** Soltar una ficha o un objeto cerca del destino cuenta como soltar en el destino. El radio de tolerancia es un token (`input.drop_radius 28 pt`) y se duplica en perfiles `literacy: none`. El destino se ilumina con `there_and_back` mientras el objeto está dentro del radio, para que el jugador vea antes de soltar.

**Fichas antes que texto.** No existe teclado de texto libre fuera del sandbox de la calculadora y de las capas `formal` y `abstract`. Escribir una operación es arrastrar el operador y el número como fichas ([Q](Q-edad-universal.md)). El teclado de fichas muestra solo lo que tiene sentido en la capa actual, incluidas fichas incorrectas cuando la capa lo pide (nivel 6 del ejemplo de cofres en [H](H-progresion-abstraccion.md)).

**Gestos por mecánica.** Los cinco gestos permitidos son los que declara `mechanics.yaml`. Ninguna mecánica depende de precisión fina en su capa concreta, y `pinch` tiene siempre una alternativa de arrastre por manija.

| Mecánica | Gestos | Qué hace cada uno |
|---|---|---|
| `balance` | drag, tap | arrastrar a un plato; tocar para inspeccionar |
| `chest_key` | drag, tap | arrastrar la llave al candado; tocar el cofre para ver su acción |
| `machine_pipe` | drag, tap | arrastrar una entrada a la boca; tocar la máquina para verla por dentro |
| `ledger` | drag, tap | arrastrar a una fila; tocar una fila para contar |
| `tiles` | drag, tap, pinch | mover baldosas; cortar o pegar; pinch para estirar el rectángulo (alternativa: manija) |
| `slope_walker` | drag, scrub | mover al caminante; scrub sobre la cuesta para ver la pendiente |
| `fill_accumulate` | scrub, hold, drag | scrub del tiempo; mantener para abrir la canilla; arrastrar la marca |
| `grid_stretch` | pinch, drag | pinch para escalar; arrastrar las flechas de base (alternativa a pinch) |
| `network_routes` | drag, tap | trazar un puente; tocar una isla para elegirla |
| `urn_dice` | tap, hold, drag | tocar para sacar una vez; mantener para sacar muchas; arrastrar bolitas |
| `gears_sequence` | scrub, drag, tap | scrub de la manivela; enganchar engranajes; tocar una ficha |
| `sorter` | drag, tap | arrastrar a una caja; tocar la etiqueta |
| `construct` | drag, tap, hold | trazar entre dos puntos; tocar para marcar; mantener para prolongar |

**Respuesta al gesto.** Todo gesto produce un cambio visible en `motion.quick` como máximo. Si el sistema necesita más tiempo (validación de equivalencia), el objeto muestra un estado intermedio y nunca se congela.

---

## 6. Narración por voz y sonido

La voz no es un extra: en niveles 0 a 2 es la única forma de dar una instrucción que no sea la demostración. Por eso es parte de la localización ([P](P-internacionalizacion.md)) y se produce por locale: TTS del sistema como base, voz grabada para el starter pack.

**Cuándo habla la app.** Al presentar una analogía (`analogies.<id>.text`), al enunciar el invariante de una mecánica la primera vez (`mechanics.<id>.invariant`), al final de una explicación de error (`misconceptions.<id>.prompt`), al leer una definición en `formal`, y al tocar una ficha, un nodo del mapa o una entrada de cheatsheet en perfiles sin lectura. Nunca habla durante una manipulación: el gesto tiene la atención.

**Opcional.** La voz se puede apagar desde la barra de la actividad y el juego funciona completo sin ella ([G0](G-analogias/G0-reglas.md)). Cuando está apagada, en perfiles `literacy: none` la instrucción se repite por demostración.

**Sonido.** Pocos sonidos y todos con significado físico: la balanza que se asienta, la llave que entra o no entra, la baldosa que encaja, el agua del recipiente. No hay música de fondo en las actividades, no hay fanfarrias de acierto y no hay sonido de error. El mapa puede tener una capa ambiental suave que se apaga con el sonido del sistema.

---

## 7. Accesibilidad

Es base, no capa posterior.

- **VoiceOver y TalkBack** en toda la interfaz. Cada objeto del canvas expone un rol y una etiqueta (`ui.canvas.<object>` en [P](P-internacionalizacion.md)) y las acciones de arrastre tienen alternativa por acciones de accesibilidad ("mover al plato izquierdo"). Una expresión matemática se lee de forma lineal desde su `MathTree`, no desde píxeles.
- **Contraste AA** como mínimo para toda tinta sobre toda superficie, verificado desde `theme.json` en CI. Los acentos sobre `bg.base` cumplen AA en su intensidad plena y se usan en intensidad tenue solo para elementos no textuales.
- **Reducir movimiento** según la sección 2.5.
- **Daltonismo:** ningún significado solo por color (sección 2.2). Además, el jugador puede activar en el perfil un modo que agrega el glifo de primitiva junto a cada objeto coloreado.
- **Tamaños de texto dinámicos** del sistema, respetados hasta 2× en interfaz y 1.6× en notación. Las pantallas se diseñan primero en el tamaño más grande.
- **Sin dependencia de tiempo.** Nada se pierde por no responder rápido; Speed se mide pero no se muestra ([K](K-evaluacion.md)).

---

## 8. Layout responsivo

**Teléfonos chicos** (ancho ≥ 320 pt): el teclado de fichas pasa a dos filas con scroll horizontal, el panel lateral se vuelve una hoja inferior que ocupa como máximo el 45 % de la altura, y la barra de herramientas colapsa en tres íconos.

**Tablets:** el canvas conserva su proporción y el panel lateral se vuelve una columna permanente de 320 pt con la cheatsheet o la calculadora. En desafíos, la cheatsheet queda abierta a la derecha desde el inicio. El mapa muestra más constelación, no nodos más grandes.

**Expansión de texto.** Todo componente con texto se diseña para el **+35 %** de longitud respecto al español ([P](P-internacionalizacion.md)). Los botones crecen en altura antes que truncar; las etiquetas de slot se envuelven en dos líneas; ningún texto de interfaz se trunca con puntos suspensivos en pantallas clave.

**RTL.** La interfaz se espeja en locales RTL: barra de herramientas, panel lateral, navegación, teclado de fichas. La **notación matemática permanece LTR** dentro de su contenedor, que se declara como isla de dirección fija. El canvas tampoco se espeja: una recta numérica crece hacia la derecha en todos los locales, porque la convención matemática es la misma. Solo los textos de interfaz que rodean al canvas cambian de lado.

---

## 9. Microcopy

El tono es el de alguien que muestra, no que califica. Frases cortas, en segunda persona, sin exclamaciones y sin diminutivos. Voz y texto dicen lo mismo con las mismas palabras.

Reglas fijas:

- **Nunca "incorrecto"** ni sinónimos (mal, error, fallaste). El juego muestra lo que pasó y pregunta qué hacemos ahora. Los prompts de `misconceptions.<id>.prompt` tienen máximo quince palabras y ya cumplen esta regla.
- **Sin cuenta regresiva** en niveles 0 a 2 ni en nodos con `literacy: none`. En niveles superiores, un temporizador es siempre opcional y solo aparece en juego libre si el jugador lo activa.
- **Sin elogios vacíos.** No hay "excelente" ni "genial". Cuando un cofre se abre, se abre; eso es el feedback.
- **Nombres de conceptos como ideas**, no como temas escolares: "restar deshace sumar", no "sustracción". Los nombres vienen de `nodes.<id>.name`.
- **Instrucciones por demostración antes que por texto.** Si una instrucción se puede mostrar con la mano fantasma, no se escribe.
- **Un solo verbo por botón.** "Jugar", "empezar", "volver", "repasar".

Todo microcopy es una clave de locale con ICU MessageFormat ([P](P-internacionalizacion.md)); ninguna cadena está en el código.

---

## 10. Lo que no hay

Para que no se agregue por costumbre:

- No hay **puntos** ni XP. El progreso son las seis dimensiones y el mapa.
- No hay **monedas** ni tienda. Las herramientas se desbloquean por `ready`, no se compran.
- No hay **vidas**. Un movimiento que no avanza produce un replay, no una pérdida.
- No hay **rachas obligatorias**. Volver después de semanas muestra óxido, no castigo.
- No hay **anuncios** ni tracking de terceros ([O](O-arquitectura-tecnica.md)).
- No hay **badges**, medallas, cofres de recompensa ni confeti.
- No hay **rankings** ni comparación entre perfiles.
- No hay **pantallas de drill**: todo ítem vive dentro de una mecánica ([Q](Q-edad-universal.md)).
- No hay **temporizadores visibles** en niveles bajos ni cuenta regresiva en ningún ítem de evidencia.

---

## 11. Verificación

- Todo color, tamaño, radio y duración usado en la app y en `manim/theme.py` proviene de `theme.json`; un lint falla si encuentra literales.
- Contraste AA verificado en CI para cada par tinta/superficie de `theme.json`, en tema oscuro y claro.
- Cada pantalla clave tiene captura automática en `es`, `en`, pseudo-locale `en-XA` y un locale RTL, a tamaño de texto máximo, sin overflow ni truncado ([P](P-internacionalizacion.md)).
- Ningún asset de objeto concreto es un emoji de plataforma: el build rechaza rangos Unicode de emoji en el canvas.
- Todo target tocable mide ≥ 44 pt; el test de accesibilidad recorre el árbol de cada pantalla.
- Playtest con niños de 5 a 7 años en los nodos 1 a 3 y con adultos en el nodo 13, según [Q](Q-edad-universal.md), como criterio de aceptación de la pantalla de actividad.
