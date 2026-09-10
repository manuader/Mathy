# Sesión 2026-09-10 (tarde) — que Mathy se juegue como un juego

Continúa [SESSION-2026-09-10-espina-hasta-21.md](SESSION-2026-09-10-espina-hasta-21.md),
que cerró en `29e608a`. No se construyó ningún nodo: se construyó lo que todos los nodos
van a tener, y el arte. Quedó commiteado en ramas sin mergear: `rediseno-juego` en Mathy y
`chatgpt-multiref` en el generador.

## Qué se pidió

En palabras del dueño, en este orden:

1. Después de jugar: "entre cada nivel haya un botón de next o algo que te diga que,
   efectivamente, lo cumpliste … tiene que haber una descripción de qué es lo que me está
   intentando enseñar, y lo que me enseña se tiene que agregar al cheat sheet … que arranque
   vacío … como una especie de llave para resolver el puzzle", y "un tutorial más
   explicado, dinámico e interactivo". Mostrarlo en el nivel 1 antes de seguir.
2. "Al arrastrar la fruta también se mueven las tarjetas". Y: más color, mejores
   animaciones, "adictivo (además de muy educativo)", que parezca un juego, una mascota
   que guíe, "el color una herramienta más del aprendizaje", actualizar N, generar los
   assets con la metodología de FisuEvolution, "para todos los niveles".
3. Sobre el arte: la mascota "más parecida a estos personajes" (un limón con birrete);
   generar con ChatGPT y no con Gemini ("el generador de GPT es más consistente"); la héroe
   definitiva es `~/Downloads/lumi.png`; regenerar dos poses con un borde blanco; la skill.

## Lo que se construyó, y por qué con esa forma

**La lección es un dato y el marco la dibuja.** Cada nivel declara qué enseña, su objetivo,
su guía y la llave que deja (`apps/mathy/src/lessons/`). Las tarjetas de entrada y de cierre
viven en `ActivityShell`, no en cada minijuego: así los 21 nodos tienen "Siguiente nivel"
sin tocar su actividad, y los que no tienen lección igual cierran con una tarjeta.

**La guía se juega.** Cada paso señala objetos reales de la ronda y avanza cuando la
actividad avisa que el jugador hizo el gesto (`signal`); el paso que explica el resultado
frena la ronda (`holds`) hasta que se lee. La alternativa —pantallas de instrucciones— es
exactamente lo que N prohíbe y lo que el dueño describió como "no se entiende qué hay que
hacer".

**La chuleta estaba rota, no sólo vacía.** `reachedNodes` devolvía todos los nodos apenas se
terminaba un nivel: 535 entradas de golpe. Ahora cada herramienta crece con lo recorrido, y
arriba van las llaves, una por nivel superado. Eso cambia R0 (las entradas nacían sólo en
`symbolic`/`formal`); dónde viven las llaves a largo plazo quedó abierto.

**El rediseño obedece a una regla: el color, la luz y el movimiento explican.** Cada color
vivo tiene un trabajo (equipo, coincide, mirá acá, lo aprendido). El jugo va en el evento
que el nivel enseña: en el nodo 1, el puente entre dos frutas crece y suelta chispas. Los
corazones, los puntos y las caras en las frutas de las referencias del dueño no entraron;
la mascota sí.

**La frontera imagen/código la pone N §4.** Lo que tiene que fundirse en su símbolo es
vector (frutas, cuencos, tarjetas); los paisajes y Lumi son imágenes. Nada importa un PNG
directo: `src/art/manifest.ts` lo escribe `tools/art/sync_art.py` con lo que hay en disco,
y lo que falta se dibuja con un reemplazo. Por eso el rediseño se pudo construir y
verificar antes de que existiera una sola imagen.

**Lumi pasó de luciérnaga a limón en el día.** La luciérnaga salió bien de Gemini, y el
dueño pidió que se pareciera a sus referencias. La regla que trajo: el limón nunca es una
fruta para contar.

**El generador se hizo andar con ChatGPT.** Ver la sección siguiente; el detalle está en
`automatic-image-generation/.claude/avo/2026-09-10-chatgpt-multiref/journal.md`
(gitignoreado).

## Los diagnósticos que estaban mal

Todos se creyeron hasta que alguien miró.

1. **"El permiso de Accesibilidad está dado".** Lo afirmé con `keystroke ""`, que pasa aunque
   falte el permiso. La corrida real falló con 1002.
2. **"El generador no conecta" = Chrome caído.** Chrome estaba vivo sin ninguna pestaña; se
   abre una por CDP (`/json/new`).
3. **"ChatGPT alcanzó su límite de uso".** La frase estaba en una plantilla oculta del HTML
   (`active_task_limit_message_template`), no en pantalla. Ahora ChatGPT mira sólo el texto
   visible.
4. **El verde del oráculo.** Se guardó como resultado la referencia adjunta: ChatGPT la
   recomprime (MAE 4,94, umbral 4) y el extractor miraba toda la página segundos después de
   enviar. Ahora mira sólo la respuesta, y el resultado real se rescató del historial.
5. **"Es el límite de ChatGPT Plus".** Tres mundos "fallaron" sin imagen. ChatGPT sí los
   había generado: con la ventana tapada, las imágenes `loading="lazy"` no se cargaban
   (0x0). Ahora se bajan con `fetch` desde la pestaña, y los tres se rescataron sin cuota.

Y dos bugs reales, sin diagnóstico previo: las tarjetas de los cuencos seguían al dedo porque
`-1` era a la vez su índice y "nada agarrado"; y en web la `Image` del paisaje tomaba su
ancho natural y dejaba media pantalla sin mundo.

## El proceso, que también costó

El camino de Gemini pide teclas reales de macOS: permiso de Accesibilidad para la app que
corre el script y la máquina quieta. Desde Claude no hubo manera; el dueño corrió las
primeras héroes desde Terminal. El motor de ChatGPT escribe ahora por CDP
(`Input.insertText`) y sube las referencias por su `input[type=file]`, así que corre desde
Claude sin permiso y sin robar el foco. Pero no puede haber dos procesos sobre la misma
ventana, y un segundo Selenium enganchado mientras corre un lote es arriesgado: los
diagnósticos se hicieron siempre con el lote parado.

## Números

| | al empezar | al cerrar |
|---|---:|---:|
| tests de Mathy | 762 | 762 (no se tocó `packages/`) |
| tests del generador | 62 | 80 |
| poses de Lumi integradas | 0 | 10 |
| mundos integrados | 0 | 11 |
| peso del arte en la app | 0 | ~3,5 MB |

## Verificado mirando, y no

Mirado en el navegador: el nodo 1, niveles 1 a 4 con la guía completa (primera parte de la
tarde) y el nivel 5 rediseñado con el bug de las tarjetas arreglado; el mapa de conceptos con
el mundo y Lumi; el sendero de niveles; el paisaje del taller detrás de un nodo de álgebra.
Todo el arte, en hojas de contactos sobre el fondo del juego.

No mirado:
- los nodos 2 a 21 con el marco nuevo: el encabezado, la barra y el fondo aplican a todos,
  pero ninguno se jugó entero;
- las diez escenas viejas con la paleta nueva. Riesgo concreto: `UrnScene`, `TilesScene` y
  `StretchScene` usan `theme.color.bg` para pintar agujeros, que ahora son parches oscuros
  sobre el paisaje;
- el nivel 6 del nodo 1 con su paso `recall`, y la chuleta con llaves después del rediseño;
- el teléfono.

## Cómo se corre

```bash
npm test --workspaces --if-present
```

```bash
npx tsc --noEmit -p apps/mathy && npx tsc --noEmit -p packages/mechanics
```

```bash
~/Desktop/projects/automatic-image-generation/.venv/bin/python tools/art/sync_art.py
```

```bash
cd apps/mathy && npx expo start --web
```
