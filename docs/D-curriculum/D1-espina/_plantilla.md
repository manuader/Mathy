# NN — {Nombre del concepto} (`area.cluster.slug`)

> Plantilla del template de 14 pasos. Cada archivo de `D1-espina/` sigue esta estructura con estos encabezados, en este orden. Las secciones no se saltan; si una no aplica (por ejemplo, un nodo `adv.*` sin analogía), se deja el encabezado y se explica en una frase por qué no aplica. Extensión objetivo: 1500–2500 palabras. Sin constantes de mastery (viven en [K](../../K-evaluacion.md)). Sin nombres de clases de ManimGL (viven en [I](../../I-manim/I0-mapping.md)); acá se describe la visualización en lenguaje de la gramática visual. Ningún texto de esta plantilla se copia literal.

**Nodo:** `area.cluster.slug` · **Área:** … · **Nivel:** … · **Primitiva:** `…` · **Mecánica principal:** `…` · **Literacy:** `…` · **Analogía:** `…`

## 1. Concepto

Una o dos frases que enuncian la idea, no el tema. Qué debe poder hacer el jugador al final que no podía hacer antes.

## 2. Prerequisitos

Los prerequisitos directos del YAML y, para cada uno, **qué se usa de él** en este nodo. Si alguna arista no es la del orden escolar, explicar por qué.

## 3. Dificultad cognitiva real

El análisis obligatorio del master prompt: qué es lo difícil de verdad. No "hacer las cuentas", sino, por ejemplo, conservar la equivalencia, elegir la operación, entender qué representa cada símbolo, anticipar el resultado. Lista corta de las capacidades que este nodo desarrolla.

## 4. Problema intuitivo

La situación con la que empieza el nodo, contada como la vería el jugador. Sin matemática explícita. Debe ser reconocible para el nivel de `literacy` declarado.

## 5. Analogía del mundo real

La analogía del YAML: qué objeto representa qué (el `structure_map`), qué invariante conserva y en qué punto se rompe. Por qué esta y no otra. Referencia a [G](../../G-analogias/G0-reglas.md).

## 6. Mecánica de juego

Qué hace físicamente el jugador, paso a paso, en la primera capa jugable. Gestos, targets, feedback inmediato. Qué pasa cuando se equivoca (sin decir "incorrecto"). Referencia a [E](../../E-mecanicas/E0-catalogo.md).

## 7. Representación visual

Cómo se ve el concepto en la capa `visual`, en términos de la gramática visual: qué se desplaza, qué se escala, qué se conserva. Qué se muestra y qué todavía no.

## 8. Transición a símbolos

La secuencia exacta de desvanecimiento: objeto → representación visual → ficha → símbolo. Qué aparece en cada paso, qué desaparece, y qué gesto del jugador provoca cada transición. El objeto en pantalla es el mismo y se transforma; nunca se reemplaza.

## 9. Notación matemática

La notación que queda cuando la analogía se fue. Qué símbolo se introduce y qué problema lo hizo necesario (regla de oro de [H](../../H-progresion-abstraccion.md)).

## 10. Definición formal

Definición, condiciones de validez, casos especiales. Presentada como texto corto con voz y el objeto visual al lado. Qué parte de la definición ya la jugó el jugador y qué parte es nueva.

## 11. Propiedades

Las propiedades que se enuncian en este nodo, cada una ligada a algo que el jugador ya hizo con la mecánica.

## 12. Ejercicios como minijuegos

Cómo se ejercita cada verbo de evidencia dentro de la mecánica: `recognize`, `explain`, `manipulate`, `apply`, `generalize`, `transfer`. Las `probes` del YAML desarrolladas. Las misconceptions esperadas y qué patrón de explicación dispara cada una ([L](../../L-modelo-errores/L0-taxonomia.md)).

## 13. Generalización

Cómo se elimina la analogía. Qué variantes del concepto debe resolver el jugador sin ayuda visual. Cuándo el nodo puede considerarse en capa `abstract`.

## 14. Transferencia y concepto siguiente

Los nodos de `transfer_to`: en qué área y con qué mecánica reaparece la misma estructura. El `next` narrativo y la frase que lo introduce ("ahora que sabés abrir un cofre, ¿qué pasa si el cofre tiene otro cofre adentro?").

---

**Visualización:** descripción de las escenas asociadas (ids de `manim` del YAML) en lenguaje de gramática visual; si se pre-renderizan o son nativas; qué debe quedar sin texto rasterizado ([P](../../P-internacionalizacion.md)).

**Calculadora:** qué operaciones desbloquea el nodo en `ready` y cómo se presentan ([M](../../M-calculadora/M0-progresion.md)).

**Edad universal:** cómo se juega este nodo sin leer si `literacy` lo permite; qué cambia para un adulto ([Q](../../Q-edad-universal.md)).

---

## Convenciones fijadas con el nodo de calibración (13)

Estas decisiones salieron de escribir [`13-alg.eq.one_step.md`](13-alg.eq.one_step.md) y valen para los 44 archivos:

1. **Mecánica principal y secundaria.** Cuando el nodo declara más de una mecánica, el archivo dice en una frase qué aporta cada una (una provee la herramienta, la otra el invariante) y en qué gesto se encuentran.
2. **Zonas de drop en la capa simbólica.** Soltar una ficha sobre el `=` es una transformación de equivalencia a ambos lados; soltar sobre un lado es aplicar a un lado; arrastrar una ficha a través del `=` es un movimiento libre que la línea valida inclinándose. Vale para todo nodo con `balance` y se hereda en los demás con su propio invariante.
3. **"Sin símbolos nuevos" es una respuesta válida en la sección 9.** Si los símbolos ya nacieron en nodos previos, la aportación puede ser una convención de escritura, y hay que decir qué problema la hace necesaria.
4. **Niveles propios y mapeo explícito.** El D1 y el F numeran sus propios niveles y declaran a qué niveles de los ejemplos de [H](../../H-progresion-abstraccion.md) corresponden cuando aplica (cofres, frutas).
5. **Convenciones transversales.** La sección 14 se describe solo con los nodos de `transfer_to` del YAML. Los generadores se nombran `gen_<objeto>` con parámetros por nombre y rangos por nivel. El `literacy` mínimo del minijuego puede ser mayor que `none` aunque la primera capa se juegue sin leer, y se justifica. Los prompts de voz se escriben en formas que sirven igual para tú y vos.
