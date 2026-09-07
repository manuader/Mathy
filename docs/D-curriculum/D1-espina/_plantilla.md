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
