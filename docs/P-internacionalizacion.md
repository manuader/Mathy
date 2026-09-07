# P. Internacionalización

Mathy nace internacionalizada. No se traduce después: se diseña para que todo lo que ve u oye el jugador exista como recurso por locale desde el primer día. Este documento fija el principio, las capas que se localizan, la notación matemática por locale, la convención de claves, la arquitectura, el proceso y la verificación. Las reglas de contenido que dependen de esto están en [C0](C-knowledge-graph/C0-esquema.md) (claves de locale en el grafo), [G0](G-analogias/G0-reglas.md) (alcance cultural de las analogías), [N](N-ux-ui.md) (layout tolerante a expansión y RTL), [Q](Q-edad-universal.md) (voz) y [O](O-arquitectura-tecnica.md) (implementación).

---

## 1. Principio

**Ninguna cadena visible al jugador está hardcodeada.** Ni en la app ni en el contenido. Toda cadena es una clave que se resuelve contra un bundle de locale, con [ICU MessageFormat](https://unicode-org.github.io/icu/userguide/format_parse/messages/) para plurales, género, selección y orden de argumentos. Un componente que muestre un literal no pasa el lint. Un YAML de contenido que contenga texto visible no pasa el validador.

El **locale fuente es `es`**. Es el idioma en que se escribe el contenido y el que tiene siempre todas las claves. El **inglés (`en`) es el segundo locale desde el día uno**, no porque se lance en inglés primero sino para detectar acoplamientos: una frase que solo funciona en español (un plural que se arma concatenando, un orden de palabras asumido, una abreviatura de función trigonométrica) se descubre cuando `en` la rompe, y se descubre temprano.

Localizar a un tercer idioma no debería tocar ni el código ni los YAML de contenido. Solo agrega un directorio en `docs/locales/<lang>/`, un `MathLocale` si hace falta, variantes de analogía si las hay y un paquete de voz.

---

## 2. Qué se localiza

Hay más capas de las que parece. Se enumeran para que ninguna quede afuera por costumbre.

**UI de la app.** Menús, botones, tarjetas del mapa, slots de sesión, perfil, ajustes, etiquetas de accesibilidad. Claves `ui.<screen>.<element>`.

**Contenido pedagógico.** Nombres de nodos y sus introducciones, `probes` de la espina, prompts de explicación de error, textos de analogías, nombres y acciones de mecánicas, etiquetas y pistas de la calculadora, títulos y cuerpos de la cheatsheet, enunciados y pistas de los desafíos, pasos de la solución en modo visto. Todo está referenciado por id desde los YAML de contenido y vive en `docs/locales/<lang>/`.

**Notación matemática.** Separadores, nombres de funciones, convenciones de `log`, intervalos, división larga, unidades. No es texto: es un `MathLocale` (sección 3), separado del locale de UI.

**Analogías.** La piel de cada mecánica puede cambiar por región según `cultural_scope` (sección 4).

**Voz.** La narración es un recurso localizado con la misma clave que el texto que narra (sección 5).

**Assets con texto.** Prohibidos. Todo texto se dibuja nativo (sección 6).

**Clips de Manim.** Se renderizan sin texto rasterizado; las etiquetas se dibujan encima por locale (sección 7).

**Formatos de UI.** Fechas, horas y números de interfaz (no notación) con `Intl` del runtime.

---

## 3. Notación matemática por locale: `MathLocale`

La matemática es universal. La forma de escribirla, no. En Argentina se escribe `sen x` y `3,14`; en Estados Unidos, `sin x` y `3.14`; en Francia, `[0, 1[` para un intervalo semiabierto; en Alemania, `2340 : 12 = 195` para una división. Un jugador aprende la notación de su aula, y Mathy debe mostrar esa.

Por eso la notación se modela como un **`MathLocale`**, un objeto de configuración que consumen el motor de layout del mini-Manim, la calculadora, la cheatsheet y el generador de problemas ([O](O-arquitectura-tecnica.md)). Es independiente del locale de UI: una familia en Miami puede querer la interfaz en español con notación `en-US`, y un docente en Quebec, interfaz en francés con notación de Francia o de Canadá. El `MathLocale` se infiere del locale del sistema al primer arranque y se cambia desde el perfil.

Un `MathLocale` declara, como mínimo:

| Campo | Qué fija |
|---|---|
| `decimal_separator` | coma o punto |
| `group_separator` | punto, coma, espacio fino o ninguno, y desde cuántas cifras |
| `function_names` | `sin/sen`, `tan/tg`, `arcsin/arcsen/sin⁻¹`, `cot/cotg`, etc. |
| `log_convention` | qué significa `log` sin base: base 10 o natural; cómo se escribe el natural (`ln`) y el decimal (`lg`, `log₁₀`) |
| `interval_notation` | `[a, b)` o `[a, b[` |
| `division_layout` | disposición de la división larga |
| `division_sign`, `multiplication_sign` | `÷` o `:`, `×` o `·` |
| `units` | métrico o imperial, y símbolos |
| `reading_order` | siempre LTR para la notación; se declara para dejar explícito que no se espeja |
| `digit_shapes` | dígitos occidentales o alternativos (fuera de v1, reservado) |

Los YAML de contenido nunca contienen notación escrita: contienen `MathJSON` o generadores. El `MathLocale` decide la forma al dibujar. Un mismo nodo `trig.fn.sine_as_height` muestra `sen` o `sin` sin que su YAML cambie.

### Tabla de ejemplos

| | es (AR) | en (US) | fr | de | pt (BR) | ja |
|---|---|---|---|---|---|---|
| Decimal | `3,14` | `3.14` | `3,14` | `3,14` | `3,14` | `3.14` |
| Miles | `1.000` | `1,000` | `1 000` | `1.000` | `1.000` | `1,000` |
| Seno | `sen x` | `sin x` | `sin x` | `sin x` | `sen x` | `sin x` |
| Tangente | `tg x` | `tan x` | `tan x` | `tan x` | `tg x` | `tan x` |
| Arcoseno | `arcsen x` | `arcsin x` o `sin⁻¹ x` | `arcsin x` | `arcsin x` | `arcsen x` | `arcsin x` |
| `log` sin base | base 10; natural `ln` | base 10 en escuela, natural en universidad; `ln` | base 10; natural `ln` | `lg` base 10, `ln` natural, `log` genérico | base 10; natural `ln` | base 10; natural `log_e` o `ln` |
| Intervalo semiabierto | `[a, b)` | `[a, b)` | `[a, b[` | `[a, b[` | `[a, b[` | `[a, b)` |
| División larga | divisor a la derecha con galera, cociente debajo del divisor | divisor a la izquierda, galera sobre el dividendo, cociente arriba | potencia: divisor a la derecha, cociente debajo | en línea: `2340 : 12 = 195` | chave: divisor a la derecha, cociente debajo | divisor a la izquierda, cociente arriba |
| Signo de división | `÷` o `:` | `÷` | `÷` o `:` | `:` | `÷` | `÷` |
| Multiplicación | `×` o `·` | `×` o `·` | `×` | `·` | `×` o `·` | `×` |
| Unidades | métrico | imperial en escuela, métrico en ciencia | métrico | métrico | métrico | métrico |
| Orden de lectura | LTR | LTR | LTR | LTR | LTR | LTR (sin escritura vertical) |

Dos aclaraciones. Primera: `es` no es un solo `MathLocale`. México y Centroamérica usan el punto decimal; por eso existen `es-AR`, `es-ES` y `es-MX` como `MathLocale` distintos bajo un mismo locale de UI `es`. Segunda: la variante universitaria de `log` natural en inglés se modela como una opción del `MathLocale` (`log_convention: natural_at_level ≥ 5`), no como un locale aparte, y el cambio se anuncia al jugador la primera vez con una entrada de cheatsheet.

Los locales RTL (árabe, hebreo, persa) mantienen la notación LTR en v1. Existe una tradición de matemática espejada en el Magreb y en Irán; queda reservada como opción futura de `reading_order`, documentada y sin implementar.

---

## 4. Analogías y alcance cultural

Las mecánicas y sus invariantes no cambian entre locales. Cambia la **piel**: los objetos concretos que visten la mecánica ([G0](G-analogias/G0-reglas.md)). Cada analogía declara `cultural_scope`:

- **universal**: un solo asset y un solo texto por idioma. Frutas, agua, cofres, balanzas, caminos.
- **adaptable**: la estructura es universal pero la piel cambia por región. La entrada declara `variants`, y cada variante tiene sus propios assets y su propia clave de texto. Las familias de variante previstas: moneda (`currency_local`), unidades (`units_metric`, `units_imperial`), comida (`round_pizza`, `round_flatbread`, `round_cake`), numeración de pisos (`floor_zero_ground`, `floor_one_ground`), relojes (`clock_12h`, `clock_24h`), deportes cuando aparezcan.
- **local**: solo se reconoce en algunas regiones. Nunca es la única analogía de un nodo. En v1 no hay ninguna; el valor existe para que el proceso de localización pueda proponerlas.

La selección de variante la hace el locale de región, no el idioma: `es-MX` y `es-AR` comparten texto base pero pueden elegir distinta moneda. El validador comprueba que toda variante tenga el mismo `structure_map` que la analogía original: la piel cambia, el esqueleto no.

Las cantidades en los textos de analogía usan placeholders ICU con plural (`{n, plural, one {# piedra} other {# piedras}}`) para que la voz y el texto sean correctos en idiomas con más de dos formas de plural (ruso, árabe, polaco).

---

## 5. Narración por voz

La voz es parte de la localización, no un extra. En niveles 0 a 2 es la única instrucción que no es demostración ([Q](Q-edad-universal.md), [N](N-ux-ui.md)). Un locale sin voz es un locale en el que un niño de cinco años no puede jugar.

**Dos fuentes.** Por defecto, TTS del sistema por locale (`expo-speech`), que cubre cualquier idioma que el dispositivo tenga instalado y no ocupa espacio. Para el **starter pack** (diagnóstico y los primeros ~30 conceptos, según [O](O-arquitectura-tecnica.md)), voz grabada por un hablante nativo, con un archivo por clave y por locale. La voz grabada se prefiere cuando existe; el TTS es el fallback.

**Misma clave.** Un archivo de voz se identifica con la clave del texto que narra: `analogies.fruit_ledger.text` en `es` tiene un archivo `voice/es/analogies.fruit_ledger.text.opus` y un manifiesto que lo lista. Si el texto cambia, el hash del manifiesto cambia y CI avisa que la grabación quedó vieja.

**Placeholders en voz.** Un texto con placeholders ICU no se puede grabar entero. Se graba por segmentos (`una piedra`, `tres piedras`, el resto de la frase) y el runtime los concatena según la forma plural elegida. Cuando la concatenación no suena natural en un idioma, ese texto usa TTS aunque exista starter pack. El manifiesto declara qué claves se graban enteras y cuáles por segmento.

**Qué se narra.** Lo que define [N](N-ux-ui.md): analogías, invariantes, prompts de error, definiciones en `formal`, y nombres al tocar en perfiles sin lectura. Todos son claves con texto; la voz nunca dice algo que no esté también como clave.

---

## 6. Assets con texto

**Prohibidos.** Ningún PNG, SVG, sprite ni clip lleva texto rasterizado ni texto como path. Todo texto que aparece en pantalla se dibuja nativo desde una clave, con la tipografía de interfaz o el motor de notación ([N](N-ux-ui.md)). Esto incluye etiquetas dentro de ilustraciones, números en una figura de desafío, nombres de ejes y el `x` sobre una caja.

Razones: un asset con texto se multiplica por idioma y se desincroniza; no escala con el tamaño de texto dinámico; no lo lee VoiceOver; y rompe el morph, porque un `x` rasterizado no puede fundirse con un `x` vectorial.

La misma regla vale para los objetos concretos: son assets propios sin texto, con variantes por `cultural_scope`, nunca emojis de plataforma ([N](N-ux-ui.md)).

---

## 7. Clips de Manim sin texto

Las escenas pre-renderizadas del pipeline de Manim ([O](O-arquitectura-tecnica.md)) se renderizan **sin texto rasterizado**. Un clip es geometría y movimiento; las etiquetas, nombres de ejes, expresiones y anotaciones se dibujan nativamente encima usando `handoff.json`, que declara para cada frame clave las posiciones e ids de los objetos a etiquetar. Un solo clip sirve para todos los idiomas y para todos los `MathLocale`. No se re-renderiza por locale.

**Excepción documentada.** Los símbolos matemáticos universales pueden ir dentro del clip: dígitos, `+`, `−`, `=`, `×`, letras de variables, paréntesis. No pueden ir: nombres de funciones (`sen`/`sin`), separadores decimales, unidades, palabras. Un clip que incluye símbolos universales se marca en `scenes.yaml` con `text_free: false` y una lista `embedded_symbols` que el validador comprueba contra la lista permitida. Todo clip sin esa lista debe ser `text_free: true`.

Cuando un `MathLocale` cambia la forma de un símbolo que sí puede ir embebido (el decimal, por ejemplo, si un clip muestra `3,5`), el clip debe usar la etiqueta nativa. La regla práctica: si dudás, va afuera.

---

## 8. Convención de claves y layout de archivos

### Claves

Toda clave sigue `<dominio>.<id>.<campo>`, donde `<id>` es el id del YAML de contenido correspondiente. Las claves son estables: renombrar un nodo pasa por `aliases` en el grafo, y el validador resuelve la clave vieja a la nueva.

| Dominio | Claves | Archivo |
|---|---|---|
| Nodos | `nodes.<id>.name`, `nodes.<id>.intro`, `nodes.<id>.probes.<verbo>` (los seis verbos, solo espina) | `nodes/<area>.yaml` |
| Mecánicas | `mechanics.<id>.name`, `.player_action`, `.invariant` | `mechanics.yaml` |
| Misconceptions | `misconceptions.<id>.name`, `.prompt` | `misconceptions.yaml` |
| Analogías | `analogies.<id>.name`, `.text`, `analogies.<id>.variants.<variant>.text` | `analogies.yaml` |
| Calculadora | `calculator.<op>.label`, `.hint` | `calculator.yaml` |
| Cheatsheet | `cheatsheet.<entry>.title`, `.body` | `cheatsheet.yaml` |
| Desafíos | `challenges.<id>.statement`, `.hints[n]`, `.solution_steps[n]` | `challenges.yaml` |
| Interfaz | `ui.<screen>.<element>`, `ui.a11y.<object>` | `ui.yaml` |

Las claves con índice (`hints[n]`) son listas YAML ordenadas; el validador exige la misma longitud en todos los locales.

### Layout

Coherente con lo que ya existe en `docs/locales/es/`:

```
docs/locales/
  es/                       locale fuente; siempre completo
    ui.yaml
    nodes/
      found.yaml
      arith.yaml
      ...                   uno por área, 16 en total
    mechanics.yaml
    misconceptions.yaml
    analogies.yaml
    calculator.yaml
    cheatsheet.yaml
    challenges.yaml
    voice.manifest.yaml     claves grabadas, segmentación, hash del texto
  en/                       misma estructura; claves faltantes = aviso
  <lang>/                   cualquier otro locale, misma estructura
docs/mathlocale/
  es-AR.yaml
  es-ES.yaml
  es-MX.yaml
  en-US.yaml
  en-GB.yaml
  fr-FR.yaml
  de-DE.yaml
  pt-BR.yaml
  ja-JP.yaml
```

Los `MathLocale` no están dentro de `locales/` porque no son texto y porque un locale de UI puede combinarse con varios de ellos. Los archivos de voz no viven en `docs/`: viven en el paquete de assets del starter pack y en el CDN, indexados por `voice.manifest.yaml`.

El **build de contenido** compila cada locale a un bundle JSON por dominio, con las claves aplanadas y los mensajes ICU precompilados. La app no lee YAML en runtime.

---

## 9. Arquitectura

**Biblioteca de i18n.** Dos candidatas: i18next y Lingui. Lingui extrae mensajes del código fuente con macros y los compila; es excelente cuando las cadenas viven en componentes. En Mathy el 95 % de las cadenas vive en YAML de contenido indexado por id, no en código, y se cargan por dominio y por locale en runtime; i18next hace exactamente eso con claves arbitrarias y namespaces. **Decisión: i18next + react-i18next + i18next-icu**, con `intl-pluralrules` como polyfill solo si el spike de Hermes muestra que `Intl.PluralRules` falta en alguna plataforma soportada ([O](O-arquitectura-tecnica.md)).

**Detección.** `expo-localization` da el locale de UI, la región y la dirección de escritura al arrancar. El `MathLocale` inicial se deriva de locale + región con una tabla en `docs/mathlocale/`; ambos se pueden cambiar desde el perfil, por separado.

**Números y fechas de interfaz.** `Intl.NumberFormat` e `Intl.DateTimeFormat` de Hermes. Solo para interfaz: la notación matemática nunca pasa por `Intl`, pasa por el `MathLocale` y el motor de layout.

**Bundles de locale.** Los JSON compilados se distribuyen con `expo-updates`, de modo que agregar o corregir un locale no requiere un release de app. El bundle `es` va embebido; los demás se descargan en el primer arranque con ese locale y se cachean.

**Pseudo-locale `en-XA`.** En desarrollo existe un locale generado que toma cada mensaje de `en`, lo alarga un 35 %, reemplaza letras por variantes acentuadas y encierra el mensaje entre corchetes. Cualquier texto que aparezca sin corchetes es un literal sin clave. Cualquier corte o solapamiento es un problema de expansión.

**Fuentes por script.** La sans de interfaz se embebe con cobertura de latín extendido, cirílico y griego. Las variantes para CJK, árabe, devanagari y tailandés se descargan bajo demanda por locale, junto con el bundle de texto. La fuente math es una sola para todos los locales.

**RTL.** La interfaz se espeja con `I18nManager` cuando el locale lo pide. El canvas y todo contenedor de notación se declaran como islas LTR ([N](N-ux-ui.md)). Los íconos con dirección semántica (flechas de "volver") se espejan; los íconos de primitiva (una flecha de desplazamiento) no, porque su dirección es matemática.

---

## 10. Proceso de localización

1. **Extracción.** El build de contenido recorre los YAML de contenido y de `locales/es/`, y produce la lista completa de claves con su tipo (texto plano, ICU con plural, lista indexada) y su contexto (nodo, mecánica, capa, `literacy`). Las claves de UI se extraen del código por lint.
2. **Fuente `es`.** Toda clave nueva se escribe primero en `es`, con su límite de longitud y sus restricciones (máximo quince palabras en prompts, sin la palabra "incorrecto", apto para voz cuando `literacy_min: none`).
3. **Traducción con glosario.** Cada idioma tiene un **glosario matemático** (`docs/locales/<lang>/glossary.yaml`): cómo se dice "pendiente", "incógnita", "deshacer", "balanza", y qué nombres de nodo son ideas y no temas escolares. La traducción puede ser humana o asistida, pero el glosario y la traducción final los **revisa un docente nativo** del idioma, porque una palabra escolar mal elegida enseña una cosa distinta.
4. **Validación en CI.** Claves faltantes respecto de `es` (error en `en`, aviso en los demás), placeholders que no coinciden con la fuente, listas con distinta longitud, mensajes ICU que no compilan, textos que exceden el límite de longitud declarado, y prompts que contienen palabras prohibidas del glosario.
5. **QA.** Captura automática de cada pantalla clave en `es`, `en`, `en-XA` y un locale RTL, a tamaño de texto máximo. Revisión manual del docente nativo sobre las capturas de su idioma, con el juego en la mano, en los nodos 1 a 3 y 13.

Un locale se considera **publicable** cuando tiene el 100 % de las claves del starter pack, un `MathLocale` asignado, voz (TTS al menos) verificada en dispositivo y una revisión de docente firmada. El resto de las claves puede llegar después vía `expo-updates`.

---

## 11. Edad universal

Un locale que solo traduce texto deja afuera a quien no lee. Por eso, en Mathy, **la narración por voz es parte de la localización**, no un extra ([Q](Q-edad-universal.md)). La checklist de un locale publicable incluye voz, y el validador trata la ausencia de voz para una clave `literacy_min: none` como una clave faltante.

Consecuencias concretas:

- Los textos de analogía e invariante se escriben para ser oídos por un niño de seis años en cada idioma, no solo en `es`. El docente revisor lo verifica leyéndolos en voz alta.
- Los plurales ICU son obligatorios en toda cantidad variable, porque el niño oye la frase y una concordancia mal hecha suena como un error.
- Las instrucciones por demostración no se localizan: la mano fantasma es la misma en todos los idiomas. Eso reduce lo que hay que traducir en los niveles bajos a las pocas frases narradas.
- Los íconos de las fichas (llave, cofre, balanza) no cambian entre locales; solo cambia la piel de la analogía si `cultural_scope` lo pide.

---

## 12. Verificación

- **Lint de literales.** Falla ante cualquier cadena literal visible en componentes de la app que no pase por la función de traducción. Se exceptúan solo símbolos matemáticos universales y nombres propios de la marca.
- **YAML sin texto visible.** Test que recorre los YAML de contenido (`C`, `E`, `F`, `G`, `L`, `M`, `R`, `S`) y falla si algún campo contiene texto que no sea id, enum, número o clave.
- **Claves completas.** Toda clave referenciada existe en `es`; en `en` falta cero claves del starter pack; los demás locales reportan cobertura.
- **Placeholders y listas.** Cada mensaje tiene los mismos placeholders ICU que la fuente y cada lista indexada tiene la misma longitud.
- **Corpus de `MathLocale`.** Un corpus de expresiones (`MathJSON`) con su render esperado por cada `MathLocale` publicado, verificado por snapshot del motor de layout: separadores, nombres de funciones, `log`, intervalos, división larga.
- **Expansión +35 %.** Capturas con `en-XA` de todas las pantallas de [N](N-ux-ui.md), sin overflow ni truncado, a tamaño de texto máximo.
- **Clips sin texto.** `scenes.yaml` marca cada escena pre-renderizada como `text_free: true` o lista `embedded_symbols` dentro de la lista permitida.
- **Voz.** Toda clave con `literacy_min: none` tiene voz (grabada o TTS verificado) en cada locale publicable; el hash del texto coincide con el del manifiesto.
- **Analogías.** Cada analogía declara `cultural_scope`; cada variante tiene el mismo `structure_map` que la original y sus propias claves de texto en cada locale.
