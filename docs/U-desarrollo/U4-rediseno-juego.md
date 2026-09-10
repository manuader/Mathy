# U4 — Rediseño: que Mathy se juegue como un juego

Plan del rediseño pedido el 2026-09-10: más color, mejores animaciones, una
mascota que guía, una interfaz que parezca un juego y no una herramienta, sin
dejar de ser rigurosamente educativo. La estética nueva vive en
[N](../N-ux-ui.md), que es la fuente de verdad; este documento es el plan: qué
se hace, en qué orden, qué es imagen y qué es código, y qué compuertas tiene.

## 1. El problema, medido

Jugando los primeros nodos el dueño encontró tres cosas:

1. **No se sabía cuándo se había cumplido un nivel ni cómo seguir.** Resuelto en
   la tanda anterior (tarjetas de entrada y cierre, guía, llaves).
2. **La pantalla parece un instrumento de laboratorio.** Fondo casi negro, trazos
   finos de un solo color, todo del mismo tamaño. N pedía eso a propósito
   ("parece un instrumento"), y el dueño lo revoca: tiene que llamar la atención
   de cualquier persona, no solo de quien ya viene con ganas de aprender.
3. **Un bug:** arrastrar una fruta arrastraba también las tarjetas de los cuencos.
   Las tarjetas que no se eligen llevan índice `-1`, que es también el valor de
   "nada agarrado". Arreglado en `BowlScene.tsx`.

## 2. La idea en una frase

**El color, la luz y el movimiento dejan de decorar y pasan a explicar.** Todo lo
que se agrega para que el juego sea más estimulante tiene que decir algo del
concepto: el color dice a qué colección pertenece algo, la luz dice qué se
aprendió, el movimiento dice qué pasó. Lo que no explica nada, no entra.

## 3. Qué se conserva de N y qué cambia

Se conserva, porque es lo que hace que el juego enseñe:

- el lienzo es el protagonista y nunca se tapa;
- no hay puntos, monedas, vidas, rachas obligatorias, rankings ni tildes rojas;
- no existe el error como categoría: lo que no avanza se muestra, no se castiga;
- el microcopy sin "incorrecto" y sin elogios vacíos;
- color con significado y nunca solo color (forma también).

Cambia, por pedido explícito:

| Antes | Ahora | Por qué no rompe lo anterior |
|---|---|---|
| "estética de instrumento", sin personaje | **Lumi**, un limón profe con birrete que guía (empezó como luciérnaga; el dueño lo cambió el mismo día) | es guía, no premio: habla en la guía y reacciona a lo que el jugador hizo; y el limón nunca es una fruta para contar |
| fondo casi negro liso | **un mundo por área**: paisaje ilustrado detrás del lienzo | el centro del paisaje es oscuro y quieto; el color fuerte queda reservado al juego |
| trazos finos de un tono | **objetos con volumen**: frutas con especie, cuencos de madera, tarjetas de vidrio | siguen siendo vectores dibujados en código, así que el morph de N §4 sigue siendo posible |
| sin celebración | **luz que sube** al ganar una llave | no es confeti: es la misma luz que ilumina el mapa, y sale del objeto que la ganó |
| botones planos | **botones de juego** con canto inferior | la profundidad se comunica con luminancia, que es lo que N permite |
| lista de niveles | **un sendero** de piedras con la llave de cada nivel | el progreso sigue siendo territorio que se ilumina |

## 4. Imagen o código: la frontera

La regla de N §4 dice que un objeto matemático tiene que poder fundirse en su
símbolo, y un PNG no se puede interpolar a un trazo. De ahí sale la frontera:

| Va como **imagen generada** | Va como **vector en código** |
|---|---|
| los paisajes de cada área | todo objeto matemático: frutas, cuencos, tarjetas, marcas, puentes |
| Lumi, en sus poses | las llaves y sus dibujos |
| el mapa del mundo | botones, carteles, sendero, íconos |
| | las partículas de luz |

Una imagen que falta nunca rompe nada: el código trae un reemplazo dibujado
(degradado del área, Lumi vectorial). Es el patrón de FisuEvolution: **el código
nunca referencia un archivo directo, pasa por el manifiesto**; sin entrada, se
dibuja el reemplazo.

## 5. El arte, con la metodología de FisuEvolution

El generador es [`automatic-image-generation`](https://github.com/manuader/automatic-image-generation):
maneja el chat web con la cuenta del dueño, sin API y sin pagar por token. **Mathy
genera con ChatGPT** (motor `chat-gpt`): es más consistente que Gemini con un personaje,
y desde el 2026-09-10 el motor escribe el prompt por el protocolo de Chrome y sube las
referencias por su `input` de archivos, así que no pide el permiso de Accesibilidad ni
la máquina quieta. La huerta (`bg_found`) salió de Gemini y quedó como referencia de
los mundos.
Un `.md` por imagen, con el estilo primero, una referencia encadenada para la
consistencia, y el recorte por conectividad sobre fondo blanco.

Dos proyectos, porque tienen salidas distintas:

| Proyecto | Salida | Qué genera | Referencia |
|---|---|---|---|
| `projects/mathy-lumi` | `game-asset`, lados 192 y 512 | Lumi: la pose héroe y 8 poses | todas adjuntan `output/lumi_hero.png` |
| `projects/mathy-mundos` | `raw` | 10 paisajes de área y el mapa del mundo | todos adjuntan `output/bg_found.png` |

Las reglas de los prompts, aprendidas en FisuEvolution y no negociables:

- **ASCII puro.** El tipeo por teclas reales pierde las vocales con tilde.
- **El estilo primero.** Lo primero que lee el modelo es lo que más pesa.
- **"Match EXACTLY … of the attached reference"**, dicho explícito: adjuntar no alcanza.
- **Composición medible**: "el centro, del 25 % al 85 % de la altura, vacío y oscuro".
- **Fondo blanco liso** para todo lo que se recorta, y la luz de Lumi adentro
  del cuerpo, sin halo sobre el blanco, o el recorte se la come.

La regla de color que agregan los paisajes: **el centro del paisaje no usa
ninguno de los colores que el juego usa para significar algo** (rojo, verde
menta, ámbar vivo). Si un paisaje compite con una colección por el color, deja de
ser fondo y pasa a ser ruido.

**La compuerta de Accesibilidad no se prueba con una pulsación vacía.**
`osascript -e 'tell application "System Events" to keystroke ""'` sale bien
aunque falte el permiso: macOS no lo exige si no hay nada que tipear. La prueba
que vale es la corrida misma: si falta el permiso, todas las imágenes fallan con
`osascript is not allowed to send keystrokes (1002)` **antes de enviar nada**, así
que la cuota queda intacta. El permiso es de la app desde la que se corre el
script (acá, Claude), y a veces pide reabrirla.

Integrar es un comando: `python3 tools/art/sync_art.py` copia lo generado a
`apps/mathy/assets/art/`, baja los paisajes a JPEG de 1920 px y reescribe
`apps/mathy/src/art/manifest.ts` con lo que existe.

## 6. Fases

1. **Plan** (este documento) y **prompts** en el generador.
2. **Arte.** Compuerta humana: el dueño da el permiso de Accesibilidad a la app
   desde la que se corre el script, abre el Chrome aislado y se loguea en Gemini
   Pro una vez. La tanda necesita la máquina quieta.
3. **Rediseño global**, para los 21 nodos a la vez: tokens de color, el mundo
   detrás de cada actividad, la barra de arriba, la guía con Lumi, las tarjetas
   de entrada y cierre, el sendero de niveles, el mapa de conceptos.
4. **Rediseño profundo del nodo 1** como referencia: frutas con volumen, cuencos
   de madera, puentes que brillan, jugo en cada gesto.
5. **N actualizado**, y la skill de construcción de niveles, que obliga a los
   nodos siguientes a hacer lo mismo.

La fase 3 no espera a la 2: mientras no hay imágenes, se ven los reemplazos.

## 7. Qué no se hace, y por qué

- **Corazones, vidas, "+20 por respuesta correcta".** Aparecen en una de las
  imágenes de referencia. Miden cuánto se jugó y no cuánto se entiende, y castigan
  el error, que es justo lo que Mathy quiere quitar. N §10 los sigue prohibiendo.
- **Caras en las frutas.** La cara es de Lumi. Un objeto matemático con cara deja
  de ser un objeto que se cuenta y pasa a ser un personaje que se mira.
- **Frutas como PNG.** Ver §4.
- **Rediseñar a fondo las otras diez escenas en esta tanda.** Heredan los colores
  nuevos por los tokens; su reskin profundo es trabajo de la skill, nodo por nodo.
